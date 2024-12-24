import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { AuthPocketbaseService } from "@app/services/auth-pocketbase.service";
import { AuthService } from "@app/services/auth.service";

@Component({
  selector: 'app-auth-flow',
  standalone: true,
  imports: [CommonModule, FormsModule ],
  
  
  templateUrl: './auth-flow.component.html'
})
export class AuthFlowComponent {
    
  email: string = '';
  password: string = '';
  isEmailSubmitted: boolean = false;
  userExists: boolean = false;

  constructor(private authServic: AuthService) {}

  async checkEmail() {
    try {
      const exists = await this.authServic.checkEmailExists(this.email);
      this.userExists = exists;
      this.isEmailSubmitted = true;
    } catch (error) {
      console.error('Error verificando email:', error);
    }
  }
register() {

}

  login() {
    // Validación básica
    if (!this.email || !this.password) {
      console.error('Email y contraseña son requeridos');
      return;
    }

    // Aquí deberías llamar a tu servicio de autenticación
    // Por ejemplo:
    // this.authService.login(this.email, this.password).subscribe(
    //   response => {
    //     // Manejar login exitoso
    //   },
    //   error => {
    //     // Manejar error
    //   }
    // );
  }
} 