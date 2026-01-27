import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, IonRefresher, IonRefresherContent, IonSpinner, ViewDidEnter } from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';
import { ChatService, ConversacionUsuario, SocketService, UserStatusEvent, AuthService, MensajeRealTime, ConversationUpdate, getAvatarUrl } from '../../../../core/services';

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
export class ChatPage implements OnInit, OnDestroy, ViewDidEnter {
  conversaciones: ConversacionUsuario[] = [];
  conversacionesFiltradas: ConversacionUsuario[] = [];
  cargando = false;
  error: string | null = null;
  searchQuery = '';
  
  private subscriptions: Subscription[] = [];
  private currentUserId: string | null = null;
  private socketInitialized = false;

  constructor(
    private router: Router,
    private chatService: ChatService,
    private socketService: SocketService,
    private authService: AuthService,
    private ngZone: NgZone
  ) {}

  async ngOnInit() {
    await this.authService.waitForAuthInit();
    this.listenToAuthChanges();
    await this.cargarConversaciones();
    await this.initializeSocket();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ionViewDidEnter() {
    this.cargarConversaciones();
  }

  /**
   * Inicializar socket y suscribirse a eventos
   */
  private async initializeSocket() {
    if (this.socketInitialized) return;
    
    await this.socketService.connect();
    
    const connectionSub = this.socketService.connectionStatus$.subscribe(() => {});
    this.subscriptions.push(connectionSub);
    
    const convUpdateSub = this.socketService.conversationUpdate$.subscribe((update: ConversationUpdate) => {
      this.ngZone.run(() => this.handleConversationUpdate(update));
    });
    this.subscriptions.push(convUpdateSub);
    
    const newMessageSub = this.socketService.newMessage$.subscribe((mensaje: MensajeRealTime) => {
      this.ngZone.run(() => this.handleNewMessage(mensaje));
    });
    this.subscriptions.push(newMessageSub);
    
    const statusSub = this.socketService.userStatusChange$.subscribe((event: UserStatusEvent) => {
      this.ngZone.run(() => this.handleUserStatusChange(event));
    });
    this.subscriptions.push(statusSub);
    
    this.socketInitialized = true;
  }

  /**
   * Manejar actualización de conversación desde socket
   */
  private handleConversationUpdate(update: ConversationUpdate) {
    const index = this.conversaciones.findIndex(c => c.id === update.conversacionId);
    
    if (index === -1) {
      this.cargarConversaciones();
      return;
    }
    
    const conv = this.conversaciones[index];
    const esPropio = update.remitenteId === this.currentUserId;
    
    // Crear conversación actualizada
    const conversacionActualizada: ConversacionUsuario = {
      ...conv,
      texto_ultimo_mensaje: update.ultimoMensaje,
      ultimo_mensaje_en: update.ultimoMensajeEn,
      no_leidos: esPropio ? conv.no_leidos : (conv.no_leidos || 0) + 1
    };
    
    // Crear nuevo array con la conversación al inicio
    const nuevasConversaciones = [
      conversacionActualizada,
      ...this.conversaciones.filter((_, i) => i !== index)
    ];
    
    this.conversaciones = nuevasConversaciones;
    this.aplicarFiltro();
  }

  /**
   * Manejar nuevo mensaje desde socket
   */
  private handleNewMessage(mensaje: MensajeRealTime) {
    const index = this.conversaciones.findIndex(c => c.id === mensaje.conversacion_id);
    
    if (index === -1) {
      this.cargarConversaciones();
      return;
    }
    
    const conv = this.conversaciones[index];
    const esPropio = mensaje.remitente_id === this.currentUserId;
    
    // Crear conversación actualizada
    const conversacionActualizada: ConversacionUsuario = {
      ...conv,
      texto_ultimo_mensaje: mensaje.contenido,
      ultimo_mensaje_en: mensaje.creado_en,
      no_leidos: esPropio ? conv.no_leidos : (conv.no_leidos || 0) + 1
    };
    
    // Crear nuevo array con la conversación al inicio
    const nuevasConversaciones = [
      conversacionActualizada,
      ...this.conversaciones.filter((_, i) => i !== index)
    ];
    
    this.conversaciones = nuevasConversaciones;
    this.aplicarFiltro();
  }

  /**
   * Manejar cambio de estado online/offline
   */
  private handleUserStatusChange(event: UserStatusEvent) {
    this.conversaciones = this.conversaciones.map(conv => {
      if (conv.otro_usuario.id === event.userId) {
        return {
          ...conv,
          otro_usuario: {
            ...conv.otro_usuario,
            esta_en_linea: event.isOnline
          }
        };
      }
      return conv;
    });
    this.aplicarFiltro();
  }

  /**
   * Escuchar cambios en la autenticación
   */
  private listenToAuthChanges() {
    const authSub = this.authService.currentUser$.subscribe(user => {
      const newUserId = user?.id || null;
      
      if (this.currentUserId !== null && this.currentUserId !== newUserId) {
        // Usuario cambió, limpiar datos
        this.conversaciones = [];
        this.conversacionesFiltradas = [];
        this.searchQuery = '';
        
        if (newUserId) {
          this.cargarConversaciones();
        }
      }
      
      this.currentUserId = newUserId;
    });
    
    this.subscriptions.push(authSub);
  }

  /**
   * Cargar conversaciones desde el servidor
   */
  async cargarConversaciones(event?: any) {
    try {
      if (event || this.conversaciones.length === 0) {
        this.cargando = true;
      }
      this.error = null;
      
      const conversaciones = await this.chatService.obtenerConversaciones();
      
      if (conversaciones && conversaciones.length > 0) {
        this.conversaciones = conversaciones;
        this.aplicarFiltro();
      } else if (this.conversaciones.length === 0) {
        this.conversaciones = [];
        this.conversacionesFiltradas = [];
      }
    } catch (error) {
      if (this.conversaciones.length === 0) {
        this.error = 'Error al cargar las conversaciones';
      }
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
      this.conversacionesFiltradas = [...this.conversaciones];
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

  getChatAvatar(chat: ConversacionUsuario): string {
    return getAvatarUrl(chat.otro_usuario.url_avatar);
  }
}
