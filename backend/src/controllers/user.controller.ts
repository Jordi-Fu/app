import { Request, Response } from 'express';
import { userService } from '../services';
import { reviewModel } from '../models/review.model';

class UserController {
  /**
   * Obtener perfil público de un usuario por ID
   */
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.id;

      if (!userId || userId.trim() === '') {
        res.status(400).json({
          success: false,
          message: 'ID de usuario inválido'
        });
        return;
      }

      const user = await userService.getUserById(userId);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
        return;
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener información del usuario'
      });
    }
  }

  /**
   * Obtener servicios de un usuario
   */
  async getUserServices(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.id;

      if (!userId || userId.trim() === '') {
        res.status(400).json({
          success: false,
          message: 'ID de usuario inválido'
        });
        return;
      }

      const services = await userService.getUserServices(userId);

      res.json({
        success: true,
        data: services
      });
    } catch (error) {
      console.error('Error al obtener servicios del usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener servicios del usuario'
      });
    }
  }

  /**
   * Buscar usuarios por nombre/username
   */
  async searchUsers(req: Request, res: Response): Promise<void> {
    try {
      const query = req.query.q as string || '';
      const limit = parseInt(req.query.limit as string) || 20;

      if (query.length < 2) {
        // Si no hay query, devolver usuarios populares
        const users = await userService.getAllActiveUsers(limit);
        res.json({
          success: true,
          data: users
        });
        return;
      }

      const users = await userService.searchUsers(query, limit);

      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('Error al buscar usuarios:', error);
      res.status(500).json({
        success: false,
        message: 'Error al buscar usuarios'
      });
    }
  }

  /**
   * Obtener todos los usuarios activos
   */
  async getAllActiveUsers(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const users = await userService.getAllActiveUsers(limit);

      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('Error al obtener usuarios activos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener usuarios'
      });
    }
  }

  /**
   * Obtener reseñas recibidas por un usuario
   */
  async getUserReviews(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.id;
      const sortBy = (req.query.sort as 'recent' | 'oldest' | 'rating-desc' | 'rating-asc') || 'recent';
      const limit = parseInt(req.query.limit as string) || 50;

      if (!userId || userId.trim() === '') {
        res.status(400).json({
          success: false,
          message: 'ID de usuario inválido'
        });
        return;
      }

      const reviews = await reviewModel.getReviewsForUser(userId, sortBy, limit);
      const total = await reviewModel.countReviewsForUser(userId);

      res.json({
        success: true,
        data: reviews,
        total
      });
    } catch (error) {
      console.error('Error al obtener reseñas del usuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener reseñas del usuario'
      });
    }
  }
}

export const userController = new UserController();
