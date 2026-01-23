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
  usuario: string;
  correo: string;
  nombre: string;
  apellido: string;
  telefono: string | null;
  codigo_pais: string;
  url_avatar: string | null;
  biografia: string | null;
  tipo_usuario: 'cliente' | 'proveedor' | 'ambos';
  rol_usuario: 'usuario' | 'proveedor' | 'admin' | 'moderador';
  esta_verificado: boolean;
  esta_activo: boolean;
  promedio_calificacion: number;
  total_resenas: number;
  creado_en: Date;
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
