import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

/**
 * Servicio de almacenamiento persistente que usa:
 * - Capacitor Preferences para plataformas móviles (iOS/Android) - Persiste incluso al cerrar la app
 * - localStorage como fallback para web
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private isNativePlatform: boolean;

  constructor() {
    this.isNativePlatform = Capacitor.isNativePlatform();
    console.log('StorageService inicializado - Plataforma nativa:', this.isNativePlatform);
  }

  /**
   * Guardar valor
   */
  async set(key: string, value: string): Promise<void> {
    try {
      if (this.isNativePlatform) {
        await Preferences.set({ key, value });
        console.log(`[Storage] Guardado ${key} en Preferences`);
      } else {
        localStorage.setItem(key, value);
        console.log(`[Storage] Guardado ${key} en localStorage`);
      }
    } catch (error) {
      console.error(`[Storage] Error guardando ${key}:`, error);
      throw error;
    }
  }

  /**
   * Obtener valor
   */
  async get(key: string): Promise<string | null> {
    try {
      if (this.isNativePlatform) {
        const result = await Preferences.get({ key });
        console.log(`[Storage] Leído ${key} de Preferences:`, result.value ? 'tiene valor' : 'null');
        return result.value;
      } else {
        const value = localStorage.getItem(key);
        console.log(`[Storage] Leído ${key} de localStorage:`, value ? 'tiene valor' : 'null');
        return value;
      }
    } catch (error) {
      console.error(`[Storage] Error leyendo ${key}:`, error);
      return null;
    }
  }

  /**
   * Eliminar valor
   */
  async remove(key: string): Promise<void> {
    try {
      if (this.isNativePlatform) {
        await Preferences.remove({ key });
      } else {
        localStorage.removeItem(key);
      }
      console.log(`[Storage] Eliminado ${key}`);
    } catch (error) {
      console.error(`[Storage] Error eliminando ${key}:`, error);
    }
  }

  /**
   * Limpiar todos los valores
   */
  async clear(): Promise<void> {
    try {
      if (this.isNativePlatform) {
        await Preferences.clear();
      } else {
        localStorage.clear();
      }
      console.log('[Storage] Storage limpiado');
    } catch (error) {
      console.error('[Storage] Error limpiando storage:', error);
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
    } catch (error) {
      console.error(`[Storage] Error parseando JSON de ${key}:`, error);
      return null;
    }
  }
}
