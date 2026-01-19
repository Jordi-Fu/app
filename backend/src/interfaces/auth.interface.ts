/**
 * Interfaz para el usuario en la base de datos
 */
export interface User {
  id: string;
  username: string;
  email: string;
  password: string; // Hash de la contraseña (password_hash en DB)
  firstName: string;
  lastName: string;
  phone: string | null;
  countryCode: string;
  avatarUrl: string | null;
  bio: string | null;
  userType: 'client' | 'provider' | 'both';
  userRole: 'user' | 'provider' | 'admin' | 'moderator';
  isVerified: boolean;
  isActive: boolean;
  isOnline: boolean;
  lastSeen: Date | null;
  ratingAverage: number;
  totalReviews: number;
  failedLoginAttempts: number;
  lockedUntil: Date | null;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Datos seguros del usuario (sin contraseña)
 */
export interface SafeUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  countryCode: string;
  avatarUrl: string | null;
  bio: string | null;
  userType: 'client' | 'provider' | 'both';
  userRole: 'user' | 'provider' | 'admin' | 'moderator';
  isVerified: boolean;
  isActive: boolean;
  ratingAverage: number;
  totalReviews: number;
  createdAt: Date;
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
  resetToken?: string; // Token para restablecer contraseña
  debug?: any; // Información de debug (solo desarrollo)
}

/**
 * Request de login
 */
export interface LoginRequest {
  credential: string; // username, email o phone
  password: string;
}

/**
 * Request de registro
 */
export interface RegisterRequest {
  nombre: string;
  apellidos: string;
  telefono: string;
  username: string;
  email: string;
  password: string;
  bio?: string;
  profilePhoto?: string;
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
