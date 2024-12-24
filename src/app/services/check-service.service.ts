import { Injectable } from '@angular/core';
import PocketBase from 'pocketbase';
import { RealtimeServicesService } from './realtime-services.service';

interface Service {
  id: string; // Asegúrate de que esta propiedad exista
  name: string;
  price?: number; // Propiedades opcionales si es necesario
}

interface Member {
  services?: Service[];
}
const pb = new PocketBase('https://db.conectavet.cl:8080');
@Injectable({
  providedIn: 'root'
})
export class CheckService {
  idS:string=""
  services: Service[] = [];

  constructor(
    public realTimeMiembros:RealtimeServicesService
  ) { }
  async checkService(service: Service,memberId:string): Promise<boolean> {
    try {
      const memberRecord = await pb.collection('members').getOne(memberId); // Siempre se obtiene el registro del miembro
      const services = Array.isArray(memberRecord['services']) ? memberRecord['services'] : [];
      const exists = services.some((s: Service) => s.id === service.id); // Verifica si el servicio está registrado
      if (exists) {
        console.log(`El servicio con id ${service.id} ya está registrado.`);
        return true; 
      } else {
        console.log(`El servicio con id ${service.id} no está registrado.`);
        return false; 
      }
    } catch (error) {
      console.error('Error al verificar el servicio:', error);
      return false;
    }
  }
 
}
