import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonSpinner, IonFooter, ViewDidEnter, ViewWillLeave, NavController } from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';
import { ChatService, ConversacionUsuario, MensajeConRemitente, SocketService, MensajeRealTime, UserStatusEvent, AuthService, getAvatarUrl } from '../../../../../core/services';
import { StorageService } from '../../../../../core/services';

// Constante de clave de storage (igual que en auth.service.ts)
const USER_KEY = 'kurro_user';

@Component({
  selector: 'app-conversacion',
  templateUrl: './conversacion.page.html',
  styleUrls: ['./conversacion.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonSpinner,
    IonFooter
  ]
})
export class ConversacionPage implements OnInit, OnDestroy, AfterViewInit, ViewDidEnter, ViewWillLeave {
  @ViewChild(IonContent) content!: IonContent;
  
  chatId: string = '';
  conversacion: ConversacionUsuario | null = null;
  mensajes: MensajeConRemitente[] = [];
  nuevoMensaje: string = '';
  usuarioActualId: string = '';
  cargando = false;
  enviando = false;
  error: string | null = null;
  otroUsuarioEscribiendo = false;
  
  private navController = inject(NavController);
  // Subscripciones
  private subscriptions: Subscription[] = [];
  private typingTimeout: any = null;
  
  // Control de scroll automático
  private isNearBottom = true;
  private readonly SCROLL_THRESHOLD = 150; // Pixeles desde el fondo para considerar "cerca"

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private chatService: ChatService,
    private storageService: StorageService,
    private socketService: SocketService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    // Obtener ID del usuario actual primero
    const user = await this.storageService.getObject<any>(USER_KEY);
    this.usuarioActualId = user?.id || '';
    
    // Suscribirse a cambios en los parámetros de ruta
    this.route.paramMap.subscribe(async params => {
      const newChatId = params.get('id') || '';
      
      // Si el chatId cambió, recargar todo
      if (newChatId !== this.chatId) {
        // Salir de la conversación anterior si existe
        if (this.chatId) {
          this.socketService.leaveConversation(this.chatId);
        }
        
        // Limpiar estado anterior
        this.mensajes = [];
        this.conversacion = null;
        this.otroUsuarioEscribiendo = false;
        
        this.chatId = newChatId;
        
        if (this.chatId) {
          // Cargar datos frescos del servidor
          await this.cargarConversacion();
          
          // Unirse a la nueva conversación
          this.socketService.joinConversation(this.chatId);
        }
      }
    });
    
    // Inicializar WebSocket
    await this.initializeSocket();
    
