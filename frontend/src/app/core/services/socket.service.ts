import { Injectable, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { StorageService } from './storage.service';
import { 
  MensajeConRemitente, 
  MensajeRealTime, 
  ConversationUpdate, 
  TypingEvent, 
  UserStatusEvent 
} from '../interfaces';

const ACCESS_TOKEN_KEY = 'kurro_access_token';

@Injectable({
  providedIn: 'root'
})
export class SocketService implements OnDestroy {
  private socket: Socket | null = null;
  private readonly baseUrl: string;
  
  // Subjects para emitir eventos
  private newMessageSubject = new Subject<MensajeRealTime>();
  private conversationUpdateSubject = new Subject<ConversationUpdate>();
  private userTypingSubject = new Subject<TypingEvent>();
  private userStoppedTypingSubject = new Subject<{ conversacionId: string; userId: string }>();
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);
  private userStatusChangeSubject = new Subject<UserStatusEvent>();
  
  // Observables públicos
  public newMessage$ = this.newMessageSubject.asObservable();
  public conversationUpdate$ = this.conversationUpdateSubject.asObservable();
  public userTyping$ = this.userTypingSubject.asObservable();
  public userStoppedTyping$ = this.userStoppedTypingSubject.asObservable();
  public connectionStatus$ = this.connectionStatusSubject.asObservable();
  public userStatusChange$ = this.userStatusChangeSubject.asObservable();

  constructor(private storageService: StorageService) {
    // Extraer la URL base del API (sin /api)
    this.baseUrl = environment.apiUrl.replace('/api', '');
  }

  /**
   * Conectar al servidor de WebSocket
   */
  async connect(): Promise<void> {
    if (this.socket?.connected) {
      return;
    }

    try {
      const token = await this.storageService.get(ACCESS_TOKEN_KEY);
      
      if (!token) {
        return;
      }

      console.log('🔌 Conectando al socket:', this.baseUrl);
      
      this.socket = io(this.baseUrl, {
        auth: { token },
        transports: ['polling', 'websocket'], // Polling primero es más compatible
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 10000,
        timeout: 30000, // 30 segundos de timeout
        forceNew: true
      });

      this.setupEventListeners();
    } catch (error) {
      console.error('🔴 Error al conectar socket:', error);
      // No lanzar error, solo loguear - la app puede funcionar sin socket
    }
  }

  /**
   * Configurar listeners de eventos
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Conexión exitosa
    this.socket.on('connect', () => {
      this.connectionStatusSubject.next(true);
    });

    // Desconexión
    this.socket.on('disconnect', (reason) => {
      this.connectionStatusSubject.next(false);
    });

    // Error de conexión
    this.socket.on('connect_error', (error) => {
      console.error('🔴 Error de conexión socket:', error.message);
      this.connectionStatusSubject.next(false);
    });

    // Nuevo mensaje en conversación
    this.socket.on('message:new', (mensaje: MensajeRealTime) => {
      this.newMessageSubject.next(mensaje);
    });

    // Actualización de conversación (para lista de chats)
    this.socket.on('conversation:update', (update: ConversationUpdate) => {
      this.conversationUpdateSubject.next(update);
    });

    // Usuario escribiendo
    this.socket.on('user:typing', (event: TypingEvent) => {
      this.userTypingSubject.next(event);
    });

    // Usuario dejó de escribir
    this.socket.on('user:stopped-typing', (event: { conversacionId: string; userId: string }) => {
      this.userStoppedTypingSubject.next(event);
    });

    // Cambio de estado online/offline de un usuario
    this.socket.on('user:status-change', (event: UserStatusEvent) => {
      this.userStatusChangeSubject.next(event);
    });
  }

  /**
   * Unirse a una conversación para recibir mensajes en tiempo real
   */
  joinConversation(conversacionId: string): void {
    if (!this.socket?.connected) {
      console.warn('🟡 Socket no conectado, intentando conectar...');
      this.connect().then(() => {
        setTimeout(() => {
          this.socket?.emit('join:conversation', conversacionId);
        }, 500);
      });
      return;
    }
    
    this.socket.emit('join:conversation', conversacionId);
  }

  /**
   * Salir de una conversación
   */
  leaveConversation(conversacionId: string): void {
    if (!this.socket?.connected) return;
    
    this.socket.emit('leave:conversation', conversacionId);
  }

  /**
   * Notificar que el usuario está escribiendo
   */
  startTyping(conversacionId: string): void {
    if (!this.socket?.connected) return;
    
    this.socket.emit('typing:start', { conversacionId });
  }

  /**
   * Notificar que el usuario dejó de escribir
   */
  stopTyping(conversacionId: string): void {
    if (!this.socket?.connected) return;
    
    this.socket.emit('typing:stop', { conversacionId });
  }

  /**
   * Verificar si está conectado
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Desconectar del servidor
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connectionStatusSubject.next(false);
    }
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
