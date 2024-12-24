import { CommonModule } from '@angular/common';
import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthPocketbaseService } from '@app/services/auth-pocketbase.service';
import PocketBase from 'pocketbase';
import Swal from 'sweetalert2';

interface ImageRecord {
  collectionId: string;
  id: string;
  image: string;
}

interface PetData {
  images: string[];
  name: string;
  type: string;
  idTutor: string;
  status: string;
  petWeight: number;
  petAge: number;
  petColor: string;
}

@Component({
  selector: 'app-addpet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './addpet.component.html',
  styleUrl: './addpet.component.css',
})
export class AddpetComponent {
  @ViewChild('imageUpload', { static: false }) imageUpload!: ElementRef;
  
  apiUrl = 'https://db.conectavet.cl:8080/api/files/';
  private pb: PocketBase;
 
  public selectedImage: File | null = null;
  public selectedImagePrev: File | null = null;
  public petName: string = '';
  public petWeight: number | null = null;
  public petAge: number | null = null;
  public petColor: string = '';
  public petBreed: string = '';
  public petType: string = '';
  public isVisible: boolean = false;
  public images: string[] = [];
  public idTutor: string = '';
  public otherPetType: string = '';
   formData:PetData = {
    images: [] ,
    name: '',
    type: '',
    idTutor: '',
    status: '',
    petWeight: 0,
    petAge: 0,
    petColor: '' 
  };

  constructor(public auth: AuthPocketbaseService) {
    this.pb = new PocketBase('https://db.conectavet.cl:8080');
  }

  onImageChangeR(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImagePrev = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onImageChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImagePrev = e.target.result; // Para la vista previa
      };
      reader.readAsDataURL(file);
    }
  }
  


  async addPet() {
    if (!this.validateForm()) {
      return;
    }

    this.idTutor = this.auth.getUserId();
    const formData = new FormData();
    formData.append('type', 'pet');
    formData.append('userId', this.idTutor);
    
    if (this.selectedImage) {
      formData.append('image', this.selectedImage);
    }

    try {
      let newImageRecord: ImageRecord | null = await this.pb
        .collection('images')
        .create(formData);

      if (newImageRecord) {

        console.log('Imagen subida:', newImageRecord);
        this.formData.images.push(
          this.apiUrl +
            newImageRecord.collectionId +
            '/' +
            newImageRecord.id +
            '/' +
            newImageRecord.image
          );
     

        const petData: PetData = {
          petWeight: this.formData.petWeight,
          petAge: this.formData.petAge,
          petColor: this.formData.petColor,
          images: this.formData.images,
          name: this.petName,
          type: this.petType,
          idTutor: this.idTutor,
          status: this.isVisible ? 'visible' : 'hidden'
        };

        await this.pb.collection('pets').create(petData);

        // Resetear formulario
        this.resetForm();

        Swal.fire({
          title: 'Éxito!',
          text: 'Mascota agregada correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
        });

      } else {
        Swal.fire({
          title: 'Error!',
          text: 'La imagen no se subió correctamente.',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
      }
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: 'No se pudo agregar la mascota.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
      console.error('Error al agregar la mascota:', error);
    }
  }
  validateForm(): boolean {
    console.log('selectedImage:', this.selectedImage); // Para ver si la imagen está definida
    console.log('petName:', this.petName); // Para ver el nombre
    console.log('petType:', this.petType); // Para ver el tipo
    
    if (!this.selectedImage) {
      Swal.fire({
        title: 'Error!',
        text: 'Por favor, suba una imagen de la mascota.',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
      });
      return false;
    }
  
    if (!this.petName) {
      Swal.fire({
        title: 'Error!',
        text: 'Por favor, ingrese el nombre de la mascota.',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
      });
      return false;
    }
  
    if (!this.petType) {
      Swal.fire({
        title: 'Error!',
        text: 'Por favor, seleccione el tipo de mascota.',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
      });
      return false;
    }
  
    return true;
  }
  
  // validateForm(): boolean {
  //   if (!this.selectedImage) {
  //     Swal.fire({
  //       title: 'Error!',
  //       text: 'Por favor, suba una imagen de la mascota.',
  //       icon: 'warning',
  //       confirmButtonText: 'Aceptar',
  //     });
  //     return false;
  //   }

  //   if (!this.petName) {
  //     Swal.fire({
  //       title: 'Error!',
  //       text: 'Por favor, ingrese el nombre de la mascota.',
  //       icon: 'warning',
  //       confirmButtonText: 'Aceptar',
  //     });
  //     return false;
  //   }

  //   if (!this.petType) {
  //     Swal.fire({
  //       title: 'Error!',
  //       text: 'Por favor, seleccione el tipo de mascota.',
  //       icon: 'warning',
  //       confirmButtonText: 'Aceptar',
  //     });
  //     return false;
  //   }

  //   return true;
  // }

  private resetForm(): void {
    this.images = [];
    this.petName = '';
    this.petType = '';
    this.selectedImage = null;
    this.selectedImagePrev = null;
    if (this.imageUpload) {
      this.imageUpload.nativeElement.value = '';
    }
  }
}