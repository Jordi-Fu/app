import { reviewDatabase } from '../database/review.database';

/**
 * Modelo de Review
 * Lógica de negocio relacionada con reseñas
 */
class ReviewModel {
  /**
   * Obtener reseñas recibidas por un usuario
   */
  async getReviewsForUser(
    userId: string,
    sortBy: 'recent' | 'oldest' | 'rating-desc' | 'rating-asc' = 'recent',
    limit: number = 50
  ) {
    return reviewDatabase.getReviewsForUser(userId, sortBy, limit);
  }

  /**
   * Contar reseñas de un usuario
   */
  async countReviewsForUser(userId: string): Promise<number> {
    return reviewDatabase.countReviewsForUser(userId);
  }

  /**
   * Obtener reseñas de un servicio
   */
  async getReviewsForService(
    serviceId: string,
    sortBy: 'recent' | 'oldest' | 'rating-desc' | 'rating-asc' = 'recent',
    limit: number = 50
  ) {
    return reviewDatabase.getReviewsForService(serviceId, sortBy, limit);
  }
}

export const reviewModel = new ReviewModel();
