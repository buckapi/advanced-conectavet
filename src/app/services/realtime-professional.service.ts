import { Injectable, OnDestroy } from '@angular/core';
import PocketBase from 'pocketbase';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Service {
  name: string;
  images?: string[]; // JSON array
  status?: string;
}

export interface Professional {
  id: string;
  name: string;
  gender: string;
  images?: string[]; // JSON array
  services?: Service[];
  IdMember?: string;
  status?: string;
}

@Injectable({
  providedIn: 'root',
})
export class RealtimeProfessionalsService implements OnDestroy {
  private pb: PocketBase;
  private professionalsSubject = new BehaviorSubject<Professional[]>([]);

  // Observable for components to subscribe to
  public professionals$: Observable<Professional[]> =
    this.professionalsSubject.asObservable();

  constructor() {
    this.pb = new PocketBase('https://db.conectavet.cl:8080');
    this.subscribeToProfessionals();
  }

  private async subscribeToProfessionals() {
    try {
      // (Optional) Authentication
      await this.pb
        .collection('users')
        .authWithPassword('platform@conectavet.cl', 'HVPO86drd_D5Zon');

      // Subscribe to changes in any record of the 'professionals' collection
      this.pb.collection('professionals').subscribe('*', (e) => {
        this.handleRealtimeEvent(e);
      });

      // Initialize the list of professionals
      this.updateProfessionalsList();
    } catch (error) {
      console.error('Error during subscription:', error);
    }
  }

  private handleRealtimeEvent(event: any) {
    console.log(`Event Action: ${event.action}`);
    console.log(`Event Record:`, event.record);

    // Update the list of professionals
    this.updateProfessionalsList();
  }

  private async updateProfessionalsList() {
    try {
      // Get the updated list of professionals
      const records = await this.pb.collection('professionals').getFullList<Professional>(200, {
        sort: '-created', // Sort by creation date
      });

      // Ensures each record conforms to Professional structure
      const professionals = records.map((record: any) => ({
        ...record,
        images: Array.isArray(record.images) ? record.images : [],
        services: Array.isArray(record.services) ? record.services : [],
      })) as Professional[];

      this.professionalsSubject.next(professionals);
    } catch (error) {
      console.error('Error updating professionals list:', error);
    }
  }

  ngOnDestroy() {
    // Unsubscribe when the service is destroyed
    this.pb.collection('professionals').unsubscribe('*');
  }
}
