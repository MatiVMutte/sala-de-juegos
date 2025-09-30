export interface Intento {
  numero: number;
  distancia: number;
  temperatura: Temperatura;
}

export type Temperatura = 'super-helado' | 'frio' | 'tibio' | 'caliente' | 'ardiente';

export interface TemperaturaInfo {
  nombre: string;
  emoji: string;
  color: string;
  bgColor: string;
  rango: string;
}
