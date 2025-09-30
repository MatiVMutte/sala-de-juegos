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
      imagen: '/images/games/mayor-o-menor.png',
      ruta: '/juegos/mayor-o-menor'
    },
    {
      id: 2,
      nombre: 'Ahorcado',
      descripcion: 'Adivina la palabra oculta letra por letra. ¡Acumula palabras correctas!',
      imagen: '/images/games/ahorcado.png',
      ruta: '/juegos/ahorcado'
    },
    {
      id: 3,
      nombre: 'Preguntados',
      descripcion: 'Responde preguntas de videojuegos. ¡Demuestra cuánto sabes!',
      imagen: '/images/games/preguntados.png',
      ruta: '/juegos/preguntados'
    },
    {
      id: 4,
      nombre: 'Adivina el Número',
      descripcion: 'Descubre el número secreto usando pistas de temperatura',
      imagen: '/images/games/adivinar-el-numero.png',
      ruta: '/juegos/adivina-numero'
    }
  ]);

}
