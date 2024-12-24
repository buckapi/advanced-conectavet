import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ConfigService } from '@app/services/config.service';
import { DeviceService } from '@app/services/device.service';
import { GlobalService } from '@app/services/global.service';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './banner.component.html',
  styleUrl: './banner.component.css'
})
export class BannerComponent {
  specialists: any[] = [];

  isMobile: boolean = false;
  activeRoute = 'home';isListView: boolean = true;  // Por defecto, vista lista
  constructor(
    public global: GlobalService,
    public device: DeviceService,
    public configService: ConfigService
  ) {}
  toggleView(view: string): void {
    this.isListView = (view === 'list');
  }
  ngOnInit() {
    this.device.isMobile().subscribe(isMobile => {
      this.isMobile = isMobile;
    });
  }
}
