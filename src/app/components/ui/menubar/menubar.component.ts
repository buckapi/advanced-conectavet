import { Component, HostListener } from '@angular/core';
import { GlobalService } from '@app/services/global.service';
import { CommonModule } from '@angular/common';
import { AuthPocketbaseService } from '@app/services/auth-pocketbase.service';
import { AuthboxComponent } from '@app/components/sections/authbox/authbox.component';
import { NotLoggedInComponent } from "../../sections/not-logged-in/not-logged-in.component";
import { MapComponent } from '@app/components/map/map.component';

@Component({
  selector: 'app-menubar',
  standalone: true,
  imports: [CommonModule, AuthboxComponent, NotLoggedInComponent, MapComponent],
  templateUrl: './menubar.component.html',
  styleUrls: ['./menubar.component.css']
})
export class MenubarComponent {
  isDragging: boolean = false;
  startY: number = 0;
  currentY: number = 0;
  threshold: number = 50;  // Umbral de deslizamiento para activar el offcanvas
  isOffcanvasActive: boolean = false;

  constructor(public global: GlobalService,
    public auth: AuthPocketbaseService
  ) {}
  isMobile() {
    return window.innerWidth <= 768; // Ajusta el tamaño según tus necesidades
  }
  // Método para prevenir el comportamiento del click en el ícono marker
  preventClick(event: MouseEvent) {
    event.preventDefault(); // Evita el comportamiento predeterminado del click
    event.stopPropagation(); // Detiene la propagación del evento para no activar el offcanvas con click
  }

  // Detecta el inicio del arrastre (dispositivos táctiles) solo si ocurre sobre el ícono de marker
  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    const target = event.target as HTMLElement;
    if (target.closest('.marker-icon')) { // Solo se ejecuta si el evento ocurre en el ícono marker
      this.isDragging = true;
      this.startY = event.touches[0].clientY;
    }
  }

  // Detecta el movimiento del arrastre solo si es sobre el ícono marker
  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    if (this.isDragging) {
      this.currentY = event.touches[0].clientY;
      const distance = this.startY - this.currentY;

      // Mueve solo el ícono marker durante el arrastre
      if (distance > 0) {
        const markerIcon = document.querySelector('.marker-icon') as HTMLElement;
        if (markerIcon) {
          markerIcon.style.transform = `translateY(${Math.min(-distance, 0)}px)`;
        }
      }
    }
  }

    
  // Detecta cuando el arrastre termina
  @HostListener('touchend', ['$event'])
  onTouchEnd() {
    if (this.isDragging) {
      const distance = this.startY - this.currentY;

      // Si el arrastre supera el umbral, activa el offcanvas
      if (distance > this.threshold) {
        this.isOffcanvasActive = true;

        // Activa la clase 'show' en el offcanvas para mostrarlo
        const offcanvas = document.querySelector('#offcanvasBottom18') as HTMLElement;
        if (offcanvas) {
          offcanvas.classList.add('show');
        }

      } else {
        // Si no, resetea la posición del ícono marker
        const markerIcon = document.querySelector('.marker-icon') as HTMLElement;
        if (markerIcon) {
          markerIcon.style.transform = 'translateY(0)';
        }
      }
    }

    this.isDragging = false;
  }

  // Método para cerrar el offcanvas
  closeOffcanvas() {
    this.isOffcanvasActive = false;

    // Remueve la clase 'show' para ocultar el offcanvas
    const offcanvas = document.querySelector('#offcanvasBottom18') as HTMLElement;
    if (offcanvas) {
      offcanvas.classList.remove('show');
    }

    // Restaura la posición del ícono marker
    const markerIcon = document.querySelector('.marker-icon') as HTMLElement;
    if (markerIcon) {
      markerIcon.style.transform = 'translateY(0)';
    }
  }
}
