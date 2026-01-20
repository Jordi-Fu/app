export interface Conversacion {
  id: string;
  participante_1_id: string;
  participante_2_id: string;
  servicio_id?: string;
  texto_ultimo_mensaje?: string;
  ultimo_mensaje_en?: Date;
  ultimo_mensaje_remitente_id?: string;
  no_leidos_p1: number;
  no_leidos_p2: number;
  esta_archivado_p1: boolean;
  esta_archivado_p2: boolean;
  creado_en: Date;
  actualizado_en: Date;
}

export interface Mensaje {
  id: string;
  conversacion_id: string;
  remitente_id: string;
  tipo_mensaje: 'texto' | 'imagen' | 'archivo' | 'ubicacion' | 'audio' | 'video';
  contenido?: string;
  url_media?: string;
  url_miniatura_media?: string;
  nombre_archivo?: string;
  latitud?: number;
  longitud?: number;
  esta_leido: boolean;
  leido_en?: Date;
  esta_editado: boolean;
  editado_en?: Date;
  esta_eliminado: boolean;
  eliminado_en?: Date;
  respuesta_a_mensaje_id?: string;
  creado_en: Date;
}

export interface ConversacionConUsuario extends Conversacion {
  otro_usuario: {
    id: string;
    nombre: string;
    apellido: string;
    usuario: string;
    url_avatar?: string;
    esta_en_linea: boolean;
    ultima_actividad?: Date;
  };
  no_leidos: number;
}

export interface MensajeConRemitente extends Mensaje {
  remitente: {
    id: string;
    nombre: string;
    apellido: string;
    usuario: string;
    url_avatar?: string;
  };
}

export interface CrearMensajeRequest {
  conversacion_id?: string;
  destinatario_id?: string;
  tipo_mensaje?: 'texto' | 'imagen' | 'archivo' | 'ubicacion' | 'audio' | 'video';
  contenido?: string;
  url_media?: string;
  respuesta_a_mensaje_id?: string;
}
