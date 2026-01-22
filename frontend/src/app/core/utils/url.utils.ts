import { environment } from '../../../environments/environment';

/**
 * Transforma una URL relativa de imagen a una URL absoluta
 * @param url URL de la imagen (puede ser relativa o absoluta)
 * @param fallback URL de fallback si la imagen es null/undefined (opcional)
 * @returns URL absoluta
 */
export function getAbsoluteImageUrl(url: string | null | undefined, fallback: string = ''): string {
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
 * El backend siempre asigna un avatar, por lo que simplemente convertimos la URL a absoluta
 * @param avatarUrl URL del avatar
 * @returns URL absoluta del avatar
 */
export function getAvatarUrl(avatarUrl: string | null | undefined): string {
  return getAbsoluteImageUrl(avatarUrl);
}
