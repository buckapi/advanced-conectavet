import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { GlobalService } from '@app/services/global.service';
import { RealtimeCategoriesService } from '@app/services/realtime-catwgories.service';
import { RealtimeServicesService } from '@app/services/realtime-services.service';
import { ServiceService } from '@app/services/service.service'; // Importar el servicio de Service
import Swal from 'sweetalert2'; // Importar SweetAlert2

@Component({
  selector: 'app-servicesadministrator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './servicesadministrator.component.html',
  styleUrl: './servicesadministrator.component.css'
})
export class ServicesadministratorComponent {
  updatingServiceId='';
  updating=false;
  services: any[] = [
    { name: 'Medicina Preventiva', categoryKey: 'salud_general' },
    { name: 'Vacunación', categoryKey: 'salud_general' },
    { name: 'Desparasitación', categoryKey: 'salud_general' },
    { name: 'Emergencia', categoryKey: 'urgencias' },
    { name: 'Cirugía Veterinaria', categoryKey: 'cirugias' },
    { name: 'Tipo de Procedimientos', categoryKey: 'presupuesto' },
    { name: 'Endocrinología', categoryKey: 'especialidades_veterinaria' },
    { name: 'Oftalmología', categoryKey: 'especialidades_veterinaria' },
    { name: 'Cardiología', categoryKey: 'especialidades_veterinaria' },
    { name: 'Neurología', categoryKey: 'especialidades_veterinaria' },
    { name: 'Nefrología', categoryKey: 'especialidades_veterinaria' },
    { name: 'Odontología', categoryKey: 'especialidades_veterinaria' },
    { name: 'Nutricionista', categoryKey: 'especialidades_veterinaria' },
    { name: 'Etología', categoryKey: 'especialidades_veterinaria' },
    { name: 'Oncología', categoryKey: 'especialidades_veterinaria' },
    { name: 'Hospitalización', categoryKey: 'hospitalizacion' },
    { name: 'Radiología', categoryKey: 'diagnostico_imagen' },
    { name: 'Ecografía', categoryKey: 'diagnostico_imagen' },
    { name: 'Listado de Exámenes', categoryKey: 'laboratorio_clinico' },
    { name: 'Terapia Física y Rehabilitación', categoryKey: 'rehabilitacion' },
    { name: 'Hotel y Guardería', categoryKey: 'hotel_guarderia' },
    { name: 'Peluquería y Spa', categoryKey: 'estetica' },
    { name: 'Eutanasia', categoryKey: 'asistencia_final_vida' },
    { name: 'Servicios de Cremación', categoryKey: 'asistencia_final_vida' }
  ];
  constructor(
    public global:GlobalService,
    public realtimeServices: RealtimeServicesService,
    private serviceService: ServiceService ,
    public realtimeCategories:RealtimeCategoriesService
    
    // Inyectar el servicio de Service
  ){}
  async deleteService(serviceId: string) { // Método para eliminar un servicio
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) { // Si el usuario confirma la eliminación
      try {
        const response = await this.serviceService.deleteService(serviceId); // Llamada al método deleteService del servicio
        console.log('Servicio eliminado:', response);
        // Aquí puedes actualizar la lista de servicios si es necesario
        Swal.fire({
          icon: 'success',
          title: 'Servicio eliminado',
          text: 'El servicio ha sido eliminado con éxito.'
        });
      } catch (error) {
        console.error('Error al eliminar el servicio:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error al eliminar',
          text: 'Ocurrió un error al eliminar el servicio.'
        });
      }
    }
  }
  isMobile() {
    return window.innerWidth <= 768; // Ajusta el tamaño según tus necesidades
  }
  updateCarouselValue(serviceId:any,other:any){}
}
