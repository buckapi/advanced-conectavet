import { Injectable } from '@angular/core';
import axios from 'axios';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = 'https://conectavet.cl:5564';

  constructor() {}

  createTransaction(buyOrder: string, sessionId: string, amount: number, returnUrl: string): Promise<any> {
    return axios.post(`${this.apiUrl}/create`, { buyOrder, sessionId, amount, returnUrl });
  }

  commitTransaction(token_ws: string): Promise<any> {
    return axios.post(`${this.apiUrl}/commit`, { token_ws });
  }
}