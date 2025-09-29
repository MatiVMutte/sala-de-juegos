import { Component, computed, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../features/auth/services/user.service';

@Component({
  selector: 'app-nav',
  imports: [RouterModule],
  templateUrl: './nav.component.html',
})
export class NavComponent {
  authService = inject(AuthService);
  router = inject(Router);
  isAuthenticated = computed(() => this.authService.isAuthenticated());
  currentUser = computed(() => this.authService.currentUser());

  async signOut() {
    await this.authService.logout();
    // Redirigir al login después de cerrar sesión
    this.router.navigate(['/login']);
  }
}
