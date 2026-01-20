import bcrypt from 'bcrypt';
import { pool } from '../config/database.config';
import { User, SafeUser, RegisterRequest } from '../interfaces';
import { v4 as uuidv4 } from 'uuid';
import { saveBase64Image, generateInitialsAvatar } from '../utils/image.util';

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
          id, usuario as username, correo as email, hash_password as password,
          nombre as "firstName", apellido as "lastName",
          telefono as phone, codigo_pais as "countryCode",
          url_avatar as "avatarUrl", biografia as bio,
          'client' as "userType", 'user' as "userRole",
          esta_verificado as "isVerified", esta_activo as "isActive",
          esta_en_linea as "isOnline", ultima_actividad as "lastSeen",
          promedio_calificacion as "ratingAverage", total_resenas as "totalReviews",
          intentos_fallidos_login as "failedLoginAttempts",
          bloqueado_hasta as "lockedUntil", ultimo_login as "lastLogin",
          creado_en as "createdAt", actualizado_en as "updatedAt"
        FROM usuarios 
        WHERE LOWER(usuario) = $1 
           OR LOWER(correo) = $1 
           OR telefono = $1
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
      const query = 'SELECT id FROM usuarios WHERE LOWER(usuario) = LOWER($1) LIMIT 1';
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
      const query = 'SELECT id FROM usuarios WHERE LOWER(correo) = LOWER($1) LIMIT 1';
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
      const query = 'SELECT id FROM usuarios WHERE telefono = $1 LIMIT 1';
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
      
      // Procesar foto de perfil si existe, o generar avatar con iniciales
      let avatarUrl = null;
      if (userData.profilePhoto) {
        avatarUrl = await saveBase64Image(userData.profilePhoto, 'uploads/avatars');
      } else {
        // Generar avatar con las iniciales del nombre y apellido
        avatarUrl = generateInitialsAvatar(userData.nombre, userData.apellidos, 'uploads/avatars');
      }
      
      const query = `
        INSERT INTO usuarios (
          id, usuario, correo, hash_password,
          nombre, apellido, telefono, codigo_pais,
          fecha_nacimiento, url_avatar, biografia,
          esta_verificado, esta_activo, esta_en_linea,
          promedio_calificacion, total_resenas,
          intentos_fallidos_login,
          idioma, zona_horaria, moneda,
          creado_en, actualizado_en
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, 0,
          'es', 'Europe/Madrid', 'EUR',
          CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
        RETURNING 
          id, usuario as username, correo as email, hash_password as password,
          nombre as "firstName", apellido as "lastName",
          telefono as phone, codigo_pais as "countryCode",
          url_avatar as "avatarUrl", biografia as bio,
          'client' as "userType", 'user' as "userRole",
          esta_verificado as "isVerified", esta_activo as "isActive",
          esta_en_linea as "isOnline", ultima_actividad as "lastSeen",
          promedio_calificacion as "ratingAverage", total_resenas as "totalReviews",
          intentos_fallidos_login as "failedLoginAttempts",
          bloqueado_hasta as "lockedUntil", ultimo_login as "lastLogin",
          creado_en as "createdAt", actualizado_en as "updatedAt"
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
        userData.fechaNacimiento || null,    // $9 - fecha_nacimiento
        avatarUrl,                           // $10 - url_avatar
        userData.bio || null,                // $11 - biografia
        false,                               // $12 - esta_verificado
        true,                                // $13 - esta_activo
        false,                               // $14 - esta_en_linea
        0.00,                                // $15 - promedio_calificacion
        0                                    // $16 - total_resenas
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
          id, usuario as username, correo as email, hash_password as password,
          nombre as "firstName", apellido as "lastName",
          telefono as phone, codigo_pais as "countryCode",
          url_avatar as "avatarUrl", biografia as bio,
          'client' as "userType", 'user' as "userRole",
          esta_verificado as "isVerified", esta_activo as "isActive",
          esta_en_linea as "isOnline", ultima_actividad as "lastSeen",
          promedio_calificacion as "ratingAverage", total_resenas as "totalReviews",
          intentos_fallidos_login as "failedLoginAttempts",
          bloqueado_hasta as "lockedUntil", ultimo_login as "lastLogin",
          creado_en as "createdAt", actualizado_en as "updatedAt"
        FROM usuarios 
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
        isActive: 'esta_activo',
        failedLoginAttempts: 'intentos_fallidos_login',
        lockUntil: 'bloqueado_hasta',
        updatedAt: 'actualizado_en',
      };
      
      for (const [key, value] of Object.entries(updates)) {
        const dbColumn = fieldMapping[key] || key;
        fields.push(`${dbColumn} = $${paramCounter}`);
        values.push(value);
        paramCounter++;
      }
      
      // Agregar updated_at automáticamente
      fields.push(`actualizado_en = CURRENT_TIMESTAMP`);
      
      if (fields.length === 0) {
        return this.findById(id);
      }
      
      values.push(id);
      const query = `
        UPDATE usuarios 
        SET ${fields.join(', ')}
        WHERE id = $${paramCounter}
        RETURNING id, usuario as username, correo as email, telefono as phone, hash_password as password,
                  esta_activo as "isActive", intentos_fallidos_login as "failedLoginAttempts",
                  bloqueado_hasta as "lockUntil", creado_en as "createdAt",
                  actualizado_en as "updatedAt"
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
        UPDATE usuarios 
        SET intentos_fallidos_login = intentos_fallidos_login + 1,
            bloqueado_hasta = CASE 
              WHEN intentos_fallidos_login + 1 >= 5 
              THEN CURRENT_TIMESTAMP + INTERVAL '15 minutes'
              ELSE bloqueado_hasta
            END,
            actualizado_en = CURRENT_TIMESTAMP
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
        UPDATE usuarios 
        SET intentos_fallidos_login = 0,
            bloqueado_hasta = NULL,
            ultimo_login = CURRENT_TIMESTAMP,
            actualizado_en = CURRENT_TIMESTAMP
        WHERE id = $1
      `;
      
      await pool.query(query, [id]);
    } catch (error) {
      console.error('Error al resetear intentos fallidos:', error);
    }
  }

  /**
   * Actualizar contraseña de usuario
   */
  async updatePassword(userId: string, hashedPassword: string): Promise<boolean> {
    try {
      const query = `
        UPDATE usuarios 
        SET hash_password = $1,
            actualizado_en = CURRENT_TIMESTAMP
        WHERE id = $2
      `;
      
      const result = await pool.query(query, [hashedPassword, userId]);
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error('Error al actualizar contraseña:', error);
      return false;
    }
  }
  
  /**
   * Obtener perfil público de un usuario por ID
   */
  async getUserById(userId: string): Promise<any | null> {
    try {
      const query = `
        SELECT 
          u.id,
          u.nombre,
          u.apellido,
          u.correo as email,
          u.telefono,
          u.url_avatar,
          u.biografia,
          u.creado_en as fecha_creacion,
          u.esta_verificado,
          u.promedio_calificacion,
          u.total_resenas,
          (SELECT COUNT(*) FROM servicios WHERE proveedor_id = u.id AND esta_activo = true) as total_servicios
        FROM usuarios u
        WHERE u.id::text = $1 AND u.esta_activo = true
      `;
      
      const result = await pool.query(query, [userId]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return result.rows[0];
    } catch (error) {
      console.error('Error al obtener usuario por ID:', error);
      throw error;
    }
  }

  /**
   * Obtener servicios de un usuario
   */
  async getUserServices(userId: string): Promise<any[]> {
    try {
      const query = `
        SELECT 
          s.id,
          s.titulo,
          s.descripcion,
          s.precio,
          s.moneda,
          s.proveedor_id,
          s.categoria_id,
          s.tipo_ubicacion,
          s.es_destacado,
          s.esta_verificado,
          s.creado_en as fecha_creacion,
          COALESCE(AVG(r.calificacion), 0) as promedio_calificacion,
          COUNT(DISTINCT r.id) as total_resenas,
          c.nombre as category_name,
          c.color as category_color,
          c.url_icono as category_icon
        FROM servicios s
        LEFT JOIN resenas r ON r.servicio_id = s.id
        LEFT JOIN categorias c ON c.id = s.categoria_id
        WHERE s.proveedor_id::text = $1 AND s.esta_activo = true
        GROUP BY s.id, c.nombre, c.color, c.url_icono
        ORDER BY s.creado_en DESC
      `;
      
      const result = await pool.query(query, [userId]);
      const services = result.rows;

      // Obtener imágenes para cada servicio
      for (const service of services) {
        const imagesQuery = `
          SELECT 
            id,
            servicio_id,
            url_imagen,
            url_miniatura,
            pie_de_foto,
            indice_orden as orden
          FROM imagenes_servicios
          WHERE servicio_id = $1
          ORDER BY indice_orden ASC
        `;
        const imagesResult = await pool.query(imagesQuery, [service.id]);
        service.images = imagesResult.rows;
      }

      return services;
    } catch (error) {
      console.error('Error al obtener servicios del usuario:', error);
      throw error;
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
