import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TriviaResponse, TriviaQuestion, PreguntaProcesada } from '../interfaces/pregunta.interface';
import { firstValueFrom } from 'rxjs';

interface TranslationResponse {
  responseData: {
    translatedText: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PreguntadosService {
  private apiUrl = 'https://opentdb.com/api.php';
  private translationApiUrl = 'https://api.mymemory.translated.net/get';

  constructor(private http: HttpClient) {}

  async obtenerPreguntas(cantidad: number = 10): Promise<PreguntaProcesada[]> {
    try {
      // Obtener preguntas de videojuegos, dificultad fácil
      const url = `${this.apiUrl}?amount=${cantidad}&category=15&difficulty=easy&type=multiple`;
      
      const response = await firstValueFrom(
        this.http.get<TriviaResponse>(url)
      );

      if (response.response_code === 0) {
        // Procesar y traducir todas las preguntas
        const preguntasProcesadas = await Promise.all(
          response.results.map(q => this.procesarYTraducirPregunta(q))
        );
        return preguntasProcesadas;
      }

      return [];
    } catch (error) {
      console.error('Error al obtener preguntas:', error);
      return [];
    }
  }

  private async procesarYTraducirPregunta(pregunta: TriviaQuestion): Promise<PreguntaProcesada> {
    // Decodificar HTML entities primero
    const preguntaDecodificada = this.decodificarHTML(pregunta.question);
    const respuestaCorrectaDecodificada = this.decodificarHTML(pregunta.correct_answer);
    const respuestasIncorrectasDecodificadas = pregunta.incorrect_answers.map(r => this.decodificarHTML(r));

    // Traducir pregunta y respuestas
    const preguntaTraducida = await this.traducirTexto(preguntaDecodificada);
    const respuestaCorrectaTraducida = await this.traducirTexto(respuestaCorrectaDecodificada);
    const respuestasIncorrectasTraducidas = await Promise.all(
      respuestasIncorrectasDecodificadas.map(r => this.traducirTexto(r))
    );

    // Mezclar todas las respuestas
    const todasLasRespuestas = [
      respuestaCorrectaTraducida,
      ...respuestasIncorrectasTraducidas
    ];
    const respuestasMezcladas = this.mezclarArray(todasLasRespuestas);

    return {
      pregunta: preguntaTraducida,
      respuestas: respuestasMezcladas,
      respuestaCorrecta: respuestaCorrectaTraducida,
      categoria: pregunta.category,
      dificultad: pregunta.difficulty
    };
  }

  private async traducirTexto(texto: string): Promise<string> {
    try {
      // Pequeño delay para no saturar la API gratuita
      await this.delay(100);
      
      const url = `${this.translationApiUrl}?q=${encodeURIComponent(texto)}&langpair=en|es`;
      
      const response = await firstValueFrom(
        this.http.get<TranslationResponse>(url)
      );

      return response.responseData.translatedText || texto;
    } catch (error) {
      console.error('Error al traducir:', error);
      // Si falla la traducción, devolver el texto original
      return texto;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private mezclarArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  private decodificarHTML(texto: string): string {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = texto;
    return textarea.value;
  }
}
