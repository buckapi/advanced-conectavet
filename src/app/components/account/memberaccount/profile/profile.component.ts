import { CommonModule } from '@angular/common';
import { Component, ViewChild, ElementRef, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthPocketbaseService } from '@app/services/auth-pocketbase.service';
import { GlobalService } from '@app/services/global.service';
import { ImageService } from '@app/services/image.service';
import Swal from 'sweetalert2';
import PocketBase from 'pocketbase';
import { CalendarModule } from 'primeng/calendar';

interface ImageRecord {
  collectionId: string;
  id: string;
  image: string;
}
interface MemberRecord {
  id: string;
  full_name: string;
  bio: string;
  email: string;
  rut: string;
  address: string;
  region: string;
  comuna: string;
  phone: string;
  days: string;
  hours: string;
  manager_name: string;
  manager_phone: string;
  manager_email: string;
  manager_position: string;
  images: string[];
  [key: string]: any; 
  account_number: string;
  account_holder: string;
  bank_name: string;
  // Agregado para permitir índices dinámicos
}

// interface MemberRecord {
//   id: string;
//   full_name: string;
//   bio: string;
//   email: string;
//   rut: string;
//   address: string;
//   region: string;
//   comuna: string;
//   phone: string;
//   days: string;
//   hours: string;
//   manager_name: string;
//   manager_phone: string;
//   manager_email: string;
//   manager_position: string;
//   images: string[];
// }

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule,CalendarModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {

   regions = [
    {
      name: 'Región de Arica y Parinacota',
      communes: ['Arica', 'Camarones', 'Putre', 'General Lagos']
    },
    {
      name: 'Región de Tarapacá',
      communes: ['Iquique', 'Alto Hospicio', 'Pozo Almonte', 'Camiña', 'Colchane', 'Huara', 'Pica']
    },
    {
      name: 'Región de Antofagasta',
      communes: ['Antofagasta', 'Mejillones', 'Sierra Gorda', 'Taltal', 'Calama', 'Ollagüe', 'San Pedro de Atacama', 'Tocopilla', 'María Elena']
    },
    {
      name: 'Región de Atacama',
      communes: ['Copiapó', 'Caldera', 'Tierra Amarilla', 'Chañaral', 'Diego de Almagro', 'Vallenar', 'Freirina', 'Huasco', 'Alto del Carmen']
    },
    {
      name: 'Región de Coquimbo',
      communes: ['La Serena', 'Coquimbo', 'Andacollo', 'La Higuera', 'Paihuano', 'Vicuña', 'Ovalle', 'Combarbalá', 'Monte Patria', 'Punitaqui', 'Río Hurtado', 'Illapel', 'Canela', 'Los Vilos', 'Salamanca']
    },
    {
      name: 'Región de Valparaíso',
      communes: ['Valparaíso', 'Viña del Mar', 'Concón', 'Quintero', 'Puchuncaví', 'Casablanca', 'Quilpué', 'Villa Alemana', 'Limache', 'Olmué', 'Quillota', 'La Calera', 'Hijuelas', 'Nogales', 'La Cruz', 'San Antonio', 'Cartagena', 'El Quisco', 'El Tabo', 'Algarrobo', 'Los Andes', 'San Esteban', 'Calle Larga', 'Rinconada', 'Petorca', 'La Ligua', 'Zapallar', 'Papudo', 'Cabildo', 'Isla de Pascua']
    },
    {
      name: 'Región Metropolitana de Santiago',
      communes: ['Santiago', 'Cerro Navia', 'Conchalí', 'El Bosque', 'Estación Central', 'Huechuraba', 'Independencia', 'La Cisterna', 'La Florida', 'La Granja', 'La Pintana', 'La Reina', 'Las Condes', 'Lo Barnechea', 'Lo Espejo', 'Lo Prado', 'Macul', 'Maipú', 'Ñuñoa', 'Pedro Aguirre Cerda', 'Peñalolén', 'Providencia', 'Pudahuel', 'Quilicura', 'Quinta Normal', 'Recoleta', 'Renca', 'San Joaquín', 'San Miguel', 'San Ramón', 'Vitacura', 'Puente Alto', 'San Bernardo', 'Buin', 'Calera de Tango', 'Paine', 'Melipilla', 'Curacaví', 'María Pinto', 'San Pedro', 'Talagante', 'El Monte', 'Isla de Maipo', 'Padre Hurtado', 'Peñaflor']
    },
    {
      name: 'Región de O’Higgins',
      communes: ['Rancagua', 'Machalí', 'Graneros', 'Codegua', 'Doñihue', 'Coltauco', 'Olivar', 'Requínoa', 'Rengo', 'Malloa', 'San Vicente', 'Pichidegua', 'Peumo', 'Las Cabras', 'San Fernando', 'Chimbarongo', 'Nancagua', 'Placilla', 'Santa Cruz', 'Pichilemu', 'Marchihue', 'Paredones', 'Navidad', 'Litueche', 'La Estrella']
    },
    {
      name: 'Región del Maule',
      communes: ['Talca', 'Constitución', 'Curepto', 'Empedrado', 'Maule', 'Pelarco', 'Pencahue', 'Río Claro', 'San Clemente', 'San Rafael', 'Cauquenes', 'Chanco', 'Pelluhue', 'Curicó', 'Hualañé', 'Licantén', 'Molina', 'Rauco', 'Romeral', 'Sagrada Familia', 'Teno', 'Linares', 'Colbún', 'Longaví', 'Parral', 'Retiro', 'San Javier', 'Villa Alegre', 'Yerbas Buenas']
    },
    {
      name: 'Región de Ñuble',
      communes: ['Chillán', 'Chillán Viejo', 'El Carmen', 'Pemuco', 'Pinto', 'Quillón', 'San Ignacio', 'Yungay', 'Cobquecura', 'Coelemu', 'Ninhue', 'Portezuelo', 'Quirihue', 'Ránquil', 'Treguaco', 'Bulnes', 'Quirihue', 'San Carlos']
    },
    {
      name: 'Región del Biobío',
      communes: ['Concepción', 'Talcahuano', 'Hualpén', 'Chiguayante', 'Coronel', 'San Pedro de la Paz', 'Lota', 'Tomé', 'Penco', 'Santa Juana', 'Hualqui', 'Florida', 'Lebu', 'Arauco', 'Curanilahue', 'Los Álamos', 'Cañete', 'Tirúa', 'Los Ángeles', 'Nacimiento', 'Negrete', 'Mulchén', 'Quilaco', 'Quilleco', 'Santa Bárbara', 'Laja', 'San Rosendo', 'Antuco', 'Cabrero', 'Yumbel']
    },
    {
      name: 'Región de La Araucanía',
      communes: ['Temuco', 'Padre Las Casas', 'Cunco', 'Curarrehue', 'Freire', 'Galvarino', 'Gorbea', 'Lautaro', 'Loncoche', 'Melipeuco', 'Nueva Imperial', 'Perquenco', 'Pitrufquén', 'Pucón', 'Saavedra', 'Teodoro Schmidt', 'Toltén', 'Vilcún', 'Villarrica', 'Angol', 'Collipulli', 'Curacautín', 'Ercilla', 'Lonquimay', 'Los Sauces', 'Lumaco', 'Purén', 'Renaico', 'Traiguén', 'Victoria']
    },
    {
      name: 'Región de Los Ríos',
      communes: ['Valdivia', 'Corral', 'Lanco', 'Los Lagos', 'Máfil', 'Mariquina', 'Paillaco', 'Panguipulli', 'La Unión', 'Río Bueno', 'Futrono', 'Lago Ranco']
    },
    {
      name: 'Región de Los Lagos',
      communes: ['Puerto Montt', 'Puerto Varas', 'Llanquihue', 'Fresia', 'Frutillar', 'Los Muermos', 'Maullín', 'Calbuco', 'Ancud', 'Castro', 'Chonchi', 'Curaco de Vélez', 'Dalcahue', 'Puqueldón', 'Queilén', 'Quellón', 'Quemchi', 'Quinchao', 'Osorno', 'Puerto Octay', 'Purranque', 'Puyehue', 'Río Negro', 'San Juan de la Costa', 'San Pablo', 'Chaitén', 'Futaleufú', 'Hualaihué', 'Palena']
    },
    {
      name: 'Región de Aysén',
      communes: ['Coyhaique', 'Aysén', 'Cisnes', 'Guaitecas', 'Chile Chico', 'Río Ibáñez', 'Cochrane', 'O’Higgins', 'Tortel']
    },
    {
      name: 'Región de Magallanes y de la Antártica Chilena',
      communes: ['Punta Arenas', 'Puerto Natales', 'Porvenir', 'Primavera', 'Timaukel', 'Cabo de Hornos', 'Antártica']
    }
  ];
  
  
  selectedRegion: string = '';
  selectedComune: string = '';
  filteredComunes: string[] = [];

  // Manejar el cambio de región
  onRegionChange(): void {
    const region = this.regions.find(r => r.name === this.selectedRegion);
    this.filteredComunes = region ? region.communes : [];
    this.selectedComune = ''; // Resetear la provincia seleccionada
    this.onInputChange('region', this.selectedRegion);
    this.toggleField('comune'); 
  }

  onComuneChange() {
    this.onInputChange('comuna', this.selectedComune);
    
    Swal.fire({
      title: 'Éxito',
      text: 'Ubicación actualizada correctamente',
      icon: 'success',
      confirmButtonText: 'Ok'
    });
  }

  canEditRut: boolean = false;
  fields: MemberRecord = {
    id: '',
    full_name: '',
    bio: '',
    email: '',
    rut: '',
    address: '',
    region: '',
    comuna: '',
    phone: '',
    days: '',
    hours: '',
    manager_name: '',
    manager_phone: '',
    manager_email: '',
    manager_position: '',
    images: [],
    account_number: '',
    account_holder: '',
    bank_name: '',
  };
  visibleFields: { [key: string]: boolean } = {
    full_name: false,
    bio: false,
    email: false,
    rut: false,
    address: false,
    region: false,
    comuna: false,
    phone: false,
    days: false,
    hours: false,
    manager_name: false,
    manager_phone: false,
    manager_email: false,
    manager_position: false,
  };


  private debounceTimers: { [key: string]: any } = {};
  @ViewChild('imageUpload', { static: false }) imageUpload!: ElementRef;
  selectedImagePreview: string | null = null; // URL para la previsualización de la imagen
currentUser = {
  images: ['assets/images/default.png'], // Imagen predeterminada
}; selectedImage: File | null = null;
  selectedImagePrev: string | null = null;
  apiUrl = 'https://db.conectavet.cl:8080/api/files/';

  private pb: PocketBase;

  startTime: Date | null = null;
  endTime: Date | null = null;

  selectedDays = {
    'L': false,
    'M': false,
    'X': false,
    'J': false,
    'V': false,
    'S': false,
    'D': false
  };

  constructor(
    private imageService: ImageService,
    public global: GlobalService,
    public auth: AuthPocketbaseService,
    private cdr: ChangeDetectorRef
  ) {
    this.pb = new PocketBase('https://db.conectavet.cl:8080');
  }

  ngOnInit(): void {
    this.fetchMemberData();
    this.initializeTimeFields();
    // Initialize selectedDays from fields.days if it exists
    if (this.fields.days) {
      const days = this.fields.days.split(',');
      days.forEach(day => {
        this.selectedDays[day.trim() as keyof typeof this.selectedDays] = true;
      });
    }
  }

  toggleField(field: keyof typeof this.visibleFields): void {
    this.visibleFields[field] = !this.visibleFields[field];
  }

  onInputChange(fieldName: string, value: string): void {
    if (fieldName === 'comuna' ) {
      return;
    }
    if (this.debounceTimers[fieldName]) {
      clearTimeout(this.debounceTimers[fieldName]);
    }
  
    this.debounceTimers[fieldName] = setTimeout(() => {
      this.updateFields(fieldName, value);
    }, 4000);
    if (fieldName === 'region' ) {
      this.onRegionChange();
    }
  }

  async updateFields(fieldName: string, value: string): Promise<void> {
    try {
      const memberId = this.fields.id;
      await this.pb.collection('members').update(memberId, { [fieldName]: value });

      if (fieldName === 'full_name') {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        currentUser.full_name = value;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
      }

      Swal.fire('Éxito', `${fieldName} se ha actualizado correctamente.`, 'success');
      console.log(`${fieldName} actualizado a "${value}".`);
    } catch (error) {
      Swal.fire('Error', `Hubo un problema al actualizar ${fieldName}.`, 'error');
      console.error(`Error al actualizar ${fieldName}:`, error);
    }
  }

  async fetchMemberData(): Promise<void> {
    try {
      const userId = this.auth.getUserId();
      const memberRecord = await this.pb.collection('members').getFirstListItem<MemberRecord>(`userId="${userId}"`);
      if (memberRecord) {
        if (!this.fields.rut) {
          this.canEditRut = true;
        }
        this.fields = memberRecord;
        this.cdr.detectChanges();
        console.log('Datos cargados:', this.fields);
      } else {
        console.warn('No se encontraron datos para este miembro.');
      }
    } catch (error) {
      console.error('Error al cargar los datos del miembro:', error);
    }
  }

  async onImageChange(event: any): Promise<void> {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
  
      // Mostrar previsualización de la imagen seleccionada
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedImagePrev = reader.result as string; // Previsualización
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
  
          // Actualizar el registro de `members`
          const tutorRecord = await this.pb
            .collection('members')
            .getFirstListItem(`userId="${userId}"`);
  
          if (tutorRecord) {
            const updatedTutor = {
              ...tutorRecord,
              images: [uploadedImageUrl],
            };
  
            await this.pb.collection('members').update(tutorRecord.id, updatedTutor);
            console.log('Ficha en members actualizada:', updatedTutor);
          }
  this.currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
          // Actualizar previsualización y localStorage
          this.selectedImagePrev = uploadedImageUrl;
          this.currentUser.images[0] = uploadedImageUrl;
          localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
  
          // Notificación de éxito
          Swal.fire({
            icon: 'success',
            title: 'Imagen actualizada',
            text: 'La imagen se ha subido correctamente.',
          });
        }
      } catch (error: any) {
        Swal.fire({
          icon: 'error',
          title: 'Error al subir imagen',
          text: 'No se pudo actualizar la imagen. Inténtelo de nuevo.',
        });
        console.error('Error al subir la imagen o actualizar registros:', error.response?.data || error);
      }
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'No se seleccionó archivo',
        text: 'Por favor selecciona un archivo para subir.',
      });
      console.warn('No se seleccionó ningún archivo.');
    }
  }

  isMobile(): boolean {
    return window.innerWidth <= 768;
  }

  async confirmSaveRut() {
    this.canEditRut = false;
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: 'El RUT solo podrá ser ingresado una vez. Después de guardar, no podrás modificarlo.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      this.updateFields('rut', this.fields.rut);
    }
  }

  updateHours() {
    if (this.startTime && this.endTime) {
      const formatTime = (date: Date) => {
        return date.toLocaleTimeString('es-ES', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        }).toUpperCase();
      };
      
      this.fields.hours = `${formatTime(this.startTime)} - ${formatTime(this.endTime)}`;
      this.onInputChange('hours', this.fields.hours);
    }
  }

  // Opcional: Si necesitas inicializar los valores cuando se carga un horario existente
  initializeTimeFields() {
    if (this.fields.hours) {
      const [start, end] = this.fields.hours.split('-').map(t => t.trim());
      if (start && end) {
        // Convertir las strings de tiempo a objetos Date
        const today = new Date();
        
        const setTimeFromString = (timeStr: string) => {
          const date = new Date(today);
          const [time, period] = timeStr.toLowerCase().split(' ');
          let [hours, minutes] = time.split(':');
          let hour = parseInt(hours);
          
          if (period === 'pm' && hour !== 12) hour += 12;
          if (period === 'am' && hour === 12) hour = 0;
          
          date.setHours(hour, parseInt(minutes));
          return date;
        };

        this.startTime = setTimeFromString(start);
        this.endTime = setTimeFromString(end);
      }
    }
  }

  updateDays() {
    const selectedDays = Object.entries(this.selectedDays)
      .filter(([_, selected]) => selected)
      .map(([day, _]) => day);
    
    this.fields.days = selectedDays.join(', ');
    this.onInputChange('days', this.fields.days);
  }

  displaySelectedDays() {
    return this.fields.days || '';
  }
}
