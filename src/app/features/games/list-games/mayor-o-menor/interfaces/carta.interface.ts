export interface Carta {
  valor: number;
  palo: 'corazones' | 'diamantes' | 'treboles' | 'picas';
  imagen: string;
}

export interface ResultadoJuego {
  usuario_id: string;
  cartasAcertadas: number;
  fecha: Date;
  duracion: number; // en segundos
}
