import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

/**
 * Utilidades para manejo de imágenes
 */

/**
 * Guardar imagen base64 en el sistema de archivos con optimización
 * @param base64Data - Imagen en formato base64
 * @param directory - Directorio donde guardar la imagen (por defecto 'uploads/avatars')
 * @returns URL relativa de la imagen o null si hay error
 */
export async function saveBase64Image(
  base64Data: string,
  directory: string = 'uploads/avatars'
): Promise<string | null> {
  try {
    // Verificar si es base64 válido
    if (!base64Data || !base64Data.includes('base64,')) {
      console.error('Formato de imagen inválido');
      return null;
    }

    // Extraer el tipo de archivo y los datos
    const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      console.error('No se pudo parsear la imagen base64');
      return null;
    }

    const imageBuffer = Buffer.from(matches[2], 'base64');

    // Validar tamaño (máximo 10MB antes de comprimir)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (imageBuffer.length > maxSize) {
      console.error('La imagen excede el tamaño máximo permitido');
      return null;
    }

    // Crear directorio si no existe
    const uploadPath = path.join(process.cwd(), directory);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    // Generar nombre único para la imagen
    const filename = `${uuidv4()}.webp`; // Usar WebP para mejor compresión
    const filepath = path.join(uploadPath, filename);

    // Optimizar y comprimir la imagen usando sharp
    await sharp(imageBuffer)
      .resize(800, 800, {
        fit: 'inside',
        withoutEnlargement: true // No agrandar imágenes pequeñas
      })
      .webp({
        quality: 85, // Calidad alta pero optimizada
        effort: 6    // Mayor esfuerzo de compresión
      })
      .toFile(filepath);

    // Retornar la URL relativa
    return `/${directory}/${filename}`;
  } catch (error) {
    console.error('Error al guardar imagen:', error);
    return null;
  }
}

/**
 * Eliminar imagen del sistema de archivos
 * @param imagePath - Ruta relativa de la imagen
 * @returns true si se eliminó correctamente, false si hubo error
 */
export function deleteImage(imagePath: string): boolean {
  try {
    if (!imagePath) return false;

    const fullPath = path.join(process.cwd(), imagePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error al eliminar imagen:', error);
    return false;
  }
}

/**
 * Generar avatar con iniciales del usuario
 * @param firstName - Nombre del usuario
 * @param lastName - Apellido del usuario
 * @param directory - Directorio donde guardar la imagen
 * @returns URL relativa del avatar generado
 */
export function generateInitialsAvatar(
  firstName: string,
  lastName: string,
  directory: string = 'uploads/avatars'
): string | null {
  try {
    // Obtener las iniciales
    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();
    const initials = `${firstInitial}${lastInitial}`;

    // Generar color de fondo basado en las iniciales
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
      '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'
    ];
    const colorIndex = (firstInitial.charCodeAt(0) + lastInitial.charCodeAt(0)) % colors.length;
    const backgroundColor = colors[colorIndex];

    // Crear SVG del avatar
    const svg = `
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="${backgroundColor}"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="80" 
              font-weight="bold" fill="white" text-anchor="middle" 
              dominant-baseline="central">${initials}</text>
      </svg>
    `.trim();

    // Crear directorio si no existe
    const uploadPath = path.join(process.cwd(), directory);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    // Generar nombre único para el avatar
    const filename = `avatar-${uuidv4()}.svg`;
    const filepath = path.join(uploadPath, filename);

    // Guardar el SVG
    fs.writeFileSync(filepath, svg);

    // Retornar la URL relativa
    return `/${directory}/${filename}`;
  } catch (error) {
    console.error('Error al generar avatar con iniciales:', error);
    return null;
  }
}
