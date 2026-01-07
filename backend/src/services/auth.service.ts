import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.config';
import { userModel, tokenModel } from '../models';
import { 
  AuthResponse, 
  AuthTokens, 
  JwtPayload, 
  LoginRequest,
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
