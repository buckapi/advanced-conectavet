import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { GlobalService } from '@app/services/global.service';
import { RealtimePetsService } from '@app/services/realtime-pet.service';
import { AuthPocketbaseService } from '@app/services/auth-pocketbase.service';

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
  status: 'PENDING' | 'AUTHORIZED' | 'REJECTED' | 'CANCELED';
  total: number;
  userId?: string;
}

@Component({
  selector: 'app-order-details-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './order-details-dialog.component.html',
  styleUrls: ['./order-details-dialog.component.css']
})
export class OrderDetailsDialogComponent {
  tutorFullName: string = '';
  showPetsDialog: boolean = false;
  asignar?: boolean; // Agregar esta línea
  name: string = '';
  serviceIndex: number = 0;
  isPetSelected: boolean = false; // Estado para controlar la selección de la mascota


  constructor(
    public auth: AuthPocketbaseService,
    public global: GlobalService,
    public realtimePets: RealtimePetsService,
    public dialogRef: MatDialogRef<OrderDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: OrderData
  ) {}
  selectPet(pet: any) {
    this.data.cart[this.serviceIndex].idPet = pet.id;
    this.showPetsDialog = false;

    this.isPetSelected = true; // Cambia el estado a seleccionado
    // Puedes almacenar la mascota seleccionada si es necesario
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
