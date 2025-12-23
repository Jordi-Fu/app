/**
 * Interfaces de autenticación para el frontend
 */

export interface LoginRequest {
  credential: string;
  password: string;
}

export interface SafeUser {
  id: string;
  username: string;
  email: string;
  phone: string;
  createdAt: Date;
  isActive: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: SafeUser;
  tokens?: AuthTokens;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}
