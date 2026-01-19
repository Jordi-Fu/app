import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * Utilidades para manejo de imágenes
 */

/**
 * Guardar imagen base64 en el sistema de archivos
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

    const imageType = matches[1]; // jpg, png, etc.
    const imageBuffer = Buffer.from(matches[2], 'base64');

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
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
    const filename = `${uuidv4()}.${imageType}`;
    const filepath = path.join(uploadPath, filename);

    // Guardar la imagen
    fs.writeFileSync(filepath, imageBuffer);

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
