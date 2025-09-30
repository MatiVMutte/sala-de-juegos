export interface Palabra {
  palabra: string;
  pista: string;
  categoria: string;
}

export interface EstadoJuego {
  palabraActual: string;
  letrasAdivinadas: Set<string>;
  letrasIncorrectas: Set<string>;
  intentosRestantes: number;
  juegoTerminado: boolean;
  gano: boolean;
}
