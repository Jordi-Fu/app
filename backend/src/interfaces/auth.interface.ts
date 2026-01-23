/**
 * Interfaz para el usuario en la base de datos
 */
export interface User {
  id: string;
  usuario: string;
  correo: string;
  hash_password: string;
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
  esta_en_linea: boolean;
  ultima_actividad: Date | null;
  promedio_calificacion: number;
  total_resenas: number;
  intentos_fallidos_login: number;
  bloqueado_hasta: Date | null;
  ultimo_login: Date | null;
  creado_en: Date;
  actualizado_en: Date;
}

/**
 * Datos seguros del usuario (sin contraseña)
 */
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

/**
 * Payload del token JWT
 */
export interface JwtPayload {
  idUsuario: string;
  usuario: string;
  correo: string;
  iat?: number;
  exp?: number;
}

/**
 * Tokens de autenticación
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiraEn: string;
}

/**
 * Respuesta de autenticación
 */
export interface AuthResponse {
  exito: boolean;
  mensaje: string;
  usuario?: SafeUser;
  tokens?: AuthTokens;
  tokenReset?: string;
  debug?: any;
}

/**
 * Request de login
 */
export interface LoginRequest {
  credencial: string;
  password: string;
}

/**
 * Request de registro
 */
export interface RegisterRequest {
  nombre: string;
  apellidos: string;
  telefono: string;
  fechaNacimiento: string;
  usuario: string;
  correo: string;
  password: string;
  biografia?: string;
  fotoPerfilBase64?: string;
}

/**
 * Refresh token almacenado
 */
export interface StoredRefreshToken {
  token: string;
  idUsuario: string;
  expiraEn: Date;
  creadoEn: Date;
}
