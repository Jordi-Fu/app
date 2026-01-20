import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, IonRefresher, IonRefresherContent, IonSpinner } from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';
import { ChatService, ConversacionUsuario, SocketService, UserStatusEvent } from '../../../../core/services';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonRefresher,
    IonRefresherContent,
    IonSpinner
  ]
})
export class ChatPage implements OnInit, OnDestroy {
  conversaciones: ConversacionUsuario[] = [];
  conversacionesFiltradas: ConversacionUsuario[] = [];
  cargando = false;
  error: string | null = null;
  searchQuery = '';
  
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private chatService: ChatService,
    private socketService: SocketService
  ) {}

  ngOnInit() {
    this.cargarConversaciones();
    this.initializeSocket();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Inicializar socket y suscribirse a cambios de estado
   */
  private async initializeSocket() {
    await this.socketService.connect();
    
    // Suscribirse a cambios de estado online/offline
    const statusSub = this.socketService.userStatusChange$.subscribe((event: UserStatusEvent) => {
      this.actualizarEstadoUsuario(event.userId, event.isOnline);
    });
    this.subscriptions.push(statusSub);
  }

  /**
   * Actualizar el estado online de un usuario en las conversaciones
   */
  private actualizarEstadoUsuario(userId: string, isOnline: boolean) {
    this.conversaciones = this.conversaciones.map(conv => {
      if (conv.otro_usuario.id === userId) {
        return {
          ...conv,
          otro_usuario: {
            ...conv.otro_usuario,
            esta_en_linea: isOnline
          }
        };
      }
      return conv;
    });
    this.aplicarFiltro();
  }

  async cargarConversaciones(event?: any) {
    try {
      this.cargando = true;
      this.error = null;
      this.conversaciones = await this.chatService.obtenerConversaciones();
      this.conversacionesFiltradas = this.conversaciones;
    } catch (error) {
      console.error('Error al cargar conversaciones:', error);
      this.error = 'Error al cargar las conversaciones';
    } finally {
      this.cargando = false;
      if (event) {
        event.target.complete();
      }
    }
  }

  onSearch(event: any) {
    this.searchQuery = event.target.value.toLowerCase();
    this.aplicarFiltro();
  }

  aplicarFiltro() {
    if (!this.searchQuery) {
      this.conversacionesFiltradas = this.conversaciones;
      return;
    }

    this.conversacionesFiltradas = this.conversaciones.filter(chat => {
      const nombreCompleto = this.getNombreCompleto(chat.otro_usuario).toLowerCase();
      const ultimoMensaje = (chat.texto_ultimo_mensaje || '').toLowerCase();
      const usuario = (chat.otro_usuario.usuario || '').toLowerCase();
      
      return nombreCompleto.includes(this.searchQuery) ||
             ultimoMensaje.includes(this.searchQuery) ||
             usuario.includes(this.searchQuery);
    });
  }

  abrirConversacion(chat: ConversacionUsuario) {
    this.router.navigate(['/home/conversacion', chat.id]);
  }

  formatearFecha(fecha?: string): string {
    if (!fecha) return '';
    
    const fechaMensaje = new Date(fecha);
    const ahora = new Date();
    const diff = ahora.getTime() - fechaMensaje.getTime();
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(diff / 3600000);
    const dias = Math.floor(diff / 86400000);

    if (minutos < 1) return 'Ahora';
    if (minutos < 60) return `Hace ${minutos} min`;
    if (horas < 24) return `${fechaMensaje.getHours()}:${fechaMensaje.getMinutes().toString().padStart(2, '0')}`;
    if (dias === 1) return 'Ayer';
    if (dias < 7) return `Hace ${dias} días`;
    
    return `${fechaMensaje.getDate()}/${fechaMensaje.getMonth() + 1}/${fechaMensaje.getFullYear()}`;
  }

  getNombreCompleto(usuario: any): string {
    return `${usuario.nombre} ${usuario.apellido}`;
  }
}
