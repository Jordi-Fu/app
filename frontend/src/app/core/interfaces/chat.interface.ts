/**
 * Interfaces para el módulo de Chat
 */

export interface ConversacionUsuario {
  id: string;
  participante_1_id: string;
  participante_2_id: string;
  servicio_id?: string;
  texto_ultimo_mensaje?: string;
  ultimo_mensaje_en?: string;
  ultimo_mensaje_remitente_id?: string;
  no_leidos: number;
  creado_en: string;
  actualizado_en: string;
  otro_usuario: {
    id: string;
    nombre: string;
    apellido: string;
    usuario: string;
    url_avatar?: string;
    esta_en_linea: boolean;
    ultima_actividad?: string;
  };
}

export interface MensajeConRemitente {
  id: string;
  conversacion_id: string;
  remitente_id: string;
  tipo_mensaje: 'texto' | 'imagen' | 'archivo' | 'ubicacion' | 'audio' | 'video';
  contenido?: string;
  url_media?: string;
  esta_leido: boolean;
  leido_en?: string;
  creado_en: string;
  remitente: {
    id: string;
    nombre: string;
    apellido: string;
    usuario: string;
    url_avatar?: string;
  };
}

export interface EnviarMensajeRequest {
  conversacion_id?: string;
  destinatario_id?: string;
  tipo_mensaje?: 'texto' | 'imagen' | 'archivo' | 'ubicacion' | 'audio' | 'video';
  contenido?: string;
  url_media?: string;
  respuesta_a_mensaje_id?: string;
}
