import { chatDatabase } from '../database/chat.database';
import { Conversacion, Mensaje, ConversacionConUsuario, MensajeConRemitente, CrearMensajeRequest } from '../interfaces';
import { socketService, MensajeRealTime } from './socket.service';

/**
 * Servicio de Chat
 * Maneja la lógica de negocio para conversaciones y mensajes
 */
class ChatService {
  
  /**
   * Obtener todas las conversaciones de un usuario
   */
  async obtenerConversaciones(userId: string): Promise<ConversacionConUsuario[]> {
    return await chatDatabase.getConversacionesByUserId(userId);
  }

  /**
   * Obtener una conversación específica
   */
  async obtenerConversacion(conversacionId: string, userId: string): Promise<ConversacionConUsuario | undefined> {
    return await chatDatabase.getConversacionById(conversacionId, userId);
  }

  /**
   * Obtener o crear una conversación con otro usuario
   */
  async obtenerOCrearConversacion(userId: string, otroUserId: string, servicioId?: string): Promise<Conversacion> {
    return await chatDatabase.findOrCreateConversacion(userId, otroUserId, servicioId);
  }

  /**
   * Obtener mensajes de una conversación
   */
  async obtenerMensajes(conversacionId: string, userId: string, limit: number = 50, offset: number = 0): Promise<MensajeConRemitente[]> {
    // Verificar que el usuario pertenece a la conversación
    const conversacion = await chatDatabase.getConversacionById(conversacionId, userId);
    if (!conversacion) {
      throw new Error('Conversación no encontrada o no tienes acceso');
    }

    return await chatDatabase.getMensajesByConversacionId(conversacionId, limit, offset);
  }

  /**
   * Enviar un mensaje y notificar en tiempo real
   */
  async enviarMensaje(userId: string, datos: CrearMensajeRequest, remitenteInfo?: { nombre: string; apellido: string; usuario: string; url_avatar?: string }): Promise<MensajeConRemitente> {
    let conversacionId = datos.conversacion_id;

    // Si no hay conversación pero hay destinatario, crear o encontrar conversación
    if (!conversacionId && datos.destinatario_id) {
      const conversacion = await chatDatabase.findOrCreateConversacion(userId, datos.destinatario_id);
      conversacionId = conversacion.id;
    }

    if (!conversacionId) {
      throw new Error('Se requiere conversacion_id o destinatario_id');
    }

    // Verificar que el usuario pertenece a la conversación
    const conversacion = await chatDatabase.getConversacionById(conversacionId, userId);
    if (!conversacion) {
      throw new Error('Conversación no encontrada o no tienes acceso');
    }

    // Crear el mensaje
    const mensaje = await chatDatabase.createMensaje(
      conversacionId,
      userId,
      datos.tipo_mensaje || 'texto',
      datos.contenido,
      datos.url_media,
      datos.respuesta_a_mensaje_id
    );

    // Construir el mensaje con información del remitente para tiempo real
    const mensajeConRemitente: MensajeRealTime = {
      id: mensaje.id,
      conversacion_id: mensaje.conversacion_id,
      remitente_id: mensaje.remitente_id,
      tipo_mensaje: mensaje.tipo_mensaje,
      contenido: mensaje.contenido || '',
      url_media: mensaje.url_media,
      creado_en: mensaje.creado_en.toISOString(),
      remitente: {
        id: userId,
        nombre: remitenteInfo?.nombre || 'Usuario',
        apellido: remitenteInfo?.apellido || '',
        usuario: remitenteInfo?.usuario || '',
        url_avatar: remitenteInfo?.url_avatar
      }
    };

    // Emitir el mensaje a todos los que están en la conversación
    socketService.emitNewMessage(conversacionId, mensajeConRemitente);

    // Notificar al otro usuario para actualizar su lista de conversaciones
    const otroUsuarioId = conversacion.participante_1_id === userId 
      ? conversacion.participante_2_id 
      : conversacion.participante_1_id;
    
    socketService.notifyNewMessage(otroUsuarioId, conversacionId, mensajeConRemitente);

    // Retornar el mensaje con la información del remitente
    return {
      ...mensaje,
      remitente: mensajeConRemitente.remitente
    };
  }

  /**
   * Marcar mensajes como leídos
   */
  async marcarComoLeido(conversacionId: string, userId: string): Promise<void> {
    // Verificar que el usuario pertenece a la conversación
    const conversacion = await chatDatabase.getConversacionById(conversacionId, userId);
    if (!conversacion) {
      throw new Error('Conversación no encontrada o no tienes acceso');
    }

    await chatDatabase.marcarMensajesComoLeidos(conversacionId, userId);
  }

  /**
   * Eliminar un mensaje
   */
  async eliminarMensaje(mensajeId: string, userId: string): Promise<boolean> {
    return await chatDatabase.eliminarMensaje(mensajeId, userId);
  }

  /**
   * Archivar una conversación
   */
  async archivarConversacion(conversacionId: string, userId: string): Promise<boolean> {
    return await chatDatabase.archivarConversacion(conversacionId, userId);
  }
}

export const chatService = new ChatService();
