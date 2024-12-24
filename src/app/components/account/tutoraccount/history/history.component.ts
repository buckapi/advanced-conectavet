import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ConfigService } from '@app/services/config.service';
import { GlobalService } from '@app/services/global.service';
import { RealtimeServicesService } from '@app/services/realtime-services.service';
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
export class HistoryComponent {
  services: any[] = [];
  selectedService: string = '';  // Almacena el nombre del servicio seleccionado
  showHistory=false;
  maxHistorico: Historico = {
    historico: [
      {
          fecha: "01/02/2023",
          motivo: "Vacunación (triple vírica)",
          observaciones: "Saludable, no presentó reacciones.",
          serviceId: "1",
          color: "#B9E3C6",  // Verde pastel (salud_general)
          category: {
              name: 'Vacunación',
              categoryKey: 'salud_general'
          }
      },
      {
          fecha: "15/03/2023",
          motivo: "Desparasitante interno",
          observaciones: "Se administró tratamiento oral, sin efectos secundarios.",
          serviceId: "2",
          color: "#B9E3C6",  // Verde pastel (salud_general)
          category: {
              name: 'Desparasitación',
              categoryKey: 'salud_general'
          }
      },
      {
          fecha: "28/04/2023",
          motivo: "Consulta por vómitos",
          diagnostico: "Gastroenteritis leve",
          tratamiento: "Medicación y dieta blanda.",
          serviceId: "3",
          color: "#B9E3C6",  // Verde pastel (salud_general)
          category: {
              name: 'Medicina Preventiva',
              categoryKey: 'salud_general'
          }
      },
      {
          fecha: "10/06/2023",
          motivo: "Vacunación (rabia)",
          observaciones: "Saludable, ninguna reacción adversa.",
          serviceId: "4",
          color: "#B9E3C6",  // Verde pastel (salud_general)
          category: {
              name: 'Vacunación',
              categoryKey: 'salud_general'
          }
      },
      {
          fecha: "20/07/2023",
          motivo: "Desparasitante externo (pulgas y garrapatas)",
          observaciones: "Aplicación de pipeta, se recomienda repetir en 3 meses.",
          serviceId: "5",
          color: "#B9E3C6",  // Verde pastel (salud_general)
          category: {
              name: 'Desparasitación',
              categoryKey: 'salud_general'
          }
      },
      {
          fecha: "05/08/2023",
          motivo: "Consulta por cojera en la pata trasera",
          diagnostico: "Esguince leve",
          tratamiento: "Reposo y antiinflamatorios.",
          serviceId: "6",
          color: "#B9E3C6",  // Verde pastel (salud_general)
          category: {
              name: 'Medicina Preventiva',
              categoryKey: 'salud_general'
          }
      },
      {
          fecha: "15/09/2023",
          motivo: "Revisión dental",
          observaciones: "Se realizó limpieza, se recomienda cepillado diario.",
          serviceId: "7",
          color: "#FAD6C8",  // Rosa pastel (especialidades_veterinaria)
          category: {
              name: 'Odontología',
              categoryKey: 'especialidades_veterinaria'
          }
      },
      {
          fecha: "30/09/2023",
          motivo: "Consulta por picazón intensa",
          diagnostico: "Alergia alimentaria",
          tratamiento: "Cambio de dieta y antihistamínicos.",
          serviceId: "8",
          color: "#FAD6C8",  // Rosa pastel (especialidades_veterinaria)
          category: {
              name: 'Endocrinología',
              categoryKey: 'especialidades_veterinaria'
          }
      },
      {
          fecha: "10/10/2023",
          motivo: "Vacunación (influencia canina)",
          observaciones: "Saludable, bien tolerada.",
          serviceId: "9",
          color: "#B9E3C6",  // Verde pastel (salud_general)
          category: {
              name: 'Vacunación',
              categoryKey: 'salud_general'
          }
      },
      {
          fecha: "25/10/2023",
          motivo: "Consulta por diarrea",
          diagnostico: "Infección bacteriana",
          tratamiento: "Antibióticos y dieta estricta.",
          serviceId: "10",
          color: "#B9E3C6",  // Verde pastel (salud_general)
          category: {
              name: 'Medicina Preventiva',
              categoryKey: 'salud_general'
          }
      },
      {
          fecha: "15/11/2023",
          motivo: "Revisión postoperatoria (esterilización)",
          observaciones: "Recuperación sin complicaciones.",
          serviceId: "11",
          color: "#D9EAD3",  // Verde claro (cirugías)
          category: {
              name: 'Cirugía Veterinaria',
              categoryKey: 'cirugias'
          }
      },
      {
          fecha: "01/12/2023",
          motivo: "Consulta por pérdida de peso",
          diagnostico: "Problemas de tiroides",
          tratamiento: "Exámenes adicionales y medicación.",
          serviceId: "12",
          color: "#FAD6C8",  // Rosa pastel (especialidades_veterinaria)
          category: {
              name: 'Endocrinología',
              categoryKey: 'especialidades_veterinaria'
          }
      },
      {
          fecha: "10/01/2024",
          motivo: "Consulta por tos persistente",
          diagnostico: "Bronquitis leve",
          tratamiento: "Broncodilatadores y reposo.",
          serviceId: "13",
          color: "#B9E3C6",  // Verde pastel (salud_general)
          category: {
              name: 'Medicina Preventiva',
              categoryKey: 'salud_general'
          }
      },
      {
          fecha: "20/02/2024",
          motivo: "Vacunación (parvovirus)",
          observaciones: "Saludable, ninguna reacción adversa.",
          serviceId: "14",
          color: "#B9E3C6",  // Verde pastel (salud_general)
          category: {
              name: 'Vacunación',
              categoryKey: 'salud_general'
          }
      },
      {
          fecha: "15/03/2024",
          motivo: "Consulta de rutina",
          observaciones: "Peso adecuado, se recomienda seguir con el control veterinario cada seis meses.",
          serviceId: "15",
          color: "#B9E3C6",  // Verde pastel (salud_general)
          category: {
              name: 'Medicina Preventiva',
              categoryKey: 'salud_general'
          }
      }
  ]
  
  };
  
constructor(  public config: ConfigService,public global:GlobalService,

  public realtimeServices:RealtimeServicesService

){
  this.realtimeServices.services$.subscribe((data) => {
    this.services = data; });

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


showServiceAlert(serviceName: string) {
  this.selectedService = serviceName;  // Actualiza el servicio seleccionado
  alert(`Servicio seleccionado: ${serviceName}`);
}
setPet(){
  this.showHistory=true;
}
}
