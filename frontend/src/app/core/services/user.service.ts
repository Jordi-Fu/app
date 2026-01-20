import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UserProfile {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  url_avatar?: string;
  biografia?: string;
  fecha_creacion: string;
  esta_verificado: boolean;
  promedio_calificacion?: number;
  total_servicios?: number;
  total_resenas?: number;
}

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
}
