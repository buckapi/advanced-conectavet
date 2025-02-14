import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthPocketbaseService } from '@app/services/auth-pocketbase.service';
import { RealtimeNotificationsService } from '@app/services/realtime-notificationns.service';
export interface Notification {
  id: string;
  title: string;
  message: string;
  status: string;
  description: string;  
  selected: boolean;
  createdAt: Date;
} 

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnDestroy {
showDetail=false;
notificationDetail= {} as Notification;
  private unsubscribe$ = new Subject<void>();
  notifications: Notification[] = [];

  constructor(
    public auth: AuthPocketbaseService,
    public realtimeNotifications: RealtimeNotificationsService) {
    // Suscribirse a las notificaciones
    this.realtimeNotifications.notifications$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (requests: Notification[]) => {
          this.notifications = this.mapNotifications(requests);
        },
        (error) => {
          console.error('Error al recibir notificaciones:', error);
        }
      );
  }

  private mapNotifications(requests: Notification[]): Notification[] {
    return requests.map((request: Notification) => ({
      ...request,
      selected: false
    }));
  }
viewNotification(notification: Notification) {
  // Lógica para ver la notificación
  this.notificationDetail=notification;
  this.showDetail=true;
  notification.status = 'read';
  console.log('Viendo notificación:', notification);
}
  // Método para limpiar la suscripción al destruir el componente
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}