import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AuthPocketbaseService } from '@app/services/auth-pocketbase.service';
import { UserInterface } from '@app/interfaces/user-interface';
import { GlobalService } from '@app/services/global.service';
import { RealtimeServicesService } from '@app/services/realtime-services.service';
import { RealtimeCategoriesService } from '@app/services/realtime-catwgories.service';
import { ActiveservicesComponent } from './activeservices/activeservices.component';
import { ProfessionalsComponent } from './professionals/professionals.component';
import { AddprofessionalComponent } from "./forms/addprofessional/addprofessional.component";
import { FormsModule } from '@angular/forms';
import { CheckService } from '@app/services/check-service.service';
import { ProfileComponent } from './profile/profile.component';
@Component({
  selector: 'app-memberaccount',
  standalone: true,
  imports: [CommonModule, ActiveservicesComponent, 
   ProfileComponent, ProfessionalsComponent, AddprofessionalComponent,FormsModule],
  templateUrl: './memberaccount.component.html',
  styleUrl: './memberaccount.component.css'
})
export class MemberaccountComponent {
  optionSelected=false;
  
  currentUser: UserInterface = {} as UserInterface;
  services: any[] = [];
   // Definir la propiedad 'services' como un arreglo
  serviceCount: number = 0; // Agregar esta línea
  serviceCountByCategory: { [key: string]: number } = {}; // Agregar esta línea

  getCategory(serviceName: string) {
    // Lógica para obtener la categoría
    const category = this.services.find(service => service.name === serviceName); // Ejemplo de búsqueda
    if (!category) {
      console.warn(`Categoría no encontrada para el servicio: ${serviceName}`); // Mensaje de advertencia
    }
    return category ? { id: category.categoryKey } : { id: null }; // Retorna la categoría encontrada o null
  }

  constructor(
    public realtimeServices: RealtimeServicesService,
    public realtimeCategories: RealtimeCategoriesService,
    public auth: AuthPocketbaseService,
    public global: GlobalService,
    public check:CheckService,
  ) {
    this.currentUser = this.auth.getCurrentUser();
    
    // Suscribirse a los servicios para calcular el conteo
    this.realtimeServices.services$.subscribe(services => {
        this.services = services; // Asignar los servicios de realtimeServices
        
        // Obtener todas las categorías
        this.realtimeCategories.categories$.subscribe(categories => {
            categories.forEach(category => {
                const count = services.filter(service => service.idCategory === category.id).length; 
                this.serviceCountByCategory[category.id] = count; // Almacenar el conteo por categoría
                console.log(`Conteo de servicios en la categoría ${category.id}: ${count}`); // Mensaje en consola por cada categoría
            });
        });
    });
    
    
    // Suscribirse a las categorías para asegurarse de que se carguen
    this.realtimeCategories.categories$.subscribe(categories => {
        // Aquí puedes manejar las categorías si es necesario
    });
  }
  isMobile() {
    return window.innerWidth <= 768; // Ajusta el tamaño según tus necesidades
  }
}
