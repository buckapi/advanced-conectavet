import { Injectable } from '@angular/core';
import { RealtimeSpecialistsService } from './realtime-specialists.service';
import { Observable, map } from 'rxjs';

export interface Marker {
  id: string;
  name: string;
  lat: number;
  lng: number;
  description: string;
  imageUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class MarkersService {
  private markers$: Observable<Marker[]>;

  // Límites aproximados de Santiago
  private readonly SANTIAGO_BOUNDS = {
    north: -33.3567, // Huechuraba
    south: -33.5147, // La Pintana
    east: -70.5516,  // La Reina
    west: -70.7516   // Pudahuel
  };

  // Calles principales de Santiago
  private readonly SANTIAGO_STREETS = [
    'Av. Providencia',
    'Av. Las Condes',
    'Av. Apoquindo',
    'Av. Vicuña Mackenna',
    'Av. Libertador Bernardo O\'Higgins',
    'Av. Kennedy',
    'Av. Los Leones',
    'Av. Pedro de Valdivia',
    'Av. Irarrázaval',
    'Av. Manuel Montt',
    'Av. Santa Rosa',
    'Av. La Florida',
    'Av. Vitacura',
    'Av. Francisco Bilbao',
    'Av. Américo Vespucio'
  ];

  private readonly SANTIAGO_COMUNAS = [
    'Providencia',
    'Las Condes',
    'Vitacura',
    'Santiago Centro',
    'Ñuñoa',
    'La Reina',
    'Lo Barnechea',
    'La Florida',
    'Maipú',
    'San Miguel'
  ];

  constructor(private realtimeService: RealtimeSpecialistsService) {
    this.markers$ = this.realtimeService.specialists$.pipe(
      map(specialists => specialists.map(specialist => {
        const randomCoords = this.getRandomSantiagoCoordinates();
        const lat = this.parseDMSCoordinate(specialist.lat);
        const lng = this.parseDMSCoordinate(specialist.lng);
        const address = specialist.address || this.generateRandomAddress();
        
        return {
          id: specialist.id,
          name: `${specialist.full_name}`,
          lat: lat || randomCoords.lat,
          lng: lng || randomCoords.lng,
          description: `${address} - ${specialist.phone || '+56 9 xxxx xxxx'}`,
          imageUrl: specialist.images?.[0] || 'assets/images/default-profile.png'
        };
      }))
    );
  }

  private getRandomSantiagoCoordinates(): { lat: number; lng: number } {
    const lat = this.SANTIAGO_BOUNDS.south + 
                (Math.random() * (this.SANTIAGO_BOUNDS.north - this.SANTIAGO_BOUNDS.south));
    const lng = this.SANTIAGO_BOUNDS.west + 
                (Math.random() * (this.SANTIAGO_BOUNDS.east - this.SANTIAGO_BOUNDS.west));
    
    return {
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6))
    };
  }

  private generateRandomAddress(): string {
    const street = this.SANTIAGO_STREETS[Math.floor(Math.random() * this.SANTIAGO_STREETS.length)];
    const number = Math.floor(Math.random() * 9000) + 1000; // Números entre 1000 y 9999
    const comuna = this.SANTIAGO_COMUNAS[Math.floor(Math.random() * this.SANTIAGO_COMUNAS.length)];
    return `${street} ${number}, ${comuna}`;
  }

  private parseDMSCoordinate(coord: string | number | null | undefined): number | null {
    if (!coord) return null;
    
    // Si ya es un número, retornarlo
    if (typeof coord === 'number') return coord;
    
    // Si es string, intentar convertir
    if (typeof coord === 'string') {
      // Primero intentar convertir directamente
      const directParse = parseFloat(coord);
      if (!isNaN(directParse)) return directParse;

      // Si tiene formato DMS (ej: "33°26'33" S")
      const dmsMatch = coord.match(/(\d+)°(\d+)'(\d+)"\s*([NSEW])/);
      if (dmsMatch) {
        const [_, degrees, minutes, seconds, direction] = dmsMatch;
        let decimal = parseInt(degrees) + parseInt(minutes)/60 + parseInt(seconds)/(60*60);
        
        // Si es Sur u Oeste, hacer el número negativo
        if (direction === 'S' || direction === 'W') {
          decimal = -decimal;
        }
        
        return decimal;
      }
    }
    
    return null;
  }

  getMarkers(): Observable<Marker[]> {
    return this.markers$;
  }
}
