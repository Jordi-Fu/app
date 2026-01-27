import { chatDatabase } from '../database/chat.database';
import { Conversacion, ConversacionConUsuario, MensajeConRemitente } from '../interfaces';

/**
 * Modelo de Chat
 * Lógica de negocio relacionada con conversaciones y mensajes
 */
class ChatModel {
  /**
   * Obtener conversaciones de un usuario
   */
  async getConversacionesByUserId(userId: string): Promise<ConversacionConUsuario[]> {
    return chatDatabase.getConversacionesByUserId(userId);
  }

  /**
   * Obtener conversación por ID
   */
  async getConversacionById(conversacionId: string, userId: string): Promise<ConversacionConUsuario | undefined> {
    return chatDatabase.getConversacionById(conversacionId, userId);
  }

  /**
   * Encontrar o crear conversación
   */
  async findOrCreateConversacion(userId: string, otroUserId: string, servicioId?: string): Promise<Conversacion> {
    return chatDatabase.findOrCreateConversacion(userId, otroUserId, servicioId);
  }

  /**
   * Obtener mensajes de una conversación
   */
  async getMensajesByConversacionId(conversacionId: string, limit: number = 50, offset: number = 0): Promise<MensajeConRemitente[]> {
    return chatDatabase.getMensajesByConversacionId(conversacionId, limit, offset);
  }

  /**
   * Crear un mensaje
   */
  async createMensaje(
    conversacionId: string,
    remitenteId: string,
    tipoMensaje: string,
    contenido: string | null,
    urlMedia?: string | null,
    respuestaAMensajeId?: string | null
  ) {
    return chatDatabase.createMensaje(
      conversacionId,
      remitenteId,
      tipoMensaje,
      contenido || undefined,
      urlMedia || undefined,
      respuestaAMensajeId || undefined
    );
  }

  /**
   * Marcar mensajes como leídos
   */
  async marcarMensajesComoLeidos(conversacionId: string, userId: string): Promise<void> {
    return chatDatabase.marcarMensajesComoLeidos(conversacionId, userId);
  }

  /**
   * Eliminar un mensaje
   */
  async eliminarMensaje(mensajeId: string, userId: string): Promise<boolean> {
    return chatDatabase.eliminarMensaje(mensajeId, userId);
  }

  /**
   * Archivar una conversación
   */
  async archivarConversacion(conversacionId: string, userId: string): Promise<boolean> {
    return chatDatabase.archivarConversacion(conversacionId, userId);
  }
}

export const chatModel = new ChatModel();
