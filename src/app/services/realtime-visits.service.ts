import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import PocketBase from 'pocketbase';

@Injectable({
  providedIn: 'root'
})
export class RealtimeVisitsService implements OnDestroy {
  private pb: PocketBase;
  private visitsSubject = new BehaviorSubject<any[]>([]);
  visits$ = this.visitsSubject.asObservable();

  constructor() {
    this.pb = new PocketBase('https://db.conectavet.cl:8080');
    this.initializeRealtimeVisits();
  }

  private async initializeRealtimeVisits() {
    try {
      // Obtener lista inicial de visitas
      const records = await this.pb.collection('visits').getList(1, 500, {
        sort: '-created',
        expand: 'location'
      });
      this.visitsSubject.next(records.items);

      // Suscribirse a cambios en tiempo real
      this.pb.collection('visits').subscribe('*', (e) => {
        const currentVisits = this.visitsSubject.value;
        let updatedVisits;

        switch (e.action) {
          case 'create':
            updatedVisits = [e.record, ...currentVisits];
            break;
          case 'update':
            updatedVisits = currentVisits.map(visit => 
              visit.id === e.record.id ? e.record : visit
            );
            break;
          case 'delete':
            updatedVisits = currentVisits.filter(visit => visit.id !== e.record.id);
            break;
          default:
            return;
        }

        this.visitsSubject.next(updatedVisits);
      });

    } catch (error) {
      console.error('Error al inicializar las visitas:', error);
    }
  }

  getVisitsByDevice() {
    const visits = this.visitsSubject.value;
    return visits.reduce((acc: { [key: string]: number }, visit) => {
      const deviceType = visit.deviceType || 'unknown';
      acc[deviceType] = (acc[deviceType] || 0) + 1;
      return acc;
    }, {});
  }

  getVisitsByCountry() {
    const visits = this.visitsSubject.value;
    return visits.reduce((acc: { [key: string]: number }, visit) => {
      const country = visit.country || 'Unknown';
      acc[country] = (acc[country] || 0) + 1;
      return acc;
    }, {});
  }

  getVisitsByBrowser() {
    const visits = this.visitsSubject.value;
    return visits.reduce((acc: { [key: string]: number }, visit) => {
      const browser = visit.browser?.split(' ')[0] || 'Unknown';
      acc[browser] = (acc[browser] || 0) + 1;
      return acc;
    }, {});
  }

  getTotalVisits() {
    return this.visitsSubject.value.length;
  }

  getUniqueVisitors() {
    const visits = this.visitsSubject.value;
    const uniqueDeviceIds = new Set(visits.map(visit => visit.deviceId));
    return uniqueDeviceIds.size;
  }

  ngOnDestroy() {
    // Limpiar todas las suscripciones al destruir el servicio
    this.pb.collection('visits').unsubscribe();
  }
}
