import { Request, Response } from 'express';
import { serviceService } from '../services';
import { validationResult } from 'express-validator';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

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
      const userId = req.user?.idUsuario;

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
      const userId = req.user?.idUsuario;

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
      const userId = req.user?.idUsuario;

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

  /**
   * POST /api/services
   * Crear un nuevo servicio
   */
  async createService(req: Request, res: Response): Promise<void> {
    try {
      // Validar errores de express-validator
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Errores de validación',
          errors: errors.array(),
        });
        return;
      }

      // El JWT usa "idUsuario", no "userId"
      const userId = (req as any).user?.idUsuario || (req as any).user?.userId;

      if (!userId) {
        console.error('[SERVICE] No se encontró userId en el token:', (req as any).user);
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
        });
        return;
      }

      const {
        titulo,
        descripcion,
        categoria_id,
        tipo_precio,
        precio,
        moneda,
        duracion_minutos,
        tipo_ubicacion,
        direccion,
        ciudad,
        estado,
        pais,
        codigo_postal,
        latitud,
        longitud,
        radio_servicio_km,
        incluye,
        no_incluye,
        disponibilidad_urgencias,
        precio_urgencias,
        imagenes,
        disponibilidad,
      } = req.body;

      // Crear el servicio
      const service = await serviceService.createService({
        proveedor_id: userId,
        categoria_id,
        titulo,
        descripcion,
        tipo_precio,
        precio: precio ? Number(precio) : undefined,
        moneda: moneda || 'EUR',
        duracion_minutos: duracion_minutos ? Number(duracion_minutos) : undefined,
        tipo_ubicacion,
        direccion,
        ciudad,
        estado,
        pais,
        codigo_postal,
        latitud: latitud ? Number(latitud) : undefined,
        longitud: longitud ? Number(longitud) : undefined,
        radio_servicio_km: radio_servicio_km ? Number(radio_servicio_km) : undefined,
        incluye,
        no_incluye,
        disponibilidad_urgencias: disponibilidad_urgencias || false,
        precio_urgencias: precio_urgencias ? Number(precio_urgencias) : undefined,
      });

      // Procesar y guardar imágenes
      const savedImages = [];
      if (imagenes && Array.isArray(imagenes) && imagenes.length > 0) {
        const uploadsDir = path.join(__dirname, '../../uploads/services');
        
        // Crear directorio si no existe
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        for (let i = 0; i < imagenes.length; i++) {
          const img = imagenes[i];
          if (img.base64) {
            // Remover prefijo data:image/...;base64, si existe
            const base64Data = img.base64.replace(/^data:image\/\w+;base64,/, '');
            const formato = img.formato || 'jpeg';
            const fileName = `${uuidv4()}.${formato}`;
            const filePath = path.join(uploadsDir, fileName);

            // Guardar archivo
            fs.writeFileSync(filePath, base64Data, 'base64');

            // Guardar en BD
            const imageRecord = await serviceService.addServiceImage({
              servicio_id: service.id,
              url_imagen: `/uploads/services/${fileName}`,
              es_principal: i === 0,
              indice_orden: i,
            });
            savedImages.push(imageRecord);
          }
        }
      }

      // Guardar disponibilidad
      const savedAvailability = [];
      if (disponibilidad && Array.isArray(disponibilidad) && disponibilidad.length > 0) {
        for (const slot of disponibilidad) {
          const availabilityRecord = await serviceService.addServiceAvailability({
            servicio_id: service.id,
            dia_semana: slot.dia_semana,
            hora_inicio: slot.hora_inicio,
            hora_fin: slot.hora_fin,
            esta_disponible: slot.esta_disponible !== false,
          });
          savedAvailability.push(availabilityRecord);
        }
      }

      res.status(201).json({
        success: true,
        message: 'Servicio creado correctamente',
        data: {
          ...service,
          images: savedImages,
          availability: savedAvailability,
        },
      });
    } catch (error) {
      console.error('[SERVICE] Error en createService:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear el servicio',
      });
    }
  }
}

export const serviceController = new ServiceController();
