import { Injectable } from '@angular/core';
import PocketBase from 'pocketbase';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private pb: PocketBase;

  constructor() {
    this.pb = new PocketBase('https://db.conectavet.cl:8080');
  }

  async createCategory(data: { name: string; description?: string; idTag?: string; status?: string; images?: string }) {
    try {
      const record = await this.pb.collection('categories').create(data);
      return record; // Retornar el registro creado
    } catch (error) {
      console.error('Error al crear la categoría:', error);
      throw error; // Lanzar el error para manejarlo en el componente
    }
  }
  async deleteCategory(categoryId: string) { // Método para eliminar una categoría
    try {
      const response = await this.pb.collection('categories').delete(categoryId); // Eliminar la categoría usando PocketBase
      return response;
    } catch (error) {
      console.error('Error al eliminar la categoría:', error);
      throw error; // Lanza el error para manejarlo en el componente
    }
  }
  async updateCarouselValue(categoryId: string, newValue: any) { // Método para actualizar el valor del carrusel
    try {
      const updatedRecord = await this.pb.collection('categories').update(categoryId, { carousel: newValue }); // Actualizar el valor del carrusel
      return updatedRecord; // Retornar el registro actualizado
    } catch (error) {
      console.error('Error al actualizar el valor del carrusel:', error);
      throw error; // Lanzar el error para manejarlo en el componente
    }
  }
}