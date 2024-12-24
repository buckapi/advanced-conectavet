import { Injectable } from '@angular/core';
import PocketBase from 'pocketbase';

@Injectable({
  providedIn: 'root'
})
export class ProfessionalService {
  private pb: PocketBase;

  constructor() {
    this.pb = new PocketBase('https://db.conectavet.cl:8080');
  }

  async createProfessional(data: { 
    name: string; 
    gender?:string;
    images?: string[]; // JSON array or object
    services?: string[]; // JSON array or object
    IdMember?: string; // ID del miembro
    status?: string; // Estado del profesional
  }) {
    try {
      const record = await this.pb.collection('professionals').create(data); // Crear el registro del profesional
      return record; // Retornar el registro creado
    } catch (error) {
      console.error('Error al crear el profesional:', error);
      throw error; // Lanzar el error para manejarlo en el componente
    }
  }

  async deleteProfessional(professionalId: string) { // Método para eliminar un profesional
    try {
      const response = await this.pb.collection('professionals').delete(professionalId); // Eliminar el profesional usando PocketBase
      return response;
    } catch (error) {
      console.error('Error al eliminar el profesional:', error);
      throw error; // Lanza el error para manejarlo en el componente
    }
  }

  async updateProfessionalValue(professionalId: string, newValue: any) { // Método para actualizar el valor del profesional
    try {
      const updatedRecord = await this.pb.collection('professionals').update(professionalId, { value: newValue }); // Actualizar el valor del profesional
      return updatedRecord; // Retornar el registro actualizado
    } catch (error) {
      console.error('Error al actualizar el valor del profesional:', error);
      throw error; // Lanzar el error para manejarlo en el componente
    }
  }
}