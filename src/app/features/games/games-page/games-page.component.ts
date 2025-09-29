import { ChangeDetectionStrategy, Component, signal, inject, computed } from '@angular/core';
import { Juego } from '../../../shared/interfaces/juego-interface';
import { AuthService } from '../../auth/services/user.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-games-page',
  imports: [RouterModule],
  templateUrl: './games-page.component.html',
})
export class GamesPageComponent {

  authService = inject(AuthService);
  isAuthenticated = computed(() => this.authService.isAuthenticated());
  currentUser = computed(() => this.authService.currentUser());

  juegos = signal<Juego[]>([
    {
      id: 1,
      nombre: 'Juego 1',
      descripcion: 'Descripcion del juego 1',
      imagen: '#'
    },
    {
      id: 2,
      nombre: 'Juego 2',
      descripcion: 'Descripcion del juego 2',
      imagen: '#'
    },
    {
      id: 3,
      nombre: 'Juego 3',
      descripcion: 'Descripcion del juego 3',
      imagen: '#'
    }
  ]);

}
