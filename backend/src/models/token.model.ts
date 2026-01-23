import { StoredRefreshToken } from '../interfaces';

/**
 * Modelo de Token
 * Maneja la lógica de datos y persistencia de refresh tokens
 */
class TokenModel {
  private refreshTokens: Map<string, StoredRefreshToken> = new Map();
  
  /**
   * Guardar refresh token
   */
  store(token: string, idUsuario: string, expiraEn: Date): void {
    this.refreshTokens.set(token, {
      token,
      idUsuario,
      expiraEn,
      creadoEn: new Date(),
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
  deleteAllByUserId(idUsuario: string): number {
    let deletedCount = 0;
    
    for (const [key, value] of this.refreshTokens.entries()) {
      if (value.idUsuario === idUsuario) {
        this.refreshTokens.delete(key);
        deletedCount++;
      }
    }
    
    return deletedCount;
  }

  /**
   * Revocar todos los tokens de un usuario (alias para deleteAllByUserId)
   */
  revokeAllByUserId(idUsuario: string): number {
    return this.deleteAllByUserId(idUsuario);
  }
  
  /**
   * Obtener todos los tokens de un usuario
   */
  findByUserId(idUsuario: string): StoredRefreshToken[] {
    const tokens: StoredRefreshToken[] = [];
    
    for (const value of this.refreshTokens.values()) {
      if (value.idUsuario === idUsuario) {
        tokens.push(value);
      }
    }
    
    return tokens;
  }
  
  /**
   * Limpiar tokens expirados
   */
  cleanExpired(): number {
    const now = new Date();
    let deletedCount = 0;
    
    for (const [key, value] of this.refreshTokens.entries()) {
      if (value.expiraEn < now) {
        this.refreshTokens.delete(key);
        deletedCount++;
      }
    }
    
    return deletedCount;
  }
  
  /**
   * Verificar si el token es válido
   */
  isValid(token: string): boolean {
    const stored = this.refreshTokens.get(token);
    if (!stored) return false;
    return stored.expiraEn > new Date();
  }
  
  /**
   * Verificar si el token existe
   */
  exists(token: string): boolean {
    return this.refreshTokens.has(token);
  }
  
  /**
   * Contar tokens activos
   */
  countActive(): number {
    const now = new Date();
    let count = 0;
    
    for (const value of this.refreshTokens.values()) {
      if (value.expiraEn > now) {
        count++;
      }
    }
    
    return count;
  }
}

export const tokenModel = new TokenModel();
