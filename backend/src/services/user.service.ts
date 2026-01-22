import { userDatabase } from '../database/user.database';

interface UserProfile {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  url_avatar?: string;
  biografia?: string;
  ubicacion?: string;
  fecha_creacion: string;
  esta_verificado: boolean;
  promedio_calificacion?: number;
  total_servicios?: number;
  total_resenas?: number;
}

class UserService {
  /**
   * Obtener perfil público de un usuario por ID
   */
  async getUserById(userId: string): Promise<UserProfile | null> {
    try {
      return await userDatabase.getUserById(userId);
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      throw error;
    }
  }

  /**
   * Obtener servicios de un usuario
   */
  async getUserServices(userId: string): Promise<any[]> {
    try {
      return await userDatabase.getUserServices(userId);
    } catch (error) {
      console.error('Error al obtener servicios del usuario:', error);
      throw error;
    }
  }

  /**
   * Buscar usuarios por nombre/username
   */
  async searchUsers(query: string, limit: number = 20): Promise<any[]> {
    try {
      return await userDatabase.searchUsers(query, limit);
    } catch (error) {
      console.error('Error al buscar usuarios:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los usuarios activos
   */
  async getAllActiveUsers(limit: number = 50): Promise<any[]> {
    try {
      return await userDatabase.getAllActiveUsers(limit);
    } catch (error) {
      console.error('Error al obtener usuarios activos:', error);
      throw error;
    }
  }
}

export const userService = new UserService();
