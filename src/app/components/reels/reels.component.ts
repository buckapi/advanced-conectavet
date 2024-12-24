import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ConfigService } from '@app/services/config.service';
import { GlobalService } from '@app/services/global.service';

@Component({
  selector: 'app-reels',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reels.component.html',
  styleUrl: './reels.component.css'
})
export class ReelsComponent {
  get reels() {
    return Object.entries(this.config.defaultConfig.reels);
  }
  constructor(  public config: ConfigService,public global:GlobalService){
  
  }
  selectCategory(categoryKey: string) {
    // this.config.selectCategory(categoryKey as keyof typeof this.config.defaultConfig.reels);
  }
}
