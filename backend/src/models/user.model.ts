import bcrypt from 'bcrypt';
import { User, SafeUser } from '../interfaces';
import { userDatabase } from '../database/user.database';

/**
 * Modelo de Usuario
 * Maneja la lógica de negocio y validaciones
 */
class UserModel {
  
  /**
   * Buscar usuario por credencial (username, email o phone)
   */
  async findByCredential(credential: string): Promise<User | undefined> {
    return userDatabase.findByCredential(credential);
  }
  
  /**
   * Buscar usuario por ID
   */
  async findById(id: string): Promise<User | undefined> {
    return userDatabase.findById(id);
  }
  
  /**
   * Incrementar intentos fallidos de login
   */
  async incrementFailedAttempts(id: string): Promise<void> {
    await userDatabase.incrementFailedAttempts(id);
  }
  
  /**
   * Resetear intentos fallidos
   */
  async resetFailedAttempts(id: string): Promise<void> {
    await userDatabase.resetFailedAttempts(id);
  }
  
  /**
   * Verificar si la cuenta está bloqueada
   */
  isLocked(user: User): boolean {
    return user.lockUntil !== null && user.lockUntil > new Date();
  }
  
  /**
   * Obtener tiempo restante de bloqueo en minutos
   */
  getLockTimeRemaining(user: User): number {
    if (!user.lockUntil) return 0;
    return Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
  }
  
  /**
   * Convertir a usuario seguro (sin contraseña)
   */
  toSafeUser(user: User): SafeUser {
    return userDatabase.toSafeUser(user);
  }
  
  /**
   * Verificar contraseña
   */
  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
  
  /**
   * Hashear contraseña
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }
}

export const userModel = new UserModel();
