import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RealtimeVisitsService } from '@app/services/realtime-visits.service';
import { Chart, ChartConfiguration, ChartData, registerables } from 'chart.js';
import { firstValueFrom } from 'rxjs';
import * as L from 'leaflet';
import PocketBase, { RecordModel } from 'pocketbase';
import { FormsModule } from '@angular/forms';

interface Visit {
  device: string;
  browser: string;
  country: string;
  created: string;
  ip: string;
  deviceType?: string;
  deviceModel?: string;
  deviceOs?: string;
  deviceOsVersion?: string;
  userAgent?: string;
}

interface DeviceInfo {
  type: string;
  model?: string;
  os?: string;
  osVersion?: string;
}

interface VisitRecord extends RecordModel {
  id: string;
  created: string;
  location: string;
  browser: string;
  country: string;
  device: string;
  datetime: string;
  ip: string;
  appName: string;
  visitCount: number;
  userAgent: string;
}

// Coordenadas predefinidas para países comunes
const COUNTRY_COORDINATES: { [key: string]: [number, number] } = {
  'Spain': [40.4637, -3.7492],
  'United States': [37.0902, -95.7129],
  'Mexico': [23.6345, -102.5528],
  'Brazil': [-14.2350, -51.9253],
  'Argentina': [-38.4161, -63.6167],
  'Colombia': [4.5709, -74.2973],
  'Chile': [-35.6751, -71.5430],
  'Peru': [-9.1900, -75.0152],
  'Venezuela': [6.4238, -66.5897],
  'Ecuador': [-1.8312, -78.1834],
  'United Kingdom': [55.3781, -3.4360],
  'France': [46.2276, 2.2137],
  'Germany': [51.1657, 10.4515],
  'Italy': [41.8719, 12.5674],
  'Canada': [56.1304, -106.3468],
  'China': [35.8617, 104.1954],
  'Japan': [36.2048, 138.2529],
  'Australia': [-25.2744, 133.7751],
  'India': [20.5937, 78.9629],
  'Russia': [61.5240, 105.3188],
  'Unknown': [0, 0] // Coordenadas por defecto para países desconocidos
};

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule, NgbModule, FormsModule],
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css']
})
export class StatsComponent implements OnInit, OnDestroy {
  @ViewChild('pieChart') pieChartCanvas!: ElementRef;
  
  selectedVisit: Visit | null = null;
  private chart?: Chart;
  private currentVisits: Visit[] = [];
  private map?: L.Map;
  private markerLayer: L.LayerGroup = new L.LayerGroup(); // Inicializar directamente

  visits: VisitRecord[] = [];
  currentPage = 1;
  perPage = 10;
  totalPages = 0;
  totalItems = 0;
  sortField = '-created';
  filterText = '';
  isLoading = false;
  Math = Math; // Para usar Math en el template

  private pb = new PocketBase('https://db.conectavet.cl:8080');

  constructor(
    public visitsService: RealtimeVisitsService,
    private modalService: NgbModal
  ) {
    Chart.register(...registerables);
  }

  ngOnInit() {
    this.visitsService.visits$.subscribe(visits => {
      this.currentVisits = visits as Visit[];
      this.updateChartData();
      this.updateMapMarkers();
    });

    // Initialize map after a short delay to ensure the container is ready
    setTimeout(() => this.initMap(), 100);

    // Cargar listado inicial
    this.loadVisits();
  }

  ngAfterViewInit() {
    this.createChart();
  }

