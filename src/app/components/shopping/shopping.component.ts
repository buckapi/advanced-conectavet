import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatCommonModule } from '@angular/material/core';
import { GlobalService } from '@app/services/global.service';
import { AuthboxComponent } from "../sections/authbox/authbox.component";
import { FormsModule } from '@angular/forms';
import { noop } from 'rxjs';
import { NotLoggedInComponent } from '../sections/not-logged-in/not-logged-in.component';
import { AuthPocketbaseService } from '@app/services/auth-pocketbase.service';
import { NewUserComponent } from '../sections/new-user/new-user.component';
import { AuthFlowComponent } from '../auth-flow/auth-flow.component';

@Component({
  selector: 'app-shopping',
  standalone: true,
  imports: [
    AuthFlowComponent,
    NewUserComponent,
    MatCommonModule, 
    CommonModule, 
    AuthboxComponent, 
    FormsModule,
    NotLoggedInComponent],
  templateUrl: './shopping.component.html',
  styleUrl: './shopping.component.css'
})
export class ShoppingComponent {
  isMobile: boolean = false;
  shippingAddress: string = '';
constructor
(
  public auth: AuthPocketbaseService ,
  public global: GlobalService){
} 

ngOnInit(): void {
  // Detectar si es dispositivo móvil
  this.checkMobileDevice();
  // Escuchar cambios en el tamaño de la ventana
  window.addEventListener('resize', () => {
    this.checkMobileDevice();
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
  
  const comision = subtotal * 0.07;
  
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
        }
      }
    });
}
}

