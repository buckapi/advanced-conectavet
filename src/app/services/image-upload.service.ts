import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ImageUploadService {
    selectedFile: File | null = null;

  private apiUrl = 'https://db.conectavet.cl:8080/api/collections/images/records';

  constructor(public http: HttpClient) { }
  onUpload() {
    console.log( "esta es la imagen:"+this.selectedFile);
    if (!this.selectedFile) {
      console.error('No se ha seleccionado ningún archivo.');
      return;
    }

    this.uploadImage(this.selectedFile).subscribe(
      response => {
        console.log('Imagen subida correctamente:', response);
        // Aquí puedes manejar la respuesta del servidor, como mostrar un mensaje de éxito
      },
      error => {
        console.error('Error al subir imagen:', error);
        // Aquí puedes manejar cualquier error que ocurra durante la carga de la imagen
      }
    );
    }
    onFileChanged(event:Event) {
      this.selectedFile = (event.target as HTMLInputElement).files?.[0] || null;
    }
  uploadImage(image: File) {
    const formData = new FormData();
    formData.append('image', image);
    formData.append('type', 'avatar');
    
    // Obtenemos el usuario actual del localStorage
    const currentUserString = localStorage.getItem('currentUser');

    if (currentUserString) {
      const currentUser = JSON.parse(currentUserString);
      const userId = currentUser.id;      
      // Agregamos el ID del usuario al formData
      formData.append('userId', userId);
    } else {
      console.error('No se pudo obtener el usuario actual del localStorage');
      // Manejar el caso en el que no se pueda obtener el usuario actual
    }

    return this.http.post<any>(this.apiUrl, formData);
  }
}
