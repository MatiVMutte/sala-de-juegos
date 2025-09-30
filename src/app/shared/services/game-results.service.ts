import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environments } from '../../../environments/environments';

export interface GameResult {
  id?: string;
  user_id: string;
  game_name: string;
  score: number;
  additional_data?: any;
  created_at?: Date;
  username?: string;
  photo_url?: string;
}

@Injectable({
  providedIn: 'root'
})
export class GameResultsService {
  private supabase: SupabaseClient = createClient(environments.supabaseUrl, environments.supabaseKey);

  // Guardar resultado de un juego (solo si es mejor que el anterior)
  // lowerIsBetter: true para juegos donde menor puntaje es mejor (ej: menos intentos)
  async saveGameResult(result: GameResult, lowerIsBetter: boolean = false) {
    try {
      // Primero verificar si el usuario ya tiene un registro para este juego
      const { data: existingResult } = await this.supabase
        .from('game_results')
        .select('*')
        .eq('user_id', result.user_id)
        .eq('game_name', result.game_name)
        .single();

      // Si no existe un registro previo, insertar nuevo
      if (!existingResult) {
        const { data, error } = await this.supabase
          .from('game_results')
          .insert({
            user_id: result.user_id,
            game_name: result.game_name,
            score: result.score,
            additional_data: result.additional_data
          })
          .select();

        if (error) {
          console.error('Error saving game result:', error);
          return { data: null, error, isNewRecord: true };
        }

        return { data, error: null, isNewRecord: true, improved: true };
      }

      // Verificar si mejoró según la lógica del juego
      const improved = lowerIsBetter 
        ? result.score < existingResult.score  // Menor es mejor
        : result.score > existingResult.score; // Mayor es mejor

      // Si mejoró, actualizar
      if (improved) {
        const { data, error } = await this.supabase
          .from('game_results')
          .update({
            score: result.score,
            additional_data: result.additional_data,
            created_at: new Date().toISOString() // Actualizar fecha al nuevo récord
          })
          .eq('id', existingResult.id)
          .select();

        if (error) {
          console.error('Error updating game result:', error);
          return { data: null, error, isNewRecord: false };
        }

        return { 
          data, 
          error: null, 
          isNewRecord: false, 
          improved: true,
          previousScore: existingResult.score
        };
      }

      // El puntaje no mejoró, no hacer nada
      return { 
        data: existingResult, 
        error: null, 
        isNewRecord: false, 
        improved: false,
        currentBest: existingResult.score
      };
    } catch (error) {
      console.error('Error saving game result:', error);
      return { data: null, error, isNewRecord: false };
    }
  }

  // Obtener mejores resultados de un juego específico
  async getTopResults(gameName: string, limit: number = 10, lowerIsBetter: boolean = false) {
    try {
      const { data, error } = await this.supabase
        .from('game_results')
        .select(`
          *,
          users!game_results_user_id_fkey (
            username,
            photo_url
          )
        `)
        .eq('game_name', gameName)
        .order('score', { ascending: lowerIsBetter }) // Si lowerIsBetter, orden ascendente
        .limit(limit);

      if (error) {
        console.error('Error fetching top results:', error);
        return { data: null, error };
      }

      // Mapear los datos para incluir username y photo_url en el nivel superior
      const mappedData = data?.map((result: any) => ({
        ...result,
        username: result.users?.username,
        photo_url: result.users?.photo_url
      })) || [];

      return { data: mappedData, error: null };
    } catch (error) {
      console.error('Error fetching top results:', error);
      return { data: null, error };
    }
  }

  // Obtener el mejor resultado de un usuario en un juego
  async getUserBestScore(userId: string, gameName: string) {
    try {
      const { data, error } = await this.supabase
        .from('game_results')
        .select('*')
        .eq('user_id', userId)
        .eq('game_name', gameName)
        .order('score', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        // Si no hay resultados, no es un error
        if (error.code === 'PGRST116') {
          return { data: null, error: null };
        }
        console.error('Error fetching user best score:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching user best score:', error);
      return { data: null, error };
    }
  }

  // Obtener todos los resultados de un usuario
  async getUserResults(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from('game_results')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user results:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error fetching user results:', error);
      return { data: null, error };
    }
  }
}
