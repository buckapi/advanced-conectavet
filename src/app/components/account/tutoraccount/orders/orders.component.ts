import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RealtimeOrdersService } from '@app/services/realtime-orders.service';
import { GlobalService } from '@app/services/global.service';
import { AuthPocketbaseService } from '@app/services/auth-pocketbase.service';
import { TransactionsService } from '@app/services/transactions.service';
import { Observable, map, switchMap, from, forkJoin } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit, OnDestroy {
  userOrders$: Observable<any[]>;
  ordersWithTransactions$: Observable<any[]>;

  constructor(
    private realtimeOrdersService: RealtimeOrdersService, 
    public global: GlobalService,
    private auth: AuthPocketbaseService,
    private transactionsService: TransactionsService
  ) {
    const currentUser = this.auth.getCurrentUser();
    this.userOrders$ = this.realtimeOrdersService.orders$.pipe(
      map(orders => orders.filter(order => order.idUser === currentUser?.id))
    );

    // Cargar órdenes con sus transacciones
    this.ordersWithTransactions$ = this.userOrders$.pipe(
      switchMap(orders => {
        const ordersWithTransactions = orders.map(order => 
          from(this.transactionsService.getTransactionByOrderId(order.buyOrder))
            .pipe(map(transaction => ({
              ...order,
              transaction
            })))
        );
        return forkJoin(ordersWithTransactions);
      })
    );
  }

  ngOnInit() {
    this.realtimeOrdersService.loadOrders();
  }

  async showTransaction(order: any) {
    if (order.transaction) {
      Swal.fire({
        title: 'Detalles de la Transacción',
        html: `
          <div class="transaction-details">
            <div class="transaction-info">
              <p><strong>ID Transacción:</strong> ${order.transaction.id}</p>
              <p><strong>Estado:</strong> ${order.transaction.status}</p>
              <p><strong>Método de Pago:</strong> ${order.transaction.paymentMethod}</p>
              <p><strong>Fecha:</strong> ${new Date(order.transaction.created).toLocaleString()}</p>
              <p><strong>Monto:</strong> $${order.transaction.amount}</p>
            </div>
          </div>
        `,
        icon: 'info',
        confirmButtonText: 'Cerrar',
        confirmButtonColor: '#3085d6'
      });
    } else {
      Swal.fire({
        title: 'Error',
        text: 'No se encontró la transacción para esta orden.',
        icon: 'error',
        confirmButtonText: 'Cerrar'
      });
    }
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'approved':
        return 'text-success';
      case 'pending':
        return 'text-warning';
      case 'cancelled':
      case 'rejected':
        return 'text-danger';
      default:
        return '';
    }
  }

  ngOnDestroy() {
    this.realtimeOrdersService.unsubscribeFromRealtimeChanges();
  }
}
