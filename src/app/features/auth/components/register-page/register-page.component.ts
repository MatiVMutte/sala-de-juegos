import { Component, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/user.service';
import { User } from '../../interfaces/user.interface';

@Component({
  selector: 'app-register-page',
  imports: [RouterModule],
  templateUrl: './register-page.component.html',
})
export class RegisterPageComponent {

  authService = inject(AuthService);
  router = inject(Router);

  showSuccessModal = signal(false);
  showErrorModal = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  isSubmitting = signal(false); 

  async register( user: User ) {
    if (!user.nombre || !user.apellido || !user.edad || !user.email || !user.password) {
      this.errorMessage.set('Todos los campos son obligatorios');
      this.triggerErrorModal();
      return;
    }

    if (user.edad <= 0) {
      this.errorMessage.set('La edad debe ser mayor a cero');
      this.triggerErrorModal();
      return;
    }

    this.isSubmitting.set(true);

    const { data, error } = await this.authService.register(user);

    this.isSubmitting.set(false);

    if (error) {
      const message = this.mapAuthError(error.message);
      this.errorMessage.set(message);
      this.triggerErrorModal();
      return;
    }

    if (data == null) {
      this.errorMessage.set('Ocurrió un error inesperado. Intenta nuevamente.');
      this.triggerErrorModal();
      return;
    }

    this.successMessage.set('¡Registro exitoso! Serás redirigido a iniciar sesión.');
    this.triggerSuccessModal();

    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 2000);
  }

  private triggerErrorModal() {
    this.showErrorModal.set(true);

    setTimeout(() => {
      this.showErrorModal.set(false);
    }, 2000);
  }

  private triggerSuccessModal() {
    this.showSuccessModal.set(true);

    setTimeout(() => {
      this.showSuccessModal.set(false);
    }, 2000);
  }

  private mapAuthError(message: string) {
    if (message.includes('User already registered')) {
      return 'Ya existe una cuenta con este correo.';
    }
    if (message.includes('Password should be at least')) {
      return 'La contraseña debe tener al menos 6 caracteres.';
    }
    return message;
  }

}
