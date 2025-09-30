import { Component, signal, inject, computed } from '@angular/core';
import { Juego } from '../../../../shared/interfaces/juego-interface';
import { AuthService } from '../../../auth/services/user.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  imports: [RouterModule]
})
export class HomePageComponent {

  authService = inject(AuthService);
  isAuthenticated = computed(() => this.authService.isAuthenticated());
  currentUser = computed(() => this.authService.currentUser());

  juegos = signal<Juego[]>([
    {
      id: 1,
      nombre: 'Mayor o Menor',
      descripcion: '¡Adivina si la siguiente carta será mayor o menor!',
      imagen: '/images/games/mayor-o-menor.png',
      ruta: '/juegos/mayor-o-menor'
    },
    {
      id: 2,
      nombre: 'Ahorcado',
      descripcion: 'Adivina la palabra oculta letra por letra',
      imagen: '/images/games/ahorcado.png',
      ruta: '/juegos/ahorcado'
    },
    {
      id: 3,
      nombre: 'Preguntados',
      descripcion: 'Responde preguntas de videojuegos',
      imagen: '/images/games/preguntados.png',
      ruta: '/juegos/preguntados'
    },
    {
      id: 4,
      nombre: 'Adivina el Número',
      descripcion: 'Encuentra el número secreto con pistas',
      imagen: '/images/games/adivinar-el-numero.png',
      ruta: '/juegos/adivina-numero'
    }
  ]);

}
