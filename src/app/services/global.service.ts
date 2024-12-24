import { Injectable } from '@angular/core';
import PocketBase from 'pocketbase';
import { Category } from '@app/interfaces/category.interface'; // Importar la interfaz
import { RealtimeSpecialistsService } from './realtime-specialists.service';
import { RealtimeProfessionalsService } from './realtime-professional.service';
import { Pet } from './realtime-pet.service';
import { BehaviorSubject } from 'rxjs';

export interface Clinic {
  id: string;
  ratingQuantity: number;

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
  newUser: boolean = false;
  hasItemsInCart: boolean = false;
  cartStatus$ = new BehaviorSubject<boolean>(false);
  cartQuantity: number = 10;
  cartQuantity$ = new BehaviorSubject<number>(0); 
  hasPendingOrder: boolean = false;
  showHistory=false;
  professionalsCount: number = 0;
  idS: string = "";
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
  cart: any[] = [];
  categorySelected: any = { // Cambiar 'category' a 'Category'
  };
  petSelected: Pet = {
    id: '',
    name: '',
    species: '',
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
  activeRoute = 'home';
  modalType = 'filter';
  constructor(
    public realtimeSpecialists: RealtimeSpecialistsService,
    public realtimeProfessionals: RealtimeProfessionalsService

  ) {
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
        const pb = new PocketBase('https://db.conectavet.cl:8080');

        const data = {
          status: 'approved'
        };

        const record = await pb.collection('members').update(clinica.id, data);

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
    this.petSelected={
      id: '',
      name: '',
      species: '',
      breed: '',
      images: [], // JSON array
      birthDate: new Date(),
      idTutor: '',
      status: '',
    }
    this.showHistory=false;

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
      const pb = new PocketBase('https://db.conectavet.cl:8080');
      const memberRecords = await pb.collection('members').getFullList(200, { filter: `userId = "${userId}"` });

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
      const pb = new PocketBase('https://db.conectavet.cl:8080');

      let memberRecord = await pb.collection('members').getOne(id);

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
  viewClinic(clinic: any) {
    this.clinicSelected = clinic;
    this.activeRoute = 'clinicdetail';
    this.conteo();
  }
  isMobile() {
    return window.innerWidth <= 768; // Ajusta el tamaño según tus necesidades
  }
  async toggleSpecialistStatus(specialist: any) {
    if (specialist && specialist.id) {
      try {
        const pb = new PocketBase('https://db.conectavet.cl:8080');

        const newStatus = specialist.status === 'approved' ? 'pending' : 'approved';
        const data = {
          status: newStatus
        };

        const record = await pb.collection('members').update(specialist.id, data);

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
