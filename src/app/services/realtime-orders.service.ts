import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import PocketBase from 'pocketbase';

@Injectable({
  providedIn: 'root'
})
export class RealtimeOrdersService {
  private pb: PocketBase;
  public ordersSubject = new BehaviorSubject<any[]>([]);
  public orders$ = this.ordersSubject.asObservable();

  constructor() {
    this.pb = new PocketBase('https://db.conectavet.cl:8080');
    this.pb.collection('users').authWithPassword('platform@conectavet.cl', 'HVPO86drd_D5Zon').then(() => {
      console.log('Autenticado');
      this.setupRealtimeSubscription();
      this.loadOrders();
    }).catch(err => {
      console.error('Error al autenticar:', err);
    });
  }

  private setupRealtimeSubscription(): void {
    this.pb.collection('orders').subscribe('*', async (e) => {
      console.log(e.action, e.record);
      
      const currentOrders = this.ordersSubject.value;
      let updatedOrders;

      // Get the full record with expanded cart for create/update actions
      let record = e.record;
      if (e.action === 'create' || e.action === 'update') {
        try {
          record = await this.pb.collection('orders').getOne(e.record.id, {
            expand: 'cart'
          });
        } catch (error) {
          console.error('Error expanding cart for order:', error);
        }
      }

      switch (e.action) {
        case 'create':
          updatedOrders = [...currentOrders, record];
          break;
        case 'update':
          updatedOrders = currentOrders.map(order => 
            order.id === record.id ? record : order
          );
          break;
        case 'delete':
          updatedOrders = currentOrders.filter(order => order.id !== record.id);
          break;
        default:
          updatedOrders = currentOrders;
      }
      
      this.ordersSubject.next(updatedOrders);
    });
  }

  public async loadOrders(): Promise<void> {
    try {
      const records = await this.pb.collection('orders').getList(1, 50, {
        sort: '-created',
        expand: 'cart'
      });
      this.ordersSubject.next(records.items);
    } catch (error) {
      console.error('Error loading orders:', error);
      this.ordersSubject.next([]);
    }
  }

  public unsubscribeFromRealtimeChanges(): void {
    this.pb.collection('orders').unsubscribe('*');
  }
}
