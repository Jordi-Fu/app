import { pool } from '../config/database.config';

/**
 * Servicio de servicios
 * Lógica de negocio relacionada con servicios
 */
class ServiceService {
  /**
   * Obtener servicios con filtros y paginación
   */
  async getServices(filters: {
    category_id?: string;
    city?: string;
    state?: string;
    price_min?: number;
    price_max?: number;
    location_type?: string;
    rating_min?: number;
    search?: string;
    page?: number;
    limit?: number;
    provider_id?: string;
    is_featured?: boolean;
    is_verified?: boolean;
  }) {
    try {
      const {
        category_id,
        city,
        state,
        price_min,
        price_max,
        location_type,
        rating_min,
        search,
        page = 1,
        limit = 20,
        provider_id,
        is_featured,
        is_verified,
      } = filters;

      let whereConditions: string[] = ['s.is_active = true', 's.deleted_at IS NULL'];
      let queryParams: any[] = [];
      let paramIndex = 1;

      // Filtros
      if (category_id) {
        whereConditions.push(`s.category_id = $${paramIndex}`);
        queryParams.push(category_id);
        paramIndex++;
      }

      if (city) {
        whereConditions.push(`LOWER(s.city) = LOWER($${paramIndex})`);
        queryParams.push(city);
        paramIndex++;
      }

      if (state) {
        whereConditions.push(`LOWER(s.state) = LOWER($${paramIndex})`);
        queryParams.push(state);
        paramIndex++;
      }

      if (price_min !== undefined) {
        whereConditions.push(`s.price >= $${paramIndex}`);
        queryParams.push(price_min);
        paramIndex++;
      }

      if (price_max !== undefined) {
        whereConditions.push(`s.price <= $${paramIndex}`);
        queryParams.push(price_max);
        paramIndex++;
      }

      if (location_type) {
        whereConditions.push(`s.location_type = $${paramIndex}`);
        queryParams.push(location_type);
        paramIndex++;
      }

      if (rating_min !== undefined) {
        whereConditions.push(`s.rating_average >= $${paramIndex}`);
        queryParams.push(rating_min);
        paramIndex++;
      }

      if (provider_id) {
        whereConditions.push(`s.provider_id = $${paramIndex}`);
        queryParams.push(provider_id);
        paramIndex++;
      }

      if (is_featured !== undefined) {
        whereConditions.push(`s.is_featured = $${paramIndex}`);
        queryParams.push(is_featured);
        paramIndex++;
      }

      if (is_verified !== undefined) {
        whereConditions.push(`s.is_verified = $${paramIndex}`);
        queryParams.push(is_verified);
        paramIndex++;
      }

      if (search) {
        whereConditions.push(`(
          LOWER(s.title) LIKE LOWER($${paramIndex}) OR 
          LOWER(s.description) LIKE LOWER($${paramIndex}) OR 
          LOWER(s.short_description) LIKE LOWER($${paramIndex})
        )`);
        queryParams.push(`%${search}%`);
        paramIndex++;
      }

      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}` 
        : '';

      // Contar total de resultados
      const countQuery = `
        SELECT COUNT(*)::int as total
        FROM services s
        ${whereClause}
      `;
      const countResult = await pool.query(countQuery, queryParams);
      const total = countResult.rows[0]?.total || 0;

      // Calcular paginación
      const offset = (page - 1) * limit;
      queryParams.push(limit, offset);

      // Query principal con joins
      const query = `
        SELECT 
          s.*,
          -- Datos del proveedor
          json_build_object(
            'id', u.id,
            'username', u.username,
            'first_name', u.first_name,
            'last_name', u.last_name,
            'avatar_url', u.avatar_url,
            'rating_average', u.rating_average,
            'total_reviews', u.total_reviews,
            'response_time_minutes', u.response_time_minutes,
            'response_rate', u.response_rate,
            'is_verified', u.is_verified
          ) as provider,
          -- Datos de la categoría
          json_build_object(
            'id', c.id,
            'name', c.name,
            'slug', c.slug,
            'description', c.description,
            'icon_url', c.icon_url,
            'color', c.color,
            'is_active', c.is_active
          ) as category,
          -- Imágenes del servicio
          COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'id', si.id,
                  'service_id', si.service_id,
                  'image_url', si.image_url,
                  'thumbnail_url', si.thumbnail_url,
                  'caption', si.caption,
                  'is_primary', si.is_primary,
                  'order_index', si.order_index,
                  'width', si.width,
                  'height', si.height,
                  'created_at', si.created_at
                )
                ORDER BY si.order_index
              )
              FROM service_images si
              WHERE si.service_id = s.id
            ),
            '[]'::json
          ) as images
        FROM services s
        LEFT JOIN users u ON s.provider_id = u.id
        LEFT JOIN categories c ON s.category_id = c.id
        ${whereClause}
        ORDER BY s.is_featured DESC, s.rating_average DESC, s.created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      const result = await pool.query(query, queryParams);

      return {
        success: true,
        services: result.rows,
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('[SERVICE_SERVICE] Error en getServices:', error);
      throw error;
    }
  }

  /**
   * Obtener un servicio por ID con todas sus relaciones
   */
  async getServiceById(id: string) {
    try {
      const query = `
        SELECT 
          s.*,
          -- Datos del proveedor
          json_build_object(
            'id', u.id,
            'username', u.username,
            'first_name', u.first_name,
            'last_name', u.last_name,
            'avatar_url', u.avatar_url,
            'bio', u.bio,
            'rating_average', u.rating_average,
            'total_reviews', u.total_reviews,
            'total_services', u.total_services,
            'response_time_minutes', u.response_time_minutes,
            'response_rate', u.response_rate,
            'is_verified', u.is_verified,
            'created_at', u.created_at
          ) as provider,
          -- Datos de la categoría
          json_build_object(
            'id', c.id,
            'name', c.name,
            'slug', c.slug,
            'description', c.description,
            'icon_url', c.icon_url,
            'color', c.color,
            'is_active', c.is_active
          ) as category,
          -- Imágenes del servicio
          COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'id', si.id,
                  'service_id', si.service_id,
                  'image_url', si.image_url,
                  'thumbnail_url', si.thumbnail_url,
                  'caption', si.caption,
                  'is_primary', si.is_primary,
                  'order_index', si.order_index,
                  'width', si.width,
                  'height', si.height,
                  'created_at', si.created_at
                )
                ORDER BY si.order_index
              )
              FROM service_images si
              WHERE si.service_id = s.id
            ),
            '[]'::json
          ) as images,
          -- Disponibilidad
          COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'id', sa.id,
                  'day_of_week', sa.day_of_week,
                  'start_time', sa.start_time,
                  'end_time', sa.end_time,
                  'is_available', sa.is_available
                )
                ORDER BY sa.day_of_week
              )
              FROM service_availability sa
              WHERE sa.service_id = s.id
            ),
            '[]'::json
          ) as availability,
          -- FAQs
          COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'id', sf.id,
                  'question', sf.question,
                  'answer', sf.answer,
                  'order_index', sf.order_index
                )
                ORDER BY sf.order_index
              )
              FROM service_faqs sf
              WHERE sf.service_id = s.id
            ),
            '[]'::json
          ) as faqs,
          -- Tags
          COALESCE(
            (
              SELECT json_agg(
                json_build_object(
                  'id', t.id,
                  'name', t.name,
                  'slug', t.slug
                )
              )
              FROM service_tags st
              INNER JOIN tags t ON st.tag_id = t.id
              WHERE st.service_id = s.id
            ),
            '[]'::json
          ) as tags
        FROM services s
        LEFT JOIN users u ON s.provider_id = u.id
        LEFT JOIN categories c ON s.category_id = c.id
        WHERE s.id = $1 AND s.is_active = true AND s.deleted_at IS NULL
      `;

      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } catch (error) {
      console.error('[SERVICE_SERVICE] Error en getServiceById:', error);
      throw error;
    }
  }

  /**
   * Incrementar contador de vistas
   */
  async incrementViews(serviceId: string) {
    try {
      const query = `
        UPDATE services 
        SET views_count = views_count + 1 
        WHERE id = $1
      `;
      await pool.query(query, [serviceId]);
    } catch (error) {
      console.error('[SERVICE_SERVICE] Error en incrementViews:', error);
      throw error;
    }
  }

  /**
   * Obtener categorías activas
   */
  async getCategories() {
    try {
      const query = `
        SELECT 
          id,
          name,
          slug,
          description,
          icon_url,
          color,
          parent_id,
          order_index,
          is_active,
          services_count
        FROM categories
        WHERE is_active = true
        ORDER BY order_index ASC, name ASC
      `;
      
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error('[SERVICE_SERVICE] Error en getCategories:', error);
      throw error;
    }
  }
}

export const serviceService = new ServiceService();
