import { pool } from '../config/database.config';

/**
 * Acceso a datos de servicios en PostgreSQL
 */
class ServiceDatabase {
  
  /**
   * Obtener servicios con filtros
   */
  async findWithFilters(whereConditions: string[], queryParams: any[], limit: number, offset: number) {
    try {
      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}` 
        : '';

      const paramIndexLimit = queryParams.length + 1;
      const paramIndexOffset = queryParams.length + 2;

      const query = `
        SELECT 
          s.*,
          -- Datos del proveedor
          json_build_object(
            'id', u.id,
            'usuario', u.usuario,
            'nombre', u.nombre,
            'apellido', u.apellido,
            'url_avatar', u.url_avatar,
            'promedio_calificacion', u.promedio_calificacion,
            'total_resenas', u.total_resenas,
            'tiempo_respuesta_minutos', u.tiempo_respuesta_minutos,
            'porcentaje_respuesta', u.porcentaje_respuesta,
            'esta_verificado', u.esta_verificado
          ) as provider,
          -- Datos de la categoría
          json_build_object(
            'id', c.id,
            'nombre', c.nombre,
            'slug', c.slug,
            'descripcion', c.descripcion,
            'url_icono', c.url_icono,
            'color', c.color,
            'esta_activo', c.esta_activo
          ) as category,
          -- Imágenes del servicio
          COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'id', si.id,
                  'servicio_id', si.servicio_id,
                  'url_imagen', si.url_imagen,
                  'url_miniatura', si.url_miniatura,
                  'pie_de_foto', si.pie_de_foto,
                  'es_principal', si.es_principal,
                  'indice_orden', si.indice_orden,
                  'ancho', si.ancho,
                  'alto', si.alto,
                  'creado_en', si.creado_en
                )
                ORDER BY si.indice_orden
              )
              FROM imagenes_servicios si
              WHERE si.servicio_id = s.id
            ),
            '[]'::json
          ) as images
        FROM servicios s
        LEFT JOIN usuarios u ON s.proveedor_id = u.id
        LEFT JOIN categorias c ON s.categoria_id = c.id
        ${whereClause}
        ORDER BY s.es_destacado DESC, s.promedio_calificacion DESC, s.creado_en DESC
        LIMIT $${paramIndexLimit} OFFSET $${paramIndexOffset}
      `;

      const allParams = [...queryParams, limit, offset];
      const result = await pool.query(query, allParams);
      return result.rows;
    } catch (error) {
      console.error('Error en ServiceDatabase.findWithFilters:', error);
      throw error;
    }
  }

  /**
   * Contar servicios con filtros
   */
  async countWithFilters(whereConditions: string[], queryParams: any[]) {
    try {
      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}` 
        : '';

      const countQuery = `
        SELECT COUNT(*)::int as total
        FROM servicios s
        ${whereClause}
      `;
      
      const result = await pool.query(countQuery, queryParams);
      return result.rows[0]?.total || 0;
    } catch (error) {
      console.error('Error en ServiceDatabase.countWithFilters:', error);
      throw error;
    }
  }

  /**
   * Buscar servicio por ID con todas sus relaciones
   */
  async findById(id: string) {
    try {
      const query = `
        SELECT 
          s.*,
          -- Datos del proveedor
          json_build_object(
            'id', u.id,
            'usuario', u.usuario,
            'nombre', u.nombre,
            'apellido', u.apellido,
            'url_avatar', u.url_avatar,
            'biografia', u.biografia,
            'promedio_calificacion', u.promedio_calificacion,
            'total_resenas', u.total_resenas,
            'total_servicios', u.total_servicios,
            'tiempo_respuesta_minutos', u.tiempo_respuesta_minutos,
            'porcentaje_respuesta', u.porcentaje_respuesta,
            'esta_verificado', u.esta_verificado,
            'creado_en', u.creado_en
          ) as provider,
          -- Datos de la categoría
          json_build_object(
            'id', c.id,
            'nombre', c.nombre,
            'slug', c.slug,
            'descripcion', c.descripcion,
            'url_icono', c.url_icono,
            'color', c.color,
            'esta_activo', c.esta_activo
          ) as category,
          -- Imágenes del servicio
          COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'id', si.id,
                  'servicio_id', si.servicio_id,
                  'url_imagen', si.url_imagen,
                  'url_miniatura', si.url_miniatura,
                  'pie_de_foto', si.pie_de_foto,
                  'es_principal', si.es_principal,
                  'indice_orden', si.indice_orden,
                  'ancho', si.ancho,
                  'alto', si.alto,
                  'creado_en', si.creado_en
                )
                ORDER BY si.indice_orden
              )
              FROM imagenes_servicios si
              WHERE si.servicio_id = s.id
            ),
            '[]'::json
          ) as images,
          -- Disponibilidad
          COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'id', sa.id,
                  'dia_semana', sa.dia_semana,
                  'hora_inicio', sa.hora_inicio,
                  'hora_fin', sa.hora_fin,
                  'esta_disponible', sa.esta_disponible
                )
                ORDER BY sa.dia_semana
              )
              FROM disponibilidad_servicios sa
              WHERE sa.servicio_id = s.id
            ),
            '[]'::json
          ) as availability,
          -- FAQs
          COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'id', sf.id,
                  'pregunta', sf.pregunta,
                  'respuesta', sf.respuesta,
                  'indice_orden', sf.indice_orden
                )
                ORDER BY sf.indice_orden
              )
              FROM preguntas_frecuentes_servicios sf
              WHERE sf.servicio_id = s.id
            ),
            '[]'::json
          ) as faqs,
          -- Tags
          COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'id', t.id,
                  'nombre', t.nombre,
                  'slug', t.slug
                )
              )
              FROM servicios_etiquetas st
              INNER JOIN etiquetas t ON st.etiqueta_id = t.id
              WHERE st.servicio_id = s.id
            ),
            '[]'::json
          ) as tags
        FROM servicios s
        LEFT JOIN usuarios u ON s.proveedor_id = u.id
        LEFT JOIN categorias c ON s.categoria_id = c.id
        WHERE s.id = $1 AND s.esta_activo = true AND s.eliminado_en IS NULL
      `;

      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error en ServiceDatabase.findById:', error);
      throw error;
    }
  }

  /**
   * Incrementar contador de vistas
   */
  async incrementViews(serviceId: string) {
    try {
      const query = `
        UPDATE servicios 
        SET vistas = vistas + 1 
        WHERE id = $1
      `;
      await pool.query(query, [serviceId]);
    } catch (error) {
      console.error('Error en ServiceDatabase.incrementViews:', error);
      throw error;
    }
  }

  /**
   * Obtener todas las categorías activas
   */
  async findAllCategories() {
    try {
      const query = `
        SELECT 
          id,
          nombre,
          slug,
          descripcion,
          url_icono,
          color,
          padre_id,
          indice_orden,
          esta_activo,
          conteo_servicios
        FROM categorias
        WHERE esta_activo = true
        ORDER BY indice_orden ASC, nombre ASC
      `;
      
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('Error en ServiceDatabase.findAllCategories:', error);
      throw error;
    }
  }

  /**
   * Verificar si un servicio está en favoritos
   */
  async isFavorite(userId: string, serviceId: string): Promise<boolean> {
    try {
      const query = `
        SELECT id FROM favoritos
        WHERE usuario_id = $1 AND servicio_id = $2
      `;
      const result = await pool.query(query, [userId, serviceId]);
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error en ServiceDatabase.isFavorite:', error);
      throw error;
    }
  }

  /**
   * Agregar servicio a favoritos
   */
  async addToFavorites(userId: string, serviceId: string) {
    try {
      const insertQuery = `
        INSERT INTO favoritos (usuario_id, servicio_id)
        VALUES ($1, $2)
        RETURNING id
      `;
      const result = await pool.query(insertQuery, [userId, serviceId]);
      return result.rows[0];
    } catch (error) {
      console.error('Error en ServiceDatabase.addToFavorites:', error);
      throw error;
    }
  }

  /**
   * Eliminar servicio de favoritos
   */
  async removeFromFavorites(userId: string, serviceId: string) {
    try {
      const deleteQuery = `
        DELETE FROM favoritos
        WHERE usuario_id = $1 AND servicio_id = $2
      `;
      await pool.query(deleteQuery, [userId, serviceId]);
    } catch (error) {
      console.error('Error en ServiceDatabase.removeFromFavorites:', error);
      throw error;
    }
  }

  /**
   * Obtener servicios favoritos de un usuario
   */
  async findFavoritesByUserId(userId: string) {
    try {
      const query = `
        SELECT 
          s.*,
          f.creado_en as favorited_at,
          -- Datos del proveedor
          json_build_object(
            'id', u.id,
            'usuario', u.usuario,
            'nombre', u.nombre,
            'apellido', u.apellido,
            'url_avatar', u.url_avatar,
            'promedio_calificacion', u.promedio_calificacion,
            'total_resenas', u.total_resenas,
            'tiempo_respuesta_minutos', u.tiempo_respuesta_minutos,
            'porcentaje_respuesta', u.porcentaje_respuesta,
            'esta_verificado', u.esta_verificado
          ) as provider,
          -- Datos de la categoría
          json_build_object(
            'id', c.id,
            'nombre', c.nombre,
            'slug', c.slug,
            'descripcion', c.descripcion,
            'url_icono', c.url_icono,
            'color', c.color,
            'esta_activo', c.esta_activo
          ) as category,
          -- Imágenes del servicio
          COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'id', si.id,
                  'servicio_id', si.servicio_id,
                  'url_imagen', si.url_imagen,
                  'url_miniatura', si.url_miniatura,
                  'pie_de_foto', si.pie_de_foto,
                  'es_principal', si.es_principal,
                  'indice_orden', si.indice_orden
                )
                ORDER BY si.indice_orden
              )
              FROM imagenes_servicios si
              WHERE si.servicio_id = s.id
            ),
            '[]'::json
          ) as images
        FROM favoritos f
        INNER JOIN servicios s ON f.servicio_id = s.id
        LEFT JOIN usuarios u ON s.proveedor_id = u.id
        LEFT JOIN categorias c ON s.categoria_id = c.id
        WHERE f.usuario_id = $1
          AND s.esta_activo = true
          AND s.eliminado_en IS NULL
        ORDER BY f.creado_en DESC
      `;
      
      const result = await pool.query(query, [userId]);
      return result.rows;
    } catch (error) {
      console.error('Error en ServiceDatabase.findFavoritesByUserId:', error);
      throw error;
    }
  }
}

export const serviceDatabase = new ServiceDatabase();
