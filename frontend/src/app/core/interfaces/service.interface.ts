export enum PriceType {
  FIXED = 'fixed',
  HOURLY = 'hourly',
  NEGOTIABLE = 'negotiable'
}

export enum LocationType {
  REMOTE = 'remote',
  AT_CLIENT = 'at_client',
  AT_PROVIDER = 'at_provider',
  FLEXIBLE = 'flexible'
}

export interface ServiceImage {
  id: string;
  servicio_id: string;
  url_imagen: string;
  url_miniatura?: string;
  pie_de_foto?: string;
  es_principal: boolean;
  indice_orden: number;
  creado_en: string;
}

export interface ServiceProvider {
  id: string;
  usuario: string;
  nombre: string;
  apellido: string;
  url_avatar?: string;
  biografia?: string;
  promedio_calificacion: number;
  total_resenas: number;
  total_servicios?: number;
  tiempo_respuesta_minutos: number;
  porcentaje_respuesta: number;
  esta_verificado?: boolean;
  creado_en?: string;
}

export interface Category {
  id: string;
  nombre: string;
  slug: string;
  descripcion?: string;
  url_icono?: string;
  color?: string;
  padre_id?: string;
  indice_orden?: number;
  esta_activo: boolean;
  conteo_servicios?: number;
}

export interface ServiceAvailability {
  id: string;
  dia_semana: number; // 0=Domingo, 6=Sábado
  hora_inicio: string;
  hora_fin: string;
  esta_disponible: boolean;
}

export interface ServiceFAQ {
  id: string;
  pregunta: string;
  respuesta: string;
  indice_orden: number;
}

export interface ServiceTag {
  id: string;
  nombre: string;
  slug: string;
}

export interface Service {
  id: string;
  proveedor_id: string;
  categoria_id: string;
  titulo: string;
  descripcion: string;
  descripcion_corta?: string;
  tipo_precio: PriceType;
  precio?: number;
  precio_maximo?: number;
  moneda: string;
  duracion_minutos?: number;
  tipo_ubicacion: LocationType;
  direccion?: string;
  ciudad?: string;
  estado?: string;
  pais?: string;
  codigo_postal?: string;
  latitud?: number;
  longitud?: number;
  radio_servicio_km?: number;
  esta_activo: boolean;
  es_destacado: boolean;
  esta_verificado: boolean;
  vistas: number;
  conteo_favoritos: number;
  conteo_reservas: number;
  promedio_calificacion: number;
  total_resenas: number;
  tiempo_respuesta_horas?: number;
  politica_cancelacion?: string;
  requisitos?: string;
  que_incluye?: string;
  que_no_incluye?: string;
  url_video?: string;
  creado_en: string;
  actualizado_en: string;
  // Relaciones
  provider?: ServiceProvider;
  category?: Category;
  images?: ServiceImage[];
  availability?: ServiceAvailability[];
  faqs?: ServiceFAQ[];
  tags?: ServiceTag[];
}

export interface ServiceFilters {
  categoria_id?: string;
  ciudad?: string;
  estado?: string;
  precio_minimo?: number;
  precio_maximo?: number;
  tipo_ubicacion?: LocationType;
  calificacion_minima?: number;
  busqueda?: string;
  page?: number;
  limit?: number;
}

export interface ServicesResponse {
  services: Service[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}
