import { Injectable } from '@angular/core';
import { Temperatura, TemperaturaInfo } from '../interfaces/juego.interface';

@Injectable({
  providedIn: 'root'
})
export class AdivinaNumeroService {

  generarNumeroSecreto(): number {
    return Math.floor(Math.random() * 100) + 1;
  }

  calcularDistancia(numeroSecreto: number, intento: number): number {
    return Math.abs(numeroSecreto - intento);
  }

  obtenerTemperatura(distancia: number): Temperatura {
    if (distancia > 50) return 'super-helado';
    if (distancia > 30) return 'frio';
    if (distancia > 15) return 'tibio';
    if (distancia > 5) return 'caliente';
    return 'ardiente';
  }

  obtenerInfoTemperatura(temperatura: Temperatura): TemperaturaInfo {
    const temperaturas: Record<Temperatura, TemperaturaInfo> = {
      'super-helado': {
        nombre: 'Super Helado',
        emoji: '',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        rango: 'Más de 50 de distancia'
      },
      'frio': {
        nombre: 'Frío',
        emoji: '',
        color: 'text-cyan-600',
        bgColor: 'bg-cyan-100',
        rango: 'Entre 30 y 50 de distancia'
      },
      'tibio': {
        nombre: 'Tibio',
        emoji: '',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        rango: 'Entre 15 y 30 de distancia'
      },
      'caliente': {
        nombre: 'Caliente',
        emoji: '',
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
        rango: 'Entre 5 y 15 de distancia'
      },
      'ardiente': {
        nombre: 'Ardiente',
        emoji: '',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        rango: 'Menos de 5 de distancia'
      }
    };

    return temperaturas[temperatura];
  }

  validarNumero(numero: number): boolean {
    return numero >= 1 && numero <= 100 && Number.isInteger(numero);
  }
}
