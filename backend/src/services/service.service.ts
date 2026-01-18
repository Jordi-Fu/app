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

      // Incrementar contador de vistas
      await serviceModel.incrementViews(id);

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
}

export const serviceService = new ServiceService();
