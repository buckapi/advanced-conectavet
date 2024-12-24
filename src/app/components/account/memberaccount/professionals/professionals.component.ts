import { CommonModule } from '@angular/common';
import { Component, OnInit,HostListener } from '@angular/core';
import { AuthPocketbaseService } from '@app/services/auth-pocketbase.service';
import { GlobalService } from '@app/services/global.service';
import { ProfessionalService } from '@app/services/professional.service';
import { RealtimeProfessionalsService } from '@app/services/realtime-professional.service';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';
export interface Professional {
  id:string;
  name: string; 
  gender:string;
    images?: string; // JSON array or object
    services?: string[]; // JSON array or object
    IdMember?: string; // ID del miembro
    status?: string; 
}
@Component({
  selector: 'app-professionals',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './professionals.component.html',
  styleUrls: ['./professionals.component.css'], // Fixed styleUrls typo
})
export class ProfessionalsComponent implements OnInit {

  isMobile: boolean = this.isMobileScreen();

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isMobile = this.isMobileScreen();
  }

  professionals: any[] = [];
  filteredProfessionals: any[] = [];
  constructor(
    public auth:AuthPocketbaseService,
    public global: GlobalService,
    public realtimeProfessionals: RealtimeProfessionalsService,
    public professionalService:ProfessionalService
  ) {
    // Assign the observable to a public property
    this.realtimeProfessionals.professionals$;
  }
  filterProfessionals() {
    this.filteredProfessionals = this.professionals.filter(professional => professional.IdMember === this.auth.getUserId());
  }

  get hasProfessionals() {
    return this.filteredProfessionals.length > 0;
  }
  ngOnInit() {
    this.realtimeProfessionals.professionals$.subscribe(professionals => {
      this.professionals = professionals;
      this.filterProfessionals();

      console.log(professionals); // Verifica los datos que se reciben
    });
  }
  

  async deleteProfessional(professionalId: string) {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: '¡No podrás revertir esto!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        await this.professionalService.deleteProfessional(professionalId);
        // Optionally, you can refresh the list of professionals after deletion
        this.professionals = this.professionals.filter(professional => professional.id !== professionalId);
        this.filterProfessionals(); // Update filtered list
        Swal.fire('Eliminado!', 'El profesional ha sido eliminado.', 'success');
      } catch (error) {
        Swal.fire('Error!', 'No se pudo eliminar el profesional.', 'error');
      }
    }
  }
  isMobileScreen(): boolean {
    return window.innerWidth <= 768; // Ajusta el tamaño según tus necesidades
  }

}
