import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MapboxService {
  private readonly mapboxToken = 'pk.eyJ1IjoiY29uZWN0YXZldCIsImEiOiJjbHFxNDFiZDIwMGdsMmpxdnhxN3VkbGRsIn0.0HLAUQbVVnwZHEfSYHLvlw';

  getToken(): string {
    return this.mapboxToken;
  }
}
