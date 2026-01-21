import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

/**
 * Servicio de almacenamiento seguro que abstrae el uso de:
 * - Secure Storage para plataformas móviles (iOS/Android)
 * - localStorage como fallback para web
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private isNativePlatform: boolean;

  constructor() {
    this.isNativePlatform = Capacitor.isNativePlatform();
  }

  /**
   * Guardar valor
   */
  async set(key: string, value: string): Promise<void> {
    try {
      if (this.isNativePlatform) {
        await SecureStoragePlugin.set({ key, value });
      } else {
        localStorage.setItem(key, value);
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Obtener valor
   */
  async get(key: string): Promise<string | null> {
    try {
      if (this.isNativePlatform) {
        const result = await SecureStoragePlugin.get({ key });
        return result.value;
      } else {
        return localStorage.getItem(key);
      }
    } catch (error) {
      // Si la clave no existe, Secure Storage lanza error
      return null;
    }
  }

  /**
   * Eliminar valor
   */
  async remove(key: string): Promise<void> {
    try {
      if (this.isNativePlatform) {
        await SecureStoragePlugin.remove({ key });
      } else {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error eliminando ${key}:`, error);
    }
  }

  /**
   * Limpiar todos los valores
   */
  async clear(): Promise<void> {
    try {
      if (this.isNativePlatform) {
        await SecureStoragePlugin.clear();
      } else {
        localStorage.clear();
      }
    } catch (error) {
      console.error('Error limpiando storage:', error);
    }
  }

  /**
   * Verificar si existe una clave
   */
  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }

  /**
   * Guardar objeto JSON
   */
  async setObject(key: string, value: any): Promise<void> {
    await this.set(key, JSON.stringify(value));
  }

  /**
   * Obtener objeto JSON
   */
  async getObject<T>(key: string): Promise<T | null> {
    const value = await this.get(key);
    if (!value) return null;
    
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }
}
