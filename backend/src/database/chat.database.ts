import { pool } from '../config/database.config';
import { Conversacion, Mensaje, ConversacionConUsuario, MensajeConRemitente } from '../interfaces';

/**
 * Base de datos de Chat
 * Maneja las operaciones de base de datos para conversaciones y mensajes
 */
class ChatDatabase {
  
  /**
   * Obtener todas las conversaciones de un usuario
   */
  async getConversacionesByUserId(userId: string): Promise<ConversacionConUsuario[]> {
    const query = `
      SELECT 
        c.*,
        CASE 
          WHEN c.participante_1_id = $1 THEN c.no_leidos_p1
          ELSE c.no_leidos_p2
        END as no_leidos,
        CASE 
          WHEN c.participante_1_id = $1 THEN u2.id
          ELSE u1.id
        END as otro_usuario_id,
        CASE 
          WHEN c.participante_1_id = $1 THEN u2.nombre
          ELSE u1.nombre
        END as otro_usuario_nombre,
        CASE 
          WHEN c.participante_1_id = $1 THEN u2.apellido
          ELSE u1.apellido
        END as otro_usuario_apellido,
        CASE 
          WHEN c.participante_1_id = $1 THEN u2.usuario
          ELSE u1.usuario
        END as otro_usuario_usuario,
        CASE 
          WHEN c.participante_1_id = $1 THEN u2.url_avatar
          ELSE u1.url_avatar
        END as otro_usuario_avatar,
        CASE 
          WHEN c.participante_1_id = $1 THEN u2.esta_en_linea
          ELSE u1.esta_en_linea
        END as otro_usuario_en_linea,
        CASE 
          WHEN c.participante_1_id = $1 THEN u2.ultima_actividad
          ELSE u1.ultima_actividad
        END as otro_usuario_ultima_actividad
      FROM conversaciones c
      INNER JOIN usuarios u1 ON c.participante_1_id = u1.id
      INNER JOIN usuarios u2 ON c.participante_2_id = u2.id
      WHERE (c.participante_1_id = $1 OR c.participante_2_id = $1)
        AND (
          (c.participante_1_id = $1 AND c.esta_archivado_p1 = false) OR
          (c.participante_2_id = $1 AND c.esta_archivado_p2 = false)
        )
      ORDER BY c.ultimo_mensaje_en DESC NULLS LAST, c.creado_en DESC
    `;

    const result = await pool.query(query, [userId]);
    
    return result.rows.map((row: any) => ({
      id: row.id,
      participante_1_id: row.participante_1_id,
      participante_2_id: row.participante_2_id,
      servicio_id: row.servicio_id,
      texto_ultimo_mensaje: row.texto_ultimo_mensaje,
      ultimo_mensaje_en: row.ultimo_mensaje_en,
      ultimo_mensaje_remitente_id: row.ultimo_mensaje_remitente_id,
      no_leidos_p1: row.no_leidos_p1,
      no_leidos_p2: row.no_leidos_p2,
      esta_archivado_p1: row.esta_archivado_p1,
      esta_archivado_p2: row.esta_archivado_p2,
      creado_en: row.creado_en,
      actualizado_en: row.actualizado_en,
      no_leidos: row.no_leidos,
      otro_usuario: {
        id: row.otro_usuario_id,
        nombre: row.otro_usuario_nombre,
        apellido: row.otro_usuario_apellido,
        usuario: row.otro_usuario_usuario,
        url_avatar: row.otro_usuario_avatar,
        esta_en_linea: row.otro_usuario_en_linea,
        ultima_actividad: row.otro_usuario_ultima_actividad
      }
    }));
  }

