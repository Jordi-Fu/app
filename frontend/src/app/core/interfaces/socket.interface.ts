/**
 * Interfaces para el servicio de WebSocket
 */

/**
 * Interfaz para mensaje en tiempo real
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
 * Interfaz para actualización de conversación
 */
export interface ConversationUpdate {
  conversacionId: string;
  ultimoMensaje: string;
  ultimoMensajeEn: string;
  remitenteId: string;
}

/**
 * Interfaz para evento de typing
 */
export interface TypingEvent {
  conversacionId: string;
  userId: string;
  username: string;
}

/**
 * Interfaz para evento de cambio de estado online
 */
export interface UserStatusEvent {
  userId: string;
  isOnline: boolean;
  timestamp: string;
}
