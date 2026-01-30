import { serviceModel } from '../models/service.model';

/**
 * Servicio de servicios
 * Lógica de negocio adicional relacionada con servicios
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
      return await serviceModel.getServices(filters);
    } catch (error) {
      console.error('Error en ServiceService.getServices:', error);
      throw error;
    }
  }

  /**
   * Obtener un servicio por ID con todas sus relaciones
   */
  async getServiceById(id: string) {
    try {
      const service = await serviceModel.getServiceById(id);
      
      if (!service) {
        return null;
      }

      return service;
    } catch (error) {
      console.error('Error en ServiceService.getServiceById:', error);
      throw error;
    }
  }

  /**
   * Obtener todas las categorías activas
   */
  async getCategories() {
    try {
      return await serviceModel.getCategories();
    } catch (error) {
      console.error('Error en ServiceService.getCategories:', error);
      throw error;
    }
  }

  /**
   * Toggle favorito: agregar o eliminar de favoritos
   */
  async toggleFavorite(userId: string, serviceId: string) {
    try {
      return await serviceModel.toggleFavorite(userId, serviceId);
    } catch (error) {
      console.error('Error en ServiceService.toggleFavorite:', error);
      throw error;
    }
  }

  /**
   * Verificar si un servicio está en favoritos
   */
  async isFavorite(userId: string, serviceId: string): Promise<boolean> {
    try {
      return await serviceModel.isFavorite(userId, serviceId);
    } catch (error) {
      console.error('Error en ServiceService.isFavorite:', error);
      throw error;
    }
  }

  /**
   * Obtener servicios favoritos de un usuario
   */
  async getFavoriteServices(userId: string) {
    try {
      return await serviceModel.getFavoriteServices(userId);
    } catch (error) {
      console.error('Error en ServiceService.getFavoriteServices:', error);
      throw error;
    }
  }

  /**
   * Incrementar contador de vistas de un servicio
   */
  async incrementViews(serviceId: string): Promise<void> {
    try {
      await serviceModel.incrementViews(serviceId);
    } catch (error) {
      console.error('Error en ServiceService.incrementViews:', error);
      throw error;
    }
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
    que_incluye?: string;
    que_no_incluye?: string;
    requisitos?: string;
    politica_cancelacion?: string;
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
    try {
      return await serviceModel.createService(data);
    } catch (error) {
      console.error('Error en ServiceService.createService:', error);
      throw error;
    }
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
    try {
      return await serviceModel.addServiceImage(data);
    } catch (error) {
      console.error('Error en ServiceService.addServiceImage:', error);
      throw error;
    }
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
    try {
      return await serviceModel.addServiceAvailability(data);
    } catch (error) {
      console.error('Error en ServiceService.addServiceAvailability:', error);
      throw error;
    }
  }

  /**
   * Actualizar un servicio existente
   */
  async updateService(id: string, data: {
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
      return await serviceModel.updateService(id, data);
    } catch (error) {
      console.error('Error en ServiceService.updateService:', error);
      throw error;
    }
  }

  /**
   * Eliminar un servicio
   */
  async deleteService(id: string) {
    try {
      return await serviceModel.deleteService(id);
    } catch (error) {
      console.error('Error en ServiceService.deleteService:', error);
      throw error;
    }
  }

  /**
   * Eliminar imágenes de un servicio
   */
  async deleteServiceImages(serviceId: string) {
    try {
      return await serviceModel.deleteServiceImages(serviceId);
    } catch (error) {
      console.error('Error en ServiceService.deleteServiceImages:', error);
      throw error;
    }
  }

  /**
   * Eliminar disponibilidad de un servicio
   */
  async deleteServiceAvailability(serviceId: string) {
    try {
      return await serviceModel.deleteServiceAvailability(serviceId);
    } catch (error) {
      console.error('Error en ServiceService.deleteServiceAvailability:', error);
      throw error;
    }
  }
}

export const serviceService = new ServiceService();
