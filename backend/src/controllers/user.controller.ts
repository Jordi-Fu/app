import { Request, Response } from 'express';
import { userService } from '../services';

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
}

export const userController = new UserController();
