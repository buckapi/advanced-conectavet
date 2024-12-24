import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthPocketbaseService } from '@app/services/auth-pocketbase.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],   
  selector: 'app-new-user',
  templateUrl: './new-user.component.html',
  styleUrls: ['./new-user.component.scss']
})
export class NewUserComponent implements OnInit {
  userForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthPocketbaseService,
    private router: Router
  ) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {}

  onSubmit() {
    if (this.userForm.valid) {
      const { email, name } = this.userForm.value;
      const password = this.generatePassword();
      
      Swal.fire({
        title: 'Registrando usuario',
        text: 'Por favor espere...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      
      this.authService.registerUser(email, password, 'tutor', name, '')
        .subscribe({
          next: (response) => {
            Swal.fire({
              icon: 'success',
              title: '¡Usuario registrado exitosamente!',
              html: `La contraseña temporal es: <strong>${password}</strong><br>Por favor, guárdela en un lugar seguro.`,
              confirmButtonText: 'Ir al login'
            }).then((result) => {
              if (result.isConfirmed) {
                this.router.navigate(['/login']);
              }
            });
          },
          error: (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Error al registrar usuario',
              text: 'Por favor, intente nuevamente.',
              confirmButtonText: 'Aceptar'
            });
          }
        });
    }
  }

  private generatePassword(): string {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  }
}
