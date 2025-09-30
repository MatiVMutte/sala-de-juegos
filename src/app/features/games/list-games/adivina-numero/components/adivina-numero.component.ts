import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdivinaNumeroService } from '../services/adivina-numero.service';
import { Intento } from '../interfaces/juego.interface';
import { AuthService } from '../../../../auth/services/user.service';
import { GameResultsService } from '../../../../../shared/services/game-results.service';
import { GameRankingComponent } from '../../../../../shared/components/game-ranking/game-ranking.component';

@Component({
  selector: 'app-adivina-numero',
  imports: [CommonModule, FormsModule, GameRankingComponent],
  templateUrl: './adivina-numero.component.html'
})
export class AdivinaNumeroComponent {
  private gameService = inject(AdivinaNumeroService);
  private authService = inject(AuthService);
  private gameResultsService = inject(GameResultsService);
  private router = inject(Router);

  // Signals
  numeroSecreto = signal<number>(0);
  intentoActual = signal<number | null>(null);
  historialIntentos = signal<Intento[]>([]);
  juegoIniciado = signal(false);
  juegoTerminado = signal(false);
  mensaje = signal('');
  tiempoInicio = signal<number>(0);
  inputNumero = signal('');

  // Computed
  currentUser = computed(() => this.authService.currentUser());
  numeroIntentos = computed(() => this.historialIntentos().length);
  ultimoIntento = computed(() => {
    const historial = this.historialIntentos();
    return historial.length > 0 ? historial[historial.length - 1] : null;
  });

  ngOnInit() {
    this.iniciarJuego();
  }

  iniciarJuego() {
    this.numeroSecreto.set(this.gameService.generarNumeroSecreto());
    this.historialIntentos.set([]);
    this.juegoIniciado.set(true);
    this.juegoTerminado.set(false);
    this.mensaje.set('');
    this.tiempoInicio.set(Date.now());
    this.inputNumero.set('');
    this.intentoActual.set(null);
  }

  realizarIntento() {
    const numero = parseInt(this.inputNumero());
    
    if (isNaN(numero)) {
      this.mensaje.set('Por favor ingresa un número válido');
      return;
    }

    if (!this.gameService.validarNumero(numero)) {
      this.mensaje.set('El número debe estar entre 1 y 100');
      return;
    }

    const distancia = this.gameService.calcularDistancia(this.numeroSecreto(), numero);
    const temperatura = this.gameService.obtenerTemperatura(distancia);

    const nuevoIntento: Intento = {
      numero,
      distancia,
      temperatura
    };

    // Agregar al historial
    this.historialIntentos.update(historial => [...historial, nuevoIntento]);

    // Verificar si adivinó
    if (numero === this.numeroSecreto()) {
      this.gano();
    } else {
      const info = this.gameService.obtenerInfoTemperatura(temperatura);
      this.mensaje.set(`${info.emoji} ${info.nombre}! ${info.rango}`);
    }

    // Limpiar input
    this.inputNumero.set('');
  }

  gano() {
    this.juegoTerminado.set(true);
    this.mensaje.set(`¡Felicitaciones! Adivinaste el número ${this.numeroSecreto()} en ${this.numeroIntentos()} ${this.numeroIntentos() === 1 ? 'intento' : 'intentos'}!`);
    this.finalizarJuego();
  }

  async finalizarJuego() {
    const duracion = Math.floor((Date.now() - this.tiempoInicio()) / 1000);
    const user = this.currentUser();
    
    // El puntaje es el número de intentos directamente
    const intentos = this.numeroIntentos();

    let mensajeFinal = `¡Felicitaciones! Adivinaste en ${intentos} ${intentos === 1 ? 'intento' : 'intentos'}!`;
    
    // Guardar resultado en Supabase (lowerIsBetter = true porque menos intentos es mejor)
    if (user?.auth_uuid) {
      const resultado = await this.gameResultsService.saveGameResult({
        user_id: user.auth_uuid,
        game_name: 'adivina-numero',
        score: intentos,
        additional_data: {
          duracion,
          numeroSecreto: this.numeroSecreto()
        }
      }, true);

      // Agregar mensaje según el resultado
      if (resultado.isNewRecord) {
        mensajeFinal += '\n¡Primer registro guardado!';
      } else if (resultado.improved) {
        mensajeFinal += `\n¡Nuevo récord personal! (Anterior: ${resultado.previousScore} intentos)`;
      } else if (resultado.currentBest) {
        mensajeFinal += `\nTu mejor marca es: ${resultado.currentBest} intentos`;
      }
    }

    this.mensaje.set(mensajeFinal);
  }

  volverAJuegos() {
    this.router.navigate(['/juegos']);
  }

  obtenerInfoTemperatura(temperatura: string) {
    return this.gameService.obtenerInfoTemperatura(temperatura as any);
  }

  onEnterKey(event: KeyboardEvent) {
    if (event.key === 'Enter' && !this.juegoTerminado()) {
      this.realizarIntento();
    }
  }
}
