import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AuthPocketbaseService } from '@app/services/auth-pocketbase.service';
import { UserInterface } from '@app/interfaces/user-interface';
import { GlobalService } from '@app/services/global.service';
import { HistoryComponent } from '../history/history.component';
import { Pet, RealtimePetsService } from '@app/services/realtime-pet.service';
import { PetService } from '@app/services/pet.service';
import Swal from 'sweetalert2';
interface PetInterface {
  // Define las propiedades de PetInterface aquí
  name: string;
  images: string[];
  age: number;
  // ... otras propiedades ...
}
@Component({
  selector: 'app-pets',
  standalone: true,
  imports: [CommonModule,HistoryComponent],
  templateUrl: './pets.component.html',
  styleUrl: './pets.component.css'
})

export class PetsComponent {
  
  canAddMorePets: boolean = false; // Agrega esta propiedad

pets: Pet[] = [];
filteredPets: any[] = [];
  currentUser: UserInterface = {} as UserInterface;

  constructor(
    private petService: PetService,
    public global:GlobalService,
    public auth: AuthPocketbaseService,
    public realtimePets:RealtimePetsService
  
  ) {
    this.realtimePets.pets$.subscribe(pets => {
      this.pets = pets;
    });

    this.currentUser = this.auth.getCurrentUser();
  }

  async deletePet(petId: string, event: Event) {
    event.stopPropagation(); // Detiene la propagación del evento de clic

    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esta acción",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar'
    });

    if (result.isConfirmed) {
      try {
        await this.petService.deletePet(petId);
        Swal.fire(
          'Eliminado!',
          'La mascota ha sido eliminada.',
          'success'
        );
        // Aquí puedes actualizar la lista de mascotas si es necesario
      } catch (error) {
        Swal.fire(
          'Error!',
          'Hubo un problema al eliminar la mascota.',
          'error'
        );
      }
    }
  }

  filterPets() {
    this.filteredPets = this.pets.filter(pet => pet.idTutor === this.auth.getUserId());
  }
  onMouseOver(event: MouseEvent) {
    // Cambiar el estilo del elemento al pasar el mouse
    const target = event.currentTarget as HTMLElement;
    target.style.backgroundColor = '#f0f0f0'; // Cambia el color de fondo
  }

  onMouseOut(event: MouseEvent) {
    // Restaurar el estilo del elemento al salir el mouse
    const target = event.currentTarget as HTMLElement;
    target.style.backgroundColor = ''; // Restaura el color de fondo original
  }
  isMobile() {
    return window.innerWidth <= 768; // Ajusta el tamaño según tus necesidades
  }
  showHistoryF(pet:Pet){
    this.global.showHistory=true;
    this.global.petSelected=pet;
  }
  validatePetsLimit() {
    const currentPets = this.pets.length || 0;
    
    if (currentPets >= 1) {
      Swal.fire({
        title: '¡Plan Limitado!',
        text: 'Para agregar más mascotas, necesitas suscribirte a un plan premium',
        icon: 'warning',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#3ba5a8'
      });
    } else {
      this.global.setFormOption('category');
    }
  }
}
