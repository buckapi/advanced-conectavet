import { CommonModule } from '@angular/common';
import { Component, ViewChild, ElementRef, OnInit, ChangeDetectorRef } from '@angular/core';
import { AuthPocketbaseService } from '@app/services/auth-pocketbase.service';
import { GlobalService } from '@app/services/global.service';
import { ImageService } from '@app/services/image.service';
import PocketBase from 'pocketbase';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

interface TutorRecord {
  id: string;
  collectionId: string;
  collectionName: string;
  created: string;
  updated: string;
  full_name: string;
  address: string;
  phone: string;
  userId: string;
  status: string;
  images: string[];
  rut: string;
}

interface ImageRecord {
  collectionId: string;
  id: string;
  image: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  canEditRut: boolean = false;

  fields = {
    full_name: '',
    rut: '',
    address: '',
    phone: '',
  };

  visibleFields = {
    full_name: false,
    rut: false,
    address: false,
    phone: false,
  };

  toggleField(field: keyof typeof this.visibleFields): void {
    this.visibleFields[field] = !this.visibleFields[field];
  }

  saveRut() {
    if (this.fields.rut) {
      this.onInputChange('rut', this.fields.rut);
    }
  }

  async confirmSaveRut() {
    // If RUT is already saved, prevent further editing
    if (this.fields.rut) {
      Swal.fire({
        icon: 'info',
        title: 'RUT ya guardado',
        text: 'El RUT ya ha sido guardado y no puede modificarse.',
        confirmButtonColor: '#3ba5a8'
      });
      return false;
    }

    // Validate RUT before showing confirmation
    const cleanRut = this.rut.replace(/[.-]/g, '').toUpperCase();
    if (!this.validateRut(cleanRut)) {
      Swal.fire({
        icon: 'warning',
        title: 'RUT Inválido',
        text: 'Por favor, ingrese un RUT válido en formato XX.XXX.XXX-X',
        confirmButtonColor: '#3ba5a8'
      });
      return false;
    }

    const result = await Swal.fire({
      title: '¿Estás seguro de guardar tu RUT?',
      html: `
        <p>Advertencia: El RUT solo podrá ser ingresado una vez.</p>
        <p>Después de guardar, <strong>NO PODRÁS modificar tu RUT</strong>.</p>
        <p>Asegúrate de que el RUT sea correcto:</p>
        <h3 class="text-primary">${this.formatRut(this.rut)}</h3>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3ba5a8',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, guardar RUT',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        // Format and save RUT
        const formattedRut = this.formatRut(this.rut);
        this.fields.rut = formattedRut;
        
        // Update RUT in backend
        await this.updateFields('rut', formattedRut);

        // Show success message
        await Swal.fire({
          title: 'RUT Guardado',
          text: 'Tu RUT ha sido guardado exitosamente.',
          icon: 'success',
          confirmButtonColor: '#3ba5a8'
        });

        // Disable further RUT edits ONLY after successful save
        this.canEditRut = false;
        this.visibleFields['rut'] = false;

        return true;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'No se pudo guardar el RUT. Inténtalo de nuevo.';
        
        Swal.fire({
          title: 'Error',
          text: errorMessage,
          icon: 'error',
          confirmButtonColor: '#d33'
        });

        // Keep edit mode active if save fails
        this.canEditRut = true;

        return false;
      }
    }
    return false;
  }

  formatRutInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/[^0-9kK]/g, '');
    
    // Limit input to 9 characters (8 digits + 1 check digit)
    if (value.length > 9) {
      value = value.slice(0, 9);
    }
    
    // Format RUT with dots and dash
    let formattedRut = '';
    if (value.length > 1) {
      const body = value.slice(0, -1);
      const checkDigit = value.slice(-1);
      
      // Add dots for thousands separator
      formattedRut = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
      formattedRut += `-${checkDigit}`;
    } else {
      formattedRut = value;
    }
    
    // Update model and input value
    this.rut = formattedRut;
    input.value = formattedRut;
  }

  private validateRut(rut: string): boolean {
    // Remove any existing formatting and convert to uppercase
    rut = rut.replace(/[.-]/g, '').toUpperCase();
    
    // Check if RUT has at least 2 characters
    if (rut.length < 2) return false;
    
    // Separate body and check digit
    const body = rut.slice(0, -1);
    const checkDigit = rut.slice(-1);
    
    // Validate body is a number
    if (!/^\d+$/.test(body)) return false;
    
    // Calculate check digit
    let sum = 0;
    let multiplier = 2;
    
    // Iterate through body digits from right to left
    for (let i = body.length - 1; i >= 0; i--) {
      sum += parseInt(body[i]) * multiplier;
      multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }
    
    // Calculate expected check digit
    const remainder = 11 - (sum % 11);
    
    // Convert calculated check digit to final form
    let finalCheckDigit: string;
    switch (remainder) {
      case 10:
        finalCheckDigit = 'K';
        break;
      case 11:
        finalCheckDigit = '0';
        break;
      default:
        finalCheckDigit = remainder.toString();
    }
    
    // Compare calculated check digit with provided check digit
    return finalCheckDigit === checkDigit;
  }

  private debounceTimers: { [key: string]: any } = {};
  isLoading: { [key: string]: { loading: boolean; success: boolean } } = {};
  @ViewChild('imageUpload', { static: false }) imageUpload!: ElementRef;
  selectedImagePreview: string | null = null; // URL para la previsualización de la imagen
  currentUser = {
    images: ['assets/images/default.png'], // Imagen predeterminada
  };



  selectedImagePrev: string | null = null;


  selectedImage: File | null = null;
  formData = {
    images: [] as string[],
  };
  idTutor: string = 'user-id'; // Reemplaza con el ID real del tutor
  apiUrl = 'https://db.conectavet.cl:8080/api/files/';
  private pb: PocketBase;
  constructor(
    private imageService: ImageService,
    public global: GlobalService,
    public auth: AuthPocketbaseService,
    private cdr: ChangeDetectorRef
  ) {

    this.pb = new PocketBase('https://db.conectavet.cl:8080');

  }
  ngOnInit(): void {
    this.fetchTutorData();
    this.fields = {
      full_name: '',
      rut: '',
      phone: '',
      address: ''
    };
    this.canEditRut = !this.fields.rut;
  }
  onInputChange(fieldName: string, value: string): void {
    // Cancela el temporizador anterior para el campo actual
    if (this.debounceTimers[fieldName]) {
      clearTimeout(this.debounceTimers[fieldName]);
    }

    // Inicia un nuevo temporizador de 3 segundos
    this.debounceTimers[fieldName] = setTimeout(() => {
      this.updateFields(fieldName, value);
    }, 4000);
  }

  async updateFields(fieldName: string, value: string): Promise<void> {
    const userId = this.auth.getUserId();

    try {
      this.isLoading[fieldName] = { loading: true, success: false };
      
      // Actualiza el campo en la colección `users`
      await this.auth.updateUserField(userId, { [fieldName]: value });

      // Busca el tutor relacionado y actualiza el campo
      const tutorRecord = await this.auth.findTutorByUserId(userId);
      if (tutorRecord) {
        await this.auth.updateTutorField(tutorRecord.id, {
          [fieldName]: value
        });
      }

      // Si el campo es full_name, actualiza también en localStorage
      if (fieldName === 'full_name') {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        currentUser.full_name = value;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
      }

      this.isLoading[fieldName] = { loading: false, success: true };
      
      // Ocultar el check y el campo después de 1 segundo
      setTimeout(() => {
        if (this.isLoading[fieldName]) {
          this.isLoading[fieldName].success = false;
          this.visibleFields[fieldName as keyof typeof this.visibleFields] = false;
        }
      }, 1000);

      console.log(`${fieldName} actualizado a "${value}" en ambas entidades.`);
    } catch (error) {
      this.isLoading[fieldName] = { loading: false, success: false };
      console.error(`Error al actualizar ${fieldName}:`, error);
    }
  }

  async onImageChange(event: any): Promise<void> {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
      this.isLoading['image'] = { loading: true, success: false };

      // Mostrar previsualización de la imagen seleccionada
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedImagePrev = reader.result as string;
      };
      reader.readAsDataURL(file);

      // Crear FormData para enviar al servidor
      const formData = new FormData();
      formData.append('type', 'avatar');
      formData.append('userId', this.auth.getUserId());

      if (this.selectedImage) {
        formData.append('image', this.selectedImage);
      }

      try {
        const newImageRecord: ImageRecord | null = await this.pb
          .collection('images')
          .create(formData);

        if (newImageRecord) {
          const uploadedImageUrl = `${this.apiUrl}${newImageRecord.collectionId}/${newImageRecord.id}/${newImageRecord.image}`;

          const userId = this.auth.getUserId();

          // Actualizar el registro de `users`
          const userRecord = await this.pb.collection('users').getOne(userId);
          if (userRecord) {
            const updatedUser = {
              ...userRecord,
              images: [uploadedImageUrl],
            };

            await this.pb.collection('users').update(userRecord.id, updatedUser);
            console.log('Imagen actualizada en users:', updatedUser);
          }

          // Actualizar el registro de `tutors`
          const tutorRecord = await this.pb
            .collection('tutors')
            .getFirstListItem(`userId="${userId}"`);

          if (tutorRecord) {
            const updatedTutor = {
              ...tutorRecord,
              images: [uploadedImageUrl],
            };

            await this.pb.collection('tutors').update(tutorRecord.id, updatedTutor);
            console.log('Ficha en tutors actualizada:', updatedTutor);
          }
          this.currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

          // Actualizar previsualización y localStorage
          this.selectedImagePrev = uploadedImageUrl;
          this.currentUser.images[0] = uploadedImageUrl;
          localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

          this.isLoading['image'] = { loading: false, success: true };
          setTimeout(() => {
            if (this.isLoading['image']) {
              this.isLoading['image'].success = false;
            }
          }, 2000);
        }
      } catch (error: any) {
        this.isLoading['image'] = { loading: false, success: false };
        console.error('Error al subir la imagen o actualizar registros:', error.response?.data || error);
      }
    } else {
      console.warn('No se seleccionó ningún archivo.');
    }
  }

  async uploadImage(file: File): Promise<void> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('userId', this.auth.getUserId());

    try {
      // Lógica para subir la imagen al servidor
      const response = await fetch('https://db.conectavet.cl:8080/api/files/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('No se pudo cargar la imagen');
      }

      const data = await response.json();

      // Actualiza la URL de la imagen en `currentUser`
      this.currentUser.images[0] = `https://db.conectavet.cl:8080/api/files/${data.collectionId}/${data.id}/${data.image}`;

      // Guarda el usuario actualizado en el `localStorage`
      localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

      console.log('Imagen cargada correctamente');
    } catch (error) {
      console.error('Error al subir la imagen:', error);
    }
  }

  isMobile(): boolean {
    return window.innerWidth <= 768; // Ajusta el ancho según tus necesidades
  }

  async fetchTutorData(): Promise<void> {
    try {
      const userId = this.auth.getUserId();
      console.log('UserId obtenido:', userId);

      const tutorRecord = await this.pb
        .collection('tutors')
        .getFirstListItem<TutorRecord>(`userId="${userId}"`);

      if (tutorRecord) {
        console.log('Registro completo del tutor:', tutorRecord);

        // Ahora puedes acceder directamente a las propiedades
        this.fields.full_name = tutorRecord.full_name || '';
        this.fields.address = tutorRecord.address || '';
        this.fields.rut = tutorRecord.rut || '';
        if (!this.fields.rut) {
          this.canEditRut = true;
        }
        this.fields.phone = tutorRecord.phone || '';

        console.log('Valores asignados:');
        console.log('full_name:', this.fields.full_name);
        console.log('address:', this.fields.address);
        console.log('rut:', this.fields.rut);
        console.log('phone:', this.fields.phone);
        this.cdr.detectChanges();
        Promise.resolve().then(() => {
          console.log('Cambio detectado por Angular');
        });
      } else {
        console.warn('No se encontraron datos para el tutor asociado.');
      }
    } catch (error) {
      console.error('Error detallado al obtener los datos del tutor:', error);
    }
  }

  NonImageChange(event: Event): void {
    console.log('Evento recibido:', event);
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      console.log('Archivo seleccionado:', file);
    } else {
      console.log('No se seleccionó ningún archivo.');
    }
  }

  private formatRut(rut: string): string {
    // Remove any existing formatting
    rut = rut.replace(/[.-]/g, '').toUpperCase();
    
    // Separate body and verification digit
    const body = rut.slice(0, -1);
    const verifier = rut.slice(-1);
    
    // Format body with dots and dash
    const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    return `${formattedBody}-${verifier}`;
  }

  rut: string = '';  // Add this property to the class


}
