import bcrypt from 'bcrypt';
import { pool } from '../config/database.config';
import { User, SafeUser } from '../interfaces';

/**
 * Acceso a datos de usuarios en PostgreSQL
 */
class UserDatabase {
  
  /**
   * Buscar usuario por credencial (username, email o phone)
   */
  async findByCredential(credential: string): Promise<User | undefined> {
    const normalizedCredential = credential.toLowerCase().trim();
    
    try {
      const query = `
        SELECT id, username, email, phone, password_hash as password, 
               is_active as "isActive", failed_login_attempts as "failedLoginAttempts",
               locked_until as "lockUntil", created_at as "createdAt", 
               updated_at as "updatedAt"
        FROM users 
        WHERE LOWER(username) = $1 
           OR LOWER(email) = $1 
           OR phone = $1
        LIMIT 1
      `;
      
      const result = await pool.query(query, [normalizedCredential]);
      
      if (result.rows.length === 0) {
        return undefined;
      }
      
      return result.rows[0] as User;
    } catch (error) {
      console.error('Error al buscar usuario por credencial:', error);
      return undefined;
    }
  }
  
  /**
   * Buscar usuario por ID
   */
  async findById(id: string): Promise<User | undefined> {
    try {
      const query = `
        SELECT id, username, email, phone, password_hash as password,
               is_active as "isActive", failed_login_attempts as "failedLoginAttempts",
               locked_until as "lockUntil", created_at as "createdAt",
               updated_at as "updatedAt"
        FROM users 
        WHERE id = $1
      `;
      
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return undefined;
      }
      
      return result.rows[0] as User;
    } catch (error) {
      console.error('Error al buscar usuario por ID:', error);
      return undefined;
    }
  }
  
  /**
   * Actualizar usuario
   */
  async update(id: string, updates: Partial<User>): Promise<User | undefined> {
    try {
      const fields: string[] = [];
      const values: any[] = [];
      let paramCounter = 1;
      
      // Mapeo de campos TypeScript a columnas PostgreSQL
      const fieldMapping: Record<string, string> = {
        isActive: 'is_active',
        failedLoginAttempts: 'failed_login_attempts',
        lockUntil: 'locked_until',
        updatedAt: 'updated_at',
      };
      
      for (const [key, value] of Object.entries(updates)) {
        const dbColumn = fieldMapping[key] || key;
        fields.push(`${dbColumn} = $${paramCounter}`);
        values.push(value);
        paramCounter++;
      }
      
      // Agregar updated_at automáticamente
      fields.push(`updated_at = CURRENT_TIMESTAMP`);
      
      if (fields.length === 0) {
        return this.findById(id);
      }
      
      values.push(id);
      const query = `
        UPDATE users 
        SET ${fields.join(', ')}
        WHERE id = $${paramCounter}
        RETURNING id, username, email, phone, password_hash as password,
                  is_active as "isActive", failed_login_attempts as "failedLoginAttempts",
                  locked_until as "lockUntil", created_at as "createdAt",
                  updated_at as "updatedAt"
      `;
      
      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        return undefined;
      }
      
      return result.rows[0] as User;
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      return undefined;
    }
  }
  
  /**
   * Incrementar intentos fallidos
   */
  async incrementFailedAttempts(id: string): Promise<void> {
    try {
      const query = `
        UPDATE users 
        SET failed_login_attempts = failed_login_attempts + 1,
            locked_until = CASE 
              WHEN failed_login_attempts + 1 >= 5 
              THEN CURRENT_TIMESTAMP + INTERVAL '15 minutes'
              ELSE locked_until
            END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `;
      
      await pool.query(query, [id]);
    } catch (error) {
      console.error('Error al incrementar intentos fallidos:', error);
    }
  }
  
  /**
   * Resetear intentos fallidos
   */
  async resetFailedAttempts(id: string): Promise<void> {
    try {
      const query = `
        UPDATE users 
        SET failed_login_attempts = 0,
            locked_until = NULL,
            last_login = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `;
      
      await pool.query(query, [id]);
    } catch (error) {
      console.error('Error al resetear intentos fallidos:', error);
    }
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
