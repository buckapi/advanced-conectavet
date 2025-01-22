import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import PocketBase from 'pocketbase';

@Injectable({
  providedIn: 'root'
})
export class RealtimeOrdersService {
  private pb: PocketBase;
  private ordersSubject = new BehaviorSubject<any[]>([]);
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
    this.pb.collection('orders').subscribe('*', (e) => {
      console.log(e.action, e.record);
      
      const currentOrders = this.ordersSubject.value;
      let updatedOrders;

      switch (e.action) {
        case 'create':
          updatedOrders = [...currentOrders, e.record];
          break;
        case 'update':
          updatedOrders = currentOrders.map(order => 
            order.id === e.record.id ? e.record : order
          );
          break;
        case 'delete':
          updatedOrders = currentOrders.filter(order => order.id !== e.record.id);
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
        sort: '-created'
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
