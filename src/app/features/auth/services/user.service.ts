import { Injectable, Signal, computed, signal } from '@angular/core';
import { Session, createClient, SupabaseClient } from '@supabase/supabase-js';
import { environments } from '../../../../environments/environments';
import { User, LoginCredentials } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private supabase: SupabaseClient = createClient(environments.supabaseUrl, environments.supabaseKey);
  private sessionState = signal<Session | null>(null);
  private currentUserData = signal<User | null>(null);
  
  // Exponer como readonly para que los componentes solo puedan leerlos
  isAuthenticated = computed(() => this.sessionState() != null);
  currentUser = computed(() => this.currentUserData());

  constructor() {
    this.loadSession();
  }

  async signUp(user: User) {
    const { data, error } = await this.supabase.auth.signUp({
      email: user.email,
      password: user.password
    });
    return { data, error };
  }

  // Login
  async signWithPassword(credentials: LoginCredentials) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });
    return { data, error };
  }

  // Register
  async register(user: User) {
    const response = await this.signUp(user);

    if (response.error != null)
      return { data: null, error: response.error };

    if (response.data?.user == null)
      return { data: null, error: new Error('User not found') };

    const { error } = await this.insertUser(user);

    return {
      data: response.data?.user,
      error
    }
  }

  async logout() {
    const { error } = await this.supabase.auth.signOut();
    return { error };
  }

  async getCurrentUser() {
    const { data } = await this.supabase.auth.getUser();
    return data.user;
  }

  async getCurrentSession() {
    const { data } = await this.supabase.auth.getSession();
    return data.session;
  }

  private async loadSession() {
    try {
      const session = await this.getCurrentSession();
      
      // Configurar listener para cambios de autenticación
      this.supabase.auth.onAuthStateChange(async (event, session) => {
        this.sessionState.set(session);
        
        // Cargar datos del usuario cuando hay sesión
        if (session?.user) {
          await this.loadUserData(session.user.id);
        } else {
          this.currentUserData.set(null);
        }
      });

      // Cargar sesión y datos del usuario iniciales
      this.sessionState.set(session);
      if (session?.user) {
        await this.loadUserData(session.user.id);
      }
    } catch (error) {
      console.error('Error initializing session:', error);
      this.sessionState.set(null);
      this.currentUserData.set(null);
    }
  }

  // Método privado para cargar datos del usuario desde la BD
  private async loadUserData(authUuid: string) {
    try {
      const { data } = await this.selectUser(authUuid);
      if (data) {
        this.currentUserData.set(data as User);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      this.currentUserData.set(null);
    }
  }

  async insertUser(user: User) {
    const { error } = await this.supabase.from('users').insert({
      username: user.username,
      name: user.name,
      lastname: user.lastname,
      age: user.age,
      email: user.email,
      auth_uuid: user.auth_uuid,
      photo_url: user.photo_url
    });
    return { error };
  }

  async selectUser(auth_uuid: string) {
    if (auth_uuid == null)
      return { data: null, error: new Error('User not found') };
    const { data } = await this.supabase.from('users')
      .select('*')
      .eq('auth_uuid', auth_uuid)
      .single();
    return { data, error: null };
  }

  // Subir foto de perfil a Supabase Storage
  async uploadAvatar(file: File, userId: string): Promise<{ url: string | null; error: any }> {
    try {
      // Validar tipo de archivo
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        return { url: null, error: new Error('Tipo de archivo no válido. Usa JPG, PNG o WEBP.') };
      }

      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        return { url: null, error: new Error('La imagen debe ser menor a 5MB.') };
      }

      // Generar nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      // Subir archivo a Supabase Storage
      const { data, error } = await this.supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        return { url: null, error };
      }

      // Obtener URL pública
      const { data: urlData } = this.supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      return { url: urlData.publicUrl, error: null };
    } catch (error) {
      return { url: null, error };
    }
  }

  // Actualizar foto de perfil del usuario en la base de datos
  async updateUserPhoto(auth_uuid: string, photo_url: string) {
    const { error } = await this.supabase
      .from('users')
      .update({ photo_url })
      .eq('auth_uuid', auth_uuid);
    return { error };
  }
}
