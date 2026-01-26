import bcrypt from 'bcrypt';
import { User, SafeUser, RegisterRequest } from '../interfaces';
import { userDatabase } from '../database/user.database';

/**
 * Modelo de Usuario
 * Maneja la lógica de negocio y validaciones
 */
class UserModel {
  
  /**
   * Buscar usuario por credencial (usuario, correo o teléfono)
   */
  async findByCredential(credencial: string): Promise<User | undefined> {
    return userDatabase.findByCredential(credencial);
  }
  
  /**
   * Buscar usuario por ID
   */
  async findById(id: string): Promise<User | undefined> {
    return userDatabase.findById(id);
  }

  /**
   * Verificar si existe usuario por username
   */
  async existsByUsername(usuario: string): Promise<boolean> {
    return userDatabase.existsByUsername(usuario);
  }

  /**
   * Verificar si existe usuario por email
   */
  async existsByEmail(correo: string): Promise<boolean> {
    return userDatabase.existsByEmail(correo);
  }

  /**
   * Verificar si existe usuario por teléfono
   */
  async existsByPhone(telefono: string): Promise<boolean> {
    return userDatabase.existsByPhone(telefono);
  }

  /**
   * Crear un nuevo usuario
   */
  async create(userData: RegisterRequest): Promise<User | undefined> {
    return userDatabase.create(userData);
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
    return user.bloqueado_hasta !== null && user.bloqueado_hasta > new Date();
  }
  
  /**
   * Obtener tiempo restante de bloqueo en minutos
   */
  getLockTimeRemaining(user: User): number {
    if (!user.bloqueado_hasta) return 0;
    return Math.ceil((user.bloqueado_hasta.getTime() - Date.now()) / 30000);
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
  async verifyPassword(passwordPlano: string, passwordHasheada: string): Promise<boolean> {
    return bcrypt.compare(passwordPlano, passwordHasheada);
  }
  
  /**
   * Actualizar contraseña de usuario
   */
  async updatePassword(idUsuario: string, nuevaPassword: string): Promise<boolean> {
    const passwordHasheada = await bcrypt.hash(nuevaPassword, 12);
    return userDatabase.updatePassword(idUsuario, passwordHasheada);
  }

  /**
   * Hashear contraseña
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }
}

export const userModel = new UserModel();
