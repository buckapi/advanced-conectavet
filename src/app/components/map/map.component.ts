import { Component, OnInit, AfterViewInit, Input, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import mapboxgl from 'mapbox-gl';
import { MarkersService, Marker } from '@app/services/markers.service';
import { Subscription } from 'rxjs';

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
  
  @Input() centerLat: number = -33.4489; // Santiago, Chile por defecto
  @Input() centerLng: number = -70.6483;

  constructor(private markersService: MarkersService) {
    // Token público de Mapbox
    (mapboxgl as any).accessToken = 'pk.eyJ1IjoiY29uZWN0YXZldC1jb20iLCJhIjoiY20ybDZpc2dmMDhpMDJpb21iZGI1Y2ZoaCJ9.WquhO_FA_2FM0vhYBaZ_jg';
    this.markerSubscription = this.markersService.getMarkers().subscribe(
      markers => {
        this.markers = markers;
        if (this.map) {
          this.addMarkersToMap();
        }
      }
    );
  }

  ngOnInit() {
    // Ya no necesitamos loadMarkers() aquí
  }

  ngOnDestroy() {
    if (this.markerSubscription) {
      this.markerSubscription.unsubscribe();
    }
  }

  ngAfterViewInit() {
    this.initializeMap();
  }

  private initializeMap() {
    // Primero inicializamos el mapa con una vista por defecto
    this.map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-70.6483, -33.4489],
      zoom: 15,
      language: 'es',
      maxZoom: 19,
      minZoom: 11,
      pitch: 45, // Inclinar el mapa para mejor visualización
      bearing: -17.6 // Rotar ligeramente para mejor perspectiva
    });

    // Agregar controles de navegación
    this.map.addControl(
      new mapboxgl.NavigationControl({
        showCompass: true,
        showZoom: true,
        visualizePitch: true
      })
    );
    
    // Crear elemento personalizado para el marcador de ubicación
    const geolocateCustomMarker = document.createElement('div');
    geolocateCustomMarker.className = 'custom-geolocate-marker';
    geolocateCustomMarker.style.backgroundImage = 'url(assets/images/markerred.png)';
    geolocateCustomMarker.style.width = '32px';
    geolocateCustomMarker.style.height = '32px';
    geolocateCustomMarker.style.backgroundSize = 'cover';
    geolocateCustomMarker.style.cursor = 'pointer';

    // Agregar control de geolocalización con marcador personalizado
    const geolocateControl = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserHeading: true
    });

    this.map.addControl(geolocateControl);

    // Escuchar el evento de geolocalización para agregar el marcador personalizado
    geolocateControl.on('geolocate', (e: any) => {
      // Eliminar marcador anterior si existe
      const existingMarker = document.querySelector('.custom-geolocate-marker');
      if (existingMarker) {
        existingMarker.remove();
      }

      // Crear nuevo marcador en la posición actual
      new mapboxgl.Marker(geolocateCustomMarker)
        .setLngLat([e.coords.longitude, e.coords.latitude])
        .addTo(this.map);
    });

    // Configurar el idioma del mapa cuando se cargue
    this.map.on('load', () => {
      // Hacer las calles más visibles
      const streetLayers = {
        'road-street': '#ffffff',
        'road-secondary-tertiary': '#ffffff',
        'road-primary': '#ffffff',
        'road-motorway-trunk': '#ffffff',
        'road-construction': '#ffffff',
        'road-path': '#ffffff',
        'road-steps': '#ffffff',
        'road-pedestrian': '#ffffff'
      };

      // Configurar cada capa de calle
      Object.entries(streetLayers).forEach(([layerId, color]) => {
        if (this.map.getLayer(layerId)) {
          // Hacer las calles más anchas y visibles
          this.map.setPaintProperty(layerId, 'line-width', [
            'interpolate', ['linear'], ['zoom'],
            14, 2,  // zoom 14, ancho 2
            16, 4,  // zoom 16, ancho 4
            18, 6   // zoom 18, ancho 6
          ]);

          // Añadir borde a las calles
          this.map.setPaintProperty(layerId, 'line-color', color);
        }
      });

      // Configurar las etiquetas de las calles
      const labelLayers = [
        'road-label',
        'road-number-shield'
      ];

      labelLayers.forEach(layerId => {
        if (this.map.getLayer(layerId)) {
          // Hacer el texto más grande
          this.map.setLayoutProperty(layerId, 'text-size', [
            'interpolate', ['linear'], ['zoom'],
            14, 14,  // zoom 14, tamaño 14
            16, 16,  // zoom 16, tamaño 16
            18, 18   // zoom 18, tamaño 18
          ]);

          // Hacer el texto más visible
          this.map.setPaintProperty(layerId, 'text-color', '#000000');
          this.map.setPaintProperty(layerId, 'text-halo-color', '#ffffff');
          this.map.setPaintProperty(layerId, 'text-halo-width', 2);

          // Mostrar más etiquetas
          this.map.setLayoutProperty(layerId, 'symbol-placement', 'line');
          this.map.setLayoutProperty(layerId, 'text-field', [
            'coalesce',
            ['get', 'name_es'],
            ['get', 'name']
          ]);
          
          // Aumentar la densidad de etiquetas
          this.map.setLayoutProperty(layerId, 'symbol-spacing', 250);
        }
      });

      // Debug: Imprimir las capas disponibles
      const style = this.map.getStyle();
      if (style && style.layers) {
        console.log('Capas disponibles:', style.layers.map(l => l.id).join(', '));
      }

      // Agregar los marcadores
      this.addMarkersToMap();
    });

    // Intentar obtener la ubicación del usuario
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          
          // Centrar el mapa en la ubicación del usuario
          this.map.flyTo({
            center: [longitude, latitude],
            zoom: 13,
            essential: true,
            duration: 2000
          });
        },
        (error) => {
          console.log('Error getting location:', error);
          // Si hay error, usar la animación por defecto
          this.defaultMapAnimation();
        }
      );
    } else {
      // Si no hay geolocalización disponible, usar la animación por defecto
      this.defaultMapAnimation();
    }
  }

  private defaultMapAnimation() {
    // Hacer zoom out al límite
    this.map.setZoom(0);

    // Después de un breve momento, centrar en Santiago con una animación suave
    setTimeout(() => {
      this.map.flyTo({
        center: [-70.6483, -33.4489],
        zoom: 11,
        essential: true,
        duration: 2000
      });
    }, 1000);
  }

  private fitMapToMarkers() {
    if (this.markers.length === 0) return;

    // Crear un bounds que incluya todos los marcadores
    const bounds = new mapboxgl.LngLatBounds();
    this.markers.forEach(marker => {
      bounds.extend([marker.lng, marker.lat]);
    });

    // Ajustar el mapa para mostrar todos los marcadores con padding
    this.map.fitBounds(bounds, {
      padding: 50,
      maxZoom: 15
    });
  }

  private addMarkersToMap() {
    // Limpiar marcadores existentes
    const existingMarkers = document.getElementsByClassName('mapboxgl-marker');
    Array.from(existingMarkers).forEach((marker: any) => {
      marker.remove();
    });

    this.markers.forEach(marker => {
      // Crear un elemento div para el marcador personalizado
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.backgroundImage = 'url(assets/images/marker.png)';
      el.style.width = '62px';
      el.style.height = '62px';
      el.style.backgroundSize = 'cover';
      
      // Crear el popup con imagen
      const popup = new mapboxgl.Popup({ 
        offset: 25,
        className: 'rounded-popup'
      })
        .setHTML(`
          <div class="marker-popup" style="border-radius: 10px; overflow: hidden; padding: 10px;">
            <img src="${marker.imageUrl}" alt="${marker.name}" class="marker-image" style="padding: 2px; border-radius: 8%;"/>
            <h3 style="margin: 8px 0;">${marker.name}</h3>
            <p style="margin: 0;">${marker.description}</p>
          </div>
        `);

      // Crear y agregar el marcador al mapa
      new mapboxgl.Marker(el)
        .setLngLat([marker.lng, marker.lat])
        .setPopup(popup)
        .addTo(this.map);
    });
  }
}
