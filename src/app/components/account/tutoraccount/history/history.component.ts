import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { ConfigService } from '@app/services/config.service';
import { GlobalService } from '@app/services/global.service';
import { RealtimeMedicalRecordsService } from '@app/services/realtime-medical-records.service';
import { RealtimeServicesService } from '@app/services/realtime-services.service';
import { RealtimeSpecialistsService } from '@app/services/realtime-specialists.service';
export interface Specialist {
  id: string;
  full_name: string;
  // Otras propiedades que necesites
}
interface Entry {
  fecha: string;
  color:string;
  category:Category;
  motivo: string;
  observaciones?: string; // Opcional
  diagnostico?: string;   // Opcional
  tratamiento?: string;   // Opcional
  serviceId?: string;     // Opcional
}

interface Historico {
  historico: Entry[];
}
interface Category {
  name: string;
  categoryKey:string;
}
@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent  implements OnInit{
  medicalRecords: any[] = [];
  // specialistsMap: { [key: string]: Specialist } = {}; // Declarar specialistsMap
  specialistsMap: { [key: string]: string } = {}; // Cambia a string para almacenar solo nombres

  services: any[] = [];
  selectedService: string = '';  // Almacena el nombre del servicio seleccionado
  showHistory=false;
  maxHistorico: Historico = {
    historico: [
    //   {
    //       fecha: "01/02/2023",
    //       motivo: "Vacunación (triple vírica)",
    //       observaciones: "Saludable, no presentó reacciones.",
    //       serviceId: "1",
    //       color: "#B9E3C6",  // Verde pastel (salud_general)
    //       category: {
    //           name: 'Vacunación',
    //           categoryKey: 'salud_general'
    //       }
    //   },
    //   {
    //       fecha: "15/03/2024",
    //       motivo: "Consulta de rutina",
    //       observaciones: "Peso adecuado, se recomienda seguir con el control veterinario cada seis meses.",
    //       serviceId: "15",
    //       color: "#B9E3C6",  // Verde pastel (salud_general)
    //       category: {
    //           name: 'Medicina Preventiva',
    //           categoryKey: 'salud_general'
    //       }
    //   }
  ]
  
  };
  
constructor(  
  private medicalRecordsService: RealtimeMedicalRecordsService,
  private specialistsService: RealtimeSpecialistsService,

  public realtimeMedicalRecords: RealtimeMedicalRecordsService,
  public config: ConfigService,public global:GlobalService,

  public realtimeServices:RealtimeServicesService

){
  this.realtimeServices.services$.subscribe((data) => {
    this.services = data; });

}

onTabChange(event: any) {
  const targetId = event.target.id; // Ahora esto debería devolver 'profile1'
  console.log('Tab changed to:', targetId); // Verifica qué pestaña se está activando
  if (targetId === 'profile1') {
    this.loadSpecialists(); // Llama al método para cargar los especialistas
  }
}
 formatDate(dateString: string): string {
    const date = new Date(dateString);
    const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    
    const diaSemana = diasSemana[date.getDay()];
    const dia = date.getDate();
    const mes = meses[date.getMonth()];
    const anio = date.getFullYear();

    return `${diaSemana} ${dia} de ${mes} de ${anio}`;
  }

loadMedicalCards() {
  this.medicalRecordsService.getMedicalRecordsByPetId(this.global.petSelected.id).subscribe(cards => {
    this.medicalRecords = cards; // Asegúrate de que esto esté llenando medicalCards
    console.log('Medical Records loaded:', this.medicalRecords); // Verifica que se estén cargando las tarjetas médicas
  });
}

// loadSpecialists() {
//   const clinicIds = this.medicalCards.map(card => card.clinicId);
//   // Obtener información de los especialistas
//   this.specialistsService.getSpecialistsByIds(clinicIds).subscribe(specialists => {
//     specialists.forEach(specialist => {
//       this.specialistsMap[specialist.id] = specialist; // Almacenar en un mapa
//     });
//   });
// }
loadSpecialists() {
  console.log('Loading specialists...');
  const clinicIds = this.medicalRecords.map(card => card.clinicId);
  clinicIds.forEach(clinicId => {
    this.specialistsService.getFullNameByClinicId(clinicId).subscribe(full_name => {
      this.specialistsMap[clinicId] = full_name;
      console.log(`Clinic ID: ${clinicId}, Full Name: ${full_name}`);
    });
  });
}


// loadSpecialists() {
//   const clinicIds = this.medicalCards.map(card => card.clinicId);
//   this.specialistsService.getSpecialistsByIds(clinicIds).subscribe(specialists => {
//     console.log('Specialists loaded:', specialists); // Verifica los especialistas cargados
//     specialists.forEach(specialist => {
//       this.specialistsMap[specialist.id] = specialist;
//     });
//   });
// }
isMobile(){
  if (window.innerWidth < 768) {
    return true;
  } else {
    return false;
  }
}
get age(): string {
    const today = new Date();
    if (!this.global.petSelected.birthDate) {
        return 'Edad no disponible';
    }
    const birthDate = new Date(this.global.petSelected.birthDate);
    
    // Calcular diferencias
    let ageYears = today.getFullYear() - birthDate.getFullYear();
    let monthDiff = today.getMonth() - birthDate.getMonth();
    let dayDiff = today.getDate() - birthDate.getDate();

    // Ajustar si el cumpleaños de este año aún no ha ocurrido
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        ageYears--;
        monthDiff += 12;
    }
    
    // Si la edad es menor a un año, calcular en meses y días
    if (ageYears < 1) {
        if (monthDiff === 0) {
            // Si es menor a un mes, mostrar en días
            const days = dayDiff < 0 ? new Date(today.getFullYear(), today.getMonth(), 0).getDate() + dayDiff : dayDiff;
            return `${days} día${days !== 1 ? 's' : ''}`;
        } else {
            // Mostrar en meses
            return `${monthDiff} mes${monthDiff !== 1 ? 'es' : ''}`;
        }
    }
        // Si tiene un año o más, mostrar en años
    return `${ageYears} año${ageYears !== 1 ? 's' : ''}`;
}
ngOnInit(): void {
  const petId = this.global.petSelected.id; // Asegúrate de que este es el petId correcto
  this.realtimeMedicalRecords.getMedicalRecordsByPetId(petId).subscribe(data => {
      this.medicalRecords = data;
      console.log("MEDICAL RECORDS",JSON.stringify(this.medicalRecords))
  });
}
showServiceAlert(serviceName: string) {
  this.selectedService = serviceName;  // Actualiza el servicio seleccionado
  alert(`Servicio seleccionado: ${serviceName}`);
}
setPet(){
  this.showHistory=true;
}
}
