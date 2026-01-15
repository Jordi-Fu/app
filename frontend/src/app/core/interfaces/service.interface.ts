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
  service_id: string;
  image_url: string;
  thumbnail_url?: string;
  caption?: string;
  is_primary: boolean;
  order_index: number;
  created_at: string;
}

export interface ServiceProvider {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  bio?: string;
  rating_average: number;
  total_reviews: number;
  total_services?: number;
  response_time_minutes: number;
  response_rate: number;
  is_verified?: boolean;
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon_url?: string;
  color?: string;
  parent_id?: string;
  order_index?: number;
  is_active: boolean;
  service_count?: number;
}

export interface ServiceAvailability {
  id: string;
  day_of_week: number; // 0=Domingo, 6=Sábado
  start_time: string;
  end_time: string;
  is_available: boolean;
}

export interface ServiceFAQ {
  id: string;
  question: string;
  answer: string;
  order_index: number;
}

export interface ServiceTag {
  id: string;
  name: string;
  slug: string;
}

export interface Service {
  id: string;
  provider_id: string;
  category_id: string;
  title: string;
  description: string;
  short_description?: string;
  price_type: PriceType;
  price?: number;
  price_max?: number;
  currency: string;
  duration_minutes?: number;
  location_type: LocationType;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  service_radius_km?: number;
  is_active: boolean;
  is_featured: boolean;
  is_verified: boolean;
  views_count: number;
  favorites_count: number;
  bookings_count: number;
  rating_average: number;
  total_reviews: number;
  response_time_hours?: number;
  cancellation_policy?: string;
  requirements?: string;
  what_included?: string;
  what_not_included?: string;
  video_url?: string;
  created_at: string;
  updated_at: string;
  // Relaciones
  provider?: ServiceProvider;
  category?: Category;
  images?: ServiceImage[];
  availability?: ServiceAvailability[];
  faqs?: ServiceFAQ[];
  tags?: ServiceTag[];
}

export interface ServiceFilters {
  category_id?: string;
  city?: string;
  state?: string;
  price_min?: number;
  price_max?: number;
  location_type?: LocationType;
  rating_min?: number;
  search?: string;
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
