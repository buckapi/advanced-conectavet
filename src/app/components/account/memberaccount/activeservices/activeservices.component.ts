import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { GlobalService } from '@app/services/global.service';
import { RealtimeServicesService } from '@app/services/realtime-services.service';
import Swal from 'sweetalert2';
import PocketBase from 'pocketbase';
import { AuthPocketbaseService } from '@app/services/auth-pocketbase.service';
import { RealtimeSpecialistsService } from '@app/services/realtime-specialists.service';
import { ServiceService } from '@app/services/service.service';
interface Service {
  id: string; // Asegúrate de que esta propiedad exista
  name: string;
  price?: number; // Propiedades opcionales si es necesario
}


interface Member {
  services?: Service[];
}

const pb = new PocketBase('https://db.conectavet.cl:8080');
@Component({
  selector: 'app-activeservices',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activeservices.component.html',
  styleUrl: './activeservices.component.css',
})
export class ActiveservicesComponent  implements OnInit{
  newServices: any[] = [];
  // services: any[] = [];
  services: Service[] = [];
  record: any;
  memberId = '';
  memberRecord: any; 
  constructor(
    public global: GlobalService,
    public auth: AuthPocketbaseService,
    public realtimeServices: RealtimeServicesService,
    public realtimeSpecialists: RealtimeSpecialistsService,
    public serviceService:ServiceService
  ) {
    this.id();
  }
  ngOnInit() {
    this.loadServices(); // Llama a la función para cargar los servicios
  }
  getServicePrice(serviceId: string): string {
    const memberService = this.global.myServices.find(s => s.id === serviceId);
    return memberService ? memberService.price : 0; // Devuelve 0 si no se encuentra
}

  async loadServices() {
    try {
      const records = await this.serviceService.getAllServices(); // Obtiene los registros
      this.services = records.map(record => ({
        id: record.id, // Asegúrate de que 'id' exista
        name: record["name"], // Mapea 'name' de RecordModel a Service
        price: record["price"] // Si 'price' existe, sino, quítalo
      })) as Service[]; // Asegúrate de que esto se ajuste a tu interfaz Service
    } catch (error) {
      console.error('Error al cargar los servicios:', error);
    }
  }
  
  async showPriceAlert(service: any) {
    const { value: price } = await Swal.fire({
      title: `Precio tentativo para ${service.name}`,
      input: 'text',
      inputLabel: 'Ingresa el precio',
      inputPlaceholder: 'Escribe el precio aquí',
      showCancelButton: true,
      confirmButtonText: 'Enviar',
      cancelButtonText: 'Cancelar',
      preConfirm: (inputValue) => {
        if (!inputValue) {
          Swal.showValidationMessage('Debes ingresar un precio');
        }
        return inputValue;
      },
    });

    if (price) {
      try {
        let memberRecord = await pb.collection('members').getOne(this.memberId);
        console.log('servc' + JSON.stringify(memberRecord['services']));
        this.newServices = memberRecord['services'];
        this.record = memberRecord as Member; 
        console.log('Detalle de clinica 6565656:', this.record);
        let services = memberRecord['services'] || [];
        console.log('Servicios:' + services); 
        this.newServices.push({
          name: service.name,
          id: service.id,
          price: parseFloat(price),
        });
        console.log({
          name: service.name,
          id: service.ide,
          price: parseFloat(price),
        });

        let enviar: any = memberRecord;
        enviar.services = this.newServices;
        console.log('info a enviar' + JSON.stringify(memberRecord));
        const updatedRecord = await pb
          .collection('members')
          .update(this.memberId, enviar);
        Swal.fire(
          'Éxito',
          'El precio se ha actualizado correctamente.',
          'success'
        );
        this.newServices = [];
        console.log('Registro actualizado:', updatedRecord);
      } catch (error) {
        Swal.fire(
          'Error',
          `No se pudo actualizar el precio. Detalles: ${error}`,
          'error'
        );
        console.error('Error al actualizar el registro:', error);
      }

      console.log(`Precio ingresado para ${service.name}: ${price}`);
    }
  }
  async updatePrice(service: Service) {
    try {
      // Cargar el registro del miembro
      const memberRecord = await pb.collection('members').getOne(this.memberId);
      console.log('Servicios del miembro:', JSON.stringify(memberRecord['services']));
      
      const memberServices: Service[] = memberRecord["services"] || []; // Asegúrate de que sea un array de Service
      const existingService = memberServices.find((s: Service) => s.id === service.id);
  
      if (existingService) {
        // Solicitar al usuario que ingrese un nuevo precio
        const { value: newPrice } = await Swal.fire({
          title: `Actualizar precio para ${service.name}`,
          input: 'text',
          inputLabel: '',
          inputPlaceholder: 'Escribe el nuevo precio aquí',
          showCancelButton: false,
          confirmButtonText: 'Actualizar',
          cancelButtonText: 'Cancelar',
          preConfirm: (inputValue) => {
            if (!inputValue || isNaN(parseFloat(inputValue))) {
              Swal.showValidationMessage('Debes ingresar un precio válido');
              return false;
            }
            return parseFloat(inputValue);
          },
          html: '<div><span style="color: gray; font-size: medium;">o si prefieres, lo puedes <span style="color:red; cursor:pointer;">borrar</span>.</span></div>',
        });
  
        if (newPrice) {
          // Actualizar el precio del servicio en el array
          existingService.price = newPrice;
  
          // Enviar la actualización al servidor
          try {
            const updatedRecord = await pb.collection('members').update(this.memberId, {
              services: memberServices,
            });
  
            Swal.fire(
              'Éxito',
              'El precio se ha actualizado correctamente.',
              'success'
            );
  
            console.log('Registro actualizado:', updatedRecord);
          } catch (error) {
            Swal.fire(
              'Error',
              `No se pudo actualizar el precio. Detalles: ${error}`,
              'error'
            );
            console.error('Error al actualizar el registro:', error);
          }
        }
      } else {
        Swal.fire(
          'Error',
          'El servicio no está registrado en tu cuenta.',
          'error'
        );
      }
    } catch (error) {
      console.error('Error al cargar el registro del miembro:', error);
      Swal.fire(
        'Error',
        'No se pudo cargar el registro del miembro.',
        'error'
      );
    }
  }
  
