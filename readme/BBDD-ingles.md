# 🗄️ Esquema de Base de Datos PostgreSQL - Aplicación de Servicios

## 📋 Descripción General
Base de datos completa para una aplicación de servicios donde los usuarios pueden publicar, buscar, contratar servicios y comunicarse. Incluye sistema de chat en tiempo real, valoraciones, notificaciones, pagos, y gestión completa de usuarios.

**32 Tablas | Triggers Automáticos | Vistas Optimizadas | Datos de Prueba Incluidos**

---

## 🚀 Instalación en 3 Pasos

### 1️⃣ Crear la base de datos en PostgreSQL:
```bash
psql -U postgres
CREATE DATABASE servicesapp;
\c servicesapp
```

### 2️⃣ Copiar TODO el código SQL de abajo (desde CREATE EXTENSION hasta el final)

### 3️⃣ Pegarlo y ejecutar en PostgreSQL

---

## 📦 Script SQL Completo (Copiar desde aquí 👇)

```sql
-- ============================================
-- CREACIÓN DE EXTENSIONES
-- ============================================

-- Habilitar UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- CREACIÓN DE TIPOS ENUM
-- ============================================

-- Tipos de usuario
CREATE TYPE user_type_enum AS ENUM ('client', 'provider', 'both');

-- Tipos de precio
CREATE TYPE price_type_enum AS ENUM ('fixed', 'hourly', 'negotiable');

-- Tipos de ubicación de servicio
CREATE TYPE location_type_enum AS ENUM ('remote', 'at_client', 'at_provider', 'flexible');

-- Estados de reserva
CREATE TYPE booking_status_enum AS ENUM ('pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled');

-- Estados de pago
CREATE TYPE payment_status_enum AS ENUM ('pending', 'paid', 'refunded');

-- Tipos de mensaje
CREATE TYPE message_type_enum AS ENUM ('text', 'image', 'file', 'location', 'audio', 'video');

-- Tipos de notificación
CREATE TYPE notification_type_enum AS ENUM ('booking', 'message', 'review', 'system', 'payment', 'promotion');

-- Tipos de reporte
CREATE TYPE report_type_enum AS ENUM ('spam', 'inappropriate', 'fraud', 'harassment', 'fake_profile', 'other');

-- Estados de reporte
CREATE TYPE report_status_enum AS ENUM ('pending', 'under_review', 'resolved', 'dismissed');

-- Métodos de pago
CREATE TYPE payment_method_enum AS ENUM ('credit_card', 'debit_card', 'paypal', 'transfer', 'cash', 'wallet');

-- Estados de transacción
CREATE TYPE transaction_status_enum AS ENUM ('pending', 'completed', 'failed', 'refunded', 'cancelled');

-- Tipos de verificación
CREATE TYPE verification_type_enum AS ENUM ('email', 'phone', 'identity', 'address', 'business', 'professional');

-- Estados de verificación
CREATE TYPE verification_status_enum AS ENUM ('pending', 'approved', 'rejected', 'expired');

-- Tipos de descuento
CREATE TYPE discount_type_enum AS ENUM ('percentage', 'fixed');

-- Roles de usuario
CREATE TYPE user_role_enum AS ENUM ('user', 'provider', 'admin', 'moderator');

-- ============================================
-- TABLA: users (Usuarios)
-- ============================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  country_code VARCHAR(5) DEFAULT '+1',
  avatar_url VARCHAR(500),
  cover_image_url VARCHAR(500),
  bio TEXT,
  date_of_birth DATE,
  gender VARCHAR(20),
  user_type user_type_enum DEFAULT 'client',
  user_role user_role_enum DEFAULT 'user',
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  is_online BOOLEAN DEFAULT false,
  last_seen TIMESTAMP,
  rating_average DECIMAL(3,2) DEFAULT 0.00 CHECK (rating_average >= 0 AND rating_average <= 5),
  total_reviews INTEGER DEFAULT 0,
  total_services INTEGER DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  completed_bookings INTEGER DEFAULT 0,
  response_time_minutes INTEGER DEFAULT 0,
  response_rate DECIMAL(5,2) DEFAULT 0.00,
  language VARCHAR(10) DEFAULT 'es',
  timezone VARCHAR(50) DEFAULT 'UTC',
  currency VARCHAR(3) DEFAULT 'USD',
  stripe_customer_id VARCHAR(255),
  stripe_account_id VARCHAR(255),
  fcm_token TEXT, -- Para notificaciones push
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

-- Índices para users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_type ON users(user_type);
CREATE INDEX idx_users_role ON users(user_role);
CREATE INDEX idx_users_rating ON users(rating_average DESC);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_users_created ON users(created_at DESC);

-- ============================================
-- TABLA: user_addresses (Direcciones de Usuario)
-- ============================================

CREATE TABLE user_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label VARCHAR(50) NOT NULL, -- 'home', 'work', 'other'
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20),
  country VARCHAR(100) NOT NULL DEFAULT 'España',
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_addresses_user ON user_addresses(user_id);
CREATE INDEX idx_user_addresses_location ON user_addresses(latitude, longitude);

-- ============================================
-- TABLA: categories (Categorías de Servicios)
-- ============================================

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon_url VARCHAR(500),
  color VARCHAR(7), -- Código hexadecimal de color
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  services_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_active ON categories(is_active);
CREATE INDEX idx_categories_order ON categories(order_index);

-- ============================================
-- TABLA: services (Servicios Publicados)
-- ============================================

CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  short_description VARCHAR(500),
  price_type price_type_enum NOT NULL,
  price DECIMAL(10,2),
  price_max DECIMAL(10,2), -- Para rangos de precio
  currency VARCHAR(3) DEFAULT 'USD',
  duration_minutes INTEGER,
  location_type location_type_enum NOT NULL,
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  postal_code VARCHAR(20),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  service_radius_km INTEGER, -- Radio de servicio en km
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  favorites_count INTEGER DEFAULT 0,
  bookings_count INTEGER DEFAULT 0,
  rating_average DECIMAL(3,2) DEFAULT 0.00 CHECK (rating_average >= 0 AND rating_average <= 5),
  total_reviews INTEGER DEFAULT 0,
  response_time_hours INTEGER,
  cancellation_policy TEXT,
  requirements TEXT, -- Requisitos para el cliente
  what_included TEXT, -- Qué incluye el servicio
  what_not_included TEXT, -- Qué no incluye
  video_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

-- Índices para services
CREATE INDEX idx_services_provider ON services(provider_id);
CREATE INDEX idx_services_category ON services(category_id);
CREATE INDEX idx_services_location ON services(city, state);
CREATE INDEX idx_services_coordinates ON services(latitude, longitude);
CREATE INDEX idx_services_rating ON services(rating_average DESC);
CREATE INDEX idx_services_active ON services(is_active);
CREATE INDEX idx_services_featured ON services(is_featured);
CREATE INDEX idx_services_price ON services(price);
CREATE INDEX idx_services_created ON services(created_at DESC);

-- ============================================
-- TABLA: service_images (Imágenes de Servicios)
-- ============================================

CREATE TABLE service_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  caption TEXT,
  is_primary BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_service_images_service ON service_images(service_id);
CREATE INDEX idx_service_images_primary ON service_images(is_primary);

-- ============================================
-- TABLA: service_availability (Disponibilidad)
-- ============================================

CREATE TABLE service_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Domingo, 6=Sábado
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_availability_service ON service_availability(service_id);
CREATE INDEX idx_availability_day ON service_availability(day_of_week);

-- ============================================
-- TABLA: service_exceptions (Excepciones de Disponibilidad)
-- ============================================

CREATE TABLE service_exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  exception_date DATE NOT NULL,
  is_available BOOLEAN DEFAULT false,
  start_time TIME,
  end_time TIME,
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_exceptions_service ON service_exceptions(service_id);
CREATE INDEX idx_exceptions_date ON service_exceptions(exception_date);

-- ============================================
-- TABLA: bookings (Reservas/Contrataciones)
-- ============================================

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number VARCHAR(20) UNIQUE NOT NULL, -- Número de referencia
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status booking_status_enum DEFAULT 'pending',
  scheduled_date DATE NOT NULL,
  scheduled_time TIME NOT NULL,
  end_date DATE,
  end_time TIME,
  duration_minutes INTEGER,
  total_price DECIMAL(10,2) NOT NULL,
  service_fee DECIMAL(10,2), -- Comisión de la plataforma
  discount_amount DECIMAL(10,2) DEFAULT 0,
  final_price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  payment_status payment_status_enum DEFAULT 'pending',
  location_address TEXT,
  location_lat DECIMAL(10,8),
  location_lng DECIMAL(11,8),
  client_notes TEXT,
  provider_notes TEXT,
  cancellation_reason TEXT,
  cancelled_by UUID REFERENCES users(id),
  cancelled_at TIMESTAMP,
  accepted_at TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para bookings
CREATE INDEX idx_bookings_number ON bookings(booking_number);
CREATE INDEX idx_bookings_service ON bookings(service_id);
CREATE INDEX idx_bookings_client ON bookings(client_id);
CREATE INDEX idx_bookings_provider ON bookings(provider_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_payment ON bookings(payment_status);
CREATE INDEX idx_bookings_date ON bookings(scheduled_date);
CREATE INDEX idx_bookings_created ON bookings(created_at DESC);

-- ============================================
-- TABLA: reviews (Valoraciones y Reseñas)
-- ============================================

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewed_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title VARCHAR(200),
  comment TEXT,
  pros TEXT,
  cons TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  response TEXT, -- Respuesta del proveedor
  response_date TIMESTAMP,
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0, -- Votos de "útil"
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(booking_id, reviewer_id)
);

-- Índices para reviews
CREATE INDEX idx_reviews_booking ON reviews(booking_id);
CREATE INDEX idx_reviews_service ON reviews(service_id);
CREATE INDEX idx_reviews_reviewer ON reviews(reviewer_id);
CREATE INDEX idx_reviews_reviewed ON reviews(reviewed_user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created ON reviews(created_at DESC);

-- ============================================
-- TABLA: review_images (Imágenes de Reseñas)
-- ============================================

CREATE TABLE review_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_review_images_review ON review_images(review_id);

-- ============================================
-- TABLA: conversations (Conversaciones de Chat)
-- ============================================

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  participant_2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  last_message_text TEXT,
  last_message_at TIMESTAMP,
  last_message_sender_id UUID REFERENCES users(id),
  unread_count_p1 INTEGER DEFAULT 0,
  unread_count_p2 INTEGER DEFAULT 0,
  is_archived_p1 BOOLEAN DEFAULT false,
  is_archived_p2 BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(participant_1_id, participant_2_id, service_id)
);

-- Índices para conversations
CREATE INDEX idx_conversations_p1 ON conversations(participant_1_id);
CREATE INDEX idx_conversations_p2 ON conversations(participant_2_id);
CREATE INDEX idx_conversations_service ON conversations(service_id);
CREATE INDEX idx_conversations_booking ON conversations(booking_id);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);

-- ============================================
-- TABLA: messages (Mensajes)
-- ============================================

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message_type message_type_enum DEFAULT 'text',
  content TEXT,
  media_url VARCHAR(500),
  media_thumbnail_url VARCHAR(500),
  media_duration INTEGER, -- Para audio/video en segundos
  media_size INTEGER, -- Tamaño en bytes
  file_name VARCHAR(255),
  latitude DECIMAL(10,8), -- Para ubicaciones compartidas
  longitude DECIMAL(11,8),
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMP,
  is_deleted BOOLEAN DEFAULT false,
  deleted_at TIMESTAMP,
  reply_to_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para messages
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
CREATE INDEX idx_messages_unread ON messages(is_read);

-- ============================================
-- TABLA: favorites (Servicios Favoritos)
-- ============================================

CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, service_id)
);

CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_service ON favorites(service_id);

-- ============================================
-- TABLA: notifications (Notificaciones)
-- ============================================

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type notification_type_enum NOT NULL,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  image_url VARCHAR(500),
  related_id UUID,
  related_type VARCHAR(50), -- 'booking', 'message', 'review', etc.
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  action_url VARCHAR(500),
  action_label VARCHAR(100),
  is_push_sent BOOLEAN DEFAULT false,
  push_sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para notifications
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(type);

-- ============================================
-- TABLA: reports (Reportes/Denuncias)
-- ============================================

CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reported_service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  reported_review_id UUID REFERENCES reviews(id) ON DELETE CASCADE,
  reported_message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  report_type report_type_enum NOT NULL,
  description TEXT NOT NULL,
  evidence_urls TEXT[], -- Array de URLs de evidencia
  status report_status_enum DEFAULT 'pending',
  admin_notes TEXT,
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para reports
CREATE INDEX idx_reports_reporter ON reports(reporter_id);
CREATE INDEX idx_reports_reported_user ON reports(reported_user_id);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_type ON reports(report_type);

-- ============================================
-- TABLA: payments (Pagos)
-- ============================================

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_number VARCHAR(20) UNIQUE NOT NULL,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
  payer_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  payment_method payment_method_enum NOT NULL,
  transaction_id VARCHAR(255), -- ID de la pasarela de pago
  external_payment_id VARCHAR(255), -- ID externo (Stripe, PayPal, etc.)
  status transaction_status_enum DEFAULT 'pending',
  payment_date TIMESTAMP,
  refund_date TIMESTAMP,
  refund_amount DECIMAL(10,2),
  refund_reason TEXT,
  platform_fee DECIMAL(10,2),
  provider_amount DECIMAL(10,2), -- Monto que recibe el proveedor
  payment_details JSONB, -- Detalles adicionales en JSON
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para payments
CREATE INDEX idx_payments_number ON payments(payment_number);
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_payer ON payments(payer_id);
CREATE INDEX idx_payments_receiver ON payments(receiver_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_date ON payments(payment_date);

-- ============================================
-- TABLA: user_verifications (Verificaciones)
-- ============================================

CREATE TABLE user_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  verification_type verification_type_enum NOT NULL,
  document_type VARCHAR(50), -- 'passport', 'license', 'id_card', etc.
  document_number VARCHAR(100),
  document_url VARCHAR(500),
  document_back_url VARCHAR(500),
  selfie_url VARCHAR(500),
  status verification_status_enum DEFAULT 'pending',
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMP,
  expires_at TIMESTAMP,
  rejection_reason TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, verification_type)
);

-- Índices para user_verifications
CREATE INDEX idx_verifications_user ON user_verifications(user_id);
CREATE INDEX idx_verifications_status ON user_verifications(status);
CREATE INDEX idx_verifications_type ON user_verifications(verification_type);

-- ============================================
-- TABLA: search_history (Historial de Búsquedas)
-- ============================================

CREATE TABLE search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  search_term VARCHAR(255) NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  filters JSONB, -- Filtros aplicados en formato JSON
  location VARCHAR(200),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  results_count INTEGER,
  clicked_service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para search_history
CREATE INDEX idx_search_history_user ON search_history(user_id);
CREATE INDEX idx_search_history_term ON search_history(search_term);
CREATE INDEX idx_search_history_category ON search_history(category_id);

-- ============================================
-- TABLA: tags (Etiquetas)
-- ============================================

CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tags_slug ON tags(slug);
CREATE INDEX idx_tags_usage ON tags(usage_count DESC);

-- ============================================
-- TABLA: service_tags (Relación Servicios-Etiquetas)
-- ============================================

CREATE TABLE service_tags (
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(service_id, tag_id)
);

CREATE INDEX idx_service_tags_service ON service_tags(service_id);
CREATE INDEX idx_service_tags_tag ON service_tags(tag_id);

-- ============================================
-- TABLA: promocodes (Códigos Promocionales)
-- ============================================

CREATE TABLE promocodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type discount_type_enum NOT NULL,
  discount_value DECIMAL(10,2) NOT NULL,
  max_discount_amount DECIMAL(10,2), -- Descuento máximo para porcentajes
  max_uses INTEGER,
  max_uses_per_user INTEGER DEFAULT 1,
  used_count INTEGER DEFAULT 0,
  min_purchase_amount DECIMAL(10,2),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL, -- Específico para categoría
  applicable_services UUID[], -- Array de IDs de servicios aplicables
  valid_from TIMESTAMP NOT NULL,
  valid_until TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para promocodes
CREATE INDEX idx_promocodes_code ON promocodes(code);
CREATE INDEX idx_promocodes_active ON promocodes(is_active);
CREATE INDEX idx_promocodes_valid ON promocodes(valid_from, valid_until);

-- ============================================
-- TABLA: promocode_usage (Uso de Códigos)
-- ============================================

CREATE TABLE promocode_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  promocode_id UUID NOT NULL REFERENCES promocodes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  discount_amount DECIMAL(10,2) NOT NULL,
  used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para promocode_usage
CREATE INDEX idx_promocode_usage_code ON promocode_usage(promocode_id);
CREATE INDEX idx_promocode_usage_user ON promocode_usage(user_id);
CREATE INDEX idx_promocode_usage_booking ON promocode_usage(booking_id);

-- ============================================
-- TABLA: user_followers (Seguidores)
-- ============================================

CREATE TABLE user_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(follower_id, following_id),
  CHECK(follower_id != following_id)
);

CREATE INDEX idx_followers_follower ON user_followers(follower_id);
CREATE INDEX idx_followers_following ON user_followers(following_id);

-- ============================================
-- TABLA: user_badges (Insignias de Usuario)
-- ============================================

CREATE TABLE user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon_url VARCHAR(500),
  requirements JSONB, -- Requisitos para obtener la insignia
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_earned_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES user_badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, badge_id)
);

CREATE INDEX idx_earned_badges_user ON user_earned_badges(user_id);
CREATE INDEX idx_earned_badges_badge ON user_earned_badges(badge_id);

-- ============================================
-- TABLA: portfolios (Portafolio del Proveedor)
-- ============================================

CREATE TABLE portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  image_url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  order_index INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_portfolios_provider ON portfolios(provider_id);
CREATE INDEX idx_portfolios_category ON portfolios(category_id);

-- ============================================
-- TABLA: service_faqs (Preguntas Frecuentes)
-- ============================================

CREATE TABLE service_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_faqs_service ON service_faqs(service_id);

-- ============================================
-- TABLA: blocked_users (Usuarios Bloqueados)
-- ============================================

CREATE TABLE blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(blocker_id, blocked_id),
  CHECK(blocker_id != blocked_id)
);

CREATE INDEX idx_blocked_blocker ON blocked_users(blocker_id);
CREATE INDEX idx_blocked_blocked ON blocked_users(blocked_id);

-- ============================================
-- TABLA: app_settings (Configuración de la App)
-- ============================================

CREATE TABLE app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  data_type VARCHAR(20) DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
  description TEXT,
  is_public BOOLEAN DEFAULT false, -- Si es visible para clientes
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: audit_logs (Logs de Auditoría)
-- ============================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  table_name VARCHAR(100),
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_table ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas con updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_verifications_updated_at BEFORE UPDATE ON user_verifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_promocodes_updated_at BEFORE UPDATE ON promocodes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para actualizar rating_average en users
CREATE OR REPLACE FUNCTION update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET 
    rating_average = (
      SELECT COALESCE(AVG(rating), 0)
      FROM reviews
      WHERE reviewed_user_id = NEW.reviewed_user_id
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM reviews
      WHERE reviewed_user_id = NEW.reviewed_user_id
    )
  WHERE id = NEW.reviewed_user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_rating_trigger
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_user_rating();

-- Función para actualizar rating_average en services
CREATE OR REPLACE FUNCTION update_service_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE services
  SET 
    rating_average = (
      SELECT COALESCE(AVG(rating), 0)
      FROM reviews
      WHERE service_id = NEW.service_id
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM reviews
      WHERE service_id = NEW.service_id
    )
  WHERE id = NEW.service_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_service_rating_trigger
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_service_rating();

-- Función para actualizar contadores de favoritos
CREATE OR REPLACE FUNCTION update_favorites_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE services
    SET favorites_count = favorites_count + 1
    WHERE id = NEW.service_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE services
    SET favorites_count = GREATEST(favorites_count - 1, 0)
    WHERE id = OLD.service_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_favorites_count_trigger
AFTER INSERT OR DELETE ON favorites
FOR EACH ROW EXECUTE FUNCTION update_favorites_count();

-- Función para generar booking_number
CREATE OR REPLACE FUNCTION generate_booking_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.booking_number = 'BK' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || LPAD(nextval('booking_number_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE booking_number_seq;

CREATE TRIGGER generate_booking_number_trigger
BEFORE INSERT ON bookings
FOR EACH ROW EXECUTE FUNCTION generate_booking_number();

-- Función para generar payment_number
CREATE OR REPLACE FUNCTION generate_payment_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.payment_number = 'PAY' || TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDD') || LPAD(nextval('payment_number_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE payment_number_seq;

CREATE TRIGGER generate_payment_number_trigger
BEFORE INSERT ON payments
FOR EACH ROW EXECUTE FUNCTION generate_payment_number();

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista de servicios con información del proveedor
CREATE VIEW services_with_provider AS
SELECT 
  s.*,
  u.username as provider_username,
  u.first_name as provider_first_name,
  u.last_name as provider_last_name,
  u.avatar_url as provider_avatar,
  u.rating_average as provider_rating,
  u.total_reviews as provider_total_reviews,
  u.is_verified as provider_is_verified,
  c.name as category_name,
  c.slug as category_slug
FROM services s
JOIN users u ON s.provider_id = u.id
JOIN categories c ON s.category_id = c.id
WHERE s.deleted_at IS NULL;

-- Vista de bookings completos
CREATE VIEW bookings_complete AS
SELECT 
  b.*,
  s.title as service_title,
  s.price_type as service_price_type,
  c_user.username as client_username,
  c_user.email as client_email,
  c_user.phone as client_phone,
  c_user.avatar_url as client_avatar,
  p_user.username as provider_username,
  p_user.email as provider_email,
  p_user.phone as provider_phone,
  p_user.avatar_url as provider_avatar
FROM bookings b
JOIN services s ON b.service_id = s.id
JOIN users c_user ON b.client_id = c_user.id
JOIN users p_user ON b.provider_id = p_user.id;

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Insertar configuraciones iniciales
INSERT INTO app_settings (key, value, data_type, description, is_public) VALUES
('platform_commission_percentage', '15', 'number', 'Porcentaje de comisión de la plataforma', false),
('min_service_price', '10', 'number', 'Precio mínimo de servicio', true),
('max_service_price', '10000', 'number', 'Precio máximo de servicio', true),
('booking_cancellation_hours', '24', 'number', 'Horas antes para cancelar sin penalización', true),
('app_name', 'ServicesApp', 'string', 'Nombre de la aplicación', true),
('support_email', 'support@servicesapp.com', 'string', 'Email de soporte', true),
('currency_default', 'USD', 'string', 'Moneda por defecto', true),
('language_default', 'es', 'string', 'Idioma por defecto', true);

-- Insertar categorías principales
INSERT INTO categories (name, slug, description, color, is_active, order_index) VALUES
('Limpieza del Hogar', 'limpieza-hogar', 'Servicios de limpieza residencial y profesional', '#4CAF50', true, 1),
('Reparaciones', 'reparaciones', 'Plomería, electricidad, carpintería y más', '#FF9800', true, 2),
('Clases Particulares', 'clases-particulares', 'Tutorías y clases privadas', '#2196F3', true, 3),
('Belleza y Estética', 'belleza-estetica', 'Peluquería, manicure, maquillaje', '#E91E63', true, 4),
('Transporte y Mudanzas', 'transporte-mudanzas', 'Servicios de transporte y mudanzas', '#9C27B0', true, 5),
('Tecnología', 'tecnologia', 'Reparación de computadoras, celulares, etc.', '#3F51B5', true, 6),
('Fotografía y Video', 'fotografia-video', 'Fotografía profesional y videografía', '#00BCD4', true, 7),
('Eventos y Catering', 'eventos-catering', 'Organización de eventos y catering', '#FFC107', true, 8),
('Salud y Bienestar', 'salud-bienestar', 'Masajes, yoga, entrenamiento personal', '#8BC34A', true, 9),
('Jardinería', 'jardineria', 'Cuidado de jardines y paisajismo', '#4CAF50', true, 10);

-- Insertar insignias de usuario
INSERT INTO user_badges (name, slug, description, icon_url) VALUES
('Proveedor Verificado', 'verified-provider', 'Usuario con identidad verificada', '/badges/verified.png'),
('Top Rated', 'top-rated', 'Proveedor con calificación promedio de 4.8+', '/badges/top-rated.png'),
('Respuesta Rápida', 'quick-response', 'Responde mensajes en menos de 1 hora', '/badges/quick-response.png'),
('Profesional Confiable', 'trusted-pro', 'Más de 50 servicios completados', '/badges/trusted.png'),
('Super Vendedor', 'super-seller', 'Más de 100 servicios completados', '/badges/super-seller.png');

-- ============================================
-- USUARIO DE PRUEBA
-- ============================================

-- Insertar usuario de prueba (password: Admin123!)
-- El hash corresponde a la contraseña "Admin123!" usando bcrypt
INSERT INTO users (
  id,
  email,
  password_hash,
  username,
  first_name,
  last_name,
  phone,
  country_code,
  avatar_url,
  bio,
  date_of_birth,
  gender,
  user_type,
  user_role,
  is_verified,
  is_active,
  is_online,
  rating_average,
  total_reviews,
  language,
  timezone,
  currency,
  email_notifications,
  push_notifications,
  sms_notifications,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'admin@servicesapp.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIw8nC8hYq', -- Password: Admin123!
  'admin',
  'Administrador',
  'Sistema',
  '5551234567',
  '+52',
  'https://ui-avatars.com/api/?name=Admin&background=4CAF50&color=fff&size=200',
  'Usuario administrador del sistema. Cuenta de prueba para desarrollo y testing.',
  '1990-01-15',
  'Masculino',
  'both',
  'admin',
  true,
  true,
  false,
  4.95,
  125,
  'es',
  'America/Mexico_City',
  'MXN',
  true,
  true,
  false,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- ============================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- ============================================

COMMENT ON TABLE users IS 'Tabla principal de usuarios de la plataforma';
COMMENT ON TABLE services IS 'Servicios publicados por los proveedores';
COMMENT ON TABLE bookings IS 'Reservas y contrataciones de servicios';
COMMENT ON TABLE reviews IS 'Valoraciones y reseñas de servicios';
COMMENT ON TABLE conversations IS 'Conversaciones de chat entre usuarios';
COMMENT ON TABLE messages IS 'Mensajes individuales en las conversaciones';
COMMENT ON TABLE payments IS 'Registro de transacciones financieras';
COMMENT ON TABLE notifications IS 'Sistema de notificaciones push e in-app';

-- ============================================
-- FIN DEL SCRIPT
-- ============================================

-- Para verificar que todo se creó correctamente:
SELECT 'Tables created: ' || COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

SELECT 'Views created: ' || COUNT(*) FROM information_schema.views 
WHERE table_schema = 'public';

SELECT 'Indexes created: ' || COUNT(*) FROM pg_indexes 
WHERE schemaname = 'public';

-- ============================================
-- ✅ INSTALACIÓN COMPLETADA
-- ============================================
-- Si ves los resultados de las queries anteriores, la base de datos está lista.
-- 
-- 👤 Usuario de prueba creado:
-- Email: admin@servicesapp.com
-- Password: Admin123!
-- Username: admin
-- Rol: Administrador
```

