import { Injectable } from '@angular/core';
import { Carta } from '../interfaces/carta.interface';

@Injectable({
  providedIn: 'root'
})
export class MayorOMenorService {

  private palos: ('corazones' | 'diamantes' | 'treboles' | 'picas')[] = ['corazones', 'diamantes', 'treboles', 'picas'];
  private valores = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]; // 1=As, 11=J, 12=Q, 13=K

  // Generar una nueva carta aleatoria
  generarCartaAleatoria(): Carta {
    const palo = this.palos[Math.floor(Math.random() * this.palos.length)];
    const valor = this.valores[Math.floor(Math.random() * this.valores.length)];
    
    return {
      valor,
      palo,
      imagen: this.obtenerImagenCarta(valor, palo)
    };
  }

  // Obtener la URL de la imagen de la carta
  private obtenerImagenCarta(valor: number, palo: string): string {
    const palosMap: { [key: string]: string } = {
      'corazones': 'hearts',
      'diamantes': 'diamonds',
      'treboles': 'clubs',
      'picas': 'spades'
    };

    const valoresMap: { [key: number]: string } = {
      1: 'ace',
      11: 'jack',
      12: 'queen',
      13: 'king'
    };

    const valorNombre = valoresMap[valor] || valor.toString();
    const paloNombre = palosMap[palo];

    // Usaremos API de cartas o símbolos Unicode
    return `${valorNombre}_of_${paloNombre}`;
  }

  // Obtener símbolo del palo
  obtenerSimboloPalo(palo: string): string {
    const simbolos: { [key: string]: string } = {
      'corazones': '♥',
      'diamantes': '♦',
      'treboles': '♣',
      'picas': '♠'
    };
    return simbolos[palo] || '';
  }

  // Obtener nombre del valor
  obtenerNombreValor(valor: number): string {
    const nombres: { [key: number]: string } = {
      1: 'A',
      11: 'J',
      12: 'Q',
      13: 'K'
    };
    return nombres[valor] || valor.toString();
  }

  // Obtener color del palo
  obtenerColorPalo(palo: string): string {
    return (palo === 'corazones' || palo === 'diamantes') ? 'text-red-600' : 'text-gray-900';
  }
}
