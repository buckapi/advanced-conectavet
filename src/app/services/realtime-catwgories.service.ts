import { Injectable, OnDestroy } from '@angular/core';
import PocketBase from 'pocketbase';
import { BehaviorSubject, Observable } from 'rxjs'; // {{ edit_1 }}

@Injectable({
  providedIn: 'root',
})
export class RealtimeCategoriesService implements OnDestroy {
  private pb: PocketBase;
  private categoriesSubject = new BehaviorSubject<any[]>([]);

  // Esta es la propiedad que expondrá el Observable para que los componentes puedan suscribirse a ella
  public categories$: Observable<any[]> =
    this.categoriesSubject.asObservable();

  constructor(private catwgoriesRealtime:RealtimeCategoriesService) { // {{ edit_2 }}
    this.pb = new PocketBase('https://db.conectavet.cl:8080');
    this.subscribeToCategories();
  }

  private async subscribeToCategories() {
    // (Opcional) Autenticación
    await this.pb
      .collection('users')
      .authWithPassword('platform@conectavet.cl', 'HVPO86drd_D5Zon');

    // Suscribirse a cambios en cualquier registro de la colección 'categories'
    this.pb.collection('categories').subscribe('*', (e) => {
      this.handleRealtimeEvent(e);
    });

    // Inicializar la lista de especialistas
    this.updateCategoriesList();
  }

  private handleRealtimeEvent(event: any) {
    // Aquí puedes manejar las acciones 'create', 'update' y 'delete'
    console.log(event.action);
    console.log(event.record);

    // Actualizar la lista de especialistas
    this.updateCategoriesList();
  }

  private async updateCategoriesList() {
    // Obtener la lista actualizada de especialistas
    const records = await this.pb
      .collection('categories')
      .getFullList(200 /* cantidad máxima de registros */, {
        sort: 'created', // Ordenar por fecha de creación (invertido)
      });
    this.categoriesSubject.next(records);
  }

  ngOnDestroy() {
    // Desuscribirse cuando el servicio se destruye
    this.pb.collection('categories').unsubscribe('*');
  }
}
