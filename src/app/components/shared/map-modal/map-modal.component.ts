import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import mapboxgl from 'mapbox-gl';
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
      <button type="button" class="btn btn-primary" (click)="saveLocation()">Guardar Ubicación</button>
      <button type="button" class="btn btn-secondary" (click)="activeModal.dismiss()">Cancelar</button>
    </div>
  `,
  styles: [
    `.map-container {
      border-radius: 4px;
      border: 1px solid #ddd;
    }`
  ]
})
export class MapModalComponent implements OnInit, AfterViewInit {
  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLDivElement>;
  @Input() initialLocation?: {lat: number, lng: number};
  @Output() locationSelected = new EventEmitter<{lat: number, lng: number}>();

  private map!: mapboxgl.Map;
  private marker!: mapboxgl.Marker;
  private currentLocation: {lat: number, lng: number} = {lat: 0, lng: 0};

  constructor(
    public activeModal: NgbActiveModal,
    private mapboxService: MapboxService
  ) {
    (mapboxgl as any).accessToken = this.mapboxService.getToken();
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
        // Intentar obtener la ubicación actual solo si no hay ubicación inicial
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

      this.map = new mapboxgl.Map({
        container: this.mapContainer.nativeElement,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [this.currentLocation.lng, this.currentLocation.lat],
        zoom: 13
      });

      // Agregar controles
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
        color: '#3ba5a8' // Color que coincide con el tema de la aplicación
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

      // Esperar a que el mapa se cargue
      this.map.on('load', () => {
        this.map.resize();
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

  saveLocation() {
    this.activeModal.close(this.currentLocation);
  }
}
