import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserProfile } from '../interfaces';

export interface SearchUser {
  id: string;
  nombre: string;
  apellido: string;
  usuario: string;
  url_avatar: string | null;
  esta_verificado: boolean;
  promedio_calificacion: number | null;
  total_resenas: number;
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
  created_at: string;
}

export type ReviewSortOption = 'recent' | 'oldest' | 'rating-desc' | 'rating-asc';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/users`;

  getUserById(userId: string): Observable<{ success: boolean; data: UserProfile }> {
    return this.http.get<{ success: boolean; data: UserProfile }>(`${this.apiUrl}/${userId}`);
  }

  getUserServices(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${userId}/services`);
  }

  /**
   * Obtener reseñas recibidas de un usuario
   */
  getUserReviews(
    userId: string, 
    sort: ReviewSortOption = 'recent', 
    limit: number = 50
  ): Observable<{ success: boolean; data: ReviewResponse[]; total: number }> {
    return this.http.get<{ success: boolean; data: ReviewResponse[]; total: number }>(
      `${this.apiUrl}/${userId}/reviews`,
      { params: { sort, limit: limit.toString() } }
    );
  }

  /**
   * Buscar usuarios por nombre/username
   */
  searchUsers(query: string, limit: number = 20): Observable<{ success: boolean; data: SearchUser[] }> {
    return this.http.get<{ success: boolean; data: SearchUser[] }>(
      `${this.apiUrl}/search`,
      { params: { q: query, limit: limit.toString() } }
    );
  }

  /**
   * Obtener todos los usuarios activos
   */
  getAllActiveUsers(limit: number = 50): Observable<{ success: boolean; data: SearchUser[] }> {
    return this.http.get<{ success: boolean; data: SearchUser[] }>(
      `${this.apiUrl}/active`,
      { params: { limit: limit.toString() } }
    );
  }
}
