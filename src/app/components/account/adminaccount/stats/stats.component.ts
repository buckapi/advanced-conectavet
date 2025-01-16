import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { RealtimeVisitsService } from '@app/services/realtime-visits.service';
import { Chart, ChartConfiguration, ChartData, registerables } from 'chart.js';
import { firstValueFrom } from 'rxjs';
import * as L from 'leaflet';

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

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule, NgbModule],
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css']
})
export class StatsComponent implements OnInit, OnDestroy {
  @ViewChild('pieChart') pieChartCanvas!: ElementRef;
  selectedVisit: Visit | null = null;
  private chart?: Chart;
  private currentVisits: Visit[] = [];
  private map?: L.Map;
  private markers: L.Marker[] = [];

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

    this.map = L.map('worldMap').setView([20, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: ' OpenStreetMap contributors'
    }).addTo(this.map);
  }

  private async updateMapMarkers() {
    if (!this.map) return;

    // Clear existing markers
    this.markers.forEach(marker => marker.remove());
    this.markers = [];

    // Get country stats
    const countryStats = this.getCountryStats();

    // Create markers for each country
    for (const [country, count] of Object.entries(countryStats)) {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(country)}`);
        const data = await response.json();
        
        if (data && data[0]) {
          const marker = L.marker([parseFloat(data[0].lat), parseFloat(data[0].lon)])
            .bindPopup(`${country}: ${count} visits`)
            .addTo(this.map);
          this.markers.push(marker);
        }
      } catch (error) {
        console.error(`Error getting coordinates for ${country}:`, error);
      }
    }
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

  ngOnDestroy() {
    if (this.chart) {
      this.chart.destroy();
    }
    if (this.map) {
      this.map.remove();
    }
  }
}
