import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { environments } from '../../../../environments/environments';
import { Mensaje } from '../interfaces/mensaje.interface';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private supabase: SupabaseClient = createClient(environments.supabaseUrl, environments.supabaseKey);
  private mensajesSubject = new BehaviorSubject<Mensaje[]>([]);
  private channel: RealtimeChannel | null = null;

  // Observable para que los componentes se suscriban
  mensajes$: Observable<Mensaje[]> = this.mensajesSubject.asObservable();

  constructor() {}

  // Cargar mensajes iniciales (últimos 15)
  async cargarMensajes() {
    try {
      const { data, error } = await this.supabase
        .from('messages')
        .select(`
          *,
          users!messages_user_id_fkey (
            username,
            photo_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(15);

      if (error) {
        console.error('Error cargando mensajes:', error);
        return;
      }

      // Mapear los datos para incluir username y photo_url
      const mensajes = data?.map((msg: any) => ({
        ...msg,
        username: msg.users?.username,
        photo_url: msg.users?.photo_url
      })) || [];

      // Revertir el orden para mostrar del más antiguo al más nuevo
      this.mensajesSubject.next(mensajes.reverse());
    } catch (error) {
      console.error('Error cargando mensajes:', error);
    }
  }

  // Suscribirse a cambios en tiempo real
  suscribirseAMensajes() {
    // Limpiar subscription anterior si existe
    if (this.channel) {
      this.supabase.removeChannel(this.channel);
    }

    // Crear canal de tiempo real
    this.channel = this.supabase
      .channel('messages_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        async (payload) => {
          console.log('Nuevo mensaje recibido:', payload);
          
          // Cuando llega un mensaje nuevo, obtener datos del usuario
          const nuevoMensaje = payload.new as Mensaje;
          
          // Obtener datos del usuario (especialmente photo_url que no está en el mensaje)
          const { data: userData } = await this.supabase
            .from('users')
            .select('photo_url')
            .eq('id', nuevoMensaje.user_id)
            .single();

          if (userData) {
            nuevoMensaje.photo_url = userData.photo_url;
          }

          // Agregar el nuevo mensaje a la lista
          const mensajesActuales = this.mensajesSubject.value;
          this.mensajesSubject.next([...mensajesActuales, nuevoMensaje]);
        }
      )
      .subscribe();
  }

  // Enviar un mensaje
  async enviarMensaje(userId: string, username: string, mensaje: string) {
    try {
      const { data, error } = await this.supabase
        .from('messages')
        .insert({
          user_id: userId,
          username: username,
          content: mensaje
        })
        .select();

      if (error) {
        console.error('Error enviando mensaje:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      return { data: null, error };
    }
  }

  // Limpiar subscripción al destruir
  desuscribirse() {
    if (this.channel) {
      this.supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }
}
