import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AhorcadoService } from '../services/ahorcado.service';
import { Palabra } from '../interfaces/palabra.interface';
import { AuthService } from '../../../../auth/services/user.service';
import { GameResultsService } from '../../../../../shared/services/game-results.service';
import { GameRankingComponent } from '../../../../../shared/components/game-ranking/game-ranking.component';

@Component({
  selector: 'app-ahorcado',
  standalone: true,
  imports: [CommonModule, GameRankingComponent],
  templateUrl: './ahorcado.component.html'
})
export class AhorcadoComponent {
  private ahorcadoService = inject(AhorcadoService);
  private authService = inject(AuthService);
  private gameResultsService = inject(GameResultsService);
  private router = inject(Router);

  // Signals
  palabraActual = signal<Palabra | null>(null);
  letrasAdivinadas = signal<Set<string>>(new Set());
  letrasIncorrectas = signal<Set<string>>(new Set());
  intentosRestantes = signal(6);
  juegoIniciado = signal(false);
  juegoTerminado = signal(false);
  gano = signal(false);
  mensaje = signal('');
  tiempoInicio = signal<number>(0);
  palabrasAcertadas = signal(0);
  palabrasJugadas = signal(0);

  // Computed
  currentUser = computed(() => this.authService.currentUser());
  palabraRevelada = computed(() => {
    if (!this.palabraActual()) return '';
    return this.ahorcadoService.obtenerPalabraRevelada(
      this.palabraActual()!.palabra,
      this.letrasAdivinadas()
    );
  });

  // Alfabeto español
  alfabeto = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  ngOnInit() {
    this.iniciarJuego();
  }

  iniciarJuego() {
    this.palabraActual.set(this.ahorcadoService.obtenerPalabraAleatoria());
    this.letrasAdivinadas.set(new Set());
    this.letrasIncorrectas.set(new Set());
    this.intentosRestantes.set(6);
    this.juegoIniciado.set(true);
    this.juegoTerminado.set(false);
    this.gano.set(false);
    this.mensaje.set('');
    this.tiempoInicio.set(Date.now());
  }

  nuevaPalabra() {
    this.palabraActual.set(this.ahorcadoService.obtenerPalabraAleatoria());
    this.letrasAdivinadas.set(new Set());
    this.letrasIncorrectas.set(new Set());
    this.intentosRestantes.set(6);
    this.juegoTerminado.set(false);
    this.gano.set(false);
    this.mensaje.set('');
  }

  adivinarLetra(letra: string) {
    if (this.juegoTerminado() || 
        this.letrasAdivinadas().has(letra) || 
        this.letrasIncorrectas().has(letra)) {
      return;
    }

    const palabraActual = this.palabraActual();
    if (!palabraActual) return;

    const letraNormalizada = this.ahorcadoService.normalizarLetra(letra);

    if (this.ahorcadoService.verificarLetra(palabraActual.palabra, letraNormalizada)) {
      // Letra correcta
      const nuevasLetras = new Set(this.letrasAdivinadas());
      nuevasLetras.add(letraNormalizada);
      this.letrasAdivinadas.set(nuevasLetras);

      // Verificar si completó la palabra
      if (this.ahorcadoService.palabraCompleta(palabraActual.palabra, nuevasLetras)) {
        this.palabraCompletada();
      }
    } else {
      // Letra incorrecta
      const nuevasIncorrectas = new Set(this.letrasIncorrectas());
      nuevasIncorrectas.add(letraNormalizada);
      this.letrasIncorrectas.set(nuevasIncorrectas);
      this.intentosRestantes.update(v => v - 1);

      // Verificar si perdió
      if (this.intentosRestantes() === 0) {
        this.perdio();
      }
    }
  }

  palabraCompletada() {
    this.gano.set(true);
    this.palabrasAcertadas.update(v => v + 1);
    this.palabrasJugadas.update(v => v + 1);
    this.mensaje.set('¡Correcto! ¿Quieres intentar con otra palabra?');
  }

  perdio() {
    this.juegoTerminado.set(true);
    this.gano.set(false);
    this.palabrasJugadas.update(v => v + 1);
    this.mensaje.set(`Perdiste. La palabra era: ${this.palabraActual()?.palabra}`);
    this.finalizarJuego();
  }

  async finalizarJuego() {
    const duracion = Math.floor((Date.now() - this.tiempoInicio()) / 1000);
    const user = this.currentUser();
    
    // El puntaje es la cantidad de palabras acertadas
    const puntaje = this.palabrasAcertadas();

    let mensajeFinal = `Juego terminado!\nPalabras acertadas: ${puntaje}`;
    
    // Guardar resultado en Supabase
    if (user?.auth_uuid && puntaje > 0) {
      const resultado = await this.gameResultsService.saveGameResult({
        user_id: user.auth_uuid,
        game_name: 'ahorcado',
        score: puntaje,
        additional_data: {
          duracion,
          palabrasJugadas: this.palabrasJugadas()
        }
      });

      // Agregar mensaje según el resultado
      if (resultado.isNewRecord) {
        mensajeFinal += '\n¡Primer registro guardado!';
      } else if (resultado.improved) {
        mensajeFinal += `\n¡Nuevo récord personal! (Anterior: ${resultado.previousScore})`;
      } else if (resultado.currentBest) {
        mensajeFinal += `\nTu récord actual es: ${resultado.currentBest}`;
      }
    }

    this.mensaje.set(mensajeFinal);
  }

  reiniciarJuego() {
    this.palabrasAcertadas.set(0);
    this.palabrasJugadas.set(0);
    this.iniciarJuego();
  }

  volverAJuegos() {
    this.router.navigate(['/juegos']);
  }

  letraYaUsada(letra: string): boolean {
    return this.letrasAdivinadas().has(letra) || this.letrasIncorrectas().has(letra);
  }

  esLetraCorrecta(letra: string): boolean {
    return this.letrasAdivinadas().has(letra);
  }

  esLetraIncorrecta(letra: string): boolean {
    return this.letrasIncorrectas().has(letra);
  }
}
