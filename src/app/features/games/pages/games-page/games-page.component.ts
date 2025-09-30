import { ChangeDetectionStrategy, Component, signal, inject, computed } from '@angular/core';
import { Juego } from '../../../../shared/interfaces/juego-interface';
import { AuthService } from '../../../auth/services/user.service';
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
      nombre: 'Mayor o Menor',
      descripcion: 'Adivina si la siguiente carta será mayor o menor. ¡Haz la racha más larga posible!',
      imagen: 'https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=500&h=300&fit=crop',
      ruta: '/juegos/mayor-o-menor'
    },
    {
      id: 2,
      nombre: 'Ahorcado',
      descripcion: 'Adivina la palabra oculta letra por letra. ¡Acumula palabras correctas!',
      imagen: 'https://images.unsplash.com/photo-1632501641765-e568d28b0015?w=500&h=300&fit=crop',
      ruta: '/juegos/ahorcado'
    },
    {
      id: 3,
      nombre: 'Preguntados',
      descripcion: 'Responde preguntas de videojuegos. ¡Demuestra cuánto sabes!',
      imagen: 'https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=500&h=300&fit=crop',
      ruta: '/juegos/preguntados'
    },
    {
      id: 4,
      nombre: 'Adivina el Número',
      descripcion: 'Descubre el número secreto usando pistas de temperatura',
      imagen: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=500&h=300&fit=crop',
      ruta: '/juegos/adivina-numero'
    }
  ]);

}
