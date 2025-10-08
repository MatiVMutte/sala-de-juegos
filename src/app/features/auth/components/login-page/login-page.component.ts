import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/user.service';
import { LoginCredentials } from '../../interfaces/user.interface';

@Component({
  selector: 'app-login-page', 
  imports: [RouterModule],
  templateUrl: './login-page.component.html',
})
export class LoginPageComponent {
  authService = inject(AuthService);
  router = inject(Router);
  
  showSuccessModal = signal(false);
  showErrorModal = signal(false);
  errorMessage = signal('');

  // Usuarios de prueba para login rápido (registrados en Autenticación)
  testUsers = [
    { email: 'mativmutte@gmail.com', password: '321321' },
    { email: 'abc@gmail.com', password: '321321' }
  ];

  // Login rápido con usuario de prueba
  async quickLogin(email: string, password: string) {
    await this.login({ email, password });
  }

  // ---- LOGIN ----
  async login( credentials: LoginCredentials ) {
    if (!this.isInputValid(credentials)) {
      this.handleValidationError();
      return;
    }

    const { data, error } = await this.authService.signWithPassword(credentials);

    if (error) {
      this.handleAuthError(error);
      return;
    }

    if (data?.user) {
      this.handleSuccessfulLogin();
    }
  }

  private isInputValid(credentials: LoginCredentials) {
    return credentials.email.trim() !== '' && credentials.password.trim() !== '';
  }

  private handleValidationError() {
    this.errorMessage.set('Todos los campos son obligatorios');
    this.showTemporaryErrorModal();
  }

  private handleAuthError(error: { message: string }) {
    console.error('Error en el login:', error);

    if (error.message.includes('Invalid login credentials')) {
      this.errorMessage.set('Datos incorrectos');
    } else {
      this.errorMessage.set(error.message);
    }

    this.showTemporaryErrorModal();
  }

  private handleSuccessfulLogin() {
    this.showSuccessModal.set(true);

    setTimeout(() => {
      this.showSuccessModal.set(false);
      this.router.navigate(['/home']);
    }, 2000);
  }

  private showTemporaryErrorModal() {
    this.showErrorModal.set(true);

    setTimeout(() => {
      this.showErrorModal.set(false);
    }, 2000);
  }

}
