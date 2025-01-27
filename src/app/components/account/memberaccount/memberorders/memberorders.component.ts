import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { RealtimeOrdersService } from '@app/services/realtime-orders.service';
import { GlobalService } from '@app/services/global.service';
import { Observable } from 'rxjs';
import { OrderDetailsDialogComponent } from './order-details-dialog/order-details-dialog.component';

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
  status: 'PENDING' | 'AUTHORIZED' | 'REJECTED' | 'CANCELED';
  total: number;
}

@Component({
  selector: 'app-memberorders',
  standalone: true,
  imports: [
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
  memberOrders$: Observable<Order[]>;
  memberId: string;

  constructor(
    private realtimeOrdersService: RealtimeOrdersService,
    public global: GlobalService,
    private dialog: MatDialog,
    private datePipe: DatePipe
  ) {
    this.memberId = localStorage.getItem('memberId') || '';
    // Las órdenes ya vienen filtradas desde el AppComponent
    this.memberOrders$ = this.realtimeOrdersService.orders$;
  }

  ngOnInit(): void {
    if (!this.memberId) {
      console.error('No member ID found in localStorage');
    }
  }

  ngOnDestroy(): void {
  }

  getFilteredOrders(orders: Order[], status: string): Order[] {
    return orders.filter(order => order.status === status);
  }

  formatDate(date: string | undefined): string {
    if (!date) return '-';
    return this.datePipe.transform(date, 'dd/MM/yyyy HH:mm') || '-';
  }

  isMobile(): boolean {
    return window.innerWidth <= 768;
  }

  openOrderDetails(order: Order): void {
    this.dialog.open(OrderDetailsDialogComponent, {
      width: '600px',
      data: order
    });
  }

  trackOrderById(index: number, order: Order): string {
    return order.id;
  }

  trackItemById(index: number, item: CartItem): string {
    return item.id;
  }
}
