import { CommonModule } from '@angular/common';
import { Component, Renderer2 } from '@angular/core';
import { AuthboxComponent } from '@app/components/sections/authbox/authbox.component';
import { AuthPocketbaseService } from '@app/services/auth-pocketbase.service';
import { ConfigService } from '@app/services/config.service';
import { GlobalService } from '@app/services/global.service';
import { of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { UserInterface } from '@app/interfaces/user-interface';
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    AuthboxComponent
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
}) 

export class SidebarComponent {
  currentUser: UserInterface = {} as UserInterface;
  constructor(
    public configService: ConfigService,
    private renderer: Renderer2,
    public auth:AuthPocketbaseService,  
    public global: GlobalService
  ) {

    this.currentUser = this.auth.getCurrentUser();
  }


goRoute(route:string){
  this.applyClasses();
  this.global.setRoute(route);

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
}
