import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { AuthPocketbaseService } from '@app/services/auth-pocketbase.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GlobalService } from '@app/services/global.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule], // Importar ReactiveFormsModule y CommonModule
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    public global: GlobalService,
    private authService: AuthPocketbaseService,
    private router: Router
  ) {
    // Inicializar el formulario con validaciones
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      // email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  // Usamos aserción de tipos para asegurar que los métodos devuelvan FormControl
  get emailControl(): FormControl {
    return this.loginForm.get('email') as FormControl;
  }

  get passwordControl(): FormControl {
    return this.loginForm.get('password') as FormControl;
  }

  // Método que se ejecuta al enviar el formulario
  onSubmit(): void {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService.loginUser(email, password).subscribe({
        next: (response) => {
          console.log('Inicio de sesión exitoso', response);
          localStorage.setItem('isLoggedin', 'true'); // Guardar el estado de login
          const currentUser = this.authService.getCurrentUser();
          this.authService.permision();
          // if (currentUser.type === 'clinica' && (!currentUser.biography  || !currentUser.days)) {
          //   this.global.setRoute('account'); // Redirigir al usuario a la ruta 'complete-profile'
          // } else {
          //   this.global.setRoute('home'); // Redirigir al usuario a la ruta 'home'
          // }
        },
        error: (error) => {
          console.error('Error en el inicio de sesión', error);
          this.errorMessage = 'Credenciales incorrectas. Inténtalo de nuevo.'; // Mensaje de error
        }
      });
    } else {
      this.errorMessage = 'Por favor completa todos los campos correctamente.'; // Mensaje de error si el formulario no es válido
    }
  }
}
