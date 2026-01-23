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
    const { credencial, password } = loginData;
    
    // Buscar usuario por credencial
    const user = await userModel.findByCredential(credencial);
    
    if (!user) {
      // Respuesta genérica para no revelar si el usuario existe
      return {
        exito: false,
        mensaje: 'Credenciales inválidas',
      };
    }
    
    // Verificar si la cuenta está bloqueada
    if (userModel.isLocked(user)) {
      const minutosRestantes = userModel.getLockTimeRemaining(user);
      return {
        exito: false,
        mensaje: `Cuenta bloqueada temporalmente. Intenta en ${minutosRestantes} minutos.`,
      };
    }
    
    // Verificar si la cuenta está activa
    if (!user.esta_activo) {
      return {
        exito: false,
        mensaje: 'Cuenta desactivada. Contacta al soporte.',
      };
    }
    
    // Verificar contraseña
    const esPasswordValida = await userModel.verifyPassword(password, user.hash_password);
    
    if (!esPasswordValida) {
      // Incrementar intentos fallidos
      await userModel.incrementFailedAttempts(user.id);
      
      const usuarioActualizado = await userModel.findById(user.id);
      const intentosRestantes = 5 - (usuarioActualizado?.intentos_fallidos_login || 0);
      
      return {
        exito: false,
        mensaje: intentosRestantes > 0 
          ? `Credenciales inválidas. ${intentosRestantes} intentos restantes.`
          : 'Cuenta bloqueada por múltiples intentos fallidos.',
      };
    }
    
    // Login exitoso - resetear intentos
    await userModel.resetFailedAttempts(user.id);
    
    // Generar tokens
    const tokens = this.generateTokens(user.id, user.usuario, user.correo);
    
    // Guardar refresh token
    const expiraRefresh = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 días
    tokenModel.store(tokens.refreshToken, user.id, expiraRefresh);
    
    return {
      exito: true,
      mensaje: 'Login exitoso',
      usuario: userModel.toSafeUser(user),
      tokens,
    };
  }

  /**
   * Registro de nuevo usuario
   */
  async register(registerData: RegisterRequest): Promise<AuthResponse> {
    // Validar que el username no esté en uso
    const existeUsuario = await userModel.existsByUsername(registerData.usuario);
    if (existeUsuario) {
      return {
        exito: false,
        mensaje: 'El nombre de usuario ya está en uso',
      };
    }

    // Validar que el email no esté en uso
    const existeEmail = await userModel.existsByEmail(registerData.correo);
    if (existeEmail) {
      return {
        exito: false,
        mensaje: 'El email ya está registrado',
      };
    }

    // Validar que el teléfono no esté en uso
    const existeTelefono = await userModel.existsByPhone(registerData.telefono);
    if (existeTelefono) {
      return {
        exito: false,
        mensaje: 'El teléfono ya está registrado',
      };
    }

    // Crear usuario
    const nuevoUsuario = await userModel.create(registerData);

    if (!nuevoUsuario) {
      return {
        exito: false,
        mensaje: 'Error al crear el usuario. Intenta nuevamente.',
      };
    }

    // Generar tokens automáticamente
    const tokens = this.generateTokens(nuevoUsuario.id, nuevoUsuario.usuario, nuevoUsuario.correo);

    // Guardar refresh token
    const expiraRefresh = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 días
    tokenModel.store(tokens.refreshToken, nuevoUsuario.id, expiraRefresh);

    return {
      exito: true,
      mensaje: 'Usuario registrado exitosamente',
      usuario: userModel.toSafeUser(nuevoUsuario),
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
          exito: false,
          mensaje: 'Token de refresco inválido o expirado',
        };
      }
      
      // Verificar JWT
      const decoded = jwt.verify(refreshToken, ENV.JWT_REFRESH_SECRET) as JwtPayload;
      
      // Buscar usuario
      const user = await userModel.findById(decoded.idUsuario);
      
      if (!user || !user.esta_activo) {
        tokenModel.delete(refreshToken);
        return {
          exito: false,
          mensaje: 'Usuario no encontrado o inactivo',
        };
      }
      
      // Eliminar token antiguo
      tokenModel.delete(refreshToken);
      
      // Generar nuevos tokens
      const tokens = this.generateTokens(user.id, user.usuario, user.correo);
      
      // Guardar nuevo refresh token
      const expiraRefresh = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      tokenModel.store(tokens.refreshToken, user.id, expiraRefresh);
      
      return {
        exito: true,
        mensaje: 'Tokens renovados',
        usuario: userModel.toSafeUser(user),
        tokens,
      };
    } catch (error) {
      tokenModel.delete(refreshToken);
      return {
        exito: false,
        mensaje: 'Token de refresco inválido',
      };
    }
  }
  
  /**
   * Logout - Invalidar tokens
   */
  async logout(refreshToken: string, idUsuario?: string): Promise<AuthResponse> {
    // Eliminar refresh token específico
    if (refreshToken) {
      tokenModel.delete(refreshToken);
    }
    
    // Opcionalmente eliminar todos los tokens del usuario
    if (idUsuario) {
      tokenModel.deleteAllByUserId(idUsuario);
    }
    
    return {
      exito: true,
      mensaje: 'Sesión cerrada correctamente',
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
  async getCurrentUser(idUsuario: string): Promise<SafeUser | null> {
    const user = await userModel.findById(idUsuario);
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
        exito: true,
        mensaje: 'Si el email existe, recibirás un código de verificación',
      };
    }

    // Generar código de reset
    const { code, expiresAt } = passwordResetModel.createResetCode(email);

    // Enviar email con el código
    try {
      const emailEnviado = await emailService.sendPasswordResetCode(email, code);
      
      if (!emailEnviado) {
        console.error('[PASSWORD RESET] Error al enviar email');
        // En caso de error al enviar, mostramos el código en consola en desarrollo
        if (ENV.isDevelopment) {
        
        }
      }
    } catch (error) {
      console.error('[PASSWORD RESET] Error al enviar email:', error);
    }

    return {
      exito: true,
      mensaje: 'Código de verificación enviado a tu email',
      // En desarrollo, devolvemos el código como fallback
      debug: ENV.isDevelopment ? { code } : undefined,
    };
  }

  /**
   * Verificar código de recuperación
   */
  async verifyResetCode(email: string, code: string): Promise<AuthResponse> {
    const resultado = passwordResetModel.verifyCode(email, code);

    if (!resultado.valid) {
      return {
        exito: false,
        mensaje: resultado.message || 'Código inválido',
      };
    }

    return {
      exito: true,
      mensaje: 'Código verificado correctamente',
      tokenReset: resultado.resetToken,
    };
  }

  /**
   * Restablecer contraseña con token
   */
  async resetPassword(tokenReset: string, nuevaPassword: string): Promise<AuthResponse> {
    // Validar token
    const validacionToken = passwordResetModel.validateResetToken(tokenReset);

    if (!validacionToken.valid || !validacionToken.email) {
      return {
        exito: false,
        mensaje: validacionToken.message || 'Token inválido',
      };
    }

    // Buscar usuario
    const user = await userModel.findByCredential(validacionToken.email);

    if (!user) {
      return {
        exito: false,
        mensaje: 'Usuario no encontrado',
      };
    }

    // Actualizar contraseña
    const actualizado = await userModel.updatePassword(user.id, nuevaPassword);

    if (!actualizado) {
      return {
        exito: false,
        mensaje: 'Error al actualizar la contraseña',
      };
    }

    // Consumir token (ya no se puede usar de nuevo)
    passwordResetModel.consumeResetToken(tokenReset);

    // Invalidar todos los tokens de sesión actuales
    tokenModel.revokeAllByUserId(user.id);

    return {
      exito: true,
      mensaje: 'Contraseña actualizada exitosamente',
    };
  }
  
  /**
   * Generar par de tokens
   */
  private generateTokens(idUsuario: string, usuario: string, correo: string): AuthTokens {
    const payload: JwtPayload = { idUsuario, usuario, correo };
    
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
      expiraEn: ENV.JWT_EXPIRES_IN,
    };
  }
}

export const authService = new AuthService();
