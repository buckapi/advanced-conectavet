import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthPocketbaseService } from './auth-pocketbase.service';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  private favoritesSubject = new BehaviorSubject<string[]>([]);
  public favorites$ = this.favoritesSubject.asObservable();

  constructor(private auth: AuthPocketbaseService) {
    this.loadFavorites();
  }

  async loadFavorites() {
    const userId = localStorage.getItem('userId');
    if (!userId) return; // Si no hay userId en localStorage, no hace nada

    try {
        const records = await this.auth.pb.collection('favorites').getFullList({
            filter: `userId = "${userId}"`,
            fields: 'member,memberId',
          });
          

      const memberIds = records.map(record => record['member']);
      this.favoritesSubject.next(memberIds);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  }

  async toggleFavorite(member: string, memberId: string) {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      Swal.fire({
        icon: 'warning',
        title: 'Acceso Denegado',
        text: 'Por favor, inicia sesión para guardar favoritos',
        confirmButtonText: 'Entendido'
      });
      return;
    }
  
    try {
      // Buscar si ya existe un favorito con el mismo userId, member y memberId
      const existingFavorite = await this.auth.pb.collection('favorites').getFirstListItem(
        `userId = "${userId}"`
      );
  
      if (existingFavorite) {
        // Si existe, eliminarlo
        await this.auth.pb.collection('favorites').delete(existingFavorite.id);
        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'Se ha eliminado de tus favoritos',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        // Si no existe, crearlo
        await this.auth.pb.collection('favorites').create({
          userId: userId,
          member: member,
          memberId: memberId, // Incluye el campo adicional
        });
        Swal.fire({
          icon: 'success',
          title: 'Agregado',
          text: 'Se ha agregado a tus favoritos',
          timer: 1500,
          showConfirmButton: false
        });
      }
  
      // Actualizar la lista de favoritos
      await this.loadFavorites();
    } catch (error) {
      console.error('Error toggling favorite:', error);
    //   Swal.fire({
    //     icon: 'error',
    //     title: 'Error',
    //     text: 'Ha ocurrido un error al procesar tu solicitud',
    //     confirmButtonText: 'Cerrar'
    //   });
    }
  }
  

  isFavorite(memberId: string): boolean {
    return this.favoritesSubject.value.includes(memberId);
  }
  
}
