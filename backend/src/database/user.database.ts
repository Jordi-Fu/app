import bcrypt from 'bcrypt';
import { pool } from '../config/database.config';
import { User, SafeUser, RegisterRequest } from '../interfaces';
import { v4 as uuidv4 } from 'uuid';

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
        SELECT 
          id, username, email, password_hash as password,
          first_name as "firstName", last_name as "lastName",
          phone, country_code as "countryCode",
          avatar_url as "avatarUrl", bio,
          user_type as "userType", user_role as "userRole",
          is_verified as "isVerified", is_active as "isActive",
          is_online as "isOnline", last_seen as "lastSeen",
          rating_average as "ratingAverage", total_reviews as "totalReviews",
          failed_login_attempts as "failedLoginAttempts",
          locked_until as "lockedUntil", last_login as "lastLogin",
          created_at as "createdAt", updated_at as "updatedAt"
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
   * Verificar si existe un usuario por username
   */
  async existsByUsername(username: string): Promise<boolean> {
    try {
      const query = 'SELECT id FROM users WHERE LOWER(username) = LOWER($1) LIMIT 1';
      const result = await pool.query(query, [username]);
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error al verificar username:', error);
      return false;
    }
  }

  /**
   * Verificar si existe un usuario por email
   */
  async existsByEmail(email: string): Promise<boolean> {
    try {
      const query = 'SELECT id FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1';
      const result = await pool.query(query, [email]);
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error al verificar email:', error);
      return false;
    }
  }

  /**
   * Verificar si existe un usuario por teléfono
   */
  async existsByPhone(phone: string): Promise<boolean> {
    try {
      const cleanPhone = phone.replace(/\s/g, '');
      const query = 'SELECT id FROM users WHERE phone = $1 LIMIT 1';
      const result = await pool.query(query, [cleanPhone]);
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error al verificar teléfono:', error);
      return false;
    }
  }

  /**
   * Crear un nuevo usuario
   */
  async create(userData: RegisterRequest): Promise<User | undefined> {
    try {
      // Hashear la contraseña
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(userData.password, saltRounds);
      
      // Limpiar el teléfono de espacios
      const cleanPhone = userData.telefono ? userData.telefono.replace(/\s/g, '') : null;
      
      // Generar ID único
      const userId = uuidv4();
      
      const query = `
        INSERT INTO users (
          id, username, email, password_hash,
          first_name, last_name, phone, country_code,
          bio, user_type, user_role,
          is_verified, is_active, is_online,
          rating_average, total_reviews,
          failed_login_attempts,
          created_at, updated_at
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, 0,
          CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
        RETURNING 
          id, username, email, password_hash as password,
          first_name as "firstName", last_name as "lastName",
          phone, country_code as "countryCode",
          avatar_url as "avatarUrl", bio,
          user_type as "userType", user_role as "userRole",
          is_verified as "isVerified", is_active as "isActive",
          is_online as "isOnline", last_seen as "lastSeen",
          rating_average as "ratingAverage", total_reviews as "totalReviews",
          failed_login_attempts as "failedLoginAttempts",
          locked_until as "lockedUntil", last_login as "lastLogin",
          created_at as "createdAt", updated_at as "updatedAt"
      `;
      
      const values = [
        userId,                              // $1 - id
        userData.username,                   // $2 - username
        userData.email.toLowerCase(),        // $3 - email
        passwordHash,                        // $4 - password_hash
        userData.nombre,                     // $5 - first_name
        userData.apellidos,                  // $6 - last_name
        cleanPhone,                          // $7 - phone
        '+34',                               // $8 - country_code (España por defecto)
        userData.bio || null,                // $9 - bio
        'client',                            // $10 - user_type
        'user',                              // $11 - user_role
        false,                               // $12 - is_verified
        true,                                // $13 - is_active
        false,                               // $14 - is_online
        0.00,                                // $15 - rating_average
        0                                    // $16 - total_reviews
      ];
      
      const result = await pool.query(query, values);
      
      if (result.rows.length === 0) {
        return undefined;
      }
      
      return result.rows[0] as User;
    } catch (error) {
      console.error('Error al crear usuario:', error);
      return undefined;
    }
  }
  
  /**
   * Buscar usuario por ID
   */
  async findById(id: string): Promise<User | undefined> {
    try {
      const query = `
        SELECT 
          id, username, email, password_hash as password,
          first_name as "firstName", last_name as "lastName",
          phone, country_code as "countryCode",
          avatar_url as "avatarUrl", bio,
          user_type as "userType", user_role as "userRole",
          is_verified as "isVerified", is_active as "isActive",
          is_online as "isOnline", last_seen as "lastSeen",
          rating_average as "ratingAverage", total_reviews as "totalReviews",
          failed_login_attempts as "failedLoginAttempts",
          locked_until as "lockedUntil", last_login as "lastLogin",
          created_at as "createdAt", updated_at as "updatedAt"
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
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      countryCode: user.countryCode,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      userType: user.userType,
      userRole: user.userRole,
      isVerified: user.isVerified,
      isActive: user.isActive,
      ratingAverage: user.ratingAverage,
      totalReviews: user.totalReviews,
      createdAt: user.createdAt,
    };
  }
}

export const userDatabase = new UserDatabase();
