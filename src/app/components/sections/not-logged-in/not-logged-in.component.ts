import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthPocketbaseService } from '@app/services/auth-pocketbase.service';

@Component({
  selector: 'app-not-logged-in',
  standalone: true,
  imports: [CommonModule, FormsModule],

  providers: [AuthPocketbaseService], 
  templateUrl: './not-logged-in.component.html',
  styleUrl: './not-logged-in.component.css'
})
export class NotLoggedInComponent {
  email: string = '';
  password: string = '';
  loading: boolean = false;

  constructor(private authService: AuthPocketbaseService) {}

  onSubmit() {
    if (!this.email || !this.password) return;
    
    this.loading = true;
    
    this.authService.loginUser(this.email, this.password).subscribe({
      next: (response) => {
        this.loading = false;
        // El servicio ya maneja el almacenamiento del token y la redirección
        this.authService.permision(); // Esto verificará y redirigirá según el tipo de usuario
      },
      error: (error) => {
        this.loading = false;
        console.error('Error al iniciar sesión:', error);
        // Aquí podrías agregar un mensaje de error para el usuario
      }
    });
  }
}
