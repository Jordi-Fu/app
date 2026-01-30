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

  /**
   * Crear un nuevo servicio
   */
  async create(data: {
    proveedor_id: string;
    categoria_id: string;
    titulo: string;
    descripcion: string;
    tipo_precio: string;
    precio?: number;
    moneda?: string;
    duracion_minutos?: number;
    tipo_ubicacion: string;
    direccion?: string;
    ciudad?: string;
    estado?: string;
    pais?: string;
    codigo_postal?: string;
    latitud?: number;
    longitud?: number;
    radio_servicio_km?: number;
    que_incluye?: string;
    que_no_incluye?: string;
    requisitos?: string;
    politica_cancelacion?: string;
    disponibilidad_urgencias?: boolean;
    precio_urgencias?: number;
  }) {
    try {
      const query = `
        INSERT INTO servicios (
          proveedor_id, categoria_id, titulo, descripcion,
          tipo_precio, precio, moneda, duracion_minutos,
          tipo_ubicacion, direccion, ciudad, estado, pais, codigo_postal,
          latitud, longitud, radio_servicio_km, que_incluye, que_no_incluye,
          requisitos, politica_cancelacion, disponibilidad_urgencias, precio_urgencias,
          esta_activo, es_destacado, esta_verificado, vistas, conteo_favoritos,
          conteo_reservas, promedio_calificacion, total_resenas
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
          $15, $16, $17, $18, $19, $20, $21, $22, $23,
          true, false, false, 0, 0, 0, 0, 0
        )
        RETURNING *
      `;

      const values = [
        data.proveedor_id,
        data.categoria_id,
        data.titulo,
        data.descripcion,
        data.tipo_precio,
        data.precio || null,
        data.moneda || '€',
        data.duracion_minutos || null,
        data.tipo_ubicacion,
        data.direccion || null,
        data.ciudad || null,
        data.estado || null,
        data.pais || 'España',
        data.codigo_postal || null,
        data.latitud || null,
        data.longitud || null,
        data.radio_servicio_km || null,
        data.que_incluye || null,
        data.que_no_incluye || null,
        data.requisitos || null,
        data.politica_cancelacion || null,
        data.disponibilidad_urgencias || false,
        data.precio_urgencias || null,
      ];

      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error en ServiceDatabase.create:', error);
      throw error;
    }
  }

  /**
   * Crear imagen de servicio
   */
  async createImage(data: {
    servicio_id: string;
    url_imagen: string;
    url_miniatura?: string;
    pie_de_foto?: string;
    es_principal: boolean;
    indice_orden: number;
    ancho?: number;
    alto?: number;
  }) {
    try {
      const query = `
        INSERT INTO imagenes_servicios (
          servicio_id, url_imagen, url_miniatura, pie_de_foto, 
          es_principal, indice_orden, ancho, alto
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;

      const values = [
        data.servicio_id,
        data.url_imagen,
        data.url_miniatura || null,
        data.pie_de_foto || null,
        data.es_principal,
        data.indice_orden,
        data.ancho || null,
        data.alto || null,
      ];

      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error en ServiceDatabase.createImage:', error);
      throw error;
    }
  }

  /**
   * Crear disponibilidad de servicio
   */
  async createAvailability(data: {
    servicio_id: string;
    dia_semana: number;
    hora_inicio: string;
    hora_fin: string;
    esta_disponible: boolean;
  }) {
    try {
      const query = `
        INSERT INTO disponibilidad_servicios (
          servicio_id, dia_semana, hora_inicio, hora_fin, esta_disponible
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;

      const values = [
        data.servicio_id,
        data.dia_semana,
        data.hora_inicio,
        data.hora_fin,
        data.esta_disponible,
      ];

      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error en ServiceDatabase.createAvailability:', error);
      throw error;
    }
  }

  /**
   * Eliminar toda la disponibilidad de un servicio
   */
  async deleteAvailabilityByServiceId(serviceId: string) {
    try {
      const query = `DELETE FROM disponibilidad_servicios WHERE servicio_id = $1`;
      await pool.query(query, [serviceId]);
    } catch (error) {
      console.error('Error en ServiceDatabase.deleteAvailabilityByServiceId:', error);
      throw error;
    }
  }

  /**
   * Actualizar contador de servicios del usuario
   */
  async incrementUserServiceCount(userId: string) {
    try {
      const query = `
        UPDATE usuarios 
        SET total_servicios = COALESCE(total_servicios, 0) + 1 
        WHERE id = $1
      `;
      await pool.query(query, [userId]);
    } catch (error) {
      console.error('Error en ServiceDatabase.incrementUserServiceCount:', error);
      throw error;
    }
  }

  /**
   * Actualizar un servicio existente
   */
  async update(id: string, data: {
    titulo?: string;
    descripcion?: string;
    categoria_id?: string;
    tipo_precio?: string;
    precio?: number;
    moneda?: string;
    duracion_minutos?: number;
    tipo_ubicacion?: string;
    direccion?: string;
    ciudad?: string;
    estado?: string;
    pais?: string;
    codigo_postal?: string;
    latitud?: number;
    longitud?: number;
    radio_servicio_km?: number;
    que_incluye?: string;
    que_no_incluye?: string;
    requisitos?: string;
    politica_cancelacion?: string;
    disponibilidad_urgencias?: boolean;
    precio_urgencias?: number;
    esta_activo?: boolean;
  }) {
    try {
      // Construir dinámicamente la query de actualización
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (data.titulo !== undefined) {
        updates.push(`titulo = $${paramIndex++}`);
        values.push(data.titulo);
      }
      if (data.descripcion !== undefined) {
        updates.push(`descripcion = $${paramIndex++}`);
        values.push(data.descripcion);
      }
      if (data.categoria_id !== undefined) {
        updates.push(`categoria_id = $${paramIndex++}`);
        values.push(data.categoria_id);
      }
      if (data.tipo_precio !== undefined) {
        updates.push(`tipo_precio = $${paramIndex++}`);
        values.push(data.tipo_precio);
      }
      if (data.precio !== undefined) {
        updates.push(`precio = $${paramIndex++}`);
        values.push(data.precio);
      }
      if (data.moneda !== undefined) {
        updates.push(`moneda = $${paramIndex++}`);
        values.push(data.moneda);
      }
      if (data.duracion_minutos !== undefined) {
        updates.push(`duracion_minutos = $${paramIndex++}`);
        values.push(data.duracion_minutos);
      }
      if (data.tipo_ubicacion !== undefined) {
        updates.push(`tipo_ubicacion = $${paramIndex++}`);
        values.push(data.tipo_ubicacion);
      }
      if (data.direccion !== undefined) {
        updates.push(`direccion = $${paramIndex++}`);
        values.push(data.direccion);
      }
      if (data.ciudad !== undefined) {
        updates.push(`ciudad = $${paramIndex++}`);
        values.push(data.ciudad);
      }
      if (data.estado !== undefined) {
        updates.push(`estado = $${paramIndex++}`);
        values.push(data.estado);
      }
      if (data.pais !== undefined) {
        updates.push(`pais = $${paramIndex++}`);
        values.push(data.pais);
      }
      if (data.codigo_postal !== undefined) {
        updates.push(`codigo_postal = $${paramIndex++}`);
        values.push(data.codigo_postal);
      }
      if (data.latitud !== undefined) {
        updates.push(`latitud = $${paramIndex++}`);
        values.push(data.latitud);
      }
      if (data.longitud !== undefined) {
        updates.push(`longitud = $${paramIndex++}`);
        values.push(data.longitud);
      }
      if (data.radio_servicio_km !== undefined) {
        updates.push(`radio_servicio_km = $${paramIndex++}`);
        values.push(data.radio_servicio_km);
      }
      if (data.que_incluye !== undefined) {
        updates.push(`que_incluye = $${paramIndex++}`);
        values.push(data.que_incluye);
      }
      if (data.que_no_incluye !== undefined) {
        updates.push(`que_no_incluye = $${paramIndex++}`);
        values.push(data.que_no_incluye);
      }
      if (data.requisitos !== undefined) {
        updates.push(`requisitos = $${paramIndex++}`);
        values.push(data.requisitos);
      }
      if (data.politica_cancelacion !== undefined) {
        updates.push(`politica_cancelacion = $${paramIndex++}`);
        values.push(data.politica_cancelacion);
      }
      if (data.disponibilidad_urgencias !== undefined) {
        updates.push(`disponibilidad_urgencias = $${paramIndex++}`);
        values.push(data.disponibilidad_urgencias);
      }
      if (data.precio_urgencias !== undefined) {
        updates.push(`precio_urgencias = $${paramIndex++}`);
        values.push(data.precio_urgencias);
      }
      if (data.esta_activo !== undefined) {
        updates.push(`esta_activo = $${paramIndex++}`);
        values.push(data.esta_activo);
      }

      if (updates.length === 0) {
        // No hay nada que actualizar
        return await this.findById(id);
      }

      values.push(id);
      const query = `
        UPDATE servicios 
        SET ${updates.join(', ')}, actualizado_en = CURRENT_TIMESTAMP
        WHERE id = $${paramIndex}
        RETURNING *
      `;

      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error en ServiceDatabase.update:', error);
      throw error;
    }
  }

  /**
   * Eliminar un servicio (soft delete - marca como eliminado)
   */
  async softDelete(id: string) {
    try {
      const query = `
        UPDATE servicios 
        SET eliminado_en = CURRENT_TIMESTAMP, esta_activo = false
        WHERE id = $1
        RETURNING *
      `;
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error en ServiceDatabase.softDelete:', error);
      throw error;
    }
  }

  /**
   * Eliminar un servicio permanentemente (hard delete)
   */
  async hardDelete(id: string) {
    try {
      // Primero eliminar las imágenes asociadas
      await this.deleteImages(id);
      
      // Luego eliminar la disponibilidad asociada
      await this.deleteAvailability(id);
      
      // Eliminar favoritos asociados
      await pool.query(`DELETE FROM favoritos WHERE servicio_id = $1`, [id]);
      
      // Finalmente eliminar el servicio
      const query = `DELETE FROM servicios WHERE id = $1 RETURNING *`;
      const result = await pool.query(query, [id]);
      return result.rows[0];
    } catch (error) {
      console.error('Error en ServiceDatabase.hardDelete:', error);
      throw error;
    }
  }

  /**
   * Eliminar imágenes de un servicio
   */
  async deleteImages(serviceId: string) {
    try {
      const query = `DELETE FROM imagenes_servicios WHERE servicio_id = $1`;
      await pool.query(query, [serviceId]);
    } catch (error) {
      console.error('Error en ServiceDatabase.deleteImages:', error);
      throw error;
    }
  }

  /**
   * Eliminar disponibilidad de un servicio
   */
  async deleteAvailability(serviceId: string) {
    try {
      const query = `DELETE FROM disponibilidad_servicios WHERE servicio_id = $1`;
      await pool.query(query, [serviceId]);
    } catch (error) {
      console.error('Error en ServiceDatabase.deleteAvailability:', error);
      throw error;
    }
  }
}

export const serviceDatabase = new ServiceDatabase();

