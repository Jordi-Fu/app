import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User, SafeUser } from '../interfaces';

/**
 * Almacén temporal de usuarios (en producción usar base de datos)
 * Las contraseñas están hasheadas con bcrypt
 */
class UserDatabase {
  private users: Map<string, User> = new Map();
  
  constructor() {
    // Inicializar con usuario de prueba (contraseña: Admin123)
    this.initializeDefaultUser();
  }
  
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
   * Incrementar intentos fallidos
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
}

export const userDatabase = new UserDatabase();