---

## ✅ ¿Qué incluye este script?

- ✅ **32 Tablas** completas con todas las relaciones
- ✅ **15 Tipos ENUM** para validación de datos
- ✅ **Triggers automáticos** para actualizar ratings, contadores y números de referencia
- ✅ **2 Vistas optimizadas** para consultas frecuentes
- ✅ **10 Categorías** de servicios prellenadas
- ✅ **5 Insignias** de usuario configuradas
- ✅ **1 Usuario administrador** de prueba (Email: admin@servicesapp.com | Pass: Admin123!)
- ✅ **Configuración inicial** de la aplicación
- ✅ **Índices optimizados** en todos los campos críticos
- ✅ **Funciones reutilizables** en PL/pgSQL

---

## 👤 Usuario de Prueba Incluido

**Credenciales:**
```
📧 Email:    admin@servicesapp.com
🔑 Password: Admin123!
👤 Username: admin
👨‍💼 Rol:      Administrador (puede ver/modificar todo)
⭐ Rating:   4.95/5.00 (125 reseñas)
```

---

## 📊 Diagrama de Relaciones

### Relaciones Principales:

```
users (1) ──┬──< (N) services
            ├──< (N) bookings [como cliente]
            ├──< (N) bookings [como proveedor]
            ├──< (N) reviews [como reviewer]
            ├──< (N) reviews [como reviewed]
            ├──< (N) messages
            ├──< (N) favorites
            ├──< (N) notifications
            ├──< (N) payments [como payer]
            └──< (N) payments [como receiver]

categories (1) ──┬──< (N) services
                 └──< (N) categories [subcategorías]

services (1) ──┬──< (N) service_images
               ├──< (N) service_availability
               ├──< (N) bookings
               ├──< (N) reviews
               ├──< (N) favorites
               ├──< (N) conversations
               └──< (N) service_faqs

bookings (1) ──┬──< (1) review
               └──< (N) payments

conversations (1) ──< (N) messages
```

