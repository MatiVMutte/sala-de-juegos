import { Component, computed, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../features/auth/services/user.service';

@Component({
  selector: 'app-nav',
  imports: [RouterModule],
  templateUrl: './nav.component.html',
})
export class NavComponent {
  authService = inject(AuthService);
  // isAuthenticated = computed(() => this.authService.isAuthenticated);

  constructor() {
    console.log('NavComponent constructor');
    // console.log('Is authenticated:', this.isAuthenticated());
  }
}
