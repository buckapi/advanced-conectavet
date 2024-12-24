import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';

interface AuthResponse {
  token: string;
  user: {
    id: number;
    email: string;
    name: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUser: any = null;
  private readonly TOKEN_KEY = 'auth_token';

  constructor(private http: HttpClient) {
    this.checkToken();
  }

  private checkToken() {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (token) {
      // Verificar si el token es válido y cargar datos del usuario
      this.validateToken(token).subscribe();
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/login', { email, password })
      .pipe(
        tap(response => {
          localStorage.setItem(this.TOKEN_KEY, response.token);
          this.currentUser = response.user;
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.currentUser = null;
  }

  register(userData: { email: string; password: string; name: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/register', userData)
      .pipe(
        tap(response => {
          localStorage.setItem(this.TOKEN_KEY, response.token);
          this.currentUser = response.user;
        })
      );
  }

  async checkEmailExists(email: string): Promise<boolean> {
    try {
      const response = await this.http.post<{ exists: boolean }>('/api/check-email', { email }).toPromise();
      if (!response) {
        throw new Error('No se recibió respuesta del servidor');
      }
      return response.exists;
    } catch (error) {
      console.error('Error al verificar el email:', error);
      throw new Error('No se pudo verificar el email. Por favor, intente nuevamente.');
    }
  }

  validateToken(token: string): Observable<boolean> {
    return this.http.post<AuthResponse>('/api/validate-token', { token })
      .pipe(
        map(response => {
          this.currentUser = response.user;
          return true;
        })
      );
  }

  isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
}