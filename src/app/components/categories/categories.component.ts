import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ConfigService } from '@app/services/config.service';
import {  GlobalService } from '@app/services/global.service';
import { RealtimeCategoriesService } from '@app/services/realtime-catwgories.service';
import { Category } from '@app/interfaces/category.interface'; // Importar la interfaz

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css'
})
export class CategoriesComponent {
constructor(  
  public config: ConfigService,
  public global:GlobalService,
  public realtimeCategories:RealtimeCategoriesService){
  
}
selectCategory(category: Category) {
  this.global.categoryFiltersAplcated = true;
  this.global.categorySelected=category; 
}
}
