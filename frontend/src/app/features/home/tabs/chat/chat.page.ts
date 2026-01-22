import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
  cargandoEnSegundoPlano = false; // Nueva variable para carga en segundo plano
  error: string | null = null;
  searchQuery = '';
  
  private subscriptions: Subscription[] = [];
  private currentUserId: string | null = null;

  constructor(
    private router: Router,
    private chatService: ChatService,
    private socketService: SocketService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    // Esperar a que la autenticación esté inicializada
    await this.authService.waitForAuthInit();
    
    // Obtener el usuario actual primero
    this.listenToAuthChanges();
    
    // 1. Mostrar datos del caché inmediatamente
    this.mostrarConversacionesDelCache();
    
    // 2. Cargar datos frescos del servidor en segundo plano
    this.cargarConversacionesEnSegundoPlano();
    
    // 3. Suscribirse a cambios en tiempo real
    this.suscribirseACambiosDeConversaciones();
    
    this.initializeSocket();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Mostrar conversaciones del caché inmediatamente (carga instantánea)
   */
  private mostrarConversacionesDelCache(): void {
    const conversacionesCache = this.chatService.getConversacionesCache();
    if (conversacionesCache.length > 0) {
      this.conversaciones = conversacionesCache;
      this.aplicarFiltro();
      this.cdr.detectChanges();
    }
  }

  /**
   * Suscribirse a cambios de conversaciones (actualizaciones en tiempo real desde el servicio)
   */
  private suscribirseACambiosDeConversaciones(): void {
    const sub = this.chatService.conversaciones$.subscribe(conversaciones => {
      if (conversaciones.length > 0) {
        this.conversaciones = conversaciones;
        this.aplicarFiltro();
        this.cdr.detectChanges();
      }
    });
    this.subscriptions.push(sub);
  }

  /**
   * Cargar conversaciones del servidor en segundo plano (sin mostrar loading)
   */
  private async cargarConversacionesEnSegundoPlano(): Promise<void> {
    try {
      this.cargandoEnSegundoPlano = true;
      await this.chatService.obtenerConversaciones();
      // El servicio ya actualiza el BehaviorSubject, así que se actualiza automáticamente
    } catch (error) {
      console.error('Error al cargar conversaciones en segundo plano:', error);
      // Si hay error y no hay caché, mostrar el error
      if (this.conversaciones.length === 0) {
        this.error = 'Error al cargar las conversaciones';
      }
    } finally {
      this.cargandoEnSegundoPlano = false;
    }
  }

  /**
   * Recargar conversaciones cada vez que se entra a la vista
   */
  ionViewDidEnter() {
    // Mostrar caché primero
    this.mostrarConversacionesDelCache();
    // Luego actualizar en segundo plano
    this.cargarConversacionesEnSegundoPlano();
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
    
    // Suscribirse a nuevos mensajes para actualizar la lista de conversaciones
    const newMessageSub = this.socketService.newMessage$.subscribe((mensaje: MensajeRealTime) => {
      console.log('📩 newMessage$ recibido:', mensaje);
      this.actualizarConversacionConNuevoMensaje(mensaje);
    });
    this.subscriptions.push(newMessageSub);
    
    // Suscribirse a actualizaciones de conversación (para cuando no estás en la conversación)
    const convUpdateSub = this.socketService.conversationUpdate$.subscribe((update: ConversationUpdate) => {
      console.log('📬 conversationUpdate$ recibido:', update);
      this.actualizarConversacionDesdeUpdate(update);
    });
    this.subscriptions.push(convUpdateSub);
  }

  /**
   * Actualizar conversación desde evento de update (cuando no estás en la conversación)
   */
  private actualizarConversacionDesdeUpdate(update: ConversationUpdate) {
    const convIndex = this.conversaciones.findIndex(c => c.id === update.conversacionId);
    
    if (convIndex !== -1) {
      const conv = this.conversaciones[convIndex];
      const esPropio = update.remitenteId === this.currentUserId;
      
      this.conversaciones[convIndex] = {
        ...conv,
        texto_ultimo_mensaje: update.ultimoMensaje,
        ultimo_mensaje_en: update.ultimoMensajeEn,
        no_leidos: esPropio ? conv.no_leidos : (conv.no_leidos || 0) + 1
      };
      
      // Mover la conversación al inicio
      const [conversacionActualizada] = this.conversaciones.splice(convIndex, 1);
      this.conversaciones.unshift(conversacionActualizada);
      
      this.aplicarFiltro();
      this.cdr.detectChanges();
    } else {
      // Nueva conversación, recargar todas
      this.cargarConversaciones();
    }
  }

  /**
   * Actualizar una conversación cuando llega un nuevo mensaje
   */
  private actualizarConversacionConNuevoMensaje(mensaje: MensajeRealTime) {
    console.log('Nuevo mensaje recibido en chat list:', mensaje);
    console.log('currentUserId:', this.currentUserId);
    
    const convIndex = this.conversaciones.findIndex(c => c.id === mensaje.conversacion_id);
    
    if (convIndex !== -1) {
      // Actualizar la conversación existente
      const conv = this.conversaciones[convIndex];
      const esPropio = mensaje.remitente_id === this.currentUserId;
      
      console.log('Conversación encontrada, esPropio:', esPropio);
      
      this.conversaciones[convIndex] = {
        ...conv,
        texto_ultimo_mensaje: mensaje.contenido,
        ultimo_mensaje_en: mensaje.creado_en,
        no_leidos: esPropio ? conv.no_leidos : (conv.no_leidos || 0) + 1
      };
      
      // Mover la conversación al inicio (más reciente)
      const [conversacionActualizada] = this.conversaciones.splice(convIndex, 1);
      this.conversaciones.unshift(conversacionActualizada);
      
      this.aplicarFiltro();
      this.cdr.detectChanges();
    } else {
      // Si la conversación no existe en la lista, recargar todas
      console.log('Conversación no encontrada, recargando todas');
      this.cargarConversaciones();
    }
  }

  /**
   * Escuchar cambios en la autenticación
   */
  private listenToAuthChanges() {
    const authSub = this.authService.currentUser$.subscribe(user => {
      const newUserId = user?.id || null;
      
      // Si el usuario cambió (diferente ID o de no-autenticado a autenticado)
      if (this.currentUserId !== null && this.currentUserId !== newUserId) {
        // Limpiar datos anteriores
        this.conversaciones = [];
        this.conversacionesFiltradas = [];
        this.searchQuery = '';
        
        // Recargar conversaciones si hay un usuario autenticado
        if (newUserId) {
          this.cargarConversaciones();
        }
      }
      
      this.currentUserId = newUserId;
    });
    
    this.subscriptions.push(authSub);
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
      // Solo mostrar loading si es pull-to-refresh o si no hay datos cacheados
      if (event || this.conversaciones.length === 0) {
        this.cargando = true;
      }
      this.error = null;
      
      const conversaciones = await this.chatService.obtenerConversaciones();
      this.conversaciones = conversaciones;
      this.aplicarFiltro();
    } catch (error) {
      console.error('Error al cargar conversaciones:', error);
      // Solo mostrar error si no hay datos cacheados
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
    // Primero filtrar solo conversaciones que tienen al menos un mensaje
    const conversacionesConMensajes = this.conversaciones.filter(chat => 
      chat.texto_ultimo_mensaje && chat.texto_ultimo_mensaje.trim() !== ''
    );

    if (!this.searchQuery) {
      this.conversacionesFiltradas = conversacionesConMensajes;
      return;
    }

    this.conversacionesFiltradas = conversacionesConMensajes.filter(chat => {
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
