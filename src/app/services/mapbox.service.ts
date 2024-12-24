import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import PocketBase from 'pocketbase';
import { AuthPocketbaseService } from './auth-pocketbase.service';
import { ClientResponseError } from 'pocketbase';

@Injectable({
  providedIn: 'root'
})
export class MapboxService {
  private readonly mapboxToken = 'pk.eyJ1IjoiY29uZWN0YXZldC1jb20iLCJhIjoiY20ybDZpc2dmMDhpMDJpb21iZGI1Y2ZoaCJ9.WquhO_FA_2FM0vhYBaZ_jg';

  constructor(private auth: AuthPocketbaseService) {}

  getToken(): string {
    return this.mapboxToken;
  }

  async saveLocation(location: { lat: number, lng: number }, memberId: string) {
    try {
      console.log('1. Iniciando actualización de ubicación para miembro:', memberId);
      
      // Verificar que tengamos el ID del miembro
      if (!memberId) {
        throw new Error('Se requiere el ID del miembro');
      }

      // Actualizar directamente las coordenadas del miembro
      console.log('2. Actualizando coordenadas:', location);
      
      const result = await this.auth.pb.collection('members').update(memberId, {
        lat: location.lat,
        lng: location.lng
      });

      console.log('3. Coordenadas actualizadas exitosamente:', result);
      return result;

    } catch (error) {
      console.error('Error actualizando ubicación:', error);
      if (error instanceof ClientResponseError) {
        console.error('Detalles del error:', {
          status: error.status,
          response: error.response,
          message: error.message,
          data: error.data
        });
      }
      throw error;
    }
  }
}
