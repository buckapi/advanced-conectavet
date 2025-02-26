import { Injectable, OnDestroy } from '@angular/core';
import PocketBase from 'pocketbase';
import { BehaviorSubject, Observable, from,of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
export interface Specialist {
  id: string;
  full_name: string;
  // Agrega aquí otras propiedades necesarias para el especialista
}

@Injectable({
  providedIn: 'root',
})
export class RealtimeSpecialistsService implements OnDestroy {
  private pb: PocketBase;
  private specialistsSubject = new BehaviorSubject<any[]>([]);

  // Esta es la propiedad que expondrá el Observable para que los componentes puedan suscribirse a ella
  public specialists$: Observable<any[]> =
    this.specialistsSubject.asObservable();

  constructor() {
    this.pb = new PocketBase('https://db.conectavet.cl:8080');
    this.subscribeToSpecialists();
  }

  private async subscribeToSpecialists() {
    // (Opcional) Autenticación
    await this.pb
      .collection('users')
      .authWithPassword('platform@conectavet.cl', 'HVPO86drd_D5Zon');

    // Suscribirse a cambios en cualquier registro de la colección 'members'
    this.pb.collection('members').subscribe('*', (e) => {
      this.handleRealtimeEvent(e);
    });

    // Inicializar la lista de especialistas
    this.updateSpecialistsList();
  }

  private handleRealtimeEvent(event: any) {
    // Aquí puedes manejar las acciones 'create', 'update' y 'delete'
    console.log(event.action);
    console.log(event.record);

    // Actualizar la lista de especialistas
    this.updateSpecialistsList();
  }

  private async updateSpecialistsList() {
    // Obtener la lista actualizada de especialistas
    const records = await this.pb
      .collection('members')
      .getFullList(200 /* cantidad máxima de registros */, {
        sort: '-created', // Ordenar por fecha de creación
      });
    this.specialistsSubject.next(records);
  }
  getFullNameByClinicId(clinicId: string): Observable<string> {
    return from(this.pb.collection('members').getOne(clinicId)).pipe(
      map(member => {
        console.log('Miembro encontrado:', member); // Verificar el miembro encontrado
        return member ? member['full_name'] : 'Veterinaria no encontrada';
      }),
      catchError(() => of('Veterinaria no encontrada')) // Manejo de errores
    );
  }
  ngOnDestroy() {
    // Desuscribirse cuando el servicio se destruye
    this.pb.collection('members').unsubscribe('*');
  }
}
