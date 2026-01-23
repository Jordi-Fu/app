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
  async findByCredential(credencial: string): Promise<User | undefined> {
    const credencialNormalizada = credencial.toLowerCase().trim();
    
    try {
      const query = `
        SELECT 
          id, usuario, correo, hash_password,
          nombre, apellido,
          telefono, codigo_pais,
          url_avatar, biografia,
          'cliente' as tipo_usuario, 'usuario' as rol_usuario,
          esta_verificado, esta_activo,
          esta_en_linea, ultima_actividad,
          promedio_calificacion, total_resenas,
          intentos_fallidos_login,
          bloqueado_hasta, ultimo_login,
          creado_en, actualizado_en
        FROM usuarios 
        WHERE LOWER(usuario) = $1 
           OR LOWER(correo) = $1 
           OR telefono = $1
        LIMIT 1
      `;
      
      const result = await pool.query(query, [credencialNormalizada]);
      
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
  async existsByUsername(usuario: string): Promise<boolean> {
    try {
      const query = 'SELECT id FROM usuarios WHERE LOWER(usuario) = LOWER($1) LIMIT 1';
      const result = await pool.query(query, [usuario]);
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
      const telefonoLimpio = userData.telefono ? userData.telefono.replace(/\s/g, '') : null;
      
      // Generar ID único
      const idUsuario = uuidv4();
      
      // Procesar foto de perfil si existe, o generar avatar con iniciales
      let urlAvatar = null;
      if (userData.fotoPerfilBase64) {
        urlAvatar = await saveBase64Image(userData.fotoPerfilBase64, 'uploads/avatars');
      } else {
        // Generar avatar con las iniciales del nombre y apellido
        urlAvatar = generateInitialsAvatar(userData.nombre, userData.apellidos, 'uploads/avatars');
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
          'es', 'Europe/Madrid', '€',
          CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
        RETURNING 
          id, usuario, correo, hash_password,
          nombre, apellido,
          telefono, codigo_pais,
          url_avatar, biografia,
          'cliente' as tipo_usuario, 'usuario' as rol_usuario,
          esta_verificado, esta_activo,
          esta_en_linea, ultima_actividad,
          promedio_calificacion, total_resenas,
          intentos_fallidos_login,
          bloqueado_hasta, ultimo_login,
          creado_en, actualizado_en
      `;
      
      const values = [
        idUsuario,                           // $1 - id
        userData.usuario,                    // $2 - usuario
        userData.correo.toLowerCase(),       // $3 - correo
        passwordHash,                        // $4 - hash_password
        userData.nombre,                     // $5 - nombre
        userData.apellidos,                  // $6 - apellido
        telefonoLimpio,                      // $7 - telefono
        '+34',                               // $8 - codigo_pais (España por defecto)
        userData.fechaNacimiento || null,    // $9 - fecha_nacimiento
        urlAvatar,                           // $10 - url_avatar
        userData.biografia || null,          // $11 - biografia
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
          id, usuario, correo, hash_password,
          nombre, apellido,
          telefono, codigo_pais,
          url_avatar, biografia,
          'cliente' as tipo_usuario, 'usuario' as rol_usuario,
          esta_verificado, esta_activo,
          esta_en_linea, ultima_actividad,
          promedio_calificacion, total_resenas,
          intentos_fallidos_login,
          bloqueado_hasta, ultimo_login,
          creado_en, actualizado_en
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
        RETURNING id, usuario, correo, telefono, hash_password,
                  esta_activo, intentos_fallidos_login,
                  bloqueado_hasta, creado_en,
                  actualizado_en
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
          u.usuario,
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
   * Buscar usuarios por nombre/username
   */
  async searchUsers(query: string, limit: number = 20): Promise<any[]> {
    try {
      const searchQuery = `
        SELECT 
          id,
          nombre,
          apellido,
          usuario,
          url_avatar,
          esta_verificado,
          promedio_calificacion,
          total_resenas
        FROM usuarios
        WHERE esta_activo = true
          AND (
            LOWER(nombre) LIKE $1
            OR LOWER(apellido) LIKE $1
            OR LOWER(usuario) LIKE $1
            OR LOWER(CONCAT(nombre, ' ', apellido)) LIKE $1
          )
        ORDER BY promedio_calificacion DESC NULLS LAST, nombre ASC
        LIMIT $2
      `;
      
      const searchPattern = `%${query.toLowerCase()}%`;
      const result = await pool.query(searchQuery, [searchPattern, limit]);
      
      return result.rows;
    } catch (error) {
      console.error('Error al buscar usuarios:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los usuarios activos (para búsqueda)
   */
  async getAllActiveUsers(limit: number = 50): Promise<any[]> {
    try {
      const query = `
        SELECT 
          id,
          nombre,
          apellido,
          usuario,
          url_avatar,
          esta_verificado,
          promedio_calificacion,
          total_resenas
        FROM usuarios
        WHERE esta_activo = true
        ORDER BY promedio_calificacion DESC NULLS LAST, nombre ASC
        LIMIT $1
      `;
      
      const result = await pool.query(query, [limit]);
      return result.rows;
    } catch (error) {
      console.error('Error al obtener usuarios activos:', error);
      throw error;
    }
  }
  
  /**
   * Convertir a usuario seguro (sin contraseña)
   */
  toSafeUser(user: User): SafeUser {
    return {
      id: user.id,
      usuario: user.usuario,
      correo: user.correo,
      nombre: user.nombre,
      apellido: user.apellido,
      telefono: user.telefono,
      codigo_pais: user.codigo_pais,
      url_avatar: user.url_avatar,
      biografia: user.biografia,
      tipo_usuario: user.tipo_usuario,
      rol_usuario: user.rol_usuario,
      esta_verificado: user.esta_verificado,
      esta_activo: user.esta_activo,
      promedio_calificacion: user.promedio_calificacion,
      total_resenas: user.total_resenas,
      creado_en: user.creado_en,
    };
  }
}

export const userDatabase = new UserDatabase();