    // Escuchar cambios de autenticación
    this.listenToAuthChanges();
  }

  ngAfterViewInit() {
    // Scroll al fondo cuando la vista está lista
    setTimeout(() => this.scrollToBottom(), 200);
  }

  async ionViewDidEnter() {
    // Recargar mensajes cada vez que se entra a la vista
    if (this.chatId) {
      // Cargar datos frescos del servidor
      await this.cargarConversacion();
      
      // Volver a unirse a la conversación en el socket
      this.socketService.joinConversation(this.chatId);
    }
    
    // Scroll al fondo cada vez que se entra a la vista
    setTimeout(() => this.scrollToBottom(), 100);
  }

  ionViewWillLeave() {
    // Salir de la conversación cuando se abandone la vista
    if (this.chatId) {
      this.socketService.leaveConversation(this.chatId);
    }
  }

  ngOnDestroy() {
    // Limpiar subscripciones
    this.subscriptions.forEach(sub => sub.unsubscribe());
    
    // Salir de la conversación en el socket
    if (this.chatId) {
      this.socketService.leaveConversation(this.chatId);
    }
    
    // Limpiar timeout de typing
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
  }

  /**
   * Escuchar cambios en la autenticación
   */
  private listenToAuthChanges() {
    const authSub = this.authService.currentUser$.subscribe(user => {
      const newUserId = user?.id || '';
      
      // Si el usuario cambió y no es el mismo que el actual
      if (this.usuarioActualId && newUserId && this.usuarioActualId !== newUserId) {
       
        
        // Regresar a la lista de conversaciones
        //this.router.navigate(['/home/chat']);
      }
    });
    
    this.subscriptions.push(authSub);
  }

  /**
   * Inicializar conexión WebSocket y suscribirse a eventos
   */
  private async initializeSocket() {
    try {
      // Conectar al socket si no está conectado
      await this.socketService.connect();
      
      // Suscribirse a nuevos mensajes
      const newMessageSub = this.socketService.newMessage$.subscribe((mensaje: MensajeRealTime) => {
        
        // Solo agregar si es de esta conversación y no es un mensaje propio
        if (mensaje.conversacion_id === this.chatId && mensaje.remitente_id !== this.usuarioActualId) {
          // Verificar que el mensaje no exista ya
          const existe = this.mensajes.some(m => m.id === mensaje.id);
          if (!existe) {
            const nuevoMensaje: MensajeConRemitente = {
              id: mensaje.id,
              conversacion_id: mensaje.conversacion_id,
              remitente_id: mensaje.remitente_id,
              tipo_mensaje: mensaje.tipo_mensaje as 'texto' | 'imagen' | 'archivo' | 'ubicacion' | 'audio' | 'video',
              contenido: mensaje.contenido,
              url_media: mensaje.url_media,
              esta_leido: false,
              creado_en: mensaje.creado_en,
              remitente: mensaje.remitente
            };
            
            this.mensajes.push(nuevoMensaje);
            this.otroUsuarioEscribiendo = false;
            this.cdr.detectChanges();
            
            // Solo hacer scroll si el usuario está cerca del fondo
            if (this.isNearBottom) {
              setTimeout(() => this.scrollToBottom(), 100);
            }
            
            // Marcar como leído
            this.chatService.marcarComoLeido(this.chatId).catch(() => {});
          }
        }
      });
      this.subscriptions.push(newMessageSub);
      
      // Suscribirse a evento de typing
      const typingSub = this.socketService.userTyping$.subscribe((event) => {
        if (event.conversacionId === this.chatId && event.userId !== this.usuarioActualId) {
          this.otroUsuarioEscribiendo = true;
          this.cdr.detectChanges();
        }
      });
      this.subscriptions.push(typingSub);
      
      // Suscribirse a evento de stopped typing
      const stoppedTypingSub = this.socketService.userStoppedTyping$.subscribe((event) => {
        if (event.conversacionId === this.chatId && event.userId !== this.usuarioActualId) {
          this.otroUsuarioEscribiendo = false;
          this.cdr.detectChanges();
        }
      });
      this.subscriptions.push(stoppedTypingSub);
      
      // Suscribirse a cambios de estado online/offline del otro usuario
      const statusSub = this.socketService.userStatusChange$.subscribe((event: UserStatusEvent) => {
        if (this.conversacion && this.conversacion.otro_usuario.id === event.userId) {
          this.conversacion = {
            ...this.conversacion,
            otro_usuario: {
              ...this.conversacion.otro_usuario,
              esta_en_linea: event.isOnline
            }
          };
          this.cdr.detectChanges();
        }
      });
      this.subscriptions.push(statusSub);
      
    } catch (error) {
      console.error('Error al inicializar socket:', error);
    }
  }

  async cargarConversacion() {
    try {
      // Solo mostrar loading si no hay mensajes cacheados
      if (this.mensajes.length === 0) {
        this.cargando = true;
      }
      this.error = null;

      // Cargar datos de la conversación
      this.conversacion = await this.chatService.obtenerConversacion(this.chatId);
      
      // Cargar mensajes
      this.mensajes = await this.chatService.obtenerMensajes(this.chatId);
      
      // Marcar mensajes como leídos
      await this.chatService.marcarComoLeido(this.chatId);

      // Forzar detección de cambios para aplicar estilos
      this.cdr.detectChanges();
      
      // Scroll al fondo después de que la vista esté completamente renderizada
      setTimeout(() => {
        this.scrollToBottom();
        this.isNearBottom = true; // Marcar que estamos abajo al cargar
      }, 100);
    } catch (error) {
      console.error('Error al cargar conversación:', error);
      // Solo mostrar error si no hay datos cacheados
      if (this.mensajes.length === 0) {
        this.error = 'Error al cargar la conversación';
      }
    } finally {
      this.cargando = false;
      this.cdr.detectChanges();
    }
  }

  /**
   * Manejar evento de input para notificar typing
   */
  onInputChange() {
    // Notificar que está escribiendo
    this.socketService.startTyping(this.chatId);
    
    // Limpiar timeout anterior
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
    
    // Detener typing después de 2 segundos de inactividad
    this.typingTimeout = setTimeout(() => {
      this.socketService.stopTyping(this.chatId);
    }, 2000);
  }

  async enviarMensaje() {
    if (!this.nuevoMensaje.trim() || this.enviando) return;

    // Detener notificación de typing
    this.socketService.stopTyping(this.chatId);
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }

    try {
      this.enviando = true;
      
      const contenido = this.nuevoMensaje;
      this.nuevoMensaje = ''; // Limpiar inmediatamente para mejor UX
      
      const mensaje = await this.chatService.enviarMensaje({
        conversacion_id: this.chatId,
        tipo_mensaje: 'texto',
        contenido: contenido
      });


      // Agregar el mensaje a la lista localmente
      // El socket también lo enviará, pero verificamos duplicados
      const existe = this.mensajes.some(m => m.id === mensaje.id);
      if (!existe) {
        const nuevoMensajeObj: MensajeConRemitente = {
          id: mensaje.id,
          conversacion_id: mensaje.conversacion_id,
          remitente_id: mensaje.remitente_id,
          tipo_mensaje: mensaje.tipo_mensaje,
          contenido: mensaje.contenido,
          url_media: mensaje.url_media,
          esta_leido: mensaje.esta_leido || false,
          leido_en: mensaje.leido_en,
          creado_en: mensaje.creado_en,
          remitente: mensaje.remitente || {
            id: mensaje.remitente_id,
            nombre: 'Tú',
            apellido: '',
            usuario: ''
          }
        };
        
        this.mensajes.push(nuevoMensajeObj);
      }
      
      // Forzar detección de cambios
      this.cdr.detectChanges();
      
      setTimeout(() => this.scrollToBottom(), 100);
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      alert('Error al enviar el mensaje');
    } finally {
      this.enviando = false;
      this.cdr.detectChanges();
    }
  }

  /**
   * Scroll al fondo del chat usando IonContent
   */
  scrollToBottom() {
    if (this.content) {
      this.content.scrollToBottom(300);
    }
  }

  /**
   * Detectar si el usuario está cerca del fondo del chat
   * Se llama desde el evento ionScroll del ion-content
   */
  async onScroll(event: any) {
    if (this.content) {
      const scrollElement = await this.content.getScrollElement();
      const distanceFromBottom = scrollElement.scrollHeight - scrollElement.scrollTop - scrollElement.clientHeight;
      this.isNearBottom = distanceFromBottom < this.SCROLL_THRESHOLD;
    }
  }


  formatearFecha(fecha: string): string {
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

  esPropio(mensaje: MensajeConRemitente): boolean {
    return mensaje.remitente_id === this.usuarioActualId;
  }

  /**
   * Verifica si el mensaje en el índice dado es el último mensaje consecutivo del otro usuario.
   * Solo muestra el avatar en el último mensaje de un grupo de mensajes del otro usuario.
   */
  esUltimoMensajeDelOtro(index: number): boolean {
    const mensaje = this.mensajes[index];
    
    // Si es un mensaje propio, no necesita avatar
    if (this.esPropio(mensaje)) {
      return false;
    }
    
    // Si es el último mensaje de la lista, mostrar avatar
    if (index === this.mensajes.length - 1) {
      return true;
    }
    
    // Verificar si el siguiente mensaje es del mismo usuario
    const siguienteMensaje = this.mensajes[index + 1];
    
    // Si el siguiente mensaje es propio o de otro remitente, este es el último del grupo
    return this.esPropio(siguienteMensaje) || siguienteMensaje.remitente_id !== mensaje.remitente_id;
  }

  getNombreCompleto(): string {
    if (!this.conversacion) return '';
    const usuario = this.conversacion.otro_usuario;
    return `${usuario.nombre} ${usuario.apellido}`;
  }

  getOtroUsuarioAvatar(): string {
    return getAvatarUrl(this.conversacion?.otro_usuario?.url_avatar);
  }

  getMensajeAvatar(mensaje: MensajeConRemitente): string {
    if (!mensaje.remitente) {
      return this.getOtroUsuarioAvatar();
    }
    return getAvatarUrl(mensaje.remitente.url_avatar);
  }

  goToProvider() {
    if (this.conversacion?.otro_usuario.id) {
      this.router.navigate(['/home/usuario', this.conversacion?.otro_usuario.id]);
    }
  }

  goBack() {
    this.navController.back();
  }
}
