import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/user.service';
import { User } from '../../interfaces/user.interface';

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

  // ---- LOGIN ----
  async login( user: User ) {
    if (!this.isInputValid(user)) {
      this.handleValidationError();
      return;
    }

    const { data, error } = await this.authService.signWithPassword(user);

    if (error) {
      this.handleAuthError(error);
      return;
    }

    if (data?.user) {
      this.handleSuccessfulLogin();
    }
  }

  private isInputValid(user: User) {
    return user.email.trim() !== '' && user.password.trim() !== '';
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