---

## 🚀 Características Implementadas

### ✅ 10 Módulos Principales

1. **👥 Gestión de Usuarios** - Registro, autenticación, verificaciones, badges, seguidores
2. **🛠️ Servicios** - Publicación, categorías, imágenes, geolocalización, disponibilidad
3. **📅 Reservas** - Contrataciones, estados, cancelaciones, historial
4. **💬 Chat** - Mensajes multimedia, estados de lectura, archivado
5. **⭐ Valoraciones** - Reseñas con imágenes, respuestas, votos útiles
6. **💰 Pagos** - Transacciones, comisiones, reembolsos, múltiples métodos
7. **🔔 Notificaciones** - Push, in-app, configuración de preferencias
8. **🔍 Búsqueda** - Historial, geolocalización, filtros, tags
9. **🎁 Promociones** - Códigos de descuento, límites de uso
10. **🛡️ Moderación** - Reportes, auditoría, bloqueos

---

## 🔧 Comandos Útiles PostgreSQL

### Crear backup:
```bash
pg_dump -U postgres servicesapp > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restaurar backup:
```bash
psql -U postgres servicesapp < backup.sql
```

### Ver tamaño de tablas:
```sql
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size('public.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size('public.'||tablename) DESC
LIMIT 10;
```

### Verificar datos insertados:
```sql
-- Ver categorías
SELECT name, slug FROM categories ORDER BY order_index;

-- Ver usuario de prueba
SELECT username, email, user_role, is_verified FROM users;

-- Ver configuración
SELECT key, value FROM app_settings;
```

---

## 📝 Tablas Creadas (32 total)

| Tabla | Descripción | Registros FK |
|-------|-------------|--------------|
| `users` | Usuarios de la plataforma | - |
| `user_addresses` | Direcciones de usuarios | users |
| `categories` | Categorías de servicios | categories (subcategorías) |
| `services` | Servicios publicados | users, categories |
| `service_images` | Galería de imágenes | services |
| `service_availability` | Horarios disponibles | services |
| `service_exceptions` | Excepciones de horario | services |
| `bookings` | Reservas/contrataciones | services, users |
| `reviews` | Valoraciones y reseñas | bookings, services, users |
| `review_images` | Imágenes de reseñas | reviews |
| `conversations` | Canales de chat | users, services |
| `messages` | Mensajes individuales | conversations, users |
| `favorites` | Servicios favoritos | users, services |
| `notifications` | Sistema de notificaciones | users |
| `reports` | Reportes/denuncias | users, services, reviews |
| `payments` | Transacciones | bookings, users |
| `user_verifications` | Verificaciones | users |
| `search_history` | Historial de búsquedas | users, categories |
| `tags` | Etiquetas globales | - |
| `service_tags` | Relación servicios-tags | services, tags |
| `promocodes` | Códigos promocionales | categories, users |
| `promocode_usage` | Uso de códigos | promocodes, users, bookings |
| `user_followers` | Sistema de seguidores | users |
| `user_badges` | Insignias disponibles | - |
| `user_earned_badges` | Insignias obtenidas | users, user_badges |
| `portfolios` | Portafolio de proveedores | users, categories |
| `service_faqs` | Preguntas frecuentes | services |
| `blocked_users` | Usuarios bloqueados | users |
| `app_settings` | Configuración | - |
| `audit_logs` | Logs de auditoría | users |
| `services_with_provider` | Vista: servicios + proveedor | - |
| `bookings_complete` | Vista: reservas completas | - |

---

## 🔒 Seguridad Implementada

- ✅ Contraseñas hasheadas con bcrypt (12 rounds)
- ✅ UUIDs para IDs (mejor seguridad que SERIAL)
- ✅ Foreign Keys con CASCADE/RESTRICT según lógica
- ✅ CHECK constraints para validación
- ✅ Índices en campos sensibles para performance
- ✅ Soft deletes (deleted_at) para datos críticos
- ✅ Audit logs para trazabilidad
- ✅ UNIQUE constraints para prevenir duplicados

---

## 💡 Notas de Implementación

1. **UUID vs SERIAL**: Se usa UUID para mejor escalabilidad y seguridad
2. **Soft Deletes**: Columna `deleted_at` para servicios y usuarios
3. **Triggers**: Automatizan ratings, contadores y números de referencia
4. **Índices**: Optimizados para búsquedas por ubicación, rating, fecha
5. **JSONB**: Para datos flexibles (filtros, configuración, detalles de pago)
6. **ENUMs**: Validación de datos a nivel de BD
7. **Funciones**: Lógica reutilizable en PL/pgSQL
8. **Vistas**: Queries frecuentes precompiladas

---

## 📞 Soporte

**Base de Datos:** PostgreSQL 12+  
**Extensiones Requeridas:** uuid-ossp, pgcrypto  
**Versión del Schema:** 2.0.0  
**Última Actualización:** Enero 2026

---

## 🎯 Próximos Pasos

1. ✅ Ejecutar el script SQL
2. 🔐 Hacer login con usuario de prueba
3. 🚀 Conectar tu backend (Node.js/Express recomendado)
4. 📱 Conectar tu frontend (Angular/Ionic desde la carpeta app)
5. 🧪 Crear datos de prueba adicionales según necesites
