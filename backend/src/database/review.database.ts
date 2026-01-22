import { pool } from '../config/database.config';

export interface ReviewDB {
  id: string;
  servicio_id: string;
  revisor_id: string;
  usuario_valorado_id: string;
  calificacion: number;
  titulo: string | null;
  comentario: string | null;
  ventajas: string | null;
  desventajas: string | null;
  es_anonimo: boolean;
  respuesta: string | null;
  fecha_respuesta: Date | null;
  es_destacada: boolean;
  votos_utiles: number;
  creado_en: Date;
  actualizado_en: Date;
  // Campos del revisor
  reviewer_name: string;
  reviewer_avatar: string | null;
  reviewer_created_at: Date;
  // Campos del servicio
  service_title: string;
}

export interface ReviewResponse {
  id: string;
  reviewer_id: string;
  reviewer_name: string;
  reviewer_avatar: string | null;
  reviewer_time_in_app: string;
  rating: number;
  title: string | null;
  time_ago: string;
  comment: string | null;
  advantages: string | null;
  disadvantages: string | null;
  is_anonymous: boolean;
  service_id: string;
  service_name: string;
  created_at: Date;
}

class ReviewDatabase {
  /**
   * Calcular tiempo relativo (ej: "3 meses", "1 año")
   */
  private calculateTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) return 'hoy';
    if (diffDays === 1) return '1 día';
    if (diffDays < 7) return `${diffDays} días`;
    if (diffDays < 14) return '1 semana';
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas`;
    if (diffDays < 60) return '1 mes';
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} meses`;
    if (diffDays < 730) return '1 año';
    return `${Math.floor(diffDays / 365)} años`;
  }

  /**
   * Calcular tiempo en la app (ej: "3 meses", "1 año")
   */
  private calculateTimeInApp(createdAt: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - new Date(createdAt).getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return 'menos de 1 mes';
    if (diffDays < 60) return '1 mes';
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} meses`;
    if (diffDays < 730) return '1 año';
    return `${Math.floor(diffDays / 365)} años`;
  }

  /**
   * Obtener reseñas recibidas por un usuario
   */
  async getReviewsForUser(
    userId: string, 
    sortBy: 'recent' | 'oldest' | 'rating-desc' | 'rating-asc' = 'recent',
    limit: number = 50
  ): Promise<ReviewResponse[]> {
    let orderClause = 'r.creado_en DESC';
    
    switch (sortBy) {
      case 'oldest':
        orderClause = 'r.creado_en ASC';
        break;
      case 'rating-desc':
        orderClause = 'r.calificacion DESC, r.creado_en DESC';
        break;
      case 'rating-asc':
        orderClause = 'r.calificacion ASC, r.creado_en DESC';
        break;
      default:
        orderClause = 'r.creado_en DESC';
    }

    const query = `
      SELECT 
        r.id,
        r.servicio_id,
        r.revisor_id,
        r.usuario_valorado_id,
        r.calificacion,
        r.titulo,
        r.comentario,
        r.ventajas,
        r.desventajas,
        r.es_anonimo,
        r.creado_en,
        u.nombre as reviewer_first_name,
        u.apellido as reviewer_last_name,
        u.url_avatar as reviewer_avatar,
        u.creado_en as reviewer_created_at,
        s.titulo as service_title
      FROM resenas r
      INNER JOIN usuarios u ON r.revisor_id = u.id
      INNER JOIN servicios s ON r.servicio_id = s.id
      WHERE r.usuario_valorado_id = $1
      ORDER BY ${orderClause}
      LIMIT $2
    `;

    const result = await pool.query(query, [userId, limit]);

    return result.rows.map(row => {
      // Si es anónimo, ocultar información del revisor
      const reviewerName = row.es_anonimo 
        ? 'Usuario anónimo'
        : `${row.reviewer_first_name} ${row.reviewer_last_name?.charAt(0) || ''}.`;
      
      const reviewerAvatar = row.es_anonimo ? null : row.reviewer_avatar;

      return {
        id: row.id,
        reviewer_id: row.es_anonimo ? '' : row.revisor_id,
        reviewer_name: reviewerName,
        reviewer_avatar: reviewerAvatar,
        reviewer_time_in_app: this.calculateTimeInApp(row.reviewer_created_at),
        rating: row.calificacion,
        title: row.titulo,
        time_ago: this.calculateTimeAgo(row.creado_en),
        comment: row.comentario,
        advantages: row.ventajas,
        disadvantages: row.desventajas,
        is_anonymous: row.es_anonimo,
        service_id: row.servicio_id,
        service_name: row.service_title,
        created_at: row.creado_en
      };
    });
  }

  /**
   * Obtener reseñas de un servicio específico
   */
  async getReviewsForService(
    serviceId: string,
    sortBy: 'recent' | 'oldest' | 'rating-desc' | 'rating-asc' = 'recent',
    limit: number = 50
  ): Promise<ReviewResponse[]> {
    let orderClause = 'r.creado_en DESC';
    
    switch (sortBy) {
      case 'oldest':
        orderClause = 'r.creado_en ASC';
        break;
      case 'rating-desc':
        orderClause = 'r.calificacion DESC, r.creado_en DESC';
        break;
      case 'rating-asc':
        orderClause = 'r.calificacion ASC, r.creado_en DESC';
        break;
    }

    const query = `
      SELECT 
        r.id,
        r.servicio_id,
        r.revisor_id,
        r.usuario_valorado_id,
        r.calificacion,
        r.titulo,
        r.comentario,
        r.ventajas,
        r.desventajas,
        r.es_anonimo,
        r.creado_en,
        u.nombre as reviewer_first_name,
        u.apellido as reviewer_last_name,
        u.url_avatar as reviewer_avatar,
        u.creado_en as reviewer_created_at,
        s.titulo as service_title
      FROM resenas r
      INNER JOIN usuarios u ON r.revisor_id = u.id
      INNER JOIN servicios s ON r.servicio_id = s.id
      WHERE r.servicio_id = $1
      ORDER BY ${orderClause}
      LIMIT $2
    `;

    const result = await pool.query(query, [serviceId, limit]);

    return result.rows.map(row => {
      const reviewerName = row.es_anonimo 
        ? 'Usuario anónimo'
        : `${row.reviewer_first_name} ${row.reviewer_last_name?.charAt(0) || ''}.`;
      
      const reviewerAvatar = row.es_anonimo ? null : row.reviewer_avatar;

      return {
        id: row.id,
        reviewer_id: row.es_anonimo ? '' : row.revisor_id,
        reviewer_name: reviewerName,
        reviewer_avatar: reviewerAvatar,
        reviewer_time_in_app: this.calculateTimeInApp(row.reviewer_created_at),
        rating: row.calificacion,
        title: row.titulo,
        time_ago: this.calculateTimeAgo(row.creado_en),
        comment: row.comentario,
        advantages: row.ventajas,
        disadvantages: row.desventajas,
        is_anonymous: row.es_anonimo,
        service_id: row.servicio_id,
        service_name: row.service_title,
        created_at: row.creado_en
      };
    });
  }

  /**
   * Contar total de reseñas para un usuario
   */
  async countReviewsForUser(userId: string): Promise<number> {
    const query = `
      SELECT COUNT(*) as total
      FROM resenas
      WHERE usuario_valorado_id = $1
    `;
    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0]?.total || '0');
  }
}

export const reviewDatabase = new ReviewDatabase();
