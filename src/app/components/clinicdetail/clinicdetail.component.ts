import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectionStrategy, CUSTOM_ELEMENTS_SCHEMA, LOCALE_ID, OnDestroy, ChangeDetectorRef, Inject } from '@angular/core';
import { GlobalService } from '@app/services/global.service';
import { DeviceService } from '@app/services/device.service';
import { AuthPocketbaseService } from '@app/services/auth-pocketbase.service';
import { RealtimeProfessionalsService } from '@app/services/realtime-professional.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCalendarHeader } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { Injectable } from '@angular/core';
import { NativeDateAdapter, DateAdapter } from '@angular/material/core';
import { Clinic } from '@app/interfaces/clinic.interface';
import { DOCUMENT } from '@angular/common';

@Injectable()
export class CustomDateAdapter extends NativeDateAdapter {
  override getFirstDayOfWeek(): number {
    return 1; // Lunes como primer día de la semana
  }
}
registerLocaleData(localeEs);

@Component({
  selector: 'app-clinicdetail',
  standalone: true,
  imports: [
    CommonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './clinicdetail.component.html',
  styleUrls: ['./clinicdetail.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter },
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: LOCALE_ID, useValue: 'es-ES' }
  ]
})
export class ClinicdetailComponent implements OnInit {

  startDate = new Date(); // Fecha inicial
  minDate = new Date(this.startDate.getFullYear(), this.startDate.getMonth() - 3, 1); // 3 meses antes
  maxDate = new Date(this.startDate.getFullYear(), this.startDate.getMonth() + 3, 0); // 3 meses después

  cartQuantity: number = 0;

  isMobile: boolean = false;
 
  selectedService: any = null;
  
  workDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  selectedDates: Date | null = null;
  selectedDateText: string = '';

  dateClass = (date: Date): string => {
    return this.isDaySelectable(date) ? 'highlight-enabled-day' : '';
  };

  customHeader = CustomHeader;

  comments: string[] = [];

  constructor(
    public device: DeviceService,
    public global: GlobalService,
    public auth: AuthPocketbaseService,
    private router: Router,
    public realtimeProfessionals: RealtimeProfessionalsService,
    private cdr: ChangeDetectorRef,
    @Inject(DOCUMENT) private document: Document
  ){}
  
  getStarsArray(rating: number): number[] {
    return Array(Math.round(rating)).fill(0);
  }

  getQuantityInCart(serviceId:string) {
    const serviceInCart = this.global.cart.find(item => item.id === serviceId);
    return serviceInCart ? serviceInCart.quantity : 0;
  }
  goToOrden() {
    // Lógica para redirigir a la página de la orden pendiente
    console.log('Redirigir a la orden pendiente...');
  }
  addToCart(service: any) {
    if (!this.global.cart) {
      this.global.cart = [];
    }
  
    const clinicInCart = this.global.cart.length > 0 ? this.global.cart[0].clinicId : null;
    const currentClinicId = this.global.clinicSelected.id;
  
    if (clinicInCart && clinicInCart !== currentClinicId) {
      // Mostrar alerta si la clínica es diferente
      Swal.fire({
        title: 'Orden pendiente',
        html: 'Para crear una nueva orden, usted debe <a style="text-decoration: underline;" id="goToOrderLink" (click)="global.setRoute(\'shopping\')">completar la orden</a> que tiene pendiente.',
       
        // html: 'Para crear una nueva orden, usted debe completar la orden que tiene pendiente.',
        icon: 'warning',
        showConfirmButton: true,
        confirmButtonText: 'Entendido'
      });
      return;
    }
  
    // Agregar servicio al carrito
    const existingService = this.global.cart.find(item => item.id === service.id);
    if (existingService) {
      existingService.quantity += 1;
    } else {
      this.global.cart.push({ ...service, quantity: 1, clinicId: currentClinicId });
    }
  
    // Guardar en localStorage
    this.saveCartToLocalStorage();
  }
  saveCartToLocalStorage() {
    this.global.updateCartQuantity(); 
    localStorage.setItem('cart', JSON.stringify(this.global.cart));
    this.global.cartStatus$.next(this.global.cart.length > 0);
  }  
  
