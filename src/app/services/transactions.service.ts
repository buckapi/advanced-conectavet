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
      console.log('Looking up transaction for orderId:', orderId);
      // Try to find by buyOrder first
      try {
        const transaction = await this.pb.collection('transactions').getFirstListItem(`buyOrder="${orderId}"`);
        console.log('Found transaction by buyOrder:', transaction);
        this.transactionSubject.next(transaction);
        return transaction;
      } catch {
        // If not found by buyOrder, try by id
        console.log('No transaction found by buyOrder, trying id');
        const transaction = await this.pb.collection('transactions').getFirstListItem(`id="${orderId}"`);
        console.log('Found transaction by id:', transaction);
        this.transactionSubject.next(transaction);
        return transaction;
      }
    } catch (error) {
      console.error('Error getting transaction:', error);
      this.transactionSubject.next(null);
      return null;
    }
  }
}
