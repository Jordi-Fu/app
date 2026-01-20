import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.config';

/**
 * Interfaz para el payload del JWT
 */
interface JwtPayload {
  userId: string;
  username: string;
  email: string;
}

/**
 * Interfaz para un mensaje en tiempo real
 */
export interface MensajeRealTime {
  id: string;
  conversacion_id: string;
  remitente_id: string;
  tipo_mensaje: string;
  contenido: string;
  url_media?: string;
  creado_en: string;
  remitente: {
    id: string;
    nombre: string;
    apellido: string;
    usuario: string;
    url_avatar?: string;
  };
}

/**
 * Servicio de WebSocket para comunicación en tiempo real
 */
class SocketService {
  private io: Server | null = null;
  
  // Mapeo de userId -> socketId para saber qué usuarios están conectados
  private userSockets: Map<string, Set<string>> = new Map();

  /**
   * Inicializar Socket.IO con el servidor HTTP
   */
  initialize(httpServer: HttpServer): Server {
    this.io = new Server(httpServer, {
      cors: {
        origin: ENV.CORS_ORIGINS,
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    this.setupMiddleware();
    this.setupEventHandlers();

    console.log('🔌 Socket.IO inicializado');
    return this.io;
  }

  /**
   * Middleware de autenticación para Socket.IO
   */
  private setupMiddleware(): void {
    if (!this.io) return;

    this.io.use((socket: Socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          console.log('🔴 Socket: Token no proporcionado');
          return next(new Error('Token de autenticación requerido'));
        }

        const decoded = jwt.verify(token, ENV.JWT_SECRET) as JwtPayload;
        
        // Adjuntar información del usuario al socket
        (socket as any).userId = decoded.userId;
        (socket as any).username = decoded.username;
        
        console.log(`🟢 Socket: Usuario ${decoded.username} autenticado`);
        next();
      } catch (error) {
        console.log('🔴 Socket: Token inválido');
        next(new Error('Token inválido'));
      }
    });
  }

  /**
   * Configurar manejadores de eventos
   */
  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket: Socket) => {
      const userId = (socket as any).userId;
      const username = (socket as any).username;
      
      console.log(`👤 Usuario conectado: ${username} (${userId}) - Socket: ${socket.id}`);

      // Registrar el socket del usuario
      this.addUserSocket(userId, socket.id);

      // Unir al usuario a su room personal (para mensajes directos)
      socket.join(`user:${userId}`);

      // Evento: Unirse a una conversación específica
      socket.on('join:conversation', (conversacionId: string) => {
        socket.join(`conversation:${conversacionId}`);
        console.log(`📥 ${username} se unió a la conversación ${conversacionId}`);
      });

      // Evento: Salir de una conversación
      socket.on('leave:conversation', (conversacionId: string) => {
        socket.leave(`conversation:${conversacionId}`);
        console.log(`📤 ${username} salió de la conversación ${conversacionId}`);
      });

      // Evento: Usuario está escribiendo
      socket.on('typing:start', (data: { conversacionId: string }) => {
        socket.to(`conversation:${data.conversacionId}`).emit('user:typing', {
          conversacionId: data.conversacionId,
          userId,
          username
        });
      });

      // Evento: Usuario dejó de escribir
      socket.on('typing:stop', (data: { conversacionId: string }) => {
        socket.to(`conversation:${data.conversacionId}`).emit('user:stopped-typing', {
          conversacionId: data.conversacionId,
          userId
        });
      });

      // Evento: Desconexión
      socket.on('disconnect', (reason) => {
        console.log(`👋 Usuario desconectado: ${username} - Razón: ${reason}`);
        this.removeUserSocket(userId, socket.id);
      });
    });
  }

  /**
   * Agregar socket de un usuario
   */
  private addUserSocket(userId: string, socketId: string): void {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(socketId);
  }

  /**
   * Eliminar socket de un usuario
   */
  private removeUserSocket(userId: string, socketId: string): void {
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.delete(socketId);
      if (sockets.size === 0) {
        this.userSockets.delete(userId);
      }
    }
  }

  /**
   * Verificar si un usuario está conectado
   */
  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId) && this.userSockets.get(userId)!.size > 0;
  }

  /**
   * Emitir nuevo mensaje a una conversación
   */
  emitNewMessage(conversacionId: string, mensaje: MensajeRealTime): void {
    if (!this.io) return;
    
    console.log(`📨 Emitiendo mensaje a conversación ${conversacionId}`);
    this.io.to(`conversation:${conversacionId}`).emit('message:new', mensaje);
  }

  /**
   * Emitir mensaje a un usuario específico
   */
  emitToUser(userId: string, event: string, data: any): void {
    if (!this.io) return;
    
    this.io.to(`user:${userId}`).emit(event, data);
  }

  /**
   * Notificar nuevo mensaje a un usuario (para actualizar lista de conversaciones)
   */
  notifyNewMessage(userId: string, conversacionId: string, mensaje: MensajeRealTime): void {
    if (!this.io) return;
    
    this.io.to(`user:${userId}`).emit('conversation:update', {
      conversacionId,
      ultimoMensaje: mensaje.contenido,
      ultimoMensajeEn: mensaje.creado_en,
      remitenteId: mensaje.remitente_id
    });
  }

  /**
   * Obtener instancia de Socket.IO
   */
  getIO(): Server | null {
    return this.io;
  }
}

export const socketService = new SocketService();
