import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { GlobalService } from '@app/services/global.service';
import { RealtimePetsService } from '@app/services/realtime-pet.service';
import { AuthPocketbaseService } from '@app/services/auth-pocketbase.service';
import { OrdersService } from '@app/services/orders.service';
import Swal from 'sweetalert2'; // Asegúrate de importar SweetAlert
import PocketBase from 'pocketbase'; // Asegúrate de importar PocketBase
import { FormsModule } from '@angular/forms';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  clinicId: string;
 
  // otras propiedades existentes
  asignar?: boolean; // Asegúrate de que esta línea esté presente
  idPet?: string;

}


interface OrderData {
  id: string;
  idUser: string;
  buyOrder: string;
  cart: CartItem[];
  created: string;
  selectedAppointmentDate?: string;
  status: 'PENDING' | 'AUTHORIZED' | 'REJECTED' | 'CANCELED' | 'ATENDIDO';
  total: number;
  userId?: string;
}

@Component({
  selector: 'app-order-details-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule,FormsModule],
  templateUrl: './order-details-dialog.component.html',
  styleUrls: ['./order-details-dialog.component.css']
})
export class OrderDetailsDialogComponent {
  medicalNote: string = ''; // Agregar esta línea para definir la propiedad
  medicalNotes: string[] = []; // Agregar esta línea para definir el array
  tutorFullName: string = '';
  showPetsDialog: boolean = false;
  asignar?: boolean; // Agregar esta línea
  name: string = '';
  serviceIndex: number = 0;
  isPetSelected: boolean = false; // Estado para controlar la selección de la mascota
  
  private pb: PocketBase;

  constructor(
    public auth: AuthPocketbaseService,
    public global: GlobalService,
    public realtimePets: RealtimePetsService,
    public orderService: OrdersService,
    public dialogRef: MatDialogRef<OrderDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: OrderData
  ) {

    this.pb = new PocketBase('https://db.conectavet.cl:8080');

  }
  selectPet(pet: any) {
    this.data.cart[this.serviceIndex].idPet = pet.id;
    

    this.isPetSelected = true; // Cambia el estado a seleccionado
    // Puedes almacenar la mascota seleccionada si es necesario
}
okAsignacion(serviceIndex:  number) {
  // Asegúrate de que el índice del servicio esté dentro del rango del array
  if (serviceIndex >= 0 && serviceIndex < this.medicalNotes.length) {
      // Aquí puedes agregar lógica para almacenar la nota ingresada
      this.medicalNotes[serviceIndex] = this.medicalNotes[serviceIndex] || ''; // Inicializa si es necesario
  }
  this.showPetsDialog = false;
  this.isPetSelected = false; // Cambia el estado a seleccionado
}

  cancelAssignment() {
    this.isPetSelected = false; // Reinicia el estado de selección
    // Aquí puedes agregar lógica adicional para manejar la cancelación
    this.showPetsDialog = false;
    console.log('Asignación cancelada');
  }
  removePet(index: number) {
    this.data.cart[index].idPet = undefined;
    this.isPetSelected = false;
  }

  acceptAssignment() {

    // Aquí puedes agregar lógica para manejar la aceptación
    console.log('Asignación aceptada');
  }
  showPets(index: number){
    this.showPetsDialog=true;
    this.serviceIndex = index;
  }
  async proccess(orderId: string) {
    try {
        await this.orderService.updateOrderStatus(orderId, 'ATENDIDO', this.data.cart);
        console.log('Estado de la cita actualizado');

        // Crear registros de tarjeta médica para las mascotas asignadas
        for (const cartItem of this.data.cart) {
            if (cartItem.idPet) {
                const data = {
                  petId: cartItem.idPet,
                  userId: this.data.idUser,
                  description: "Registro médico para la mascota asignada", // Personalizar según sea necesario
                  clinicId: cartItem.clinicId,
                  service: JSON.stringify(cartItem), // Personalizar según sea necesario
                  notes: this.medicalNotes[this.data.cart.indexOf(cartItem)] // Usar el array para obtener la nota correspondiente
                  };

                const record = await this.pb.collection('medicalRecords').create(data);
                console.log('Tarjeta médica creada:', record);
            }
        }

        // Mostrar alerta de éxito
        Swal.fire({
            text: 'La cita fue procesada con éxito.',
            icon: 'success',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false
        }).then((result) => {
            if (result.dismiss === Swal.DismissReason.timer) {
                console.log('La alerta se cerró automáticamente después de 2 segundos');
            }
            this.dialogRef.close();
            this.updateCart();
        });
    } catch (error) {
        console.error('Error al procesar la cita', error);
        Swal.fire({
            title: 'Error!',
            text: 'No se pudo procesar la cita.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
        });
    }
  }
//   proccess(orderId: string) {
//     this.orderService.updateOrderStatus(orderId, 'ATENDIDO'       ,   this.data.cart   ).then(
//         response => {
//             console.log('Estado de la cita actualizado', response);
//             // Mostrar SweetAlert
//             Swal.fire({
//               // title: 'Éxito!',
//               text: 'La cita fue procesada con éxito.',
//               icon: 'success',
//               timer: 2000, // Tiempo en milisegundos para que se cierre automáticamente
//               timerProgressBar: true, // Muestra una barra de progreso
//               showConfirmButton: false // Oculta el botón de "Aceptar"
//           }).then((result) => {
//               // Si el temporizador se agota
//               if (result.dismiss === Swal.DismissReason.timer) {
//                   console.log('La alerta se cerró automáticamente después de 2 segundos');
//               }
          
//               // Cerrar el diálogo
//               this.dialogRef.close();
//               // Aquí puedes llamar a un método para actualizar el carrito si es necesario
//               this.updateCart();
//           });
//         }
//     ).catch(error => {
//         console.error('Error al procesar la cita', error);
//         // Manejo de errores
//         Swal.fire({
//             title: 'Error!',
//             text: 'No se pudo procesar la cita.',
//             icon: 'error',
//             confirmButtonText: 'Aceptar'
//         });
//     });
// }
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const diasSemana = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const diaSemana = diasSemana[date.getDay()];
    const dia = date.getDate();
    const mes = meses[date.getMonth()];
    const anio = date.getFullYear();
    return `${diaSemana} ${dia} de ${mes} de ${anio}`;
  }
  updateCart() {
    // Lógica para actualizar el carrito en el backend
    // Puedes llamar a un servicio que maneje esto
}
  volverAtras() {
    // Lógica para volver atrás, por ejemplo, cerrar el diálogo o navegar a la página anterior
    this.dialogRef.close(); // Si estás usando un MatDialog
  }
  async ngOnInit() {
    // Suponiendo que 'data.idUser' es el id del usuario que quieres buscar
    const tutor = await this.auth.findTutorByUserId(this.data.idUser);
    this.tutorFullName = tutor?.full_name; // Almacena el nombre completo en una variable
  }
  close(): void {
    this.dialogRef.close();
  }
}
