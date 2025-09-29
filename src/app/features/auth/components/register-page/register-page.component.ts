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
  selectedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null); 

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validar tipo de archivo
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        this.errorMessage.set('Tipo de archivo no válido. Usa JPG, PNG o WEBP.');
        this.triggerErrorModal();
        return;
      }

      // Validar tamaño
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage.set('La imagen debe ser menor a 5MB.');
        this.triggerErrorModal();
        return;
      }

      this.selectedFile.set(file);

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl.set(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  async register( user: User ) {
    if (!user.username || !user.name || !user.lastname || !user.age || !user.email || !user.password) {
      this.errorMessage.set('Todos los campos son obligatorios');
      this.triggerErrorModal();
      return;
    }

    if (user.age <= 0) {
      this.errorMessage.set('La edad debe ser mayor a cero');
      this.triggerErrorModal();
      return;
    }

    this.isSubmitting.set(true);

    // Si hay foto seleccionada, primero hacer el registro y luego subir la foto
    const { data, error } = await this.authService.register(user);

    if (error) {
      this.isSubmitting.set(false);
      const message = this.mapAuthError(error.message);
      this.errorMessage.set(message);
      this.triggerErrorModal();
      return;
    }

    if (data == null) {
      this.isSubmitting.set(false);
      this.errorMessage.set('Ocurrió un error inesperado. Intenta nuevamente.');
      this.triggerErrorModal();
      return;
    }

    // Subir foto si hay una seleccionada
    if (this.selectedFile() && data.id) {
      const uploadResult = await this.authService.uploadAvatar(this.selectedFile()!, data.id);
      
      if (uploadResult.url) {
        // Actualizar la foto en la base de datos
        await this.authService.updateUserPhoto(data.id, uploadResult.url);
      }
    }

    this.isSubmitting.set(false);

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
