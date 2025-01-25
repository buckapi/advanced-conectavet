import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatCommonModule } from '@angular/material/core';
import { GlobalService } from '@app/services/global.service';
import { FormsModule } from '@angular/forms';
import { noop } from 'rxjs';
import { NotLoggedInComponent } from '../sections/not-logged-in/not-logged-in.component';
import { AuthPocketbaseService } from '@app/services/auth-pocketbase.service';
import { NewUserComponent } from '../sections/new-user/new-user.component';
import { TransactionService } from '@app/services/transaction.service'; // Asegúrate de tener este servicio
import { v4 as uuidv4 } from 'uuid';
import PocketBase from 'pocketbase';
const pb = new PocketBase('https://db.conectavet.cl:8080');

@Component({
  selector: 'app-shopping',
  standalone: true,
  imports: [
    NewUserComponent,
    MatCommonModule, 
    CommonModule, 
    FormsModule,
    NotLoggedInComponent],
  templateUrl: './shopping.component.html',
  styleUrl: './shopping.component.css'
})
export class ShoppingComponent {
  isMobile: boolean = false;
  shippingAddress: string = '';
  appComission: number = 0.07; // Default value in case fetch fails
constructor
(
  public auth: AuthPocketbaseService ,
  private transactionService: TransactionService ,
  public global: GlobalService){
} 
// processOrder() {
//   const buyOrder = uuidv4().replace(/-/g, '').substring(0, 26); // Genera un identificador único para la orden y lo acorta
//   const sessionId = uuidv4(); // Genera un identificador de sesión único
//   const amount = this.calculateTotal(); // Usa tu método para calcular el total
//   const returnUrl = 'https://conectavet.cl:5564/payment-result'; // URL de retorno
//   this.transactionService.createTransaction(buyOrder, sessionId, amount, returnUrl)
//     .then((response: any) => {
//       console.log('Create Transaction Response:', response);
//       console.log('Full response data:', JSON.stringify(response.data, null, 2));
      
//       if (!response.data || !response.data.url) {
//         console.error('No URL found in response');
//         Swal.fire('Error', 'No se pudo obtener la URL de pago.', 'error');
//         return;
//       }

//       if (!response.data.token_ws) {
//         console.error('No token found in response');
//         Swal.fire('Error', 'No se pudo obtener el token de pago.', 'error');
//         return;
//       }

//       console.log('URL:', response.data.url , 'Token:', response.data.token_ws);
//      window.location.href = `${response.data.url}`;
//     })
//     .catch((error: any) => {
//       console.error('Error:', error);
//       Swal.fire('Error', 'No se pudo procesar la orden.', 'error');
//     });
// }

processOrder() {
  const buyOrder = uuidv4().replace(/-/g, '').substring(0, 26);
  const sessionId = uuidv4();
  const amount = this.calculateTotal();
  const returnUrl = 'https://conectavet.cl:5564/payment-result';
  
  this.transactionService.createTransaction(buyOrder, sessionId, amount, returnUrl)
    .then(async (response: any) => {
      console.log('Create Transaction Response:', response);
      
      if (!response.data || !response.data.url) {
        console.error('No URL found in response');
        Swal.fire('Error', 'No se pudo obtener la URL de pago.', 'error');
        return;
      }

      // Crear entrada en el backend
      const data = {
        idUser: this.auth.getUserId(), // Asegúrate de que este método exista
        cart: JSON.stringify(this.global.cart), // Suponiendo que `cart` es un array de objetos
        total: amount,
        status: 'PENDING', // O el estado que desees
        buyOrder: buyOrder,
        selectedAppointmentDate: localStorage.getItem('selectedAppointmentDate') || new Date(),
        deviceId: localStorage.getItem('deviceId')

      };

      try {
        const record = await pb.collection('orders').create(data);
        console.log('Order created:', record);
      } catch (error) {
        console.error('Error creating order:', error);
        Swal.fire('Error', 'No se pudo crear la orden.', 'error');
        return;
      }

      window.location.href = `${response.data.url}`;
    })
    .catch((error: any) => {
      console.error('Error:', error);
      Swal.fire('Error', 'No se pudo procesar la orden.', 'error');
    });
}
ngOnInit(): void {
  this.checkMobileDevice();
  window.addEventListener('resize', () => {
    this.checkMobileDevice();
  });
  // Fetch commission configuration
    this.auth.pb.collection('config').getFirstListItem('')
      .then(config => {
        if (config['appComission']) {
          this.appComission = config['appComission'];
        }
      })
      .catch(err => {
        console.error('Error fetching commission config:', err);
      });
  // Verificar si hay un token_ws en la URL
  const urlParams = new URLSearchParams(window.location.search);
  const token_ws = urlParams.get('token_ws');
  if (token_ws) {
    this.commitTransaction(token_ws);
  }
}

commitTransaction(token_ws: string) {
  this.transactionService.commitTransaction(token_ws)
    .then((response: any) => {
      console.log('Commit Transaction Response:', response);
      if (response.data.status === 'AUTHORIZED') {
        // Mostrar mensaje de éxito
        Swal.fire('Pago exitoso', 'Tu pago ha sido procesado exitosamente.', 'success');
      } else {
        // Mostrar mensaje de error
        Swal.fire('Pago rechazado', 'Hubo un problema con tu pago.', 'error');
      }
    })
    .catch((error: any) => {
      console.error('Error:', error);
      Swal.fire('Error', 'No se pudo confirmar el pago.', 'error');
    });
}
register() {
  this.global.newUser = true;
}
private checkMobileDevice(): void {
  this.isMobile = window.innerWidth < 992; // Bootstrap lg breakpoint
}
backToLogin() {
  this.global.newUser = false;
}
calculateTotal(): number {
  let subtotal = 0;
  this.global.cart.forEach(item => {
      subtotal += item.price * item.quantity;
  });
  
  const comision = subtotal * this.appComission;
  
  return subtotal + comision;
}
ngOnDestroy(): void {
  window.removeEventListener('resize', () => {
    this.checkMobileDevice();
  });
}

increaseQuantity(item: any) {
    item.quantity = (item.quantity || 1) + 1;
    this.updateCart();
}

decreaseQuantity(item: any) {
    if (item.quantity > 1) {
        item.quantity--;
        this.updateCart();
    }
}

updateCart() {
    this.global.cartQuantity = this.global.cart.reduce((total, item) => total + item.quantity, 0);
}

 removeItem(item: any) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: '¿Deseas eliminar este producto del carrito?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        const index = this.global.cart.indexOf(item);
        if (index > -1) {
          this.global.cart.splice(index, 1);
          this.global.cartQuantity = this.global.cart.reduce((total, item) => total + item.quantity, 0);
          
          // Actualizar localStorage
          localStorage.setItem('cart', JSON.stringify(this.global.cart));
          
          Swal.fire(
            '¡Eliminado!',
            'El producto ha sido eliminado del carrito.',
            'success'
          );
          if (this.global.cart.length === 0) {
            this.global.cartQuantity = 0;
            localStorage.removeItem('cart');
            this.global.setRoute('home');
            this.global.hasItemsInCart = false;
          }
        }
      }
    });
}
}
