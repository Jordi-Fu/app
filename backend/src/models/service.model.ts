import { serviceDatabase } from '../database/service.database';

/**
 * Modelo de Servicio
 * Lógica de negocio relacionada con servicios
 */
class ServiceModel {
  
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

    let whereConditions: string[] = ['s.esta_activo = true', 's.eliminado_en IS NULL'];
    let queryParams: any[] = [];
    let paramIndex = 1;

    // Construir condiciones WHERE
    if (category_id) {
      whereConditions.push(`s.categoria_id = $${paramIndex}`);
      queryParams.push(category_id);
      paramIndex++;
    }

    if (city) {
      whereConditions.push(`LOWER(s.ciudad) = LOWER($${paramIndex})`);
      queryParams.push(city);
      paramIndex++;
    }

    if (state) {
      whereConditions.push(`LOWER(s.estado) = LOWER($${paramIndex})`);
      queryParams.push(state);
      paramIndex++;
    }

    if (price_min !== undefined) {
      whereConditions.push(`s.precio >= $${paramIndex}`);
      queryParams.push(price_min);
      paramIndex++;
    }

    if (price_max !== undefined) {
      whereConditions.push(`s.precio <= $${paramIndex}`);
      queryParams.push(price_max);
      paramIndex++;
    }

    if (location_type) {
      whereConditions.push(`s.tipo_ubicacion = $${paramIndex}`);
      queryParams.push(location_type);
      paramIndex++;
    }

    if (rating_min !== undefined) {
      whereConditions.push(`s.promedio_calificacion >= $${paramIndex}`);
      queryParams.push(rating_min);
      paramIndex++;
    }

    if (provider_id) {
      whereConditions.push(`s.proveedor_id = $${paramIndex}`);
      queryParams.push(provider_id);
      paramIndex++;
    }

    if (is_featured !== undefined) {
      whereConditions.push(`s.es_destacado = $${paramIndex}`);
      queryParams.push(is_featured);
      paramIndex++;
    }

    if (is_verified !== undefined) {
      whereConditions.push(`s.esta_verificado = $${paramIndex}`);
      queryParams.push(is_verified);
      paramIndex++;
    }

    if (search) {
      whereConditions.push(`(
        LOWER(s.titulo) LIKE LOWER($${paramIndex}) OR 
        LOWER(s.descripcion) LIKE LOWER($${paramIndex})
      )`);
      queryParams.push(`%${search}%`);
      paramIndex++;
    }

    // Obtener total
    const total = await serviceDatabase.countWithFilters(whereConditions, queryParams);

    // Calcular paginación
    const offset = (page - 1) * limit;

    // Obtener servicios
    const services = await serviceDatabase.findWithFilters(whereConditions, queryParams, limit, offset);

    return {
      success: true,
      services,
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    };
  }

  /**
   * Obtener un servicio por ID
   */
  async getServiceById(id: string) {
    return await serviceDatabase.findById(id);
  }

  /**
   * Incrementar vistas de un servicio
   */
  async incrementViews(serviceId: string) {
    await serviceDatabase.incrementViews(serviceId);
  }

  /**
   * Obtener todas las categorías
   */
  async getCategories() {
    return await serviceDatabase.findAllCategories();
  }

  /**
   * Toggle favorito
   */
  async toggleFavorite(userId: string, serviceId: string) {
    const isFavorite = await serviceDatabase.isFavorite(userId, serviceId);
    
    if (isFavorite) {
      await serviceDatabase.removeFromFavorites(userId, serviceId);
      return { isFavorite: false, message: 'Eliminado de favoritos' };
    } else {
      await serviceDatabase.addToFavorites(userId, serviceId);
      return { isFavorite: true, message: 'Agregado a favoritos' };
    }
  }

  /**
   * Verificar si un servicio está en favoritos
   */
  async isFavorite(userId: string, serviceId: string): Promise<boolean> {
    return await serviceDatabase.isFavorite(userId, serviceId);
  }

  /**
   * Obtener servicios favoritos de un usuario
   */
  async getFavoriteServices(userId: string) {
    return await serviceDatabase.findFavoritesByUserId(userId);
  }
}

export const serviceModel = new ServiceModel();
