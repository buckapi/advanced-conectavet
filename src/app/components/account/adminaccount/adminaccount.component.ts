import { CommonModule } from '@angular/common';
import { Component, Renderer2 } from '@angular/core';
import { UserInterface } from '@app/interfaces/user-interface';
import { AuthPocketbaseService } from '@app/services/auth-pocketbase.service';
import { ServicesadministratorComponent } from "./servicesadministrator/servicesadministrator.component";
import { GlobalService } from '@app/services/global.service';
import { AddserviceComponent } from './forms/addservice/addservice.component';
import { AddcategoryComponent } from './forms/addcategory/addcategory.component';
import { CategoriesadministratorComponent } from "./categoriesadministrator/categoriesadministrator.component";
import { of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { RequestsComponent } from './requests/requests.component';

@Component({
  selector: 'app-adminaccount',
  standalone: true,
  imports: [
    CommonModule, 
    RequestsComponent,
    ServicesadministratorComponent, 
    AddserviceComponent, 
    AddcategoryComponent, 
    CategoriesadministratorComponent
  ],
  templateUrl: './adminaccount.component.html',
  styleUrl: './adminaccount.component.css'
})
export class AdminaccountComponent {
  optionSelected=false;
  currentUser: UserInterface = {} as UserInterface;

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
    private renderer: Renderer2,
    
    public auth: AuthPocketbaseService,public global:GlobalService) {
    this.currentUser= this.auth.getCurrentUser();
  }
  applyClasses() {
    // Añadir la clase "dark-overlay" al elemento con id "overlay"
    const overlay = this.renderer.selectRootElement('#overlay', true);
    this.renderer.removeClass(overlay, 'active');
    this.renderer.addClass(overlay, 'dark-overlay');

    // Añadir la clase "sidebar" al elemento con id "sidebar"
    const sidebar = this.renderer.selectRootElement('#sidebar', true);
    this.renderer.removeClass(sidebar, 'show');
    this.renderer.addClass(sidebar, 'sidebar');

  }
  logout() {
    this.auth.logoutUser().pipe(
      tap(() => {
        // Acciones que ocurren al finalizar el logout con éxito
        const overlay = this.renderer.selectRootElement('#overlay', true);
        this.renderer.removeClass(overlay, 'active');
        this.renderer.removeClass(overlay, 'dark-overlay');
        this.renderer.addClass(overlay, 'dark-overlay');
        
        // Redirigir al usuario, limpiar el estado de la app, etc.
      }),
      catchError(error => {
        console.error('Error al cerrar sesión:', error);
        const overlay = this.renderer.selectRootElement('#overlay', true);
        this.renderer.removeClass(overlay, 'active');
        this.renderer.removeClass(overlay, 'dark-overlay');
        this.renderer.addClass(overlay, 'dark-overlay');
    
        // Muestra una alerta o maneja el error de alguna manera
        return of(null); // Continúa el flujo devolviendo un observable vacío
      })
    ).subscribe();
  }
  isMobile() {
    return window.innerWidth <= 768; // Ajusta el tamaño según tus necesidades
  }
}
