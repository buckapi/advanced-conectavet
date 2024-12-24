import { Injectable, OnDestroy } from '@angular/core';
import PocketBase from 'pocketbase';
import { BehaviorSubject, Observable } from 'rxjs'; // {{ edit_1 }}

@Injectable({
  providedIn: 'root',
})
export class RealtimeServicesService implements OnDestroy {
  private pb: PocketBase;
  private servicesSubject = new BehaviorSubject<any[]>([]);

  // Esta es la propiedad que expondrá el Observable para que los componentes puedan suscribirse a ella
  public services$: Observable<any[]> =
    this.servicesSubject.asObservable();

  constructor(private servicesRealtime:RealtimeServicesService) { // {{ edit_2 }}
    this.pb = new PocketBase('https://db.conectavet.cl:8080');
    this.subscribeToServices();
  }

  private async subscribeToServices() {
    // (Opcional) Autenticación
    await this.pb
      .collection('users')
      .authWithPassword('platform@conectavet.cl', 'HVPO86drd_D5Zon');

    // Suscribirse a cambios en cualquier registro de la colección 'categories'
    this.pb.collection('services').subscribe('*', (e) => {
      this.handleRealtimeEvent(e);
    });

    // Inicializar la lista de especialistas
    this.updateServicesList();
  }

  private handleRealtimeEvent(event: any) {
    // Aquí puedes manejar las acciones 'create', 'update' y 'delete'
    console.log(event.action);
    console.log(event.record);

    // Actualizar la lista de especialistas
    this.updateServicesList();
  }

  private async updateServicesList() {
    // Obtener la lista actualizada de especialistas
    const records = await this.pb
      .collection('services')
      .getFullList(200 /* cantidad máxima de registros */, {
        sort: '-created', // Ordenar por fecha de creación
      });
    
    // Invertir el orden de los registros
    const reversedRecords = records.reverse(); // {{ edit_1 }}
    
    this.servicesSubject.next(reversedRecords); // {{ edit_2 }}
  }
  ngOnDestroy() {
    // Desuscribirse cuando el servicio se destruye
    this.pb.collection('services').unsubscribe('*');
  }
}
