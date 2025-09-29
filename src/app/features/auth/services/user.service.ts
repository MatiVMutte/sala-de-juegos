import { Injectable, Signal, computed, signal } from '@angular/core';
import { Session, createClient, SupabaseClient } from '@supabase/supabase-js';
import { environments } from '../../../../environments/environments';
import { User } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private supabase: SupabaseClient = createClient(environments.supabaseUrl, environments.supabaseKey);
  // private sessionState = signal<Session | null>(null);
  // private initialized = false;

  constructor() {
    // No llamar async en el constructor - se inicializará cuando se acceda por primera vez
    // this.initializeSession();
  }

  async signUp(user: User) {
    const { data, error } = await this.supabase.auth.signUp({
      email: user.email,
      password: user.password
    });
    return { data, error };
  }

  // Login
  async signWithPassword(user: User) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: user.email,
      password: user.password,
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

  // // Logout
  // async logout() {
  //   const { error } = await this.supabase.auth.signOut();
  //   return { error };
  // }

  // // isAuthenticated
  // get isAuthenticated() {
  //   return this.sessionState() != null;
  // }

  // // Obtener usuario actual
  // async getCurrentUser() {
  //   const { data } = await this.supabase.auth.getUser();
  //   return data.user;
  // }

  // // Obtener sesión actual
  // async getCurrentSession() {
  //   const { data } = await this.supabase.auth.getSession();
  //   return data.session;
  // }

  // private initializeSession() {
  //   // Ejecutar la inicialización de forma asíncrona sin bloquear el constructor
  //   this.loadSession();
  // }

  // private async loadSession() {
  //   if (this.initialized) return;
    
  //   try {
  //     // Obtener la sesión actual al inicializar
  //     const session = await this.getCurrentSession();
  //     this.sessionState.set(session);
  //     this.initialized = true;
      
  //     // Escuchar cambios en el estado de autenticación
  //     // this.supabase.auth.onAuthStateChange((_event, session) => {
  //     //   this.sessionState.set(session);
  //     // });
  //   } catch (error) {
  //     console.error('Error initializing session:', error);
  //     this.sessionState.set(null);
  //     this.initialized = true;
  //   }
  // }

  async insertUser(user: User) {
    const { error } = await this.supabase.from('users').insert({
      name: user.nombre,
      lastname: user.apellido,
      age: user.edad,
      email: user.email,
      auth_uuid: user.auth_uuid
    });
    return { error };
  }
}
