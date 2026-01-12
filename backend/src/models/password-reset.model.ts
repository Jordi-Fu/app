import crypto from 'crypto';

interface PasswordResetCode {
  email: string;
  code: string;
  resetToken?: string;
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
}

/**
 * Modelo para gestionar códigos de recuperación de contraseña
 * Almacena códigos temporales en memoria
 */
class PasswordResetModel {
  private resetCodes: Map<string, PasswordResetCode> = new Map();
  private readonly CODE_EXPIRATION_MS = 15 * 60 * 1000; // 15 minutos
  private readonly MAX_ATTEMPTS = 5;

  /**
   * Generar código de 6 dígitos
   */
  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Generar token único de reset
   */
  private generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Crear código de reset para un email
   */
  createResetCode(email: string): { code: string; expiresAt: Date } {
    const code = this.generateCode();
    const expiresAt = new Date(Date.now() + this.CODE_EXPIRATION_MS);

    const resetData: PasswordResetCode = {
      email: email.toLowerCase(),
      code,
      expiresAt,
      attempts: 0,
      createdAt: new Date(),
    };

    this.resetCodes.set(email.toLowerCase(), resetData);

    // Limpiar código automáticamente después de expirar
    setTimeout(() => {
      this.resetCodes.delete(email.toLowerCase());
    }, this.CODE_EXPIRATION_MS);

    return { code, expiresAt };
  }

  /**
   * Verificar código de reset
   */
  verifyCode(email: string, code: string): { valid: boolean; resetToken?: string; message?: string } {
    const resetData = this.resetCodes.get(email.toLowerCase());

    if (!resetData) {
      return { valid: false, message: 'Código no encontrado o expirado' };
    }

    // Verificar expiración
    if (new Date() > resetData.expiresAt) {
      this.resetCodes.delete(email.toLowerCase());
      return { valid: false, message: 'El código ha expirado' };
    }

    // Verificar intentos
    if (resetData.attempts >= this.MAX_ATTEMPTS) {
      this.resetCodes.delete(email.toLowerCase());
      return { valid: false, message: 'Demasiados intentos. Solicita un nuevo código' };
    }

    // Incrementar intentos
    resetData.attempts++;

    // Verificar código
    if (resetData.code !== code) {
      return { valid: false, message: 'Código inválido' };
    }

    // Código válido - generar token de reset
    const resetToken = this.generateResetToken();
    resetData.resetToken = resetToken;

    return { valid: true, resetToken };
  }

  /**
   * Validar token de reset
   */
  validateResetToken(resetToken: string): { valid: boolean; email?: string; message?: string } {
    for (const [email, data] of this.resetCodes.entries()) {
      if (data.resetToken === resetToken) {
        // Verificar expiración
        if (new Date() > data.expiresAt) {
          this.resetCodes.delete(email);
          return { valid: false, message: 'Token expirado' };
        }

        return { valid: true, email };
      }
    }

    return { valid: false, message: 'Token inválido' };
  }

  /**
   * Consumir token de reset (eliminar después de usarlo)
   */
  consumeResetToken(resetToken: string): void {
    for (const [email, data] of this.resetCodes.entries()) {
      if (data.resetToken === resetToken) {
        this.resetCodes.delete(email);
        break;
      }
    }
  }

  /**
   * Limpiar códigos expirados (ejecutar periódicamente)
   */
  cleanupExpired(): void {
    const now = new Date();
    for (const [email, data] of this.resetCodes.entries()) {
      if (now > data.expiresAt) {
        this.resetCodes.delete(email);
      }
    }
  }

  /**
   * Obtener información de debug (solo para desarrollo)
   */
  getResetInfo(email: string): PasswordResetCode | undefined {
    return this.resetCodes.get(email.toLowerCase());
  }
}

export const passwordResetModel = new PasswordResetModel();

// Limpiar códigos expirados cada 5 minutos
setInterval(() => {
  passwordResetModel.cleanupExpired();
}, 5 * 60 * 1000);
