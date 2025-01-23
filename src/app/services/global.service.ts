import { Injectable } from '@angular/core';
import PocketBase from 'pocketbase';
import { Category } from '@app/interfaces/category.interface'; // Importar la interfaz
import { RealtimeSpecialistsService } from './realtime-specialists.service';
import { RealtimeProfessionalsService } from './realtime-professional.service';
import { Pet } from './realtime-pet.service';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { MarkersService } from './markers.service';

export interface Clinic {
  id: string;
  ratingQuantity: number;
  comments: string[];
  hours: string;
  name: string;
  days: string;
  full_name: string;
  bio: string;
  address: string;
  userId: string;
  phoneNumber: string;
  rating: number;
  images: string[]; // O el tipo adecuado para las imágenes
  services: Service[]; // O el tipo adecuado para los servicios
  // Otros campos que sean necesarios
}

interface Service {
  id: string;
  name: string;
  price: number;
}

@Injectable({
  providedIn: 'root',
})

export class GlobalService {
  selectedDate: Date | null = null;
  newUser: boolean = false;
  hasItemsInCart: boolean = false;
  cartStatus$ = new BehaviorSubject<boolean>(false);
  cartQuantity: number = 10;
  cartQuantity$ = new BehaviorSubject<number>(0);
  hasPendingOrder: boolean = false;
  showHistory = false;
  professionalsCount: number = 0;
  idS: string = "";
webShowMap: boolean = true;

  categoryFiltersAplcated = false;
  adminOptionn: string = '';
  memberOption: string = 'profile';
  tutorOption: string = 'profile';
  showMemberMenu: boolean = false;
  showTutorMenu: boolean = false;
  formOption: string = '';
  option: string = '';
  isScrollingDown = false;
  lastScrollTop = 0;
  scrollThreshold = 380;
  specialists: any[] = [];
  myServices: any[] = [];
  myServicesAct: any[] = [];
  categories: any[] = [];
  focusMarker: any = null;
  cart: any[] = [];
  categorySelected: any = { // Cambiar 'category' a 'Category'
  };
  petSelected: Pet = {
    id: '',
  petColor: '',
  petBreed: '',
  petWeight: 0,
  petType: '',
    petAge: 0,
    name: '',
    species: '',otherPetType: '',
    birthDate: new Date(),
    breed: '',
    images: [], // JSON array
    idTutor: '',
    status: '',
  };
  clinicSelected: Clinic = {
    ratingQuantity: 0,
    rating: 0,
    days: '',
    comments: [],
    hours: '',
    id: '',
    userId: '',
    bio: '',
    name: '',
    full_name: '',
    address: '',
    phoneNumber: '',
    images: [], // Inicializa con un array vacío
    services: [] as Service[],
  };
  activeRoute = 'under';
  modalType = 'filter';
  private commentsSubscription: (() => void) | null = null;
  private pb: PocketBase;
  clinicComments$ = new BehaviorSubject<string[]>([]);

  constructor(
    public realtimeSpecialists: RealtimeSpecialistsService,
    public realtimeProfessionals: RealtimeProfessionalsService,
    public markersService: MarkersService,
    private router: Router

  ) {
    this.pb = new PocketBase('https://db.conectavet.cl:8080');
    this.showMemberMenu = !this.isMobile();
    this.loadCartFromLocalStorage();

  }
  // public updateCartQuantity() {
  //   const totalQuantity = this.cart.reduce((sum, item) => sum + item.quantity, 0);
  //   this.cartQuantity$.next(totalQuantity);
  // }
  public updateCartQuantity() {
    const totalItems = this.cart.length; // Cantidad de ítems únicos en el carrito
    this.cartQuantity$.next(totalItems);
  }

