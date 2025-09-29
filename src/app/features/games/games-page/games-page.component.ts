import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Juego } from '../../../shared/interfaces/juego-interface';

@Component({
  selector: 'app-games-page',
  imports: [],
  templateUrl: './games-page.component.html',
})
export class GamesPageComponent {

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