  /**
   * Obtener una conversación por ID
   */
  async getConversacionById(conversacionId: string, userId: string): Promise<ConversacionConUsuario | undefined> {
    const query = `
      SELECT 
        c.*,
        CASE 
          WHEN c.participante_1_id = $2 THEN c.no_leidos_p1
          ELSE c.no_leidos_p2
        END as no_leidos,
        CASE 
          WHEN c.participante_1_id = $2 THEN u2.id
          ELSE u1.id
        END as otro_usuario_id,
        CASE 
          WHEN c.participante_1_id = $2 THEN u2.nombre
          ELSE u1.nombre
        END as otro_usuario_nombre,
        CASE 
          WHEN c.participante_1_id = $2 THEN u2.apellido
          ELSE u1.apellido
        END as otro_usuario_apellido,
        CASE 
          WHEN c.participante_1_id = $2 THEN u2.usuario
          ELSE u1.usuario
        END as otro_usuario_usuario,
        CASE 
          WHEN c.participante_1_id = $2 THEN u2.url_avatar
          ELSE u1.url_avatar
        END as otro_usuario_avatar,
        CASE 
          WHEN c.participante_1_id = $2 THEN u2.esta_en_linea
          ELSE u1.esta_en_linea
        END as otro_usuario_en_linea,
        CASE 
          WHEN c.participante_1_id = $2 THEN u2.ultima_actividad
          ELSE u1.ultima_actividad
        END as otro_usuario_ultima_actividad
      FROM conversaciones c
      INNER JOIN usuarios u1 ON c.participante_1_id = u1.id
      INNER JOIN usuarios u2 ON c.participante_2_id = u2.id
      WHERE c.id = $1 AND (c.participante_1_id = $2 OR c.participante_2_id = $2)
    `;

    const result = await pool.query(query, [conversacionId, userId]);
    
    if (result.rows.length === 0) return undefined;

    const row = result.rows[0];
    return {
      id: row.id,
      participante_1_id: row.participante_1_id,
      participante_2_id: row.participante_2_id,
      servicio_id: row.servicio_id,
      texto_ultimo_mensaje: row.texto_ultimo_mensaje,
      ultimo_mensaje_en: row.ultimo_mensaje_en,
      ultimo_mensaje_remitente_id: row.ultimo_mensaje_remitente_id,
      no_leidos_p1: row.no_leidos_p1,
      no_leidos_p2: row.no_leidos_p2,
      esta_archivado_p1: row.esta_archivado_p1,
      esta_archivado_p2: row.esta_archivado_p2,
      creado_en: row.creado_en,
      actualizado_en: row.actualizado_en,
      no_leidos: row.no_leidos,
      otro_usuario: {
        id: row.otro_usuario_id,
        nombre: row.otro_usuario_nombre,
        apellido: row.otro_usuario_apellido,
        usuario: row.otro_usuario_usuario,
        url_avatar: row.otro_usuario_avatar,
        esta_en_linea: row.otro_usuario_en_linea,
        ultima_actividad: row.otro_usuario_ultima_actividad
      }
    };
  }

  /**
   * Buscar o crear una conversación entre dos usuarios
   */
  async findOrCreateConversacion(userId: string, otroUserId: string, servicioId?: string): Promise<Conversacion> {
    // Buscar conversación existente
    const buscarQuery = `
      SELECT * FROM conversaciones
      WHERE (
        (participante_1_id = $1 AND participante_2_id = $2) OR
        (participante_1_id = $2 AND participante_2_id = $1)
      )
      AND ($3::uuid IS NULL OR servicio_id = $3)
      LIMIT 1
    `;

    const buscarResult = await pool.query(buscarQuery, [userId, otroUserId, servicioId || null]);

    if (buscarResult.rows.length > 0) {
      return buscarResult.rows[0];
    }

    // Crear nueva conversación
    const crearQuery = `
      INSERT INTO conversaciones (
        participante_1_id,
        participante_2_id,
        servicio_id
      ) VALUES ($1, $2, $3)
      RETURNING *
    `;

    const crearResult = await pool.query(crearQuery, [userId, otroUserId, servicioId || null]);
    return crearResult.rows[0];
  }

