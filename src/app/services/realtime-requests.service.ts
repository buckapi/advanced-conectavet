import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import PocketBase from 'pocketbase';

@Injectable({
  providedIn: 'root'
})
export class RealtimeRequestsWebsService {
  private pb: PocketBase;
  private requestsWebsSubject = new BehaviorSubject<any[]>([]);
  public requestsWebs$ = this.requestsWebsSubject.asObservable();

  constructor() {
    this.pb = new PocketBase('https://db.conectavet.cl:8080');
    
    // (Opcional) Autenticación
    this.pb.collection('users').authWithPassword('platform@conectavet.cl', 'HVPO86drd_D5Zon').then(() => {
      console.log('Autenticado');
      this.subscribeToRealtimeChanges();
    }).catch(err => {
      console.error('Error al autenticar:', err);
    });
  }

  private subscribeToRealtimeChanges(): void {
    // Primero, obtener todos los registros existentes
    this.pb.collection('requestWeb').getList(1, 50).then(records => {
      this.requestsWebsSubject.next(records.items);
      
      // Luego suscribirse a los cambios en tiempo real
      this.pb.collection('requestWeb').subscribe('*', (e) => {
        console.log(e.action, e.record);
        
        const currentRequests = this.requestsWebsSubject.value;
        let updatedRequests;

        switch (e.action) {
          case 'create':
            updatedRequests = [...currentRequests, e.record];
            break;
          case 'update':
            updatedRequests = currentRequests.map(req => 
              req.id === e.record.id ? e.record : req
            );
            break;
          case 'delete':
            updatedRequests = currentRequests.filter(req => req.id !== e.record.id);
            break;
          default:
            updatedRequests = currentRequests;
        }

        this.requestsWebsSubject.next(updatedRequests);
      });
    });
  }

  public unsubscribeFromRealtimeChanges(): void {
    this.pb.collection('requestWeb').unsubscribe('*');
  }
}
