import { environment } from '../../../environments/environment';

/**
 * Transforma una URL relativa de imagen a una URL absoluta
 * @param url URL de la imagen (puede ser relativa o absoluta)
 * @param fallback URL de fallback si la imagen es null/undefined
 * @returns URL absoluta
 */
export function getAbsoluteImageUrl(url: string | null | undefined, fallback: string = 'assets/avatar-default.png'): string {
  if (!url) {
    return fallback;
  }
  
  // Si ya es una URL absoluta, retornarla
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Construir URL absoluta usando el apiUrl del environment
  const baseUrl = environment.apiUrl.replace('/api', '');
  return `${baseUrl}${url}`;
}

/**
 * Obtiene la URL del avatar de un usuario
 * @param avatarUrl URL del avatar
 * @param nombre Nombre para generar avatar con iniciales
 * @param apellido Apellido para generar avatar con iniciales
 * @returns URL del avatar
 */
export function getAvatarUrl(
  avatarUrl: string | null | undefined, 
  nombre?: string, 
  apellido?: string
): string {
  if (!avatarUrl) {
    // Generar avatar con iniciales si hay nombre
    if (nombre) {
      return `https://ui-avatars.com/api/?name=${nombre}+${apellido || ''}&background=13B5B5&color=fff`;
    }
    return 'assets/avatar-default.png';
  }
  
  return getAbsoluteImageUrl(avatarUrl);
}
