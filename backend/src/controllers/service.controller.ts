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
   * POST /api/services/:id/view
   * Incrementar contador de vistas
   */
  async incrementViews(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      await serviceService.incrementViews(id);
      
      res.status(200).json({
        success: true,
        message: 'Vista registrada',
      });
    } catch (error) {
      console.error('[SERVICE] Error en incrementViews:', error);
      res.status(500).json({
        success: false,
        message: 'Error al registrar vista',
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
}

export const serviceController = new ServiceController();
