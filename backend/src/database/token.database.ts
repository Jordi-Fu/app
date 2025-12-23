import { StoredRefreshToken } from '../interfaces';

/**
 * Almacén de refresh tokens (en producción usar Redis o base de datos)
 */
class TokenDatabase {
  private refreshTokens: Map<string, StoredRefreshToken> = new Map();
  
  /**
   * Guardar refresh token
   */
  store(token: string, userId: string, expiresAt: Date): void {
    this.refreshTokens.set(token, {
      token,
      userId,
      expiresAt,
      createdAt: new Date(),
    });
  }
  
  /**
   * Obtener refresh token
   */
  get(token: string): StoredRefreshToken | undefined {
    return this.refreshTokens.get(token);
  }
  
  /**
   * Eliminar refresh token
   */
  delete(token: string): boolean {
    return this.refreshTokens.delete(token);
  }
  
  /**
   * Eliminar todos los tokens de un usuario
   */
  deleteAllByUserId(userId: string): void {
    for (const [key, value] of this.refreshTokens.entries()) {
      if (value.userId === userId) {
        this.refreshTokens.delete(key);
      }
    }
  }
  
  /**
   * Limpiar tokens expirados
   */
  cleanExpired(): void {
    const now = new Date();
    for (const [key, value] of this.refreshTokens.entries()) {
      if (value.expiresAt < now) {
        this.refreshTokens.delete(key);
      }
    }
  }
  
  /**
   * Verificar si el token es válido
   */
  isValid(token: string): boolean {
    const stored = this.refreshTokens.get(token);
    if (!stored) return false;
    return stored.expiresAt > new Date();
  }
}

export const tokenDatabase = new TokenDatabase();