  /**
   * Obtener mensajes de una conversación
   */
  async getMensajesByConversacionId(conversacionId: string, limit: number = 50, offset: number = 0): Promise<MensajeConRemitente[]> {
    const query = `
      SELECT 
        m.*,
        u.id as remitente_id,
        u.nombre as remitente_nombre,
        u.apellido as remitente_apellido,
        u.usuario as remitente_usuario,
        u.url_avatar as remitente_avatar
      FROM mensajes m
      INNER JOIN usuarios u ON m.remitente_id = u.id
      WHERE m.conversacion_id = $1 AND m.esta_eliminado = false
      ORDER BY m.creado_en DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [conversacionId, limit, offset]);
    
    return result.rows.map((row: any) => ({
      id: row.id,
      conversacion_id: row.conversacion_id,
      remitente_id: row.remitente_id,
      tipo_mensaje: row.tipo_mensaje,
      contenido: row.contenido,
      url_media: row.url_media,
      url_miniatura_media: row.url_miniatura_media,
      nombre_archivo: row.nombre_archivo,
      latitud: row.latitud,
      longitud: row.longitud,
      esta_leido: row.esta_leido,
      leido_en: row.leido_en,
      esta_editado: row.esta_editado,
      editado_en: row.editado_en,
      esta_eliminado: row.esta_eliminado,
      eliminado_en: row.eliminado_en,
      respuesta_a_mensaje_id: row.respuesta_a_mensaje_id,
      creado_en: row.creado_en,
      remitente: {
        id: row.remitente_id,
        nombre: row.remitente_nombre,
        apellido: row.remitente_apellido,
        usuario: row.remitente_usuario,
        url_avatar: row.remitente_avatar
      }
    })).reverse(); // Invertir para que el más antiguo esté primero
  }

  /**
   * Crear un nuevo mensaje
   */
  async createMensaje(
    conversacionId: string,
    remitenteId: string,
    tipoMensaje: string,
    contenido?: string,
    urlMedia?: string,
    respuestaAMensajeId?: string
  ): Promise<Mensaje> {
    const query = `
      INSERT INTO mensajes (
        conversacion_id,
        remitente_id,
        tipo_mensaje,
        contenido,
        url_media,
        respuesta_a_mensaje_id
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await pool.query(query, [
      conversacionId,
      remitenteId,
      tipoMensaje,
      contenido || null,
      urlMedia || null,
      respuestaAMensajeId || null
    ]);

    // Actualizar la conversación con el último mensaje
    await this.actualizarUltimoMensaje(conversacionId, remitenteId, contenido || '[Media]');

    return result.rows[0];
  }

  /**
   * Actualizar el último mensaje de una conversación
   */
  private async actualizarUltimoMensaje(conversacionId: string, remitenteId: string, textoMensaje: string): Promise<void> {
    const query = `
      UPDATE conversaciones
      SET 
        texto_ultimo_mensaje = $2,
        ultimo_mensaje_en = CURRENT_TIMESTAMP,
        ultimo_mensaje_remitente_id = $3,
        no_leidos_p1 = CASE WHEN participante_1_id != $3 THEN no_leidos_p1 + 1 ELSE no_leidos_p1 END,
        no_leidos_p2 = CASE WHEN participante_2_id != $3 THEN no_leidos_p2 + 1 ELSE no_leidos_p2 END,
        actualizado_en = CURRENT_TIMESTAMP
      WHERE id = $1
    `;

    await pool.query(query, [conversacionId, textoMensaje.substring(0, 200), remitenteId]);
  }

  /**
   * Marcar mensajes como leídos
   */
  async marcarMensajesComoLeidos(conversacionId: string, userId: string): Promise<void> {
    // Marcar mensajes como leídos
    const mensajesQuery = `
      UPDATE mensajes
      SET esta_leido = true, leido_en = CURRENT_TIMESTAMP
      WHERE conversacion_id = $1 
        AND remitente_id != $2 
        AND esta_leido = false
    `;

    await pool.query(mensajesQuery, [conversacionId, userId]);

    // Resetear contador de no leídos en la conversación
    const conversacionQuery = `
      UPDATE conversaciones
      SET 
        no_leidos_p1 = CASE WHEN participante_1_id = $2 THEN 0 ELSE no_leidos_p1 END,
        no_leidos_p2 = CASE WHEN participante_2_id = $2 THEN 0 ELSE no_leidos_p2 END,
        actualizado_en = CURRENT_TIMESTAMP
      WHERE id = $1
    `;

    await pool.query(conversacionQuery, [conversacionId, userId]);
  }

  /**
   * Eliminar un mensaje
   */
  async eliminarMensaje(mensajeId: string, userId: string): Promise<boolean> {
    const query = `
      UPDATE mensajes
      SET esta_eliminado = true, eliminado_en = CURRENT_TIMESTAMP
      WHERE id = $1 AND remitente_id = $2
      RETURNING id
    `;

    const result = await pool.query(query, [mensajeId, userId]);
    return result.rows.length > 0;
  }

  /**
   * Archivar una conversación
   */
  async archivarConversacion(conversacionId: string, userId: string): Promise<boolean> {
    const query = `
      UPDATE conversaciones
      SET 
        esta_archivado_p1 = CASE WHEN participante_1_id = $2 THEN true ELSE esta_archivado_p1 END,
        esta_archivado_p2 = CASE WHEN participante_2_id = $2 THEN true ELSE esta_archivado_p2 END,
        actualizado_en = CURRENT_TIMESTAMP
      WHERE id = $1 AND (participante_1_id = $2 OR participante_2_id = $2)
      RETURNING id
    `;

    const result = await pool.query(query, [conversacionId, userId]);
    return result.rows.length > 0;
  }
}

export const chatDatabase = new ChatDatabase();
