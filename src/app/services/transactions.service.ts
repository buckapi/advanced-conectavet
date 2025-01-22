import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import PocketBase from 'pocketbase';

@Injectable({
  providedIn: 'root'
})
export class TransactionsService {
  private pb: PocketBase;
  private transactionSubject = new BehaviorSubject<any>(null);
  public transaction$ = this.transactionSubject.asObservable();

  constructor() {
    this.pb = new PocketBase('https://db.conectavet.cl:8080');
  }

  async getTransactionByOrderId(orderId: string): Promise<any> {
    try {
      const transaction = await this.pb.collection('transactions').getFirstListItem(`buyOrder="${orderId}"`);
      this.transactionSubject.next(transaction);
      return transaction;
    } catch (error) {
      console.error('Error getting transaction:', error);
      this.transactionSubject.next(null);
      return null;
    }
  }
}
