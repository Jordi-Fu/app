import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.config';
import { userModel, tokenModel, passwordResetModel } from '../models';
import { emailService } from './email.service';
import { 
  AuthResponse, 
  AuthTokens, 
  JwtPayload, 
  LoginRequest,
  RegisterRequest,
  SafeUser 
} from '../interfaces';

/**
 * Servicio de autenticación - Lógica de negocio
 */
class AuthService {
  /**
   * Login de usuario
   */
  async login(loginData: LoginRequest): Promise<AuthResponse> {
    const { credential, password } = loginData;
    
    // Buscar usuario por credencial
    const user = await userModel.findByCredential(credential);
    
    if (!user) {
      // Respuesta genérica para no revelar si el usuario existe
      return {
        success: false,
        message: 'Credenciales inválidas',
      };
    }
    
    // Verificar si la cuenta está bloqueada
    if (userModel.isLocked(user)) {
      const minutesLeft = userModel.getLockTimeRemaining(user);
      return {
        success: false,
        message: `Cuenta bloqueada temporalmente. Intenta en ${minutesLeft} minutos.`,
      };
    }
    
    // Verificar si la cuenta está activa
    if (!user.isActive) {
      return {
        success: false,
        message: 'Cuenta desactivada. Contacta al soporte.',
      };
    }
    
    // Verificar contraseña
    const isPasswordValid = await userModel.verifyPassword(password, user.password);
    
    if (!isPasswordValid) {
      // Incrementar intentos fallidos
      await userModel.incrementFailedAttempts(user.id);
      
      const updatedUser = await userModel.findById(user.id);
      const attemptsLeft = 5 - (updatedUser?.failedLoginAttempts || 0);
      
      return {
        success: false,
        message: attemptsLeft > 0 
          ? `Credenciales inválidas. ${attemptsLeft} intentos restantes.`
          : 'Cuenta bloqueada por múltiples intentos fallidos.',
      };
    }
    
    // Login exitoso - resetear intentos
    await userModel.resetFailedAttempts(user.id);
    
    // Generar tokens
    const tokens = this.generateTokens(user.id, user.username, user.email);
    
    // Guardar refresh token
    const refreshExpiry = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 días
    tokenModel.store(tokens.refreshToken, user.id, refreshExpiry);
    
    return {
      success: true,
      message: 'Login exitoso',
      user: userModel.toSafeUser(user),
      tokens,
    };
  }

  /**
   * Registro de nuevo usuario
   */
  async register(registerData: RegisterRequest): Promise<AuthResponse> {
    // Validar que el username no esté en uso
    const usernameExists = await userModel.existsByUsername(registerData.username);
    if (usernameExists) {
      return {
        success: false,
        message: 'El nombre de usuario ya está en uso',
      };
    }

    // Validar que el email no esté en uso
    const emailExists = await userModel.existsByEmail(registerData.email);
    if (emailExists) {
      return {
        success: false,
        message: 'El email ya está registrado',
      };
    }

    // Validar que el teléfono no esté en uso
    const phoneExists = await userModel.existsByPhone(registerData.telefono);
    if (phoneExists) {
      return {
        success: false,
        message: 'El teléfono ya está registrado',
      };
    }

    // Crear usuario
    const newUser = await userModel.create(registerData);

    if (!newUser) {
      return {
        success: false,
        message: 'Error al crear el usuario. Intenta nuevamente.',
      };
    }

    // Generar tokens automáticamente
    const tokens = this.generateTokens(newUser.id, newUser.username, newUser.email);

    // Guardar refresh token
    const refreshExpiry = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 días
    tokenModel.store(tokens.refreshToken, newUser.id, refreshExpiry);

    return {
      success: true,
      message: 'Usuario registrado exitosamente',
      user: userModel.toSafeUser(newUser),
      tokens,
    };
  }
  
  /**
   * Refresh de tokens
   */
  async refreshTokens(refreshToken: string): Promise<AuthResponse> {
    try {
      // Verificar que el refresh token existe y es válido
      if (!tokenModel.isValid(refreshToken)) {
        return {
          success: false,
          message: 'Token de refresco inválido o expirado',
        };
      }
      
      // Verificar JWT
      const decoded = jwt.verify(refreshToken, ENV.JWT_REFRESH_SECRET) as JwtPayload;
      
      // Buscar usuario
      const user = await userModel.findById(decoded.userId);
      
      if (!user || !user.isActive) {
        tokenModel.delete(refreshToken);
        return {
          success: false,
          message: 'Usuario no encontrado o inactivo',
        };
      }
      
      // Eliminar token antiguo
      tokenModel.delete(refreshToken);
      
      // Generar nuevos tokens
      const tokens = this.generateTokens(user.id, user.username, user.email);
      
      // Guardar nuevo refresh token
      const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      tokenModel.store(tokens.refreshToken, user.id, refreshExpiry);
      
      return {
        success: true,
        message: 'Tokens renovados',
        user: userModel.toSafeUser(user),
        tokens,
      };
    } catch (error) {
      tokenModel.delete(refreshToken);
      return {
        success: false,
        message: 'Token de refresco inválido',
      };
    }
  }
  
