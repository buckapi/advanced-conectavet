import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { RealtimeOrdersService } from '@app/services/realtime-orders.service';
import { GlobalService } from '@app/services/global.service';
import { AuthPocketbaseService } from '@app/services/auth-pocketbase.service';
import { TransactionsService } from '@app/services/transactions.service';
import { Observable, map, switchMap, from, forkJoin, tap } from 'rxjs';
import { OrderDialogComponent } from './order-dialog/order-dialog.component';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatDialogModule,
    MatButtonModule
  ]
})
export class OrdersComponent implements OnInit, OnDestroy {
  userOrders$: Observable<any[]>;
  ordersWithTransactions$: Observable<any[]>;

  constructor(
    private realtimeOrdersService: RealtimeOrdersService, 
    public global: GlobalService,
    private auth: AuthPocketbaseService,
    private transactionsService: TransactionsService,
    private dialog: MatDialog
  ) {
    const currentUser = this.auth.getCurrentUser();
    console.log('Current User:', currentUser);

    this.userOrders$ = this.realtimeOrdersService.orders$.pipe(
      tap(orders => console.log('All Orders:', orders)),
      map(orders => orders.filter(order => order.idUser === currentUser?.id || order.userId === currentUser?.id)),
      tap(filteredOrders => console.log('Filtered Orders:', filteredOrders))
    );

    this.ordersWithTransactions$ = this.userOrders$.pipe(
      switchMap(orders => {
        if (orders.length === 0) {
          console.log('No orders found');
          return from([[]]);
        }
        console.log('Processing orders for transactions:', orders);
        const ordersWithTransactions = orders.map(order => {
          const buyOrder = order.buyOrder || order.id;
          console.log('Getting transaction for order:', buyOrder);
          return from(this.transactionsService.getTransactionByOrderId(buyOrder)).pipe(
            map(transaction => {
              console.log('Transaction found:', transaction);
              return {
                ...order,
                transaction: transaction || null
              };
            })
          );
        });
        return forkJoin(ordersWithTransactions);
      }),
      tap(finalOrders => console.log('Final Orders with Transactions:', finalOrders))
    );
  }

  isMobile() {
    return this.global.isMobile();
  }
  ngOnInit(): void {
    this.realtimeOrdersService.loadOrders();
  }

  getFilteredOrders(orders: any[], status: string): any[] {
    return orders.filter(order => order.transaction?.status === status);
  }

  openOrderDialog(order: any): void {
    this.dialog.open(OrderDialogComponent, {
      width: '600px',
      data: { order }
    });
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

  ngOnDestroy() {
    this.realtimeOrdersService.unsubscribeFromRealtimeChanges();
  }
}
