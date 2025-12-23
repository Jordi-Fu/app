import { Request, Response } from 'express';
import { authService } from '../services';

/**
 * Controlador de autenticación
 * Maneja las peticiones HTTP y delega la lógica al servicio
 */
class AuthController {
  /**
   * POST /api/auth/login
   * Login de usuario
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { credential, password } = req.body;
      
      const result = await authService.login({ credential, password });
      
      if (!result.success) {
        res.status(401).json(result);
        return;
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('[AUTH] Error en login:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  /**
   * POST /api/auth/refresh
   * Renovar tokens
   */
  async refresh(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      
      const result = await authService.refreshTokens(refreshToken);
      
      if (!result.success) {
        res.status(401).json(result);
        return;
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('[AUTH] Error en refresh:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  /**
   * POST /api/auth/logout
   * Cerrar sesión
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      const userId = req.user?.userId;
      
      const result = await authService.logout(refreshToken, userId);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('[AUTH] Error en logout:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  /**
   * GET /api/auth/me
   * Obtener usuario actual
   */
  async me(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      
      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
        });
        return;
      }
      
      const user = authService.getCurrentUser(userId);
      
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado',
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      console.error('[AUTH] Error en me:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  /**
   * GET /api/auth/verify
   * Verificar si el token es válido
   */
  verify(req: Request, res: Response): void {
    res.status(200).json({
      success: true,
      message: 'Token válido',
      user: req.user,
    });
  }
}

export const authController = new AuthController();
