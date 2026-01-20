import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.config';
import { pool } from '../config/database.config';

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
          return next(new Error('Token de autenticación requerido'));
        }

        const decoded = jwt.verify(token, ENV.JWT_SECRET) as JwtPayload;
        
        // Adjuntar información del usuario al socket
        (socket as any).userId = decoded.userId;
        (socket as any).username = decoded.username;
        
        next();
      } catch (error) {
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
      

      // Registrar el socket del usuario
      this.addUserSocket(userId, socket.id);
      
      // Actualizar estado a online en la base de datos y notificar
      this.setUserOnlineStatus(userId, true);

      // Unir al usuario a su room personal (para mensajes directos)
      socket.join(`user:${userId}`);

      // Evento: Unirse a una conversación específica
      socket.on('join:conversation', (conversacionId: string) => {
        socket.join(`conversation:${conversacionId}`);
      });

      // Evento: Salir de una conversación
      socket.on('leave:conversation', (conversacionId: string) => {
        socket.leave(`conversation:${conversacionId}`);
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
        this.removeUserSocket(userId, socket.id);
        
        // Solo marcar offline si no tiene más sockets conectados
        if (!this.isUserOnline(userId)) {
          this.setUserOnlineStatus(userId, false);
        }
      });
    });
  }

  /**
   * Actualizar estado online/offline del usuario en la base de datos y notificar
   */
  private async setUserOnlineStatus(userId: string, isOnline: boolean): Promise<void> {
    try {
      // Actualizar en la base de datos
      await pool.query(
        `UPDATE usuarios SET esta_en_linea = $1, ultima_actividad = CURRENT_TIMESTAMP WHERE id = $2`,
        [isOnline, userId]
      );
      
      
      // Emitir evento a todos los usuarios para que actualicen el estado
      if (this.io) {
        this.io.emit('user:status-change', {
          userId,
          isOnline,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error al actualizar estado online del usuario:', error);
    }
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
