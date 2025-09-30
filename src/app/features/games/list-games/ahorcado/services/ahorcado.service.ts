import { Injectable } from '@angular/core';
import { Palabra } from '../interfaces/palabra.interface';

@Injectable({
  providedIn: 'root'
})
export class AhorcadoService {
  
  private palabras: Palabra[] = [
    // Animales
    { palabra: 'ELEFANTE', pista: 'Animal grande con trompa', categoria: 'Animales' },
    { palabra: 'JIRAFA', pista: 'Animal con cuello muy largo', categoria: 'Animales' },
    { palabra: 'DELFIN', pista: 'Mamífero marino inteligente', categoria: 'Animales' },
    { palabra: 'LEON', pista: 'Rey de la selva', categoria: 'Animales' },
    { palabra: 'PINGUINO', pista: 'Ave que no vuela y vive en el hielo', categoria: 'Animales' },
    
    // Países
    { palabra: 'ARGENTINA', pista: 'País sudamericano famoso por el tango', categoria: 'Países' },
    { palabra: 'JAPON', pista: 'País asiático de los samurais', categoria: 'Países' },
    { palabra: 'EGIPTO', pista: 'País de las pirámides', categoria: 'Países' },
    { palabra: 'BRASIL', pista: 'País más grande de Sudamérica', categoria: 'Países' },
    { palabra: 'CANADA', pista: 'País norteamericano conocido por el maple', categoria: 'Países' },
    
    // Frutas
    { palabra: 'MANZANA', pista: 'Fruta roja o verde muy común', categoria: 'Frutas' },
    { palabra: 'BANANA', pista: 'Fruta amarilla alargada', categoria: 'Frutas' },
    { palabra: 'SANDIA', pista: 'Fruta grande, verde por fuera y roja por dentro', categoria: 'Frutas' },
    { palabra: 'NARANJA', pista: 'Fruta cítrica de color anaranjado', categoria: 'Frutas' },
    { palabra: 'FRUTILLA', pista: 'Fruta roja pequeña con semillas', categoria: 'Frutas' },
    
    // Deportes
    { palabra: 'FUTBOL', pista: 'Deporte con pelota y arcos', categoria: 'Deportes' },
    { palabra: 'BASQUET', pista: 'Deporte con aro y pelota naranja', categoria: 'Deportes' },
    { palabra: 'TENIS', pista: 'Deporte con raqueta y red', categoria: 'Deportes' },
    { palabra: 'NATACION', pista: 'Deporte acuático', categoria: 'Deportes' },
    { palabra: 'VOLEY', pista: 'Deporte con pelota y red alta', categoria: 'Deportes' },
    
    // Profesiones
    { palabra: 'DOCTOR', pista: 'Profesional de la salud', categoria: 'Profesiones' },
    { palabra: 'INGENIERO', pista: 'Profesional que diseña y construye', categoria: 'Profesiones' },
    { palabra: 'PROFESOR', pista: 'Profesional que enseña', categoria: 'Profesiones' },
    { palabra: 'BOMBERO', pista: 'Profesional que apaga incendios', categoria: 'Profesiones' },
    { palabra: 'PROGRAMADOR', pista: 'Profesional que escribe código', categoria: 'Profesiones' },
  ];

  obtenerPalabraAleatoria(): Palabra {
    const indice = Math.floor(Math.random() * this.palabras.length);
    return this.palabras[indice];
  }

  normalizarLetra(letra: string): string {
    return letra.toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Quita acentos
  }

  verificarLetra(palabra: string, letra: string): boolean {
    return palabra.includes(this.normalizarLetra(letra));
  }

  obtenerPalabraRevelada(palabra: string, letrasAdivinadas: Set<string>): string {
    return palabra
      .split('')
      .map(letra => {
        if (letra === ' ') return ' ';
        const letraNormalizada = this.normalizarLetra(letra);
        return letrasAdivinadas.has(letraNormalizada) ? letra : '_';
      })
      .join('');
  }

  palabraCompleta(palabra: string, letrasAdivinadas: Set<string>): boolean {
    return palabra
      .split('')
      .filter(letra => letra !== ' ')
      .every(letra => letrasAdivinadas.has(this.normalizarLetra(letra)));
  }
}
