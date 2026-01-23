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
      
      const result = await authService.login({ credencial: credential, password });
      
      if (!result.exito) {
        res.status(401).json({
          success: result.exito,
          message: result.mensaje,
        });
        return;
      }
      
      // Mapear respuesta al formato esperado por el frontend
      res.status(200).json({
        success: result.exito,
        message: result.mensaje,
        user: result.usuario,
        tokens: result.tokens,
      });
    } catch (error) {
      console.error('[AUTH] Error en login:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  /**
   * POST /api/auth/register
   * Registro de usuario
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { nombre, apellidos, telefono, fechaNacimiento, username, email, password, bio, profilePhoto } = req.body;
      
      const result = await authService.register({
        nombre,
        apellidos,
        telefono,
        fechaNacimiento,
        usuario: username,
        correo: email,
        password,
        biografia: bio,
        fotoPerfilBase64: profilePhoto,
      });
      
      if (!result.exito) {
        res.status(400).json({
          success: result.exito,
          message: result.mensaje,
        });
        return;
      }
      
      // Mapear respuesta al formato esperado por el frontend
      res.status(201).json({
        success: result.exito,
        message: result.mensaje,
        user: result.usuario,
        tokens: result.tokens,
      });
    } catch (error) {
      console.error('[AUTH] Error en registro:', error);
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
      
      if (!result.exito) {
        res.status(401).json({
          success: result.exito,
          message: result.mensaje,
        });
        return;
      }
      
      res.status(200).json({
        success: result.exito,
        message: result.mensaje,
        user: result.usuario,
        tokens: result.tokens,
      });
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
      const idUsuario = req.user?.idUsuario;
      
      const result = await authService.logout(refreshToken, idUsuario);
      
      res.status(200).json({
        success: result.exito,
        message: result.mensaje,
      });
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
      const idUsuario = req.user?.idUsuario;
      
      if (!idUsuario) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
        });
        return;
      }
      
      const usuario = await authService.getCurrentUser(idUsuario);
      
      if (!usuario) {
        res.status(404).json({
          success: false,
          message: 'Usuario no encontrado',
        });
        return;
      }
      
      res.status(200).json({
        success: true,
        user: usuario,
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

  /**
   * POST /api/auth/forgot-password
   * Solicitar recuperación de contraseña
   */
  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      
      const result = await authService.requestPasswordReset(email);
      
      res.status(200).json({
        success: result.exito,
        message: result.mensaje,
        debug: result.debug,
      });
    } catch (error) {
      console.error('[AUTH] Error en forgot-password:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  /**
   * POST /api/auth/verify-reset-code
   * Verificar código de recuperación
   */
  async verifyResetCode(req: Request, res: Response): Promise<void> {
    try {
      const { email, code } = req.body;
      
      const result = await authService.verifyResetCode(email, code);
      
      if (!result.exito) {
        res.status(400).json({
          success: result.exito,
          message: result.mensaje,
        });
        return;
      }
      
      res.status(200).json({
        success: result.exito,
        message: result.mensaje,
        resetToken: result.tokenReset,
      });
    } catch (error) {
      console.error('[AUTH] Error en verify-reset-code:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }

  /**
   * POST /api/auth/reset-password
   * Restablecer contraseña
   */
  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { resetToken, newPassword } = req.body;
      
      const result = await authService.resetPassword(resetToken, newPassword);
      
      if (!result.exito) {
        res.status(400).json({
          success: result.exito,
          message: result.mensaje,
        });
        return;
      }
      
      res.status(200).json({
        success: result.exito,
        message: result.mensaje,
      });
    } catch (error) {
      console.error('[AUTH] Error en reset-password:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
      });
    }
  }
}

export const authController = new AuthController();