  /**
   * Logout - Invalidar tokens
   */
  async logout(refreshToken: string, userId?: string): Promise<AuthResponse> {
    // Eliminar refresh token específico
    if (refreshToken) {
      tokenModel.delete(refreshToken);
    }
    
    // Opcionalmente eliminar todos los tokens del usuario
    if (userId) {
      tokenModel.deleteAllByUserId(userId);
    }
    
    return {
      success: true,
      message: 'Sesión cerrada correctamente',
    };
  }
  
  /**
   * Verificar token de acceso
   */
  verifyAccessToken(token: string): JwtPayload | null {
    try {
      const decoded = jwt.verify(token, ENV.JWT_SECRET) as JwtPayload;
      return decoded;
    } catch {
      return null;
    }
  }
  
  /**
   * Obtener usuario actual
   */
  async getCurrentUser(userId: string): Promise<SafeUser | null> {
    const user = await userModel.findById(userId);
    if (!user) return null;
    return userModel.toSafeUser(user);
  }

  /**
   * Solicitar recuperación de contraseña
   */
  async requestPasswordReset(email: string): Promise<AuthResponse> {
    // Buscar usuario por email
    const user = await userModel.findByCredential(email);

    // Por seguridad, siempre retornamos éxito aunque el usuario no exista
    // Esto previene que se pueda verificar qué emails están registrados
    if (!user) {
      return {
        success: true,
        message: 'Si el email existe, recibirás un código de verificación',
      };
    }

    // Generar código de reset
    const { code, expiresAt } = passwordResetModel.createResetCode(email);

    // Enviar email con el código
    try {
      const emailSent = await emailService.sendPasswordResetCode(email, code);
      
      if (!emailSent) {
        console.error('[PASSWORD RESET] Error al enviar email');
        // En caso de error al enviar, mostramos el código en consola en desarrollo
        if (ENV.isDevelopment) {
          console.log(`[PASSWORD RESET] Código para ${email}: ${code}`);
          console.log(`[PASSWORD RESET] Expira: ${expiresAt}`);
        }
      }
    } catch (error) {
      console.error('[PASSWORD RESET] Error al enviar email:', error);
      // En desarrollo, mostramos el código en consola si falla el email
      if (ENV.isDevelopment) {
        console.log(`[PASSWORD RESET] Código para ${email}: ${code}`);
        console.log(`[PASSWORD RESET] Expira: ${expiresAt}`);
      }
    }

    return {
      success: true,
      message: 'Código de verificación enviado a tu email',
      // En desarrollo, devolvemos el código como fallback
      debug: ENV.isDevelopment ? { code } : undefined,
    };
  }

  /**
   * Verificar código de recuperación
   */
  async verifyResetCode(email: string, code: string): Promise<AuthResponse> {
    const result = passwordResetModel.verifyCode(email, code);

    if (!result.valid) {
      return {
        success: false,
        message: result.message || 'Código inválido',
      };
    }

    return {
      success: true,
      message: 'Código verificado correctamente',
      resetToken: result.resetToken,
    };
  }

  /**
   * Restablecer contraseña con token
   */
  async resetPassword(resetToken: string, newPassword: string): Promise<AuthResponse> {
    // Validar token
    const tokenValidation = passwordResetModel.validateResetToken(resetToken);

    if (!tokenValidation.valid || !tokenValidation.email) {
      return {
        success: false,
        message: tokenValidation.message || 'Token inválido',
      };
    }

    // Buscar usuario
    const user = await userModel.findByCredential(tokenValidation.email);

    if (!user) {
      return {
        success: false,
        message: 'Usuario no encontrado',
      };
    }

    // Actualizar contraseña
    const updated = await userModel.updatePassword(user.id, newPassword);

    if (!updated) {
      return {
        success: false,
        message: 'Error al actualizar la contraseña',
      };
    }

    // Consumir token (ya no se puede usar de nuevo)
    passwordResetModel.consumeResetToken(resetToken);

    // Invalidar todos los tokens de sesión actuales
    tokenModel.revokeAllByUserId(user.id);

    return {
      success: true,
      message: 'Contraseña actualizada exitosamente',
    };
  }
  
  /**
   * Generar par de tokens
   */
  private generateTokens(userId: string, username: string, email: string): AuthTokens {
    const payload: JwtPayload = { userId, username, email };
    
    const accessToken = jwt.sign(
      payload, 
      ENV.JWT_SECRET,
      { expiresIn: ENV.JWT_EXPIRES_IN } as jwt.SignOptions
    );
    
    const refreshToken = jwt.sign(
      payload, 
      ENV.JWT_REFRESH_SECRET,
      { expiresIn: ENV.JWT_REFRESH_EXPIRES_IN } as jwt.SignOptions
    );
    
    return {
      accessToken,
      refreshToken,
      expiresIn: ENV.JWT_EXPIRES_IN,
    };
  }
}

export const authService = new AuthService();
