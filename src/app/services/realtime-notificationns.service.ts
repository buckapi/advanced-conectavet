import { Injectable, OnDestroy } from '@angular/core';
import PocketBase from 'pocketbase';
import { BehaviorSubject, Observable } from 'rxjs'; // {{ edit_1 }}

@Injectable({
  providedIn: 'root',
})
export class RealtimeNotificationsService implements OnDestroy {
  private pb: PocketBase;
  private notificationsSubject = new BehaviorSubject<any[]>([]);

  // Esta es la propiedad que expondrá el Observable para que los componentes puedan suscribirse a ella
  public notifications$: Observable<any[]> =
    this.notificationsSubject.asObservable();

  constructor(
    private notificationsRealtime:RealtimeNotificationsService) { // {{ edit_2 }}
    this.pb = new PocketBase('https://db.conectavet.cl:8080');
    this.subscribeToNotifications();
  }
  countUserNotifications(userId: string): number {
    const notifications = this.notificationsSubject.getValue();
    return notifications.filter(notification => notification.userId === userId).length;
  }
  private async subscribeToNotifications() {
    // (Opcional) Autenticación
    await this.pb
      .collection('users')
      .authWithPassword('platform@conectavet.cl', 'HVPO86drd_D5Zon');

    // Suscribirse a cambios en cualquier registro de la colección 'notifications'
    this.pb.collection('notifications').subscribe('*', (e) => {
      this.handleRealtimeEvent(e);
    });

    // Inicializar la lista de especialistas
    this.updateNotificationsList();
  }

  private handleRealtimeEvent(event: any) {
    // Aquí puedes manejar las acciones 'create', 'update' y 'delete'
    console.log(event.action);
    console.log(event.record);

    // Actualizar la lista de especialistas
    this.updateNotificationsList();
  }

  private async updateNotificationsList() {
    // Obtener la lista actualizada de especialistas
    const records = await this.pb
      .collection('notifications')
      .getFullList(200 /* cantidad máxima de registros */, {
        sort: 'created', // Ordenar por fecha de creación (invertido)
      });
    this.notificationsSubject.next(records);
  }

  ngOnDestroy() {
    // Desuscribirse cuando el servicio se destruye
    this.pb.collection('notifications').unsubscribe('*');
  }
}
