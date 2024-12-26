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
    // Token público de Mapbox
    (mapboxgl as any).accessToken = 'pk.eyJ1IjoiY29uZWN0YXZldC1jb20iLCJhIjoiY20ybDZpc2dmMDhpMDJpb21iZGI1Y2ZoaCJ9.WquhO_FA_2FM0vhYBaZ_jg';

    // Suscripción a los marcadores
    this.markerSubscription = this.markersService.getMarkers().subscribe(
      markers => {
        console.log('Markers received:', markers);
        this.markers = markers;
        if (this.map && this.map.isStyleLoaded()) {
          this.addMarkersToMap();
        } else {
          this.map?.on('load', () => this.addMarkersToMap());
        }
      },
      error => {
        console.error('Error loading markers:', error);
      }
    );
  }

  ngOnInit() {
    // No se necesita lógica adicional en ngOnInit
  }

  ngAfterViewInit() {
    this.initializeMap();
  }

  ngOnDestroy() {
    if (this.markerSubscription) {
      this.markerSubscription.unsubscribe();
    }

    // Remove the global click listener
    if (this.closePopupsListener && this.map) {
      this.map.getCanvas().removeEventListener('click', this.closePopupsListener);
    }
  }

  private initializeMap() {
    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [this.centerLng, this.centerLat],
      zoom: 13,
      minZoom: 11,
      maxZoom: 16
    });

    // Controles de navegación
    this.map.addControl(new mapboxgl.NavigationControl({ showCompass: true, showZoom: true }));

    // Control de geolocalización
    const geolocateControl = new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true
    });
    this.map.addControl(geolocateControl);

    geolocateControl.on('geolocate', (e: any) => {
      const userMarker = new mapboxgl.Marker({ color: 'red' })
        .setLngLat([e.coords.longitude, e.coords.latitude])
        .addTo(this.map);
    });

    // Add zoom and move event listeners to update marker positions
    this.map.on('zoom', () => {
      this.updateMarkerPositions();
    });

    this.map.on('move', () => {
      this.updateMarkerPositions();
    });

    this.map.on('load', () => {
      console.log('Map loaded successfully');
      this.addMarkersToMap();
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          this.map.flyTo({ center: [longitude, latitude], zoom: 13, essential: true });
        },
        (error) => {
          console.warn('Geolocation error:', error);
          this.defaultMapAnimation();
        }
      );
    } else {
      this.defaultMapAnimation();
    }
  }

  private updateMarkerPositions() {
    // Reposition all markers to maintain their correct location
    this.mapMarkers.forEach(marker => {
      const lngLat = marker.getLngLat();
      const point = this.map.project(lngLat);
      marker.getElement().style.transform = `translate(${point.x}px, ${point.y}px)`;
    });
  }

  private defaultMapAnimation() {
    this.map.flyTo({ center: [this.centerLng, this.centerLat], zoom: 11, essential: true });
  }

  private addMarkersToMap() {
    // Clear existing mapMarkers array
    this.mapMarkers = [];
    this.mapPopups = []; // Ensure popups array is also cleared

    // Remover marcadores existentes
    this.clearAllMarkers();

    // Verificar si hay marcadores
    if (!this.markers || this.markers.length === 0) {
      console.warn('No markers available to add to map');
      return;
    }

    // Create bounds to fit all markers
    const bounds = new mapboxgl.LngLatBounds();

    this.markers.forEach(marker => {
      const el = document.createElement('div');
      el.className = 'custom-marker always-visible';
      el.style.backgroundImage = 'url(assets/images/marker.png)';
      el.style.width = '40px'; // Slightly larger marker
      el.style.height = '40px';
      el.style.backgroundSize = 'cover';
      el.style.transition = 'transform 0.2s ease';
      el.style.cursor = 'pointer';
      el.style.zIndex = '1000'; // Ensure markers are always on top
      el.style.position = 'absolute'; // Ensure consistent positioning
      el.style.pointerEvents = 'auto'; // Ensure clickable
      el.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'; // Add subtle shadow for visibility

      // Create popup for this marker
      const popup = new mapboxgl.Popup({
        closeButton: true,
        closeOnClick: false,
        offset: 10, // Small default offset
        anchor: undefined, // Let Mapbox determine the best anchor dynamically
        className: 'custom-popup popup-constrained',
        maxWidth: '300px', // Ensure consistent width
        focusAfterOpen: false // Prevent automatic focus
      })
      .setHTML(this.createPopupContent(marker))
      .setLngLat([marker.lng, marker.lat]);

      const newMarker = new mapboxgl.Marker({
        element: el,
        anchor: 'bottom', // Anchor marker at bottom for precise positioning
        offset: [0, 0] // No additional offset
      })
        .setLngLat([marker.lng, marker.lat])
        .setPopup(popup)
        .addTo(this.map);

      // Add click event to marker
      el.addEventListener('click', (e) => {
        e.stopPropagation();

        // Close other popups
        this.mapMarkers.forEach(m => {
          const existingPopup = m.getPopup();
          if (existingPopup && m !== newMarker) {
            existingPopup.remove();
          }
        });

        // Toggle this popup
        const existingPopup = newMarker.getPopup();
        if (existingPopup) {
          // If popup is already open, close it
          if (existingPopup.isOpen()) {
            existingPopup.remove();
          } else {
            // Otherwise, open it
            existingPopup.addTo(this.map);
          }
        }
      });
      
      // Add marker to bounds
      bounds.extend([marker.lng, marker.lat]);
      this.mapMarkers.push(newMarker);
      this.mapPopups.push(popup);
    });

    // Always fit bounds if markers exist
    if (!bounds.isEmpty()) {
      this.map.fitBounds(bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        duration: 1000,
        maxZoom: 15 // Limita el zoom máximo al ajustar los bounds
      });
    }
  }

  private createPopupContent(marker: Marker): string {
    return `
      <div class="popup-container">
        <div class="popup-content">
          <div class="popup-image">
            <img src="${marker.imageUrl}" alt="${marker.name}" class="popup-profile-image">
          </div>
          <div class="popup-details">
            <h5 class="popup-name">${marker.name}</h5>
            <p class="popup-description">${marker.description}</p>
          </div>
        </div>
      </div>
    `;
  }

  highlightMarker(lng: number, lat: number) {
    // Find the specific marker
    const markerToHighlight = this.mapMarkers.find(marker => {
      const markerLngLat = marker.getLngLat();
      return Math.abs(markerLngLat.lng - lng) < 0.0001 && 
             Math.abs(markerLngLat.lat - lat) < 0.0001;
    });

    if (markerToHighlight) {
      // Scale up the marker with transition
      const el = markerToHighlight.getElement();
      if (el) {
        el.style.transition = 'transform 0.3s ease-out';
        el.style.transform = 'scale(1.2)';
        el.style.zIndex = '1000';
      }

      // Center the map on the marker while keeping other markers visible
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
    // Find the specific marker
    const markerToReset = this.mapMarkers.find(marker => {
      const markerLngLat = marker.getLngLat();
      return Math.abs(markerLngLat.lng - lng) < 0.0001 && 
             Math.abs(markerLngLat.lat - lat) < 0.0001;
    });

    if (markerToReset) {
      // Reset marker scale
      const el = markerToReset.getElement();
      if (el) {
        el.style.transition = 'transform 0.3s ease-out';
        el.style.transform = 'scale(1)';
        el.style.zIndex = 'auto';
      }
    }
  }

  private getPopupContentForMarker(marker: mapboxgl.Marker): string {
    // Find the original marker data
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
    // Find the specific marker
    const markerToShow = this.mapMarkers.find(marker => {
      const markerLngLat = marker.getLngLat();
      return Math.abs(markerLngLat.lng - lng) < 0.0001 && 
             Math.abs(markerLngLat.lat - lat) < 0.0001;
    });

    if (markerToShow) {
      // Close other popups
      this.mapMarkers.forEach(m => {
        if (m !== markerToShow) {
          m.getPopup()?.remove();
        }
      });

      // Show this marker's popup
      const popup = markerToShow.getPopup();
      if (popup) {
        popup.addTo(this.map);
      }
    }
  }

  hideMarkerPopup(lng: number, lat: number) {
    // Find the specific marker
    const markerToHide = this.mapMarkers.find(marker => {
      const markerLngLat = marker.getLngLat();
      return Math.abs(markerLngLat.lng - lng) < 0.0001 && 
             Math.abs(markerLngLat.lat - lat) < 0.0001;
    });

    if (markerToHide) {
      // Hide this marker's popup
      const popup = markerToHide.getPopup();
      if (popup) {
        popup.remove();
      }
    }
  }

  private clearAllMarkers() {
    // Remove all existing markers from the map
    this.mapMarkers.forEach(marker => marker.remove());
    this.mapMarkers = [];
    
    // Remove all popups
    this.mapPopups.forEach(popup => popup.remove());
    this.mapPopups = [];
    
    // Remove any remaining marker elements
    document.querySelectorAll('.mapboxgl-marker').forEach(marker => marker.remove());
  }

  private fitMapToMarkers() {
    if (!this.markers.length) return;

    const bounds = new mapboxgl.LngLatBounds();
    this.markers.forEach(marker => bounds.extend([marker.lng, marker.lat]));

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
    const defaultOptions = {
      offset: [0, 0],
      zoom: 11,
      duration: 800
    };

    const finalOptions = { ...defaultOptions, ...options };

    // Adjust the center point based on the offset
    const centerPoint = this.map.project([lng, lat]);
    const adjustedCenter = this.map.unproject([
      centerPoint.x + (finalOptions.offset[0] || 0),
      centerPoint.y + (finalOptions.offset[1] || 0)
    ]);

    this.map.easeTo({
      center: [adjustedCenter.lng, adjustedCenter.lat],
      zoom: finalOptions.zoom,
      duration: finalOptions.duration,
      essential: true
    });
  }
}