  private loadCartFromLocalStorage() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      this.cart = JSON.parse(savedCart);
      this.cartStatus$.next(this.cart.length > 0); // Emitir estado inicial
    }
  }
  async acept(clinica: any) {
    if (clinica && clinica.id) {
      try {
        const data = {
          status: 'approved'
        };

        const record = await this.pb.collection('members').update(clinica.id, data);

        console.log('Estado de la clínica actualizado a: approved', record);
        return record;
      } catch (error) {
        console.error('Error al actualizar el estado de la clínica', error);
        throw error;
      }
    } else {
      console.error('Clínica no válida');
      throw new Error('Clínica no válida');
    }
  }
  resetAdminOption() {
    this.adminOptionn = '';

  }
  conteo() {
    this.realtimeProfessionals.professionals$.subscribe((professionals: any[]) => {
      this.professionalsCount = professionals.filter(profesional => profesional.images && profesional.IdMember === this.clinicSelected.userId).length;
    });
  }
  setAdminOption(option: string) {
    this.adminOptionn = option;
  }
  resetMemberOption() {
    this.memberOption = '';
    this.showMemberMenu = true;

  }

  resetTutorOption() {
    this.tutorOption = '';
    this.showTutorMenu = true;

  }
  setTutorOptionToPets() {
    this.tutorOption = 'pets';
    // this.showTutorMenu = true;
    this.petSelected = {
      id: '',
      name: '',
      species: '',
      petColor: '',
      petAge: 0,
      breed: '',
      images: [], // JSON array
      birthDate: new Date(),
      idTutor: '',
      status: '',
    }
    this.showHistory = false;

  }
  id() {
    const userId = localStorage.getItem('userId');

    this.selectId(userId);
  }
  async selectId(parametro: string | null) {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.log('No user ID found in local storage.');
      return;
    }

    // Fetch member records using userId
    try {
      const memberRecords = await this.pb.collection('members').getFullList(200, { filter: `userId = "${userId}"` });

      if (memberRecords.length > 0) {
        const memberRecord = memberRecords[0]; // Assuming userId is unique

        // Check if services exist and handle accordingly
        if (memberRecord["services"]) {
          console.log('Member services:', memberRecord["services"]);
        }

        // Now, proceed to find the specialist
        this.realtimeSpecialists.specialists$.subscribe(Specialists => {
          const specialist = Specialists.find(prof => prof.userId === userId);

          if (specialist) {
            console.log(`Found specialist ID: ${specialist.id}`);
            this.idS = specialist.id;
            this.getMemberRecord(specialist.id);
          } else {
            console.log('No specialist found for the current user ID.');
          }
        });
      } else {
        // Swal.fire('Error', 'No se encontró el miembro. Intenta nuevamente.', 'error');
      }
    } catch (error) {
      console.error('Error fetching member records:', error);
      // Swal.fire('Error', 'Ocurrió un error al obtener los datos del miembro.', 'error');
    }
  }

  async getMemberRecord(id: string) {
    try {
      // Fetch the member record using this.idS
      console.log("bsucando")
      let memberRecord = await this.pb.collection('members').getOne(id);

      // Log or use the member record as needed
      console.log('Member la info:', memberRecord);
      let services = memberRecord["services"] || [];

      this.myServices = services;
      // Additional logic can go here
    } catch (error) {
      console.error('Error fetching member record:', error);
      // Swal.fire('Error', 'No se pudo obtener el registro del miembro. Inténtalo nuevamente.', 'error');
    }
  }
  async check(service: any) {


    this.id()
  }
  setMemberOption(option: string) {
    this.showMemberMenu = false;
    this.memberOption = option;
    // this.getMemberRecord();
  }
  setTutorOption(option: string) {
    this.showTutorMenu = false;
    this.tutorOption = option;
    // this.getMemberRecord();
  }
  setFormOption(option: string) {
    this.formOption = option;
  }
  setRoute(route: string) {
    this.activeRoute = route;
  }
  setModalType(modalType: string) {
    this.modalType = modalType;
  }
  async viewClinic(clinic: any) {
    console.log('ViewClinic called with clinic:', clinic);
    
    // Limpiar suscripción anterior si existe
    if (this.commentsSubscription) {
      console.log('Unsubscribing from previous comments subscription');
      this.commentsSubscription();
      this.commentsSubscription = null;
    }

    this.clinicSelected = clinic;
    if (!this.clinicSelected.comments) {
      this.clinicSelected.comments = [];
    }
    
    console.log('Selected clinic:', this.clinicSelected);
    
    try {
      // Función para cargar comentarios existentes
      const loadExistingComments = async () => {
        try {
          const records = await this.pb.collection('ratings').getList(1, 50, {
            filter: `idMember = "${this.clinicSelected.id}"`,
            sort: '-created'
          });
          console.log('Existing comments loaded:', records);
          if (records && records.items) {
            const comments = records.items
              .filter(record => record['comment'])
              .map(record => record['comment'] as string);
            this.clinicSelected.comments = comments;
            console.log('Updated comments:', comments);
          }
        } catch (error) {
          console.error('Error fetching existing comments:', error);
        }
      };

      // Cargar comentarios iniciales
      await loadExistingComments();

      // Suscribirse a cambios en ratings
      console.log('Setting up realtime subscription for clinic ID:', this.clinicSelected.id);
      
      // Suscribirse solo a los cambios que afectan a esta clínica
      this.commentsSubscription = await this.pb.collection('ratings').subscribe('*', async (e: any) => {
        console.log('Received realtime event:', e);
        if (e.record && e.record.idMember === this.clinicSelected.id) {
          console.log('Rating changed for current clinic, reloading comments...');
          await loadExistingComments();
        } else {
          console.log('Ignoring event for different clinic:', e.record?.idMember);
        }
      });

      console.log('Realtime subscription set up successfully');

    } catch (error) {
      console.error('Error in viewClinic:', error);
    }

    this.activeRoute = 'clinicdetail';
    this.conteo();
  }
  isMobile() {
    return window.innerWidth <= 768; // Ajusta el tamaño según tus necesidades
  }
  async toggleSpecialistStatus(specialist: any) {
    if (specialist && specialist.id) {
      try {
        const newStatus = specialist.status === 'approved' ? 'pending' : 'approved';
        const data = {
          status: newStatus
        };

        const record = await this.pb.collection('members').update(specialist.id, data);

        console.log(`Estado del especialista actualizado a: ${newStatus}`, record);

        // Actualiza el estado del especialista en la lista local
        const index = this.specialists.findIndex(s => s.id === specialist.id);
        if (index !== -1) {
          this.specialists[index].status = newStatus;
        }

        return record;
      } catch (error) {
        console.error('Error al actualizar el estado del especialista', error);
        throw error;
      }
    } else {
      console.error('Especialista no válido');
      throw new Error('Especialista no válido');
    }
  }
}
