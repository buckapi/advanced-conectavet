import { Injectable, OnDestroy,OnInit } from '@angular/core';
import PocketBase from 'pocketbase';
import { BehaviorSubject, Observable } from 'rxjs'; // {{ edit_1 }}
import { map, tap, switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { from } from 'rxjs';
export interface MedicalRecord {
  id: string; // o el tipo que corresponda
  petId: string;
  userId: string;
  // Agrega aquí otros campos relevantes según la estructura de tus tarjetas médicas
}
@Injectable({
  providedIn: 'root',
})
export class RealtimeMedicalRecordsService implements OnDestroy,OnInit {
  private pb: PocketBase;
  private medicalRecordsSubject = new BehaviorSubject<any[]>([]);

  // Esta es la propiedad que expondrá el Observable para que los componentes puedan suscribirse a ella
  public medicalRecords$: Observable<any[]> =
    this.medicalRecordsSubject.asObservable();

  constructor(
    private medicalRecordsRealtime:RealtimeMedicalRecordsService) { // {{ edit_2 }}
    this.pb = new PocketBase('https://db.conectavet.cl:8080');
    this.subscribeToMedicalRecords();
  }
  ngOnInit() {
    this.loadMedicalRecords();
  }
  loadMedicalRecords() {
    this.pb.collection('users')
      .authWithPassword('platform@conectavet.cl', 'HVPO86drd_D5Zon').then(() => {
        // Aquí puedes obtener las tarjetas médicas y actualizar el BehaviorSubject
        this.pb.collection('medicalRecords').getFullList().then(records => {
          this.medicalRecordsSubject.next(records);
        });
      }).catch(error => {
        console.error('Error loading medical records:', error);
      });
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
  getMedicalRecordsByPetId(petId: string): Observable<MedicalRecord[]> {
    return from(this.pb.collection('users')
      .authWithPassword('platform@conectavet.cl', 
        'HVPO86drd_D5Zon')).pipe(
          switchMap(() => {
              return from(this.pb.collection('medicalRecords').getFullList()).pipe(
                  map(records => records.map(record => ({
                      petId: record['petId'],
                      userId: record['userId'],
                      // Asegúrate de agregar aquí todos los campos necesarios para medicalRecordss
                      // por ejemplo:
                      id: record.id,
                      description: record['description'],
                      clinicId: record['clinicId'],
                      notes: record['notes'],
                      service: record['service'],
                      created: record['created'],
                      updated: record['updated'],
                  }))),
                  map(records => records.filter(record => record.petId === petId)),
                  tap(filteredRecords => {
                      console.log('Filtered Medical Records for petId:', petId, JSON.stringify(filteredRecords));
                  }),
                  catchError(error => {
                      console.error('Error fetching medical records:', error);
                      return of([]); // Retorna un array vacío en caso de error
                  })
              );
          }),
          catchError(error => {
              console.error('Authentication failed:', error);
              return of([]); // Retorna un array vacío si la autenticación falla
          })
      );
  }
  countUserMedicalRecords(userId: string): number {
    const medicalRecords = this.medicalRecordsSubject.getValue();
    return medicalRecords.filter(medicalRecord => medicalRecord.userId === userId).length;
  }
  private async subscribeToMedicalRecords() {
    // (Opcional) Autenticación
    await this.pb
      .collection('users')
      .authWithPassword('platform@conectavet.cl', 'HVPO86drd_D5Zon');

    // Suscribirse a cambios en cualquier registro de la colección 'medicalRecords'
    this.pb.collection('medicalRecords').subscribe('*', (e) => {
      this.handleRealtimeEvent(e);
    });

    // Inicializar la lista de especialistas
    this.updateMedicalRecordsList();
  }

  private handleRealtimeEvent(event: any) {
    // Aquí puedes manejar las acciones 'create', 'update' y 'delete'
    console.log(event.action);
    console.log(event.record);

    // Actualizar la lista de especialistas
    this.updateMedicalRecordsList();
  }

  private async updateMedicalRecordsList() {
    // Obtener la lista actualizada de especialistas
    const records = await this.pb
      .collection('medicalRecords')
      .getFullList(200 /* cantidad máxima de registros */, {
        sort: 'created', // Ordenar por fecha de creación (invertido)
      });
    this.medicalRecordsSubject.next(records);
  }

  ngOnDestroy() {
    // Desuscribirse cuando el servicio se destruye
    this.pb.collection('medicalRecords').unsubscribe('*');
  }
}