  async selectService(service: any) {
    const clinicInCart = this.global.cart.length > 0 ? this.global.cart[0].clinicId : null;
    const currentClinicId = this.global.clinicSelected.id;
  
    if (clinicInCart && clinicInCart !== currentClinicId) {
      Swal.fire({
        title: 'Orden pendiente',
        html: 'Para crear una nueva orden, usted debe <a href="javascript:void(0)" style="text-decoration: underline;" id="goToOrderLink">completar la orden</a> que tiene pendiente.',
        icon: 'warning',
        showConfirmButton: false
      });
      return;
    } 
  
    this.selectedService = service;
  }
  
  
  isServiceSelected(service: any): boolean {
    return this.selectedService === service;
  }
  ngOnInit() {
    this.global.cartQuantity$.subscribe(quantity => {
      this.global.cartQuantity = quantity;
      this.global.updateCartQuantity(); 
    });

    this.device.isMobile().subscribe(isMobile => {
      this.isMobile = isMobile;
    });

    // Suscribirse a los cambios en comentarios
    this.global.clinicComments$.subscribe(comments => {
      console.log('Received new comments:', comments);
      this.comments = comments;
      this.cdr.detectChanges();
    });
  
    // Cargar el carrito desde localStorage si existe
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      this.global.cart = JSON.parse(savedCart);
    }
  }

  ngOnDestroy() {
  }

  private formatDate(date: Date): string {
    const meses = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
  
    const dia = date.getDate();
    const mes = meses[date.getMonth()];
    const anio = date.getFullYear();
  
    return `${mes} ${dia} de ${anio}`;
  }
  isDaySelectable = (date: Date | null): boolean => {
    if (!date || !this.global.clinicSelected?.days) return false;

    const daysMapping: Record<'L' | 'M' | 'X' | 'J' | 'V' | 'S' | 'D', number> = {
      L: 1, // Lunes
      M: 2, // Martes
      X: 3, // Miércoles
      J: 4, // Jueves
      V: 5, // Viernes
      S: 6, // Sábado
      D: 0, // Domingo
    };

    const clinicDays = this.global.clinicSelected.days
    .split(',')
    .map((day) => {
      const key = day.trim().toUpperCase() as keyof typeof daysMapping;
      return daysMapping[key];
    })
    .filter((day) => day !== undefined);

    const dayOfWeek = date.getDay();
    return clinicDays.includes(dayOfWeek);
  };

  onDateSelected(selectedDate: Date | null): void {
    if (selectedDate) {
      this.global.selectedDate = selectedDate;
      const formattedDate = this.formatDate(selectedDate);
      console.log('Fecha seleccionada:', formattedDate);
      this.selectedDateText = formattedDate; // Guardar el texto formateado
      this.selectedDates = selectedDate;
      // Guardar la fecha en localStorage como string ISO
      localStorage.setItem('selectedAppointmentDate', selectedDate.toISOString());
    } else {
      console.log('No se seleccionó ninguna fecha.');
      localStorage.removeItem('selectedAppointmentDate');
    }
  }
  
  shouldShowStepper(service: any): boolean {
    const serviceInCart = this.global.cart.find(item => item.id === service.id);
    const quantityInCart = serviceInCart ? serviceInCart.quantity : 0;
    return this.isServiceSelected(service) || quantityInCart > 0;
  }
  isSameClinic(service: any): boolean {
    // Verifica si el carrito está vacío o si el primer servicio en el carrito es de la misma clínica
    if (!this.global.cart || this.global.cart.length === 0) {
      return true;
    }
  
    // Compara el `clinicId` del primer servicio en el carrito con el `global.clinicSelected.id`
    const clinicInCart = this.global.cart[0].clinicId;
    return clinicInCart === this.global.clinicSelected.id;
  }
  
  removeFromCart(service: any) {
    if (!this.global.cart) {
      this.global.cart = [];
    }
  
    const existingService = this.global.cart.find(item => item.id === service.id);
    if (existingService) {
      if (existingService.quantity > 1) {
        existingService.quantity -= 1;
      } else {
        this.global.cart = this.global.cart.filter(item => item.id !== service.id);
      }
    }
  
    // Guardar en localStorage
    this.saveCartToLocalStorage();
  }

  isDayInClinicDays(day: string): boolean {
    const validDays = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
    const daysString = this.global.clinicSelected?.days || '';
    const workDays = daysString 
    .split(',')
    .map(d => d.trim().toUpperCase())
    .filter(d => validDays.includes(d)); // Filtrar días válidos
    const normalizedDay = day.trim().toUpperCase();
    return workDays.includes(normalizedDay);
  }
  
    
  
  
  goToCalendar(): void {
    this.global.activeRoute = 'shopping';
    
    // Usar setTimeout para asegurar que el scroll ocurra después de cualquier cambio de vista
    setTimeout(() => {
      this.document.defaultView?.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  }

  getCartFromLocalStorage(): boolean {
    return this.global.cart && this.global.cart.length > 0;
  }
}

@Component({
  selector: 'custom-header',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  styles: [`.mat-calendar-header .mat-calendar-controls .mat-calendar-period-button {
    font-size: 14px;
  }`],
  template: `
    <div class="mat-calendar-header">
      <div class="mat-calendar-controls">
        <!-- <button mat-button type="button" class="mat-calendar-period-button"
                (click)="currentPeriodClicked()">
          {{periodButtonText}}
        </button> -->
        <div class="mat-calendar-spacer"></div>
        <button mat-icon-button type="button" class="mat-calendar-previous-button"
                [disabled]="!previousEnabled()" (click)="previousClicked()">
          <mat-icon>chevron_left</mat-icon>
        </button>
        <button mat-icon-button type="button" class="mat-calendar-next-button"
                [disabled]="!nextEnabled()" (click)="nextClicked()">
          <mat-icon>chevron_right</mat-icon>
        </button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomHeader<D> extends MatCalendarHeader<D> {
}