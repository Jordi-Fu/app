import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  Service, 
  ServicesResponse, 
  ServiceFilters, 
  Category 
} from '../interfaces/service.interface';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/services`;

  /**
   * Obtener lista de servicios con filtros opcionales
   */
  getServices(filters?: ServiceFilters): Observable<ServicesResponse> {
    let params = new HttpParams();
    
    if (filters) {
      Object.keys(filters).forEach(key => {
        const value = (filters as any)[key];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<ServicesResponse>(this.apiUrl, { params });
  }

  /**
   * Obtener un servicio por ID
   */
  getServiceById(id: string): Observable<{ success: boolean; data: Service }> {
    return this.http.get<{ success: boolean; data: Service }>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtener servicios destacados
   */
  getFeaturedServices(): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.apiUrl}/featured`);
  }

  /**
   * Obtener servicios de un proveedor específico
   */
  getServicesByProvider(providerId: string): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.apiUrl}/provider/${providerId}`);
  }

  /**
   * Buscar servicios
   */
  searchServices(query: string): Observable<Service[]> {
    const params = new HttpParams().set('search', query);
    return this.http.get<Service[]>(`${this.apiUrl}/search`, { params });
  }

  /**
   * Obtener categorías de servicios
   */
  getCategories(): Observable<{ success: boolean; data: Category[] }> {
    return this.http.get<{ success: boolean; data: Category[] }>(`${environment.apiUrl}/categories`);
  }

  /**
   * Incrementar contador de vistas
   */
  incrementViews(serviceId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${serviceId}/views`, {});
  }

  /**
   * Marcar/desmarcar servicio como favorito
   */
  toggleFavorite(serviceId: string): Observable<{ success: boolean; isFavorite: boolean; message: string }> {
    return this.http.post<{ success: boolean; isFavorite: boolean; message: string }>(
      `${this.apiUrl}/${serviceId}/favorite`, 
      {}
    );
  }

  /**
   * Verificar si un servicio está en favoritos
   */
  checkIsFavorite(serviceId: string): Observable<{ success: boolean; isFavorite: boolean }> {
    return this.http.get<{ success: boolean; isFavorite: boolean }>(
      `${this.apiUrl}/${serviceId}/is-favorite`
    );
  }

  /**
   * Obtener servicios favoritos del usuario
   */
  getFavoriteServices(): Observable<{ success: boolean; data: Service[]; total: number }> {
    return this.http.get<{ success: boolean; data: Service[]; total: number }>(
      `${this.apiUrl}/user/favorites`
    );
  }
}
