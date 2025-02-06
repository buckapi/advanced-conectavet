import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { RealtimeOrdersService } from '@app/services/realtime-orders.service';
import { GlobalService } from '@app/services/global.service';
import { Observable } from 'rxjs';
import { OrderDetailsDialogComponent } from './order-details-dialog/order-details-dialog.component';
import { OrdersService } from '@app/services/orders.service';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  clinicId: string;
}

interface Order {
  id: string;
  buyOrder: string;
  cart: CartItem[];
  created: string;
  selectedAppointmentDate?: string;
  status: 'PENDING' | 'AUTHORIZED' | 'REJECTED' | 'CANCELED' | 'ATENDIDO';
  total: number;
}

@Component({
  selector: 'app-memberorders',
  standalone: true,
  imports: [
    MatTabsModule,
    CommonModule,
    MatTabsModule,
    MatDialogModule,
    MatButtonModule
  ],
  providers: [DatePipe],
  templateUrl: './memberorders.component.html',
  styleUrls: ['./memberorders.component.css']
})
export class MemberordersComponent implements OnInit, OnDestroy {
  filteredPendingOrders: Order[] = [];
filteredAttendedOrders: Order[] = [];
  memberOrders$: Observable<Order[]>;
  memberId: string;

  constructor(
    private realtimeOrdersService: RealtimeOrdersService,
    public global: GlobalService,
    private dialog: MatDialog,
    private renderer: Renderer2, 
    private datePipe: DatePipe,
    private orderService: OrdersService
  ) {
    this.memberId = localStorage.getItem('memberId') || '';
    // Las órdenes ya vienen filtradas desde el AppComponent
    this.memberOrders$ = this.realtimeOrdersService.orders$;
  }
ngOnInit(): void {
    if (!this.memberId) {
        console.error('No member ID found in localStorage');
    }

    this.memberOrders$.subscribe(orders => {
        this.filteredPendingOrders = orders.filter(order => order.status === 'PENDING');
        this.filteredAttendedOrders = orders.filter(order => order.status === 'ATENDIDO');
    });
}

  ngOnDestroy(): void {
  }

  getFilteredOrders(orders: Order[], status: string): Order[] {
    return orders.filter(order => order.status === status);
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
  isMobile(): boolean {
    return window.innerWidth <= 768;
  }

  openOrderDetails(order: Order): void {
    const dialogRef = this.dialog.open(OrderDetailsDialogComponent, {
        width: '600px',
        data: order
    });

    // Agregar clases al fondo del modal
    const overlayContainer = this.renderer.selectRootElement('.cdk-overlay-container', true);
    // this.renderer.addClass(overlayContainer, 'cdk-overlay-dark-backdrop');

    dialogRef.afterClosed().subscribe(() => {
        // Aquí puedes quitar las clases cuando se cierra el modal
        this.renderer.removeClass(overlayContainer, 'cdk-overlay-dark-backdrop');
    });
}

  
  applyClasses(): void {
    const overlay = this.renderer.selectRootElement('#overlay', true);
    this.renderer.removeClass(overlay, 'active');
    this.renderer.addClass(overlay, 'dark-overlay');

  }

  trackOrderById(index: number, order: Order): string {
    return order.id;
  }

  trackItemById(index: number, item: CartItem): string {
    return item.id;
  }
}
