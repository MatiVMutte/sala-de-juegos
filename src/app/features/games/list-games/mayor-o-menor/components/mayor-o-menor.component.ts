import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MayorOMenorService } from '../services/mayor-o-menor.service';
import { Carta } from '../interfaces/carta.interface';
import { AuthService } from '../../../../auth/services/user.service';
import { GameResultsService } from '../../../../../shared/services/game-results.service';
import { GameRankingComponent } from '../../../../../shared/components/game-ranking/game-ranking.component';

@Component({
  selector: 'app-mayor-o-menor',
  templateUrl: './mayor-o-menor.component.html',
  imports: [CommonModule, GameRankingComponent]
})
export class MayorOMenorComponent {
  private gameService = inject(MayorOMenorService);
  private authService = inject(AuthService);
  private gameResultsService = inject(GameResultsService);
  private router = inject(Router);

  // Signals
  cartaActual = signal<Carta | null>(null);
  cartasAcertadas = signal(0);
  juegoIniciado = signal(false);
  juegoTerminado = signal(false);
  mensaje = signal('');
  tiempoInicio = signal<number>(0);
  racha = signal(0);
  mejorRacha = signal(0);
  mostrandoResultado = signal(false);

  // Computed
  currentUser = computed(() => this.authService.currentUser());

  ngOnInit() {
    this.iniciarJuego();
  }

  iniciarJuego() {
    this.cartaActual.set(this.gameService.generarCartaAleatoria());
    this.cartasAcertadas.set(0);
    this.juegoIniciado.set(true);
    this.juegoTerminado.set(false);
    this.mensaje.set('');
    this.tiempoInicio.set(Date.now());
    this.racha.set(0);
    this.mostrandoResultado.set(false);
  }

  adivinar(esMayor: boolean) {
    if (!this.cartaActual() || this.juegoTerminado() || this.mostrandoResultado()) {
      return;
    }

    const cartaAnterior = this.cartaActual()!;
    const nuevaCarta = this.gameService.generarCartaAleatoria();
    
    this.mostrandoResultado.set(true);
    
    setTimeout(() => {
      this.cartaActual.set(nuevaCarta);
      
      const acierto = esMayor 
        ? nuevaCarta.valor >= cartaAnterior.valor 
        : nuevaCarta.valor <= cartaAnterior.valor;

      if (acierto) {
        this.cartasAcertadas.update(v => v + 1);
        this.racha.update(v => v + 1);
        
        // Actualizar mejor racha
        if (this.racha() > this.mejorRacha()) {
          this.mejorRacha.set(this.racha());
        }

        this.mensaje.set('¡Correcto! 🎉');
      } else {
        this.mensaje.set('¡Incorrecto! ❌');
        this.juegoTerminado.set(true);
        this.finalizarJuego();
      }

      setTimeout(() => {
        this.mostrandoResultado.set(false);
        if (!this.juegoTerminado()) {
          this.mensaje.set('');
        }
      }, 1000);
    }, 300);
  }

  async finalizarJuego() {
    const duracion = Math.floor((Date.now() - this.tiempoInicio()) / 1000);
    const user = this.currentUser();
    
    let mensajeFinal = `¡Juego terminado! Acertaste ${this.cartasAcertadas()} ${
      this.cartasAcertadas() === 1 ? 'carta' : 'cartas'
    }`;
    
    // Guardar resultado en Supabase
    if (user?.auth_uuid) {
      const resultado = await this.gameResultsService.saveGameResult({
        user_id: user.auth_uuid,
        game_name: 'mayor-o-menor',
        score: this.cartasAcertadas(),
        additional_data: {
          duracion,
          mejorRacha: this.mejorRacha()
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

  obtenerSimboloPalo(palo: string): string {
    return this.gameService.obtenerSimboloPalo(palo);
  }

  obtenerNombreValor(valor: number): string {
    return this.gameService.obtenerNombreValor(valor);
  }

  obtenerColorPalo(palo: string): string {
    return this.gameService.obtenerColorPalo(palo);
  }
}
