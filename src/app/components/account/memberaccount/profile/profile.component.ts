import { Component, OnInit, ChangeDetectorRef, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageService } from '@app/services/image.service';
import { GlobalService } from '@app/services/global.service';
import { AuthPocketbaseService } from '@app/services/auth-pocketbase.service';
import PocketBase from 'pocketbase';
import { CalendarModule } from 'primeng/calendar';
import { NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MapModalComponent } from '@app/components/shared/map-modal/map-modal.component';
import Swal from 'sweetalert2';

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
  lat: number;
  lng: number;
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

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CalendarModule,
    NgbModule,
    MapModalComponent
  ]
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
      communes: ['Santiago', 'Cerro Navia', 'Conchalí', 'El Bosque', 'Estación Central', 'Hualpén', 'Independencia', 'La Cisterna', 'La Florida', 'La Granja', 'La Pintana', 'La Reina', 'Las Condes', 'Lo Barnechea', 'Lo Espejo', 'Lo Prado', 'Macul', 'Maipú', 'Ñuñoa', 'Pedro Aguirre Cerda', 'Peñalolén', 'Providencia', 'Pudahuel', 'Quilicura', 'Quinta Normal', 'Recoleta', 'Renca', 'San Joaquín', 'San Miguel', 'San Ramón', 'Vitacura', 'Puente Alto', 'San Bernardo', 'Buin', 'Calera de Tango', 'Paine', 'Melipilla', 'Curacaví', 'María Pinto', 'San Pedro', 'Talagante', 'El Monte', 'Isla de Maipo', 'Padre Hurtado', 'Peñaflor']
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

    // Trigger update for region with loading state
    if (this.selectedRegion) {
      this.updateFields('region', this.selectedRegion);
    }

    this.toggleField('comune'); 
  }

  onComuneChange(): void {
    // Trigger update for commune with loading state
    if (this.selectedComune) {
      this.updateFields('comuna', this.selectedComune);
    }
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
    lat: 0,
    lng: 0,
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

  isLoading: { 
    [key: string]: {
      loading: boolean, 
      success: boolean 
    } 
  } = {};

  private debounceTimers: { [key: string]: any } = {};
  @ViewChild('imageUpload', { static: false }) imageUpload!: ElementRef;
  selectedImagePreview: string | null = null; // URL para la previsualización de la imagen
currentUser = {
  images: ['assets/images/default.png'], // Imagen predeterminada
}; selectedImage: File | null = null;
  selectedImagePrev: string | null = null;
  selectedImagePrevUrl: string | null = null;
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
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal
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
    this.canEditRut = !this.fields.rut;
    // this.testRutValidation();
  }

  toggleField(field: keyof typeof this.visibleFields): void {
    this.visibleFields[field] = !this.visibleFields[field];
  }

  onInputChange(fieldName: string, value: string): void {
    if (fieldName === 'comuna') {
      return;
    }
    
    if (this.debounceTimers[fieldName]) {
      clearTimeout(this.debounceTimers[fieldName]);
    }
  
    this.debounceTimers[fieldName] = setTimeout(() => {
      this.updateFields(fieldName, value);
    }, 4000);
    
    if (fieldName === 'region') {
      this.onRegionChange();
    }
  }

  async updateFields(fieldName: string, value: string): Promise<void> {
    // Initialize the loading state for the field
    this.isLoading[fieldName] = { 
      loading: true, 
      success: false 
    };
    this.cdr.detectChanges(); // Trigger change detection

    try {
      const memberId = this.fields.id;
      
      // Simulate a minimum loading time to make the spinner visible
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await this.pb.collection('members').update(memberId, { [fieldName]: value });

      if (fieldName === 'full_name') {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        currentUser.full_name = value;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
      }

      // Special handling for region, commune, days, and hours
      if (fieldName === 'region') {
        this.fields.region = value;
        this.visibleFields['region'] = false;
      }

      if (fieldName === 'comuna') {
        this.fields.comuna = value;
        this.visibleFields['comune'] = false;
      }

      if (fieldName === 'days') {
        this.fields.days = value;
        // Do NOT hide days selector
      }

      if (fieldName === 'hours') {
        this.fields.hours = value;
      }

      // Remove loading state and show success state
      this.isLoading[fieldName].loading = false;
      this.isLoading[fieldName].success = true;
      this.cdr.detectChanges();

      // Remove success state after 2 seconds
      setTimeout(() => {
        this.isLoading[fieldName].success = false;
        
        if (fieldName === 'region') {
          this.visibleFields['region'] = false;
        }
        if (fieldName === 'comuna') {
          this.visibleFields['comune'] = false;
        }
        // Do NOT hide days selector
        
        this.cdr.detectChanges();
      }, 2000);

      console.log(`${fieldName} actualizado a "${value}".`);
    } catch (error) {
      // Ensure loading state is removed even on error
      this.isLoading[fieldName] = { 
        loading: false, 
        success: false 
      };
      this.cdr.detectChanges();

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
          console.log('Imagen actualizada correctamente');
        }
      } catch (error: any) {
        console.error('Error al subir la imagen o actualizar registros:', error.response?.data || error);
        this.showErrorNotification('No se pudo actualizar la imagen. Inténtelo de nuevo.');
      }
    } else {
      console.warn('No se seleccionó ningún archivo.');
      this.showWarningNotification('Por favor selecciona un archivo para subir.');
    }
  }

  isMobile(): boolean {
    return window.innerWidth <= 768;
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

  updateRut(): void {
    // Validate and format RUT
    if (this.rut) {
      // Remove any existing formatting and validate
      const cleanRut = this.rut.replace(/[.-]/g, '').toUpperCase();
      
      // Basic RUT validation
      if (this.validateRut(cleanRut)) {
        // Format RUT with dots and dash
        this.rut = this.formatRut(cleanRut);
        
        // Only allow editing if RUT hasn't been saved before
        this.canEditRut = !this.fields.rut;
      } else {
        // Keep the input field active if RUT is invalid
        this.canEditRut = true;
      }
    } else {
      // Disable edit if no RUT is entered
      this.canEditRut = false;
    }
  }

  private formatRut(rut: string): string {
    // Remove any existing formatting
    rut = rut.replace(/[.-]/g, '').toUpperCase();
    
    // Separate body and verification digit
    const body = rut.slice(0, -1);
    const verifier = rut.slice(-1);
    
    // Format body with dots
    const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    return `${formattedBody}-${verifier}`;
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

  private testRutValidation() {
    // Test cases with various RUT combinations
    const testCases = [
      '77.777.777-7',   // Repeated digits
      '45.457.787-8',   // Mixed digits
      '12.345.678-9',   // Sequential digits
      '98.765.432-0',   // Descending digits
      '11.111.111-1',   // All 1s
      '22.222.222-2',   // All 2s
      '10.000.000-K',   // RUT with K check digit
      '54.545.454-5'    // The specific RUT mentioned
    ];

    testCases.forEach(rut => {
      const cleanRut = rut.replace(/[.-]/g, '').toUpperCase();
      console.log(`RUT: ${rut}, Valid: ${this.validateRut(cleanRut)}`);
    });
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
      
      // Use updateFields to save hours with loading state
      this.updateFields('hours', this.fields.hours);
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
    
    // Use updateFields to save days with loading state
    if (this.fields.days) {
      this.updateFields('days', this.fields.days);
    }
  }

  displaySelectedDays() {
    return this.fields.days || '';
  }

  async openMap() {
    try {
      const modalRef = this.modalService.open(MapModalComponent, {
        size: 'lg',
        centered: true
      });

      // Pasar la ubicación inicial y el ID del miembro
      modalRef.componentInstance.initialLocation = {
        lat: this.fields.lat || -33.4369,
        lng: this.fields.lng || -70.6344
      };
      modalRef.componentInstance.memberId = this.fields.id;

      // Esperar el resultado del modal
      const result = await modalRef.result;
      if (result) {
        this.fields.lat = result.lat;
        this.fields.lng = result.lng;
      }
    } catch (error) {
      console.error('Error al abrir el mapa:', error);
    }
  }

  // Add rut property
  rut: string = '';

  // Helper methods for notifications
  private showErrorNotification(message: string) {
    console.error(message);
    // You can replace this with your preferred notification method
    alert(message);
  }

  private showWarningNotification(message: string) {
    console.warn(message);
    // You can replace this with your preferred notification method
    alert(message);
  }
}
