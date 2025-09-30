import { Component, OnInit, OnDestroy, inject, signal, computed, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../../auth/services/user.service';
import { Mensaje } from '../../interfaces/mensaje.interface';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-page.component.html'
})
export class ChatPageComponent implements OnInit, OnDestroy, AfterViewChecked {
  private chatService = inject(ChatService);
  private authService = inject(AuthService);
  
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  
  mensajes = signal<Mensaje[]>([]);
  nuevoMensaje = signal('');
  enviandoMensaje = signal(false);
  cargandoMensajes = signal(true);
  
  private mensajesSubscription?: Subscription;
  private shouldScroll = false;

  currentUser = computed(() => this.authService.currentUser());

  async ngOnInit() {
    // Cargar mensajes iniciales
    await this.chatService.cargarMensajes();
    
    // Suscribirse a nuevos mensajes
    this.chatService.suscribirseAMensajes();
    
    // Observar cambios en los mensajes
    this.mensajesSubscription = this.chatService.mensajes$.subscribe(mensajes => {
      this.mensajes.set(mensajes);
      this.cargandoMensajes.set(false);
      this.shouldScroll = true;
    });
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  ngOnDestroy() {
    // Limpiar subscripciones
    this.chatService.desuscribirse();
    if (this.mensajesSubscription) {
      this.mensajesSubscription.unsubscribe();
    }
  }

  async enviarMensaje() {
    const mensaje = this.nuevoMensaje().trim();
    if (!mensaje || this.enviandoMensaje()) return;

    const user = this.currentUser();
    if (!user?.auth_uuid) return;

    this.enviandoMensaje.set(true);

    const resultado = await this.chatService.enviarMensaje(user.auth_uuid, mensaje);

    if (resultado.error) {
      console.error('Error al enviar mensaje');
    } else {
      this.nuevoMensaje.set('');
    }

    this.enviandoMensaje.set(false);
  }

  esMiMensaje(mensaje: Mensaje): boolean {
    return mensaje.user_id === this.currentUser()?.auth_uuid;
  }

  formatearHora(fecha: Date | string | undefined): string {
    if (!fecha) return '';
    const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  }

  onEnterKey(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.enviarMensaje();
    }
  }

  private scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        this.messagesContainer.nativeElement.scrollTop = 
          this.messagesContainer.nativeElement.scrollHeight;
      }
    } catch(err) {
      console.error('Error al hacer scroll:', err);
    }
  }
}
