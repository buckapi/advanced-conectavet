import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ConfigService } from '@app/services/config.service';
import { CategoriesComponent } from '../categories/categories.component';
import { ServicesComponent } from '../services/services.component';
import { GlobalService } from '@app/services/global.service';
import { ReelsComponent } from '../reels/reels.component';
import { BannerComponent } from '../sections/banner/banner.component';
import { DeviceService } from '@app/services/device.service';
import { AuthPocketbaseService } from '@app/services/auth-pocketbase.service';
import { FilterSpecialistsPipe } from '@app/pipes/filter-specialists.pipe';
import { RealtimeCategoriesService } from 'src/app/services/realtime-catwgories.service';
import { FavoritesService } from '@app/services/favorites.service';
import { MapComponent } from '../map/map.component';
import { Marker } from '@app/services/markers.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MapComponent,
    BannerComponent,
    CommonModule,
    FilterSpecialistsPipe,
    CategoriesComponent,
    ServicesComponent,
    ReelsComponent,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {
  specialists: any[] = [];
  categories: any[] = [];
  activeRoute = 'home';
  isListView: boolean = true;
  @ViewChild(MapComponent) mapComponent!: MapComponent;
  private markersSubscription: Subscription | null = null;
  private markers: Marker[] = [];

  constructor(
    public device: DeviceService,
    public auth: AuthPocketbaseService,
    public global: GlobalService,
    public configService: ConfigService,
    private realtimeCategoriesService: RealtimeCategoriesService,
    public favoritesService: FavoritesService
  ) {}

  ngOnInit(): void {
    this.realtimeCategoriesService.categories$.subscribe(categories => {
      this.categories = categories;
    });

    // Subscribe to markers
    this.markersSubscription = this.global.markersService.getMarkers().subscribe(
      markers => {
        console.log('Markers received:', markers);
        this.markers = markers;
      }
    );
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    if (this.markersSubscription) {
      this.markersSubscription.unsubscribe();
    }
  }

  toggleMap() {
    this.global.webShowMap = !this.global.webShowMap;
  }

  toggleView(view: string): void {
    this.isListView = (view === 'list');
  }

  async mostrarFavorito(event: Event, specialistId: string) {
    event.stopPropagation();
    await this.favoritesService.toggleFavorite(specialistId, specialistId);
  }

  isFavorite(specialistId: string): boolean {
    return this.favoritesService.isFavorite(specialistId);
  }

  getStarsArray(rating: number): number[] {
    return Array(Math.round(rating)).fill(0);
  }

  async onClinicClick(clinic: any) {
    // First, view the clinic details
    await this.global.viewClinic(clinic);

    // Then, move map to the clinic's location
    this.onSpecialistClick(clinic);
  }

  onSpecialistHover(specialist: any) {
    // Ensure markers are loaded before processing
    if (this.markers.length === 0) {
      console.warn('No markers available');
      return;
    }

    // Find the corresponding marker based on the specialist's ID
    const markerToHighlight = this.markers.find(marker => 
      marker.id === specialist.id
    );

    if (markerToHighlight) {
      // Only show popup, do not move map or highlight marker
      this.mapComponent.showMarkerPopup(markerToHighlight.lng, markerToHighlight.lat);
    }
  }

  onSpecialistUnhover(specialist: any) {
    // Find the corresponding marker based on the specialist's ID
    const markerToUnhighlight = this.markers.find(marker => 
      marker.id === specialist.id
    );

    if (markerToUnhighlight) {
      // Hide popup for this marker
      this.mapComponent.hideMarkerPopup(markerToUnhighlight.lng, markerToUnhighlight.lat);
    }
  }

  onSpecialistClick(specialist: any) {
    // Ensure markers are loaded before processing
    if (this.markers.length === 0) {
      console.warn('No markers available');
      return;
    }

    // Find the corresponding marker based on the specialist's ID
    const markerToFocus = this.markers.find(marker => 
      marker.id === specialist.id
    );

    if (markerToFocus) {
      // Smooth map movement with offset and zoom
      this.mapComponent.moveToLocation(
        markerToFocus.lng, 
        markerToFocus.lat, 
        { 
          offset: [0, -100], // Slight vertical offset to keep marker visible
          zoom: 15 // Slightly higher zoom for detail
        }
      );
      
      // Highlight the marker
      this.mapComponent.highlightMarker(markerToFocus.lng, markerToFocus.lat);

      // Show popup for this marker
      this.mapComponent.showMarkerPopup(markerToFocus.lng, markerToFocus.lat);
    } else {
      console.warn(`No marker found for specialist: ${specialist.id}`);
    }
  }

  onSpecialistCardClick(specialist: any) {
    // First, view the clinic details
    this.global.viewClinic(specialist);

    // Then, move map to the specialist's location
    if (this.markers.length === 0) {
      console.warn('No markers available');
      return;
    }

    // Find the corresponding marker based on the specialist's ID
    const markerToFocus = this.markers.find(marker => 
      marker.id === specialist.id
    );

    if (markerToFocus) {
      // Smooth map movement with offset and zoom
      this.mapComponent.moveToLocation(
        markerToFocus.lng, 
        markerToFocus.lat, 
        { 
          offset: [0, -100], // Slight vertical offset to keep marker visible
          zoom: 15 // Slightly higher zoom for detail
        }
      );
      
      // Highlight the marker
      this.mapComponent.highlightMarker(markerToFocus.lng, markerToFocus.lat);

      // Show popup for this marker
      this.mapComponent.showMarkerPopup(markerToFocus.lng, markerToFocus.lat);
    } else {
      console.warn(`No marker found for specialist: ${specialist.id}`);
    }
  }
}
