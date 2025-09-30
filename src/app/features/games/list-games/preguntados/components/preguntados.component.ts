import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PreguntadosService } from '../services/preguntados.service';
import { PreguntaProcesada } from '../interfaces/pregunta.interface';
import { AuthService } from '../../../../auth/services/user.service';
import { GameResultsService } from '../../../../../shared/services/game-results.service';
import { GameRankingComponent } from '../../../../../shared/components/game-ranking/game-ranking.component';

@Component({
  selector: 'app-preguntados',
  standalone: true,
  imports: [CommonModule, GameRankingComponent],
  templateUrl: './preguntados.component.html'
})
export class PreguntadosComponent implements OnInit {
  private preguntadosService = inject(PreguntadosService);
  private authService = inject(AuthService);
  private gameResultsService = inject(GameResultsService);
  private router = inject(Router);

  // Signals
  preguntas = signal<PreguntaProcesada[]>([]);
  preguntaActualIndex = signal(0);
  respuestasCorrectas = signal(0);
  respuestasIncorrectas = signal(0);
  respuestaSeleccionada = signal<string | null>(null);
  mostrandoResultado = signal(false);
  juegoIniciado = signal(false);
  juegoTerminado = signal(false);
  cargandoPreguntas = signal(false);
  mensaje = signal('');
  tiempoInicio = signal<number>(0);

  // Computed
  currentUser = computed(() => this.authService.currentUser());
  preguntaActual = computed(() => {
    const preguntas = this.preguntas();
    const index = this.preguntaActualIndex();
    return preguntas.length > 0 ? preguntas[index] : null;
  });
  totalPreguntas = computed(() => this.preguntas().length);
  preguntasRespondidas = computed(() => 
    this.respuestasCorrectas() + this.respuestasIncorrectas()
  );
  porcentajeAciertos = computed(() => {
    const total = this.preguntasRespondidas();
    if (total === 0) return 0;
    return Math.round((this.respuestasCorrectas() / total) * 100);
  });

  async ngOnInit() {
    await this.iniciarJuego();
  }

  async iniciarJuego() {
    this.cargandoPreguntas.set(true);
    this.mensaje.set('Cargando y traduciendo preguntas...');
    
    const preguntas = await this.preguntadosService.obtenerPreguntas(10);
    
    if (preguntas.length === 0) {
      this.mensaje.set('Error al cargar las preguntas. Intenta de nuevo.');
      this.cargandoPreguntas.set(false);
      return;
    }

    this.preguntas.set(preguntas);
    this.preguntaActualIndex.set(0);
    this.respuestasCorrectas.set(0);
    this.respuestasIncorrectas.set(0);
    this.respuestaSeleccionada.set(null);
    this.mostrandoResultado.set(false);
    this.juegoIniciado.set(true);
    this.juegoTerminado.set(false);
    this.mensaje.set('');
    this.tiempoInicio.set(Date.now());
    this.cargandoPreguntas.set(false);
  }

  seleccionarRespuesta(respuesta: string) {
    if (this.mostrandoResultado() || this.juegoTerminado()) return;

    this.respuestaSeleccionada.set(respuesta);
    this.mostrandoResultado.set(true);

    const pregunta = this.preguntaActual();
    if (!pregunta) return;

    if (respuesta === pregunta.respuestaCorrecta) {
      this.respuestasCorrectas.update(v => v + 1);
      this.mensaje.set('¡Correcto!');
    } else {
      this.respuestasIncorrectas.update(v => v + 1);
      this.mensaje.set(`Incorrecto. La respuesta era: ${pregunta.respuestaCorrecta}`);
    }

    // Esperar y pasar a la siguiente pregunta
    setTimeout(() => {
      if (this.preguntaActualIndex() < this.totalPreguntas() - 1) {
        this.siguientePregunta();
      } else {
        this.finalizarJuego();
      }
    }, 2000);
  }

  siguientePregunta() {
    this.preguntaActualIndex.update(v => v + 1);
    this.respuestaSeleccionada.set(null);
    this.mostrandoResultado.set(false);
    this.mensaje.set('');
  }

  async finalizarJuego() {
    this.juegoTerminado.set(true);
    const duracion = Math.floor((Date.now() - this.tiempoInicio()) / 1000);
    const user = this.currentUser();
    
    const correctas = this.respuestasCorrectas();
    let mensajeFinal = `Juego terminado!\nRespuestas correctas: ${correctas}/${this.totalPreguntas()}\nPorcentaje: ${this.porcentajeAciertos()}%`;
    
    // Guardar resultado en Supabase
    if (user?.auth_uuid) {
      const resultado = await this.gameResultsService.saveGameResult({
        user_id: user.auth_uuid,
        game_name: 'preguntados',
        score: correctas,
        additional_data: {
          duracion,
          totalPreguntas: this.totalPreguntas(),
          incorrectas: this.respuestasIncorrectas(),
          porcentaje: this.porcentajeAciertos()
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

  volverAJuegos() {
    this.router.navigate(['/juegos']);
  }

  esRespuestaCorrecta(respuesta: string): boolean {
    if (!this.mostrandoResultado()) return false;
    const pregunta = this.preguntaActual();
    return pregunta ? respuesta === pregunta.respuestaCorrecta : false;
  }

  esRespuestaIncorrecta(respuesta: string): boolean {
    if (!this.mostrandoResultado()) return false;
    const pregunta = this.preguntaActual();
    return respuesta === this.respuestaSeleccionada() && 
           respuesta !== pregunta?.respuestaCorrecta;
  }
}
