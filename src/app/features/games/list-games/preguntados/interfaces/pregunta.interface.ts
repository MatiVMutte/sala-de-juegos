export interface TriviaResponse {
  response_code: number;
  results: TriviaQuestion[];
}

export interface TriviaQuestion {
  type: string;
  difficulty: string;
  category: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

export interface PreguntaProcesada {
  pregunta: string;
  respuestas: string[];
  respuestaCorrecta: string;
  categoria: string;
  dificultad: string;
}
