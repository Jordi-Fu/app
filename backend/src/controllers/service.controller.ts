import { Request, Response } from 'express';
import { serviceService } from '../services';

/**
 * Controlador de servicios
 * Maneja las peticiones HTTP relacionadas con servicios
 */
class ServiceController {
  /**
   * GET /api/services
   * Obtener lista de servicios con filtros
   */
  async getServices(req: Request, res: Response): Promise<void> {
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
      } = req.query;

      const result = await serviceService.getServices({
        category_id: category_id as string,
        city: city as string,
        state: state as string,
        price_min: price_min ? Number(price_min) : undefined,
        price_max: price_max ? Number(price_max) : undefined,
        location_type: location_type as any,
        rating_min: rating_min ? Number(rating_min) : undefined,
        search: search as string,
        page: Number(page),
        limit: Number(limit),
        provider_id: provider_id as string,
        is_featured: is_featured ? is_featured === 'true' : undefined,
        is_verified: is_verified ? is_verified === 'true' : undefined,
      });

      res.status(200).json(result);
    } catch (error) {
      console.error('[SERVICE] Error en getServices:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener servicios',
      });
    }
  }

  /**
   * GET /api/services/:id
   * Obtener un servicio por ID
   */
  async getServiceById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const service = await serviceService.getServiceById(id);
      
      if (!service) {
        res.status(404).json({
          success: false,
          message: 'Servicio no encontrado',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: service,
      });
    } catch (error) {
      console.error('[SERVICE] Error en getServiceById:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener servicio',
      });
    }
  }

  /**
   * GET /api/services/featured
   * Obtener servicios destacados
   */
  async getFeaturedServices(req: Request, res: Response): Promise<void> {
    try {
      const { limit = 10 } = req.query;
      
      const result = await serviceService.getServices({
        is_featured: true,
        page: 1,
        limit: Number(limit),
      });

      res.status(200).json(result);
    } catch (error) {
      console.error('[SERVICE] Error en getFeaturedServices:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener servicios destacados',
      });
    }
  }

  /**
   * GET /api/services/provider/:providerId
   * Obtener servicios de un proveedor
   */
  async getServicesByProvider(req: Request, res: Response): Promise<void> {
    try {
      const { providerId } = req.params;
      
      const result = await serviceService.getServices({
        provider_id: providerId,
        page: 1,
        limit: 100,
      });

      res.status(200).json(result);
    } catch (error) {
      console.error('[SERVICE] Error en getServicesByProvider:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener servicios del proveedor',
      });
    }
  }

  /**
   * GET /api/categories
   * Obtener categorías de servicios
   */
  async getCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await serviceService.getCategories();
      
      res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      console.error('[SERVICE] Error en getCategories:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener categorías',
      });
    }
  }

  /**
   * POST /api/services/:id/favorite
   * Toggle favorito (agregar o eliminar)
   */
  async toggleFavorite(req: Request, res: Response): Promise<void> {
    try {
      const { id: serviceId } = req.params;
      const userId = (req as any).user?.userId; // Asumiendo que el middleware de autenticación agrega el userId

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
        });
        return;
      }

      const result = await serviceService.toggleFavorite(userId, serviceId);
      
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      console.error('[SERVICE] Error en toggleFavorite:', error);
      res.status(500).json({
        success: false,
        message: 'Error al actualizar favoritos',
      });
    }
  }

  /**
   * GET /api/services/:id/is-favorite
   * Verificar si un servicio está en favoritos
   */
  async checkIsFavorite(req: Request, res: Response): Promise<void> {
    try {
      const { id: serviceId } = req.params;
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(200).json({
          success: true,
          isFavorite: false,
        });
        return;
      }

      const isFavorite = await serviceService.isFavorite(userId, serviceId);
      
      res.status(200).json({
        success: true,
        isFavorite,
      });
    } catch (error) {
      console.error('[SERVICE] Error en checkIsFavorite:', error);
      res.status(500).json({
        success: false,
        message: 'Error al verificar favorito',
      });
    }
  }

  /**
   * GET /api/services/favorites
   * Obtener servicios favoritos del usuario
   */
  async getFavoriteServices(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
        });
        return;
      }

      const favorites = await serviceService.getFavoriteServices(userId);
      
      res.status(200).json({
        success: true,
        data: favorites,
        total: favorites.length,
      });
    } catch (error) {
      console.error('[SERVICE] Error en getFavoriteServices:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener servicios favoritos',
      });
    }
  }

  /**
   * POST /api/services/:id/views
   * Incrementar las vistas de un servicio
   */
  async incrementViews(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      await serviceService.incrementViews(id);
      
      res.status(200).json({
        success: true,
        message: 'Vista registrada correctamente',
      });
    } catch (error) {
      console.error('[SERVICE] Error en incrementViews:', error);
      res.status(500).json({
        success: false,
        message: 'Error al registrar vista',
      });
    }
  }
}

export const serviceController = new ServiceController();
