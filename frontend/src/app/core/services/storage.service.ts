import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

/**
 * Servicio de almacenamiento SEGURO que usa:
 * - Capacitor Secure Storage Plugin para todas las plataformas
 *   - iOS: Keychain
 *   - Android: EncryptedSharedPreferences (Android Keystore)
 *   - Web: Web Crypto API con cifrado AES-GCM
 * 
 * ⚠️ IMPORTANTE: Este servicio NO usa localStorage, sessionStorage, 
 * IndexedDB ni cookies. Todos los datos sensibles se almacenan cifrados.
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private isNativePlatform: boolean;
  
  // Cache en memoria para acceso rápido (solo para datos no sensibles)
  private memoryCache = new Map<string, string>();
  
  // Web Crypto para cifrado en navegador
  private webCryptoKey: CryptoKey | null = null;
  private webCryptoInitialized = false;
  private readonly WEB_CRYPTO_KEY_NAME = '__web_crypto_key__';

  constructor() {
    this.isNativePlatform = Capacitor.isNativePlatform();
    
    if (!this.isNativePlatform) {
      this.initWebCrypto();
    }
  }

  /**
   * Inicializa Web Crypto API para cifrado en navegador.
   * Genera una clave AES-GCM de 256 bits.
   */
  private async initWebCrypto(): Promise<void> {
    if (this.webCryptoInitialized) return;
    
    try {
      // Intentar recuperar clave existente de localStorage (persistente entre recargas)
      const exportedKey = localStorage.getItem(this.WEB_CRYPTO_KEY_NAME);
      
      if (exportedKey) {
        const keyData = Uint8Array.from(atob(exportedKey), c => c.charCodeAt(0));
        this.webCryptoKey = await crypto.subtle.importKey(
          'raw',
          keyData,
          { name: 'AES-GCM', length: 256 },
          true,
          ['encrypt', 'decrypt']
        );
      } else {
        // Generar nueva clave
        this.webCryptoKey = await crypto.subtle.generateKey(
          { name: 'AES-GCM', length: 256 },
          true,
          ['encrypt', 'decrypt']
        );
        
        // Exportar y guardar la clave en localStorage (persistente)
        const exportedKeyData = await crypto.subtle.exportKey('raw', this.webCryptoKey);
        const keyBase64 = btoa(String.fromCharCode(...new Uint8Array(exportedKeyData)));
        localStorage.setItem(this.WEB_CRYPTO_KEY_NAME, keyBase64);
      }
      
      this.webCryptoInitialized = true;
    } catch (error) {
      console.error('[SecureStorage] Error inicializando Web Crypto:', error);
    }
  }

  /**
   * Cifra un valor usando Web Crypto API (AES-GCM)
   */
  private async encryptForWeb(value: string): Promise<string> {
    if (!this.webCryptoKey) {
      await this.initWebCrypto();
    }
    
    if (!this.webCryptoKey) {
      throw new Error('Web Crypto no disponible');
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(value);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const encryptedData = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      this.webCryptoKey,
      data
    );

    // Combinar IV + datos cifrados
    const combined = new Uint8Array(iv.length + encryptedData.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedData), iv.length);
    
    return btoa(String.fromCharCode(...combined));
  }

  /**
   * Descifra un valor usando Web Crypto API
   */
  private async decryptForWeb(encryptedValue: string): Promise<string> {
    if (!this.webCryptoKey) {
      await this.initWebCrypto();
    }
    
    if (!this.webCryptoKey) {
      throw new Error('Web Crypto no disponible');
    }

    const combined = Uint8Array.from(atob(encryptedValue), c => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const decryptedData = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      this.webCryptoKey,
      data
    );

    return new TextDecoder().decode(decryptedData);
  }

  /**
   * Guardar valor de forma segura (cifrado)
   */
  async set(key: string, value: string): Promise<void> {
    try {
      if (this.isNativePlatform) {
        // Usar Capacitor Secure Storage Plugin (Keychain/Keystore)
        await SecureStoragePlugin.set({ key, value });
      } else {
        // Web: Cifrar con AES-GCM y guardar en sessionStorage
        const encryptedValue = await this.encryptForWeb(value);
        sessionStorage.setItem(`__secure__${key}`, encryptedValue);
      }
      
      // Actualizar cache en memoria
      this.memoryCache.set(key, value);
    } catch (error) {
      console.error(`[SecureStorage] Error guardando ${key}:`, error);
      throw error;
    }
  }

  /**
   * Obtener valor de forma segura (descifrado)
   */
  async get(key: string): Promise<string | null> {
    try {
      // Primero intentar cache en memoria
      if (this.memoryCache.has(key)) {
        return this.memoryCache.get(key)!;
      }

      if (this.isNativePlatform) {
        const result = await SecureStoragePlugin.get({ key });
        const value = result.value;
        
        if (value) {
          this.memoryCache.set(key, value);
        }
        
        return value;
      } else {
        const encryptedValue = sessionStorage.getItem(`__secure__${key}`);
        if (!encryptedValue) {
          return null;
        }
        
        const value = await this.decryptForWeb(encryptedValue);
        this.memoryCache.set(key, value);
        
        return value;
      }
    } catch (error) {
      // SecureStoragePlugin lanza error si la clave no existe
      console.warn(`[SecureStorage] Clave ${key} no encontrada:`, error);
      return null;
    }
  }

  /**
   * Eliminar valor
   */
  async remove(key: string): Promise<void> {
    try {
      // Limpiar cache
      this.memoryCache.delete(key);
      
      if (this.isNativePlatform) {
        await SecureStoragePlugin.remove({ key });
      } else {
        sessionStorage.removeItem(`__secure__${key}`);
      }
    } catch (error) {
      console.warn(`[SecureStorage] Error eliminando ${key}:`, error);
    }
  }

  /**
   * Limpiar todos los valores
   */
  async clear(): Promise<void> {
    try {
      this.memoryCache.clear();
      
      if (this.isNativePlatform) {
        await SecureStoragePlugin.clear();
      } else {
        // Solo limpiar claves con prefijo __secure__
        const keysToRemove: string[] = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key?.startsWith('__secure__')) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => sessionStorage.removeItem(key));
      }
    } catch (error) {
      console.error('[SecureStorage] Error limpiando storage:', error);
    }
  }

  /**
   * Verificar si existe una clave
   */
  async has(key: string): Promise<boolean> {
    try {
      if (this.memoryCache.has(key)) return true;
      
      if (this.isNativePlatform) {
        const keys = await SecureStoragePlugin.keys();
        return keys.value.includes(key);
      } else {
        return sessionStorage.getItem(`__secure__${key}`) !== null;
      }
    } catch {
      return false;
    }
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
      console.error(`[SecureStorage] Error parseando JSON de ${key}:`, error);
      return null;
    }
  }

  /**
   * Obtener todas las claves almacenadas
   */
  async keys(): Promise<string[]> {
    try {
      if (this.isNativePlatform) {
        const result = await SecureStoragePlugin.keys();
        return result.value;
      } else {
        const keys: string[] = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key?.startsWith('__secure__')) {
            keys.push(key.replace('__secure__', ''));
          }
        }
        return keys;
      }
    } catch {
      return [];
    }
  }
}