  // updatePrice(service: Service) {
  //   alert("hola");
  //   const memberServices: Service[] = this.memberRecord.services || []; /
  //   const existingService = memberServices.find((s: Service) => s.id === service.id);
  
  //   if (existingService) {
  //     Swal.fire({
  //       title: `Actualizar precio para ${service.name}`,
  //       input: 'text',
  //       inputLabel: 'Ingresa el nuevo precio',
  //       inputPlaceholder: 'Escribe el nuevo precio aquí',
  //       showCancelButton: true,
  //       confirmButtonText: 'Actualizar',
  //       cancelButtonText: 'Cancelar',
  //       preConfirm: (inputValue) => {
  //         if (!inputValue || isNaN(parseFloat(inputValue))) {
  //           Swal.showValidationMessage('Debes ingresar un precio válido');
  //           return false;
  //         }
  //         return parseFloat(inputValue);
  //       },
  //     }).then(async (result) => {
  //       if (result.isConfirmed) {
  //         const newPrice = result.value;
  
  //         existingService.price = newPrice;
  
  //         try {
  //           const updatedRecord = await pb.collection('members').update(this.memberId, {
  //             services: memberServices,
  //           });
  
  //           Swal.fire(
  //             'Éxito',
  //             'El precio se ha actualizado correctamente.',
  //             'success'
  //           );
  
  //           console.log('Registro actualizado:', updatedRecord);
  //         } catch (error) {
  //           Swal.fire(
  //             'Error',
  //             `No se pudo actualizar el precio. Detalles: ${error}`,
  //             'error'
  //           );
  //           console.error('Error al actualizar el registro:', error);
  //         }
  //       }
  //     });
  //   } else {
  //     Swal.fire(
  //       'Error',
  //       'El servicio no está registrado en tu cuenta.',
  //       'error'
  //     );
  //   }
  // }
  
  async loadMemberRecord() {
    try {
      this.memberRecord = await pb.collection('members').getOne(this.memberId);
    } catch (error) {
      console.error('Error al cargar el registro del miembro:', error);
    }
  }
  isServiceRegistered(serviceId: string): boolean {
    const services: Service[] = Array.isArray(this.global?.myServices) ? this.global.myServices : [];
    return services.some((service: Service) => service.id === serviceId); // Especifica el tipo de service aquí
  }
  
  async checkService(service: Service): Promise<boolean> {
    try {
      const memberRecord = await pb.collection('members').getOne(this.memberId); // Siempre se obtiene el registro del miembro
      const services = Array.isArray(memberRecord['services']) ? memberRecord['services'] : [];
      const exists = services.some((s: Service) => s.id === service.id); // Verifica si el servicio está registrado
  
      if (exists) {
        console.log(`El servicio con id ${service.id} ya está registrado.`);
        return true; 
      } else {
        console.log(`El servicio con id ${service.id} no está registrado.`);
        return false; 
      }
    } catch (error) {
      console.error('Error al verificar el servicio:', error);
      return false;
    }
  }
  
  id() {
    this.getMemberId();
  }
  getMemberId() {
    this.realtimeSpecialists.specialists$.subscribe((Specialists) => {
      const specialist = Specialists.find(
        (prof) => prof.userId === this.auth.getUserId()
      );
      if (specialist) {
        console.log(`Encontrado ID: ${specialist.id}`);
        this.memberId = specialist.id;
        localStorage.setItem('memberId',this.memberId ); // Guardar el memberId
        this.global.myServices = specialist.services;
        // Suscribirse a los servicios disponibles
        this.realtimeServices.services$.subscribe((allServices) => {
          // Filtrar servicios que faltan
          const missingServices = allServices.filter(
            (service) => !this.global.myServices.some(
              (myService) => myService.id === service.id
            )
          );
  
          // Agregar servicios faltantes a myServicesAct
          this.global.myServicesAct = [...this.global.myServicesAct, ...missingServices];
        });
      } else {
        console.log('No specialist found for the current user ID.');
      }
    });
  }
  
  selectIdP() {
    this.realtimeSpecialists.specialists$.subscribe((Specialists) => {
      const specialist = Specialists.find(
        (prof) => prof.userId === this.auth.getUserId()
      );
      if (specialist) {
        console.log(`Encontrado ID: ${specialist.id}`);
        this.memberId = specialist.id;
        this.global.myServices = specialist.services;
      } else {
        console.log('No specialist found for the current user ID.');
      }
    });
  }
  isMobile() {
    return window.innerWidth <= 768; // Ajusta el tamaño según tus necesidades
  }
}
