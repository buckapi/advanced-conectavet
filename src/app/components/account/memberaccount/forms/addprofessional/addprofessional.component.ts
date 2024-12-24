import { CommonModule } from '@angular/common';
import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthPocketbaseService } from '@app/services/auth-pocketbase.service';
import { GlobalService } from '@app/services/global.service';
import { ProfessionalService } from '@app/services/professional.service';
import { RealtimeServicesService } from '@app/services/realtime-services.service';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import PocketBase from 'pocketbase';
import Swal from 'sweetalert2';
interface ImageRecord {
  collectionId: string;
  id: string;
  image: string;
  // agrega otros campos según sea necesario
}
interface FormData {
  images: string[];
  documents: string[];
  avatar: string[];
  certificates: string[];
  full_name: string;
  email: string;
  phone: string;
  address: string;
  consultationAddress: string;
  city: string;
  country: string;
  gender: string;
  profession: string;
  studyArea: string;
  university: string;
  graduationYear: string;
  specialties: any[];
  category: string;
  services: string;
  availability: string;
  days: boolean[];
  membershipPlan: string;
  advertiseServices: any[];
  schedule: string;
  status: string;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
  membership: string;
  advertiseProfile: boolean;
  advertisePlatform: boolean;
}

@Component({
  selector: 'app-addprofessional',
  standalone: true,
  imports: [CommonModule, FormsModule, NgMultiSelectDropDownModule],
  templateUrl: './addprofessional.component.html',
  styleUrl: './addprofessional.component.css',
})
export class AddprofessionalComponent {
  @ViewChild('imageUpload', { static: false }) imageUpload!: ElementRef;
  apiUrl = 'https://db.conectavet.cl:8080/api/files/';
  private pb: PocketBase;
  public selectedImage: File | null = null;
  public selectedImagePrev: File | null = null;
  public professionalName: string = '';
  public isVisible: boolean = false;
  public images: string[] = [];
  public gender: string = '';
  public services: string[] = [];
  public idMember: string = '';
  public selectedServices: string[] = [];
  idCategory: string = '';
  formData: FormData = {
    images: [],
    documents: [],
    avatar: [],
    certificates: [],
    full_name: '',
    email: '',
    phone: '',
    address: '',
    consultationAddress: '',
    city: '',
    country: '',
    gender: '',
    profession: '',
    studyArea: '',
    university: '',
    graduationYear: '',
    specialties: [],
    category: '',
    services: '',
    availability: '',
    monday: true,
    tuesday: false,
    wednesday: false,
    thursday: false,
    friday: false,
    saturday: false,
    sunday: false,
    days: Array(7).fill(true),
    membershipPlan: '',
    advertiseServices: [],
    schedule: '',
    status: '',
    membership: 'Basic Plan',
    advertiseProfile: true,
    advertisePlatform: false,
  };
  dropdownSettings: IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    selectAllText: 'Seleccionar todos',
    unSelectAllText: 'Deseleccionar todos',
    itemsShowLimit: 3,
    allowSearchFilter: true,
  };
  constructor(
    public realtimeServices: RealtimeServicesService,
    public auth: AuthPocketbaseService,
    public global: GlobalService,
    private professionalService: ProfessionalService,
    private realtimeService: RealtimeServicesService
  ) {
    this.pb = new PocketBase('https://db.conectavet.cl:8080');
  }
  onImageChange(event: any): void {
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
  async addProfessional() {
    if (!this.validateForm()) {
      return; // Detener la ejecución si hay errores de validación.
    }
    this.idMember = this.auth.getUserId();
    const formData = new FormData();
    formData.append('type', 'test');
    formData.append('userId', this.idMember);
    if (this.selectedImage) {
      formData.append('image', this.selectedImage);
    }
    this.idMember = this.auth.getUserId();
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

        const newProfessional =
          await this.professionalService.createProfessional({
            images: this.formData.images,
            name: this.professionalName,
            gender: this.gender,
            services: this.selectedServices,
            IdMember: this.idMember,
            status: this.isVisible ? 'visible' : 'hidden',
          });

        this.formData.images = [];
        this.professionalName = '';
        this.selectedServices = [];
        this.gender = '';

        newImageRecord = null;
        this.selectedImage = null;
        this.imageUpload.nativeElement.value = '';

        Swal.fire({
          title: 'Éxito!',
          text: 'Profesional agregado correctamente.',
          icon: 'success',
          confirmButtonText: 'Aceptar',
        });

        console.log('Profesional agregado:', newProfessional);
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
        text: 'No se pudo agregar el profesional.',
        icon: 'error',
        confirmButtonText: 'Aceptar',
      });
      console.error('Error al agregar el profesional:', error);
    }
  }
validateForm(): boolean {
  if (!this.selectedImage) {
    Swal.fire({
      title: 'Error!',
      text: 'Por favor, suba una imagen de perfil.',
      icon: 'warning',
      confirmButtonText: 'Aceptar',
    });
    return false;
  }
  if (!this.professionalName) {
    Swal.fire({
      title: 'Error!',
      text: 'Por favor, ingrese el nombre del profesional.',
      icon: 'warning',
      confirmButtonText: 'Aceptar',
    });
    return false;
  }
  


  if (!this.selectedServices || this.selectedServices.length === 0) {
    Swal.fire({
      title: 'Error!',
      text: 'Por favor, seleccione al menos un servicio.',
      icon: 'warning',
      confirmButtonText: 'Aceptar',
    });
    return false;
  }


  if (!this.gender) {
    Swal.fire({
      title: 'Error!',
      text: 'Por favor, seleccione el género.',
      icon: 'warning',
      confirmButtonText: 'Aceptar',
    });
    return false;
  }
  return true;
}

  onCategoryChange(selectedCategory: any): void {
    if (selectedCategory && selectedCategory.length > 0) {
      const idCategorySelected = selectedCategory[0].id;
      this.global.categorySelected = true;
    } else {
      this.global.categorySelected = false;
    }
  }
}
