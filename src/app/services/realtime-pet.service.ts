import { Injectable, OnDestroy } from '@angular/core';
import PocketBase from 'pocketbase';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Service {
  name: string;
  images?: string[]; // JSON array
  status?: string;
}

export interface Pet {
    id: string;
    name: string;
    species: string;
    breed?: string;
    images?: string[]; // JSON array
    birthDate?: Date;
    idTutor?: string;
    status?: string;
  }
@Injectable({
  providedIn: 'root',
})
export class RealtimePetsService implements OnDestroy {
  private pb: PocketBase;
  private petsSubject = new BehaviorSubject<Pet[]>([]);

  // Observable for components to subscribe to
  public pets$: Observable<Pet[]> =
    this.petsSubject.asObservable();

  constructor() {
    this.pb = new PocketBase('https://db.conectavet.cl:8080');
    this.subscribeToPets();
  }

  private async subscribeToPets() {
    try {
      // (Optional) Authentication
      await this.pb
        .collection('users')
        .authWithPassword('platform@conectavet.cl', 'HVPO86drd_D5Zon');

      // Subscribe to changes in any record of the 'pets' collection
      this.pb.collection('pets').subscribe('*', (e) => {
        this.handleRealtimeEvent(e);
      });

      // Initialize the list of pets
      this.updatePetsList();
    } catch (error) {
      console.error('Error during subscription:', error);
    }
  }

  private handleRealtimeEvent(event: any) {
    console.log(`Event Action: ${event.action}`);
    console.log(`Event Record:`, event.record);

    // Update the list of pets
    this.updatePetsList();
  }

  private async updatePetsList() {
    try {
      // Get the updated list of pets
      const records = await this.pb.collection('pets').getFullList<Pet>(200, {
        sort: '-created', // Sort by creation date
      });

      // Ensures each record conforms to pet structure
      const pets = records.map((record: any) => ({
        ...record,
        images: Array.isArray(record.images) ? record.images : [],
        services: Array.isArray(record.services) ? record.services : [],
      })) as Pet[];

      this.petsSubject.next(pets);
    } catch (error) {
      console.error('Error updating pets list:', error);
    }
  }

  ngOnDestroy() {
    // Unsubscribe when the service is destroyed
    this.pb.collection('pets').unsubscribe('*');
  }
}
