import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { MapboxService } from '@app/services/mapbox.service';

@Component({
  selector: 'app-map-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-header">
      <h4 class="modal-title">Seleccionar Ubicación</h4>
      <button type="button" class="btn-close" aria-label="Close" (click)="activeModal.dismiss()"></button>
    </div>
    <div class="modal-body">
      <div #mapContainer class="map-container" style="height: 400px;"></div>
      <div class="mt-2">
        <small class="text-muted">Haz clic en el mapa o arrastra el marcador para seleccionar la ubicación</small>
      </div>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-primary" [disabled]="isSaving" (click)="saveLocation()">
        <span *ngIf="isSaving" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
        {{ isSaving ? 'Guardando...' : 'Guardar Ubicación' }}
      </button>
      <button type="button" class="btn btn-secondary" [disabled]="isSaving" (click)="activeModal.dismiss()">Cancelar</button>
    </div>
  `,
  styles: [
    `.map-container {
      border-radius: 4px;
      border: 1px solid #ddd;
      width: 100%;
      height: 400px;
      position: relative;
    }`
  ]
})
export class MapModalComponent implements OnInit, AfterViewInit {
  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLDivElement>;
  @Input() initialLocation?: {lat: number, lng: number};
  @Input() memberId!: string;
  @Output() locationSelected = new EventEmitter<{lat: number, lng: number}>();

  private map!: mapboxgl.Map;
  private marker!: mapboxgl.Marker;
  private currentLocation: {lat: number, lng: number} = {lat: 0, lng: 0};
  isSaving: boolean = false;

  constructor(
    public activeModal: NgbActiveModal,
    private mapboxService: MapboxService
  ) {
    // Usar el mismo token que funciona en map.component.ts
    (mapboxgl as any).accessToken = 'pk.eyJ1IjoiY29uZWN0YXZldC1jb20iLCJhIjoiY20ybDZpc2dmMDhpMDJpb21iZGI1Y2ZoaCJ9.WquhO_FA_2FM0vhYBaZ_jg';
  }

  ngOnInit() {
    if (this.initialLocation) {
      this.currentLocation = this.initialLocation;
    }
  }

  ngAfterViewInit() {
    this.initializeMap();
  }

  private async initializeMap() {
    try {
      if (!this.initialLocation) {
        try {
          const position = await this.getCurrentPosition();
          this.currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
        } catch (error) {
          console.error('Error getting location:', error);
          // Ubicación por defecto (centro de Chile)
          this.currentLocation = {
            lat: -33.4489,
            lng: -70.6693
          };
        }
      }

      const mapOptions: mapboxgl.MapOptions = {
        container: this.mapContainer.nativeElement,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [this.currentLocation.lng, this.currentLocation.lat] as [number, number],
        zoom: 13
      };

      console.log('Initializing map with options:', mapOptions);
      this.map = new mapboxgl.Map(mapOptions);

      this.map.on('error', (e) => {
        console.error('Mapbox error:', e);
      });

      this.map.on('load', () => {
        console.log('Map loaded successfully');
        this.map.resize();
      });

      // Agregar controles después de que el mapa se haya inicializado
      this.map.addControl(new mapboxgl.NavigationControl());
      this.map.addControl(new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true
      }));

      // Agregar marcador
      this.marker = new mapboxgl.Marker({
        draggable: true,
        color: '#3ba5a8'
      })
      .setLngLat([this.currentLocation.lng, this.currentLocation.lat])
      .addTo(this.map);

      // Actualizar coordenadas cuando se arrastra el marcador
      this.marker.on('dragend', () => {
        const lngLat = this.marker.getLngLat();
        this.currentLocation = {
          lat: lngLat.lat,
          lng: lngLat.lng
        };
      });

      // Actualizar marcador al hacer clic en el mapa
      this.map.on('click', (e) => {
        const { lng, lat } = e.lngLat;
        this.marker.setLngLat([lng, lat]);
        this.currentLocation = { lat, lng };
      });

    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }

  private getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      });
    });
  }

  async saveLocation() {
    if (this.isSaving) return;
    
    try {
      this.isSaving = true;
      console.log('Intentando guardar ubicación:', {
        location: this.currentLocation,
        memberId: this.memberId
      });
      
      // Verificar que tengamos coordenadas válidas
      if (this.currentLocation.lat === 0 && this.currentLocation.lng === 0) {
        throw new Error('Por favor, selecciona una ubicación en el mapa');
      }

      if (!this.memberId) {
        throw new Error('No se encontró el ID del miembro');
      }
      
      // Guardar la ubicación en el backend
      const result = await this.mapboxService.saveLocation(this.currentLocation, this.memberId);
      console.log('Resultado del guardado:', result);
      
      // Cerrar el modal y devolver la ubicación seleccionada
      this.activeModal.close(this.currentLocation);
    } catch (error: any) {
      console.error('Error detallado guardando la ubicación:', error);
      
      // Mostrar mensaje de error específico al usuario
      let errorMessage = 'Error al guardar la ubicación. ';
      
      if (error.data?.message) {
        errorMessage += error.data.message;
      } else if (error.response?.message) {
        errorMessage += error.response.message;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Ocurrió un error inesperado. Por favor, intenta nuevamente.';
      }
      
      alert(errorMessage);
    } finally {
      this.isSaving = false;
    }
  }
}
