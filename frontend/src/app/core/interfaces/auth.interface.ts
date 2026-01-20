/**
 * Interfaces de autenticación para el frontend
 */

export interface LoginRequest {
  credential: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  apellidos: string;
  telefono: string;
  fechaNacimiento: string;
  username: string;
  email: string;
  password: string;
  bio?: string;
  profilePhoto?: string;
}

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
