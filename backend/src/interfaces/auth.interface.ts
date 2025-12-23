/**
 * Interfaz para el usuario en la base de datos
 */
export interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  password: string; // Hash de la contraseña
  createdAt: Date;
  updatedAt: Date;
  failedLoginAttempts: number;
  lockUntil: Date | null;
  isActive: boolean;
}

/**
 * Datos seguros del usuario (sin contraseña)
 */
export interface SafeUser {
  id: string;
  username: string;
  email: string;
  phone: string;
  createdAt: Date;
  isActive: boolean;
}

/**
 * Payload del token JWT
 */
export interface JwtPayload {
  userId: string;
  username: string;
  email: string;
  iat?: number;
  exp?: number;
}

/**
 * Tokens de autenticación
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

/**
 * Respuesta de autenticación
 */
export interface AuthResponse {
  success: boolean;
  message: string;
  user?: SafeUser;
  tokens?: AuthTokens;
}

/**
 * Request de login
 */
export interface LoginRequest {
  credential: string; // username, email o phone
  password: string;
}

/**
 * Refresh token almacenado
 */
export interface StoredRefreshToken {
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
}
