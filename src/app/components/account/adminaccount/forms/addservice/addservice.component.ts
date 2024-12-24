import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RealtimeCategoriesService } from '@app/services/realtime-catwgories.service';
import { GlobalService } from '@app/services/global.service';
import Swal from 'sweetalert2';
import PocketBase from 'pocketbase';
import { CommonModule } from '@angular/common';

const pb = new PocketBase('https://db.conectavet.cl:8080');

@Component({
  selector: 'app-addservice',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './addservice.component.html',
  styleUrls: ['./addservice.component.css']
})
export class AddserviceComponent {
  @Output() serviceAdded = new EventEmitter<void>();
  serviceName: string = '';
  serviceDescription: string = '';
  idCategory: string = '';
  carouselActive: boolean = false;
  categories: any[] = [];

  constructor(
    public global: GlobalService,
    private realtimeCategoriesService: RealtimeCategoriesService
  ) {
    // this.loadCategories();
  }

  async loadCategories() {
    this.categories = (await this.realtimeCategoriesService.categories$.toPromise()) || [];
}

  async addService() {
    const newService = {
      name: this.serviceName,
      description: this.serviceDescription,
      idCategory: this.idCategory,
      images: JSON.stringify([]),
      status: 'activo',
      option: this.carouselActive
    };

    try {
      const createdService = await pb.collection('services').create(newService);
      console.log('Servicio creado:', createdService);
      this.serviceName = '';
      this.serviceDescription = '';
      this.idCategory = '';
      this.carouselActive = false;
      this.serviceAdded.emit();

      // Mostrar alerta de éxito
      Swal.fire({
        title: 'Éxito!',
        text: 'Servicio agregado correctamente.',
        icon: 'success',
        confirmButtonText: 'Aceptar'
      });
    } catch (error) {
      console.error('Error al agregar el servicio:', error);
      
      // Mostrar alerta de error
      Swal.fire({
        title: 'Error!',
        text: 'No se pudo agregar el servicio.',
        icon: 'error',
        confirmButtonText: 'Aceptar'
      });
    }
  }

  isMobile() {
    return window.innerWidth <= 768; // Ajusta el tamaño según tus necesidades
  }
}
