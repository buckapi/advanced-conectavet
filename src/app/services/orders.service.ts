import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import PocketBase from 'pocketbase';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private pb = new PocketBase(environment.apiUrl);
  private ordersSubject = new BehaviorSubject<any[]>([]);
  public orders$ = this.ordersSubject.asObservable();

  constructor() {
    this.pb = new PocketBase('https://db.conectavet.cl:8080'); // Cambia esto a tu URL real


  }
  updateOrderStatus(orderId: string, status: string, cart: any): Promise<any> {
    return this.pb.collection('orders').update(orderId, { status, cart });
  }
  async loadMemberOrders(memberId: string) {
    try {
      const records = await this.pb.collection('orders').getList(1, 50, {
        filter: `memberId = "${memberId}"`,
        sort: '-created',
        expand: 'cart'
      });
      
      this.ordersSubject.next(records.items);
    } catch (error) {
      console.error('Error loading orders:', error);
      this.ordersSubject.next([]);
    }
  }
}
