import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { CategoriesComponent } from '@app/components/categories/categories.component';
import { GlobalService } from '@app/services/global.service';
import { ServicesComponent } from '../../services/services.component';
import { ReeldetailComponent } from '@app/components/reeldetail/reeldetail.component';
import { AuthPocketbaseService } from '@app/services/auth-pocketbase.service';
import { AuthboxComponent } from '@app/components/sections/authbox/authbox.component';
import { DeviceService } from '@app/services/device.service';
import { CartButtonComponent } from '../cart-button/cart-button.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CartButtonComponent,
    ReeldetailComponent,
    CommonModule,
    CategoriesComponent,
    ServicesComponent,
    AuthboxComponent
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit{
  isMobile: boolean = false;
  hasItemsInCart: boolean = false;

  constructor(
    public device:DeviceService,
    public global: GlobalService,
    public auth: AuthPocketbaseService
  ) {
    this.auth.permision();
  }
  // Detectamos el evento de scroll
  @HostListener('window:scroll', ['$event'])
  onWindowScroll() {
    const currentScroll =
      window.pageYOffset || document.documentElement.scrollTop;

    if (
      currentScroll > this.global.lastScrollTop &&
      currentScroll > this.global.scrollThreshold
    ) {
      // Si se desplaza hacia abajo más de 200 píxeles
      this.global.isScrollingDown = true;
    } else if (currentScroll < this.global.lastScrollTop) {
      // Si se desplaza hacia arriba
      this.global.isScrollingDown = false;
    }

    this.global.lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // Para evitar valores negativos
  }
  ngOnInit() {
    this.global.cartStatus$.subscribe(status => {
      this.global.hasItemsInCart = status;
    });
    this.device.isMobile().subscribe(isMobile => {
      this.isMobile = isMobile;
    });
  }
  toggleScroll() {
    // Si está a menos de 350 píxeles del top, desplazamos la ventana a esa altura
    const currentScroll =
      window.pageYOffset || document.documentElement.scrollTop;
    const targetScroll = 390;

    if (currentScroll < targetScroll) {
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    }

    // Alternamos el estado de isScrollingDown
    this.global.isScrollingDown = !this.global.isScrollingDown;
  }
}
