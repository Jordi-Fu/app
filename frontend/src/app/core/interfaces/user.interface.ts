/**
 * Interfaces relacionadas con usuarios
 */

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
  usuario?: string;
}

export interface Review {
  id: string;
  reviewer_name: string;
  reviewer_avatar?: string;
  reviewer_time_in_app: string;
  rating: number;
  time_ago: string;
  comment: string;
  service_id?: string;
  service_name?: string;
}
