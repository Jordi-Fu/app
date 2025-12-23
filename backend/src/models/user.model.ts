import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User, SafeUser } from '../interfaces';

/**
 * Modelo de Usuario
 * Maneja la lógica de datos y persistencia de usuarios
 */
class UserModel {
  private users: Map<string, User> = new Map();
  
  constructor() {
    this.initializeDefaultUser();
  }
  
  /**
   * Inicializar usuario de prueba
   */
  private async initializeDefaultUser(): Promise<void> {
    const hashedPassword = await bcrypt.hash('Admin123', 12);
    const defaultUser: User = {
      id: uuidv4(),
      username: 'admin',
      email: 'admin@ejemplo.com',
      phone: '1234567890',
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
      failedLoginAttempts: 0,
      lockUntil: null,
      isActive: true,
    };
    
    this.users.set(defaultUser.id, defaultUser);
  }
  
  /**
   * Buscar usuario por credencial (username, email o phone)
   */
  findByCredential(credential: string): User | undefined {
    const normalizedCredential = credential.toLowerCase().trim();
    
    for (const user of this.users.values()) {
      if (
        user.username.toLowerCase() === normalizedCredential ||
        user.email.toLowerCase() === normalizedCredential ||
        user.phone === normalizedCredential
      ) {
        return user;
      }
    }
    
    return undefined;
  }
  
  /**
   * Buscar usuario por ID
   */
  findById(id: string): User | undefined {
    return this.users.get(id);
  }
  
  /**
   * Buscar usuario por email
   */
  findByEmail(email: string): User | undefined {
    const normalizedEmail = email.toLowerCase().trim();
    
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === normalizedEmail) {
        return user;
      }
    }
    
    return undefined;
  }
  
  /**
   * Buscar usuario por username
   */
  findByUsername(username: string): User | undefined {
    const normalizedUsername = username.toLowerCase().trim();
    
    for (const user of this.users.values()) {
      if (user.username.toLowerCase() === normalizedUsername) {
        return user;
      }
    }
    
    return undefined;
  }
  
  /**
   * Crear nuevo usuario
   */
  async create(userData: {
    username: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    const newUser: User = {
      id: uuidv4(),
      username: userData.username.toLowerCase().trim(),
      email: userData.email.toLowerCase().trim(),
      phone: userData.phone.trim(),
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
      failedLoginAttempts: 0,
      lockUntil: null,
      isActive: true,
    };
    
    this.users.set(newUser.id, newUser);
    return newUser;
  }
  
  /**
   * Actualizar usuario
   */
  update(id: string, updates: Partial<User>): User | undefined {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date(),
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  /**
   * Eliminar usuario
   */
  delete(id: string): boolean {
    return this.users.delete(id);
  }
  
  /**
   * Incrementar intentos fallidos de login
   */
  incrementFailedAttempts(id: string): void {
    const user = this.users.get(id);
    if (!user) return;
    
    const failedAttempts = user.failedLoginAttempts + 1;
    let lockUntil = user.lockUntil;
    
    // Bloquear después de 5 intentos por 15 minutos
    if (failedAttempts >= 5) {
      lockUntil = new Date(Date.now() + 15 * 60 * 1000);
    }
    
    this.update(id, {
      failedLoginAttempts: failedAttempts,
      lockUntil,
    });
  }
  
  /**
   * Resetear intentos fallidos
   */
  resetFailedAttempts(id: string): void {
    this.update(id, {
      failedLoginAttempts: 0,
      lockUntil: null,
    });
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
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt,
      isActive: user.isActive,
    };
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
