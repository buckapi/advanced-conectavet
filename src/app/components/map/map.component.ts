import { Component, OnInit, AfterViewInit, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import mapboxgl from 'mapbox-gl';
import { MarkersService, Marker } from '@app/services/markers.service';
import { Subscription } from 'rxjs';
import { GlobalService } from '@app/services/global.service';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {
  private map!: mapboxgl.Map;
  private markers: Marker[] = [];
  private markerSubscription: Subscription;
  private mapMarkers: mapboxgl.Marker[] = [];
  private mapPopups: mapboxgl.Popup[] = [];
  private closePopupsListener: ((e: MouseEvent) => void) | null = null;

  @Input() centerLat: number = -33.4489; // Santiago, Chile por defecto
  @Input() centerLng: number = -70.6483;

  constructor(
    private markersService: MarkersService,
    public global: GlobalService
  ) {
    // Token público de Mapbox para autenticación de mapas
    (mapboxgl as any).accessToken = 'pk.eyJ1IjoiY29uZWN0YXZldC1jb20iLCJhIjoiY20ybDZpc2dmMDhpMDJpb21iZGI1Y2ZoaCJ9.WquhO_FA_2FM0vhYBaZ_jg';

    // Suscripción a los marcadores para obtener actualizaciones
    this.markerSubscription = this.markersService.getMarkers().subscribe(
      markers => {
        console.log('Marcadores recibidos:', markers);
        this.markers = markers;
        if (this.map && this.map.isStyleLoaded()) {
          this.addMarkersToMap();
        } else {
          this.map?.on('load', () => this.addMarkersToMap());
        }
      },
      error => {
        console.error('Error al cargar marcadores:', error);
      }
    );
  }

  ngOnInit() {
    // No se necesita lógica adicional en ngOnInit
  }

  ngAfterViewInit() {
    // Inicializar el mapa después de que la vista esté completamente renderizada
    this.initializeMap();
  }

  ngOnDestroy() {
    // Desuscribirse para evitar fugas de memoria
    if (this.markerSubscription) {
      this.markerSubscription.unsubscribe();
    }

    // Eliminar el listener global de clic
    if (this.closePopupsListener && this.map) {
      this.map.getCanvas().removeEventListener('click', this.closePopupsListener);
    }
  }

  private initializeMap() {
    // Crear una nueva instancia de mapa con configuraciones específicas
    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [this.centerLng, this.centerLat],
      zoom: 13,
      minZoom: 11,
      maxZoom: 16
    });

    // Agregar controles de navegación al mapa
    this.map.addControl(new mapboxgl.NavigationControl({ showCompass: true, showZoom: true }));

    // Crear y agregar control de geolocalización
    const geolocateControl = new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true
    });
    this.map.addControl(geolocateControl);

    // Agregar un marcador rojo cuando se obtiene la ubicación del usuario
    geolocateControl.on('geolocate', (e: any) => {
      const userMarker = new mapboxgl.Marker({ color: 'red' })
        .setLngLat([e.coords.longitude, e.coords.latitude])
        .addTo(this.map);
    });

    // Agregar eventos de zoom y movimiento para actualizar posiciones de marcadores
    this.map.on('zoom', () => {
      this.updateMarkerPositions();
    });

    this.map.on('move', () => {
      this.updateMarkerPositions();
    });

    this.map.on('load', () => {
      console.log('Mapa cargado exitosamente');
      this.addMarkersToMap();
    });

    // Intentar obtener la ubicación actual del usuario
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          this.map.flyTo({ center: [longitude, latitude], zoom: 13, essential: true });
        },
        (error) => {
          console.warn('Error de geolocalización:', error);
          this.defaultMapAnimation();
        }
      );
    } else {
      this.defaultMapAnimation();
    }
  }

  private updateMarkerPositions() {
    // Reposicionar todos los marcadores para mantener su ubicación correcta
    this.mapMarkers.forEach(marker => {
      const lngLat = marker.getLngLat();
      const point = this.map.project(lngLat);
      marker.getElement().style.transform = `translate(${point.x}px, ${point.y}px)`;
    });
  }

  private defaultMapAnimation() {
    // Animación predeterminada para centrar el mapa en la ubicación inicial
    this.map.flyTo({ center: [this.centerLng, this.centerLat], zoom: 11, essential: true });
  }

  private addMarkersToMap() {
    // Limpiar el arreglo de mapMarkers existente
    this.mapMarkers = [];
    this.mapPopups = []; // Asegurar que el arreglo de popups también esté limpio

    // Remover marcadores existentes
    this.clearAllMarkers();

    // Verificar si hay marcadores
    if (!this.markers || this.markers.length === 0) {
      console.warn('No hay marcadores disponibles para agregar al mapa');
      return;
    }

    // Crear límites para ajustar todos los marcadores
    const bounds = new mapboxgl.LngLatBounds();

    this.markers.forEach(marker => {
      // Crear un elemento de marcador personalizado
      const el = document.createElement('div');
      el.className = 'custom-marker always-visible';
      el.style.backgroundImage = 'url(assets/images/marker.png)';
      el.style.width = '40px'; // Marcador ligeramente más grande
      el.style.height = '40px';
      el.style.backgroundSize = 'cover';
      el.style.transition = 'transform 0.2s ease';
      el.style.cursor = 'pointer';
      el.style.zIndex = '1000'; // Asegurar que los marcadores estén siempre en la parte superior
      el.style.position = 'absolute'; // Asegurar posicionamiento consistente
      el.style.pointerEvents = 'auto'; // Asegurar que se pueda hacer clic
      el.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'; // Agregar sombra sutil para visibilidad

      // Crear un popup para este marcador
      const popup = new mapboxgl.Popup({
        closeButton: true,
        closeOnClick: false,
        offset: 10, // Pequeño desplazamiento predeterminado
        anchor: undefined, // Dejar que Mapbox determine el mejor anclaje dinámicamente
        className: 'custom-popup popup-constrained',
        // maxWidth: '170px', // Asegurar ancho consistente
        focusAfterOpen: false // Prevenir enfoque automático
      })
      .setHTML(this.createPopupContent(marker))
      .setLngLat([marker.lng, marker.lat]);

      // Crear un nuevo marcador
      const newMarker = new mapboxgl.Marker({
        element: el,
        anchor: 'bottom', // Anclar marcador en la parte inferior para posicionamiento preciso
        offset: [0, 0] // Sin desplazamiento adicional
      })
        .setLngLat([marker.lng, marker.lat])
        .setPopup(popup)
        .addTo(this.map);

      // Agregar evento de clic al marcador
      el.addEventListener('click', (e) => {
        e.stopPropagation();

        // Cerrar otros popups
        this.mapMarkers.forEach(m => {
          const existingPopup = m.getPopup();
          if (existingPopup && m !== newMarker) {
            existingPopup.remove();
          }
        });

        // Alternar este popup
        const existingPopup = newMarker.getPopup();
        if (existingPopup) {
          // Si el popup ya está abierto, cerrarlo
          if (existingPopup.isOpen()) {
            existingPopup.remove();
          } else {
            // De lo contrario, abrirlo
            existingPopup.addTo(this.map);
          }
        }
      });
      
      // Agregar marcador a los límites
      bounds.extend([marker.lng, marker.lat]);
      this.mapMarkers.push(newMarker);
      this.mapPopups.push(popup);
    });

    // Siempre ajustar los límites si existen marcadores
    if (!bounds.isEmpty()) {
      this.map.fitBounds(bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        duration: 1000,
        pitch: 25,
        maxZoom: 15 // Limitar el zoom máximo al ajustar los límites
      });
    }
  }

  private createPopupContent(marker: Marker): string {
    // Crear contenido HTML personalizado para el popup del marcador
    return `<div class="popup-container">
  <div class="popup-content">
    <div class="popup-image">
      <img src="${marker.imageUrl}" alt="${marker.name}" class="popup-profile-image">
    </div>
    <div class="popup-details">
      <div class="popup-header">
        <h5 class="popup-name">
          ${marker.name}
          <span class="popup-rating">
          <span class="popup-rating-value"> 
          ${marker.rating}
          </span>
          <i class="fas fa-star"></i>
          </span>
        </h5>
      </div>
      <p class="popup-description">${marker.description}</p>
      <p class="popup-address">
        <i class="fas fa-map-marker-alt"></i>
        ${marker.address}
      </p>
    </div>
  </div>
</div>

<style>
  .popup-container {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
  }

  .popup-rating-value {
    font-weight: bold;
  color: #000; }

  .popup-content {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    background: #fff;
/*    border-radius: 8px;*/
    padding: 10px;
/*    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);*/
    max-width: 350px; /* Limita el ancho total */
    box-sizing: border-box;
  }

  .popup-image {
    flex-shrink: 0;
    max-width: 100px; /* Tamaño máximo para la imagen */
  }
    .custom-popup .mapboxgl-popup-content {
      padding: 0 !important;
      border-radius: 8px !important;
      overflow: hidden !important;
      box-shadow: 0 3px 15px rgba(0,0,0,0.2) !important;
    }

  .popup-image img {
    width: 100%;
    height: auto;
    border-radius: 8px;
    object-fit: cover;
  }

  .popup-details {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .popup-name {
    font-size: 16px;
    font-weight: bold;
    margin: 0;
  }

  .popup-rating {
    font-size: 14px;
    color: #ffcc00;
    display: flex;
    align-items: center;
    gap: 5px;
    white-space: nowrap;
  }

  .popup-description {
    font-size: 13px;
    color: #555;
    margin: 0;
  }

  .popup-address {
    font-size: 12px;
    color: #777;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .fas.fa-star {
    color: #ffcc00;
  }
</style>

    `;
  }

  private clearAllMarkers() {
    // Eliminar todos los marcadores existentes del mapa
    this.mapMarkers.forEach(marker => marker.remove());
    this.mapMarkers = [];
    
    // Eliminar todos los popups
    this.mapPopups.forEach(popup => popup.remove());
    this.mapPopups = [];
    
    // Eliminar cualquier elemento de marcador restante
    document.querySelectorAll('.mapboxgl-marker').forEach(marker => marker.remove());
  }

  highlightMarker(lng: number, lat: number) {
    // Encontrar el marcador específico
    const markerToHighlight = this.mapMarkers.find(marker => {
      const markerLngLat = marker.getLngLat();
      return Math.abs(markerLngLat.lng - lng) < 0.0001 && 
             Math.abs(markerLngLat.lat - lat) < 0.0001;
    });

    if (markerToHighlight) {
      // Escalar el marcador con transición
      const el = markerToHighlight.getElement();
      if (el) {
        el.style.transition = 'transform 0.3s ease-out';
        el.style.transform = 'scale(1.2)';
        el.style.zIndex = '1000';
      }

      // Centrar el mapa en el marcador manteniendo otros marcadores visibles
      const currentZoom = this.map.getZoom();
      this.map.easeTo({
        center: [lng, lat],
        zoom: Math.max(currentZoom, 13),
        duration: 800,
        pitch: 25,
        offset: [0, -50],
        padding: { top: 50, bottom: 50, left: 50, right: 50 }
      });
    }
  }

  unhighlightMarker(lng: number, lat: number) {
    // Encontrar el marcador específico
    const markerToReset = this.mapMarkers.find(marker => {
      const markerLngLat = marker.getLngLat();
      return Math.abs(markerLngLat.lng - lng) < 0.0001 && 
             Math.abs(markerLngLat.lat - lat) < 0.0001;
    });

    if (markerToReset) {
      // Restablecer la escala del marcador
      const el = markerToReset.getElement();
      if (el) {
        el.style.transition = 'transform 0.3s ease-out';
        el.style.transform = 'scale(1)';
        el.style.zIndex = 'auto';
      }
    }
  }

  private getPopupContentForMarker(marker: mapboxgl.Marker): string {
    // Encontrar los datos originales del marcador
    const originalMarker = this.markers.find(m => 
      Math.abs(m.lng - marker.getLngLat().lng) < 0.0001 && 
      Math.abs(m.lat - marker.getLngLat().lat) < 0.0001
    );

    if (originalMarker) {
      return `
        <div class="custom-popup" style="
          max-width: 280px;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          font-family: Arial, sans-serif;
        ">
          <div style="
            width: 100%;
            height: 160px;
            overflow: hidden;
            position: relative;
          ">
            <img src="${originalMarker.imageUrl || 'assets/images/default-clinic.jpg'}" 
              alt="${originalMarker.name}" 
              style="
                width: 100%;
                height: 100%;
                object-fit: cover;
              "
              onerror="this.src='assets/images/default-clinic.jpg'"
            >
          </div>
          <div style="padding: 15px;">
            <h4 style="
              margin: 0 0 8px 0;
              color: #333;
              font-size: 16px;
              font-weight: 600;
            ">${originalMarker.name}</h4>
            <p style="
              margin: 0;
              color: #666;
              font-size: 14px;
              line-height: 1.4;
            ">${originalMarker.description || 'Clínica veterinaria'}</p>
          </div>
        </div>
      `;
    }
    return '';
  }

  showMarkerPopup(lng: number, lat: number) {
    // Encontrar el marcador específico
    const markerToShow = this.mapMarkers.find(marker => {
      const markerLngLat = marker.getLngLat();
      return Math.abs(markerLngLat.lng - lng) < 0.0001 && 
             Math.abs(markerLngLat.lat - lat) < 0.0001;
    });

    if (markerToShow) {
      // Cerrar otros popups
      this.mapMarkers.forEach(m => {
        if (m !== markerToShow) {
          m.getPopup()?.remove();
        }
      });

      // Mostrar el popup de este marcador
      const popup = markerToShow.getPopup();
      if (popup) {
        popup.addTo(this.map);
      }
    }
  }

  hideMarkerPopup(lng: number, lat: number) {
    // Encontrar el marcador específico
    const markerToHide = this.mapMarkers.find(marker => {
      const markerLngLat = marker.getLngLat();
      return Math.abs(markerLngLat.lng - lng) < 0.0001 && 
             Math.abs(markerLngLat.lat - lat) < 0.0001;
    });

    if (markerToHide) {
      // Ocultar el popup de este marcador
      const popup = markerToHide.getPopup();
      if (popup) {
        popup.remove();
      }
    }
  }

  private fitMapToMarkers() {
    if (!this.markers.length) return;

    const bounds = new mapboxgl.LngLatBounds();
    this.markers.forEach(marker => bounds.extend([marker.lng, marker.lat]));

    // Ajustar los límites del mapa para mostrar todos los marcadores
    this.map.fitBounds(bounds, { padding: 50, maxZoom: 15 , pitch: 45 });
  }

  moveToLocation(
    lng: number, 
    lat: number, 
    options?: {
      offset?: [number, number],
      zoom?: number,
      duration?: number
    }
  ) {
    // Opciones predeterminadas para mover la ubicación
    const defaultOptions = {
      offset: [0, 0],
      zoom: 11,
      duration: 800
    };

    // Combinar opciones predeterminadas con opciones personalizadas
    const finalOptions = { ...defaultOptions, ...options };

    // Ajustar el punto central basado en el desplazamiento
    const centerPoint = this.map.project([lng, lat]);
    const adjustedCenter = this.map.unproject([
      centerPoint.x + (finalOptions.offset[0] || 0),
      centerPoint.y + (finalOptions.offset[1] || 0)
    ]);

    // Mover el mapa suavemente a la nueva ubicación
    this.map.easeTo({
      center: [adjustedCenter.lng, adjustedCenter.lat],
      zoom: finalOptions.zoom,
      duration: finalOptions.duration,
      essential: true
    });
  }

  isMobile() {
    return window.innerWidth <= 768;
  }
}
