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

  /**
   * Crear un nuevo servicio
   */
  async createService(data: {
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
    incluye?: string;
    no_incluye?: string;
    disponibilidad_urgencias?: boolean;
    precio_urgencias?: number;
    imagenes?: Array<{
      base64: string;
      formato: string;
    }>;
    disponibilidad?: Array<{
      dia_semana: number;
      hora_inicio: string;
      hora_fin: string;
      esta_disponible: boolean;
    }>;
  }) {
    // 1. Crear el servicio
    const service = await serviceDatabase.create({
      proveedor_id: data.proveedor_id,
      categoria_id: data.categoria_id,
      titulo: data.titulo,
      descripcion: data.descripcion,
      tipo_precio: data.tipo_precio,
      precio: data.precio,
      moneda: data.moneda,
      duracion_minutos: data.duracion_minutos,
      tipo_ubicacion: data.tipo_ubicacion,
      direccion: data.direccion,
      ciudad: data.ciudad,
      estado: data.estado,
      pais: data.pais,
      codigo_postal: data.codigo_postal,
      latitud: data.latitud,
      longitud: data.longitud,
      radio_servicio_km: data.radio_servicio_km,
      incluye: data.incluye,
      no_incluye: data.no_incluye,
      disponibilidad_urgencias: data.disponibilidad_urgencias,
      precio_urgencias: data.precio_urgencias,
    });

    // 2. Incrementar contador de servicios del usuario
    await serviceDatabase.incrementUserServiceCount(data.proveedor_id);

    return service;
  }

  /**
   * Añadir imagen a un servicio
   */
  async addServiceImage(data: {
    servicio_id: string;
    url_imagen: string;
    url_miniatura?: string;
    pie_de_foto?: string;
    es_principal: boolean;
    indice_orden: number;
    ancho?: number;
    alto?: number;
  }) {
    return await serviceDatabase.createImage(data);
  }

  /**
   * Añadir disponibilidad a un servicio
   */
  async addServiceAvailability(data: {
    servicio_id: string;
    dia_semana: number;
    hora_inicio: string;
    hora_fin: string;
    esta_disponible: boolean;
  }) {
    return await serviceDatabase.createAvailability(data);
  }
}

export const serviceModel = new ServiceModel();