  private createChart() {
    const ctx = this.pieChartCanvas.nativeElement.getContext('2d');
    this.chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40',
            '#FF6384',
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'right',
          }
        }
      }
    });
  }

  private initMap() {
    if (this.map) return;

    // Crear el mapa
    this.map = L.map('worldMap').setView([20, 0], 2);
    
    // Añadir el layer de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: ' OpenStreetMap contributors'
    }).addTo(this.map);

    // Añadir el layer de marcadores al mapa
    this.markerLayer.addTo(this.map);

    // Actualizar los marcadores inicialmente
    this.updateMapMarkers();
  }

  private getCountryCoordinates(country: string): [number, number] {
    // Primero buscar en las coordenadas predefinidas
    const normalizedCountry = Object.keys(COUNTRY_COORDINATES).find(
      key => key.toLowerCase() === country.toLowerCase()
    );

    if (normalizedCountry) {
      return COUNTRY_COORDINATES[normalizedCountry];
    }

    // Si no se encuentra, usar coordenadas por defecto
    console.warn(`Using default coordinates for country: ${country}`);
    return COUNTRY_COORDINATES['Unknown'];
  }

  private updateMapMarkers() {
    if (!this.map) {
      console.warn('Map not initialized');
      return;
    }

    // Limpiar marcadores existentes
    this.markerLayer.clearLayers();

    // Obtener estadísticas de países
    const countryStats = this.getCountryStats();

    // Crear marcadores para cada país
    Object.entries(countryStats).forEach(([country, count]) => {
      const coordinates = this.getCountryCoordinates(country);
      
      // Crear icono personalizado
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div class="marker-content">
                <span class="marker-count">${count}</span>
              </div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });

      // Crear marcador con popup
      L.marker(coordinates, { icon })
        .bindPopup(`
          <div class="popup-content">
            <h4>${country}</h4>
            <p>Visitas: ${count}</p>
          </div>
        `)
        .addTo(this.markerLayer);
    });
  }

  getDeviceStats(): { [key: string]: number } {
    return this.currentVisits.reduce((acc: { [key: string]: number }, visit) => {
      try {
        const device: DeviceInfo = visit.device ? JSON.parse(visit.device) : { type: 'Unknown' };
        const deviceType = device.type || 'Unknown';
        acc[deviceType] = (acc[deviceType] || 0) + 1;
      } catch (e) {
        acc['Unknown'] = (acc['Unknown'] || 0) + 1;
      }
      return acc;
    }, {});
  }

  getCountryStats(): { [key: string]: number } {
    return this.currentVisits.reduce((acc: { [key: string]: number }, visit) => {
      const country = visit.country || 'Unknown';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {});
  }

  getBrowserStats(): { [key: string]: number } {
    return this.currentVisits.reduce((acc: { [key: string]: number }, visit) => {
      const browser = visit.browser?.split(' ')[0] || 'Unknown';
      acc[browser] = (acc[browser] || 0) + 1;
      return acc;
    }, {});
  }

  updateChartData() {
    if (!this.chart) return;
    
    const countryStats = this.getCountryStats();
    const entries = Object.entries(countryStats);
    
    this.chart.data.labels = entries.map(([country]) => country);
    this.chart.data.datasets[0].data = entries.map(([, count]) => count);
    this.chart.update();
  }

  getMaxVisitCountry(): string {
    const countryStats = this.getCountryStats();
    return Object.entries(countryStats).reduce((max, current) => 
      current[1] > max[1] ? current : max, ['', 0]
    )[0];
  }

  isMaxVisitCountry(country: string): boolean {
    return country === this.getMaxVisitCountry();
  }

  getMaxVisitDevice(): string {
    const deviceStats = this.getDeviceStats();
    return Object.entries(deviceStats).reduce((max, current) => 
      current[1] > max[1] ? current : max, ['', 0]
    )[0];
  }

  isMaxVisitDevice(device: string): boolean {
    return device === this.getMaxVisitDevice();
  }

  showVisitDetails(visit: Visit, content: any) {
    this.selectedVisit = visit;
    this.modalService.open(content, {
      size: 'lg',
      centered: true,
      scrollable: true
    });
  }

  async loadVisits() {
    try {
      this.isLoading = true;
      let filter = '';
      
      if (this.filterText) {
        filter = `browser ~ "${this.filterText}" || country ~ "${this.filterText}" || device ~ "${this.filterText}"`;
      }

      const resultList = await this.pb.collection('visits').getList<VisitRecord>(
        this.currentPage,
        this.perPage,
        {
          sort: this.sortField,
          filter: filter,
          expand: ''
        }
      );

      this.visits = resultList.items;
      this.totalItems = resultList.totalItems;
      this.totalPages = resultList.totalPages;
    } catch (error) {
      console.error('Error loading visits:', error);
      // Mostrar un mensaje de error al usuario
      this.visits = [];
      this.totalItems = 0;
      this.totalPages = 0;
    } finally {
      this.isLoading = false;
    }
  }

  onPageChange(page: number) {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadVisits();
    }
  }

  onSortChange(field: string) {
    this.sortField = this.sortField === field ? `-${field}` : field;
    this.currentPage = 1; // Volver a la primera página al cambiar el ordenamiento
    this.loadVisits();
  }

  onFilterChange() {
    this.currentPage = 1; // Volver a la primera página al filtrar
    this.loadVisits();
  }

  formatDate(date: string): string {
    try {
      return new Date(date).toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return date;
    }
  }

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
    if (this.map) {
      this.markerLayer.clearLayers();
      this.map.remove();
    }
  }
}
