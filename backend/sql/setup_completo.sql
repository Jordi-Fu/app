-- ============================================
-- SCRIPT DE INSTALACIÓN COMPLETA
-- Base de datos para plataforma de servicios
-- ============================================
-- Este script crea:
-- 1. Extensiones y tipos ENUM
-- 2. Todas las tablas con sus índices
-- 3. Funciones y triggers
-- 4. Vistas
-- 5. Datos iniciales (categorías, configuración)
-- 6. Usuario administrador
-- 7. Datos de prueba (usuarios, servicios, conversaciones)
-- ============================================

-- ============================================
-- CREACIÓN DE EXTENSIONES
-- ============================================

-- Habilitar UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- CREACIÓN DE TIPOS ENUM
-- ============================================

-- Tipos de precio
CREATE TYPE tipo_precio_enum AS ENUM ('fijo', 'por_hora');

-- Tipos de mensaje
CREATE TYPE tipo_mensaje_enum AS ENUM ('texto', 'imagen', 'archivo', 'ubicacion', 'audio', 'video');

-- Tipos de notificación
CREATE TYPE tipo_notificacion_enum AS ENUM ('mensaje', 'valoracion', 'sistema', 'promocion');

-- Tipos de reporte
CREATE TYPE tipo_reporte_enum AS ENUM ('spam', 'inapropiado', 'fraude', 'acoso', 'perfil_falso', 'otro');

-- Estados de reporte
CREATE TYPE estado_reporte_enum AS ENUM ('pendiente', 'en_revision', 'resuelto', 'descartado');

-- Tipos de verificación
CREATE TYPE tipo_verificacion_enum AS ENUM ('email', 'telefono');

-- Estados de verificación
CREATE TYPE estado_verificacion_enum AS ENUM ('pendiente', 'aprobado', 'rechazado', 'expirado');

-- Tipos de descuento
CREATE TYPE tipo_descuento_enum AS ENUM ('porcentaje', 'fijo');


-- ============================================
-- TABLA: users (Usuarios)
-- ============================================

CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  correo VARCHAR(255) UNIQUE NOT NULL,
  hash_password VARCHAR(255) NOT NULL,
  usuario VARCHAR(100) UNIQUE NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  telefono VARCHAR(20),
  codigo_pais VARCHAR(5) DEFAULT '+34',
  url_avatar VARCHAR(500),
  biografia TEXT,
  fecha_nacimiento DATE,
  esta_verificado BOOLEAN DEFAULT false,
  esta_activo BOOLEAN DEFAULT true,
  esta_en_linea BOOLEAN DEFAULT false,
  ultima_actividad TIMESTAMP,
  promedio_calificacion DECIMAL(3,2) DEFAULT 0.00 CHECK (promedio_calificacion >= 0 AND promedio_calificacion <= 5),
  total_resenas INTEGER DEFAULT 0,
  total_servicios INTEGER DEFAULT 0,
  tiempo_respuesta_minutos INTEGER DEFAULT 0,
  porcentaje_respuesta DECIMAL(5,2) DEFAULT 0.00,
  idioma VARCHAR(10) DEFAULT 'es',
  zona_horaria VARCHAR(50) DEFAULT 'UTC',
  moneda VARCHAR(3) DEFAULT 'EUR',
  stripe_cliente_id VARCHAR(255),
  stripe_cuenta_id VARCHAR(255),
  token_fcm TEXT, -- Para notificaciones push
  notificaciones_email BOOLEAN DEFAULT true,
  notificaciones_push BOOLEAN DEFAULT true,
  notificaciones_sms BOOLEAN DEFAULT false,
  intentos_fallidos_login INTEGER DEFAULT 0,
  bloqueado_hasta TIMESTAMP,
  ultimo_login TIMESTAMP,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  eliminado_en TIMESTAMP
);

-- Índices para usuarios
CREATE INDEX idx_usuarios_correo ON usuarios(correo);
CREATE INDEX idx_usuarios_usuario ON usuarios(usuario);
CREATE INDEX idx_usuarios_telefono ON usuarios(telefono);
CREATE INDEX idx_usuarios_promedio ON usuarios(promedio_calificacion DESC);
CREATE INDEX idx_usuarios_activo ON usuarios(esta_activo);
CREATE INDEX idx_usuarios_creado ON usuarios(creado_en DESC);

-- ============================================
-- TABLA: user_addresses (Direcciones de Usuario)
-- ============================================

CREATE TABLE direcciones_usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  etiqueta VARCHAR(50) NOT NULL, -- 'home', 'work', 'other'
  direccion_linea1 VARCHAR(255) NOT NULL,
  direccion_linea2 VARCHAR(255),
  ciudad VARCHAR(100) NOT NULL,
  estado VARCHAR(100) NOT NULL,
  codigo_postal VARCHAR(20),
  pais VARCHAR(100) NOT NULL DEFAULT 'España',
  latitud DECIMAL(10,8),
  longitud DECIMAL(11,8),
  predeterminada BOOLEAN DEFAULT false,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_direcciones_usuarios_usuario ON direcciones_usuarios(usuario_id);
CREATE INDEX idx_direcciones_usuarios_ubicacion ON direcciones_usuarios(latitud, longitud);

-- ============================================
-- TABLA: categories (Categorías de Servicios)
-- ============================================

CREATE TABLE categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  descripcion TEXT,
  url_icono VARCHAR(500),
  color VARCHAR(7) DEFAULT '#000000',
  padre_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
  esta_activo BOOLEAN DEFAULT true,
  indice_orden INTEGER DEFAULT 0,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categorias_slug ON categorias(slug);
CREATE INDEX idx_categorias_padre ON categorias(padre_id);
CREATE INDEX idx_categorias_activo ON categorias(esta_activo);
CREATE INDEX idx_categorias_indice_orden ON categorias(indice_orden);

-- ============================================
-- TABLA: services (Servicios Publicados)
-- ============================================

CREATE TABLE servicios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proveedor_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  categoria_id UUID NOT NULL REFERENCES categorias(id) ON DELETE RESTRICT,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  tipo_precio tipo_precio_enum DEFAULT 'fijo',
  precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
  moneda VARCHAR(3) DEFAULT 'EUR',
  duracion_minutos INTEGER,
  tipo_ubicacion VARCHAR(50) DEFAULT 'flexible', -- 'remote', 'at_client', 'at_provider', 'flexible'
  direccion VARCHAR(255),
  ciudad VARCHAR(100),
  estado VARCHAR(100),
  codigo_postal VARCHAR(20),
  pais VARCHAR(100) DEFAULT 'España',
  latitud DECIMAL(10,8),
  longitud DECIMAL(11,8),
  radio_servicio_km INTEGER,
  max_clientes_simultaneos INTEGER DEFAULT 1,
  requiere_aprobacion BOOLEAN DEFAULT false,
  esta_activo BOOLEAN DEFAULT true,
  es_destacado BOOLEAN DEFAULT false,
  esta_verificado BOOLEAN DEFAULT false,
  fecha_verificacion TIMESTAMP,
  vistas INTEGER DEFAULT 0,
  conteo_favoritos INTEGER DEFAULT 0,
  promedio_calificacion DECIMAL(3,2) DEFAULT 0.00 CHECK (promedio_calificacion >= 0 AND promedio_calificacion <= 5),
  total_resenas INTEGER DEFAULT 0,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  eliminado_en TIMESTAMP
);

-- Índices para servicios
CREATE INDEX idx_servicios_proveedor ON servicios(proveedor_id);
CREATE INDEX idx_servicios_categoria ON servicios(categoria_id);
CREATE INDEX idx_servicios_ubicacion ON servicios(ciudad, estado);
CREATE INDEX idx_servicios_coordenadas ON servicios(latitud, longitud);
CREATE INDEX idx_servicios_promedio ON servicios(promedio_calificacion DESC);
CREATE INDEX idx_servicios_activo ON servicios(esta_activo);
CREATE INDEX idx_servicios_destacado ON servicios(es_destacado);
CREATE INDEX idx_servicios_precio ON servicios(precio);
CREATE INDEX idx_servicios_creado ON servicios(creado_en DESC);

-- ============================================
-- TABLA: service_images (Imágenes de Servicios)
-- ============================================

CREATE TABLE imagenes_servicios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  servicio_id UUID NOT NULL REFERENCES servicios(id) ON DELETE CASCADE,
  url_imagen VARCHAR(500) NOT NULL,
  url_miniatura VARCHAR(500),
  pie_de_foto VARCHAR(255),
  es_principal BOOLEAN DEFAULT false,
  indice_orden INTEGER DEFAULT 0,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_imagenes_servicios_servicio ON imagenes_servicios(servicio_id);
CREATE INDEX idx_imagenes_servicios_principal ON imagenes_servicios(es_principal);

-- ============================================
-- TABLA: service_availability (Disponibilidad)
-- ============================================

CREATE TABLE disponibilidad_servicios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  servicio_id UUID NOT NULL REFERENCES servicios(id) ON DELETE CASCADE,
  dia_semana INTEGER NOT NULL CHECK (dia_semana >= 0 AND dia_semana <= 6), -- 0=domingo, 6=sábado
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  esta_disponible BOOLEAN DEFAULT true,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_disponibilidad_servicio ON disponibilidad_servicios(servicio_id);
CREATE INDEX idx_disponibilidad_dia ON disponibilidad_servicios(dia_semana);

-- ============================================
-- TABLA: service_exceptions (Excepciones de Disponibilidad)
-- ============================================

CREATE TABLE excepciones_servicios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  servicio_id UUID NOT NULL REFERENCES servicios(id) ON DELETE CASCADE,
  fecha_excepcion DATE NOT NULL,
  hora_inicio TIME,
  hora_fin TIME,
  esta_disponible BOOLEAN DEFAULT false,
  motivo VARCHAR(255),
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_excepciones_servicio ON excepciones_servicios(servicio_id);
CREATE INDEX idx_excepciones_fecha ON excepciones_servicios(fecha_excepcion);

-- ============================================
-- TABLA: reviews (Valoraciones y Reseñas)
-- ============================================

CREATE TABLE resenas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  servicio_id UUID NOT NULL REFERENCES servicios(id) ON DELETE CASCADE,
  revisor_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  usuario_valorado_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  calificacion INTEGER NOT NULL CHECK (calificacion >= 1 AND calificacion <= 5),
  comentario TEXT,
  respuesta_proveedor TEXT,
  respuesta_en TIMESTAMP,
  url_foto_1 VARCHAR(500),
  url_foto_2 VARCHAR(500),
  url_foto_3 VARCHAR(500),
  fue_util_count INTEGER DEFAULT 0,
  fue_no_util_count INTEGER DEFAULT 0,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(servicio_id, revisor_id)
);

-- Índices para reseñas
CREATE INDEX idx_resenas_servicio ON resenas(servicio_id);
CREATE INDEX idx_resenas_revisor ON resenas(revisor_id);
CREATE INDEX idx_resenas_usuario_valorado ON resenas(usuario_valorado_id);
CREATE INDEX idx_resenas_calificacion ON resenas(calificacion);
CREATE INDEX idx_resenas_creado ON resenas(creado_en DESC);

-- ============================================
-- TABLA: conversations (Conversaciones de Chat)
-- ============================================

CREATE TABLE conversaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participante_1_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  participante_2_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  servicio_id UUID REFERENCES servicios(id) ON DELETE SET NULL,
  texto_ultimo_mensaje TEXT,
  ultimo_mensaje_en TIMESTAMP,
  ultimo_mensaje_remitente_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  no_leidos_p1 INTEGER DEFAULT 0,
  no_leidos_p2 INTEGER DEFAULT 0,
  esta_archivado_p1 BOOLEAN DEFAULT false,
  esta_archivado_p2 BOOLEAN DEFAULT false,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(participante_1_id, participante_2_id, servicio_id)
);

-- Índices para conversaciones
CREATE INDEX idx_conversaciones_p1 ON conversaciones(participante_1_id);
CREATE INDEX idx_conversaciones_p2 ON conversaciones(participante_2_id);
CREATE INDEX idx_conversaciones_servicio ON conversaciones(servicio_id);
CREATE INDEX idx_conversaciones_ultimo_mensaje ON conversaciones(ultimo_mensaje_en DESC);

-- ============================================
-- TABLA: messages (Mensajes)
-- ============================================

CREATE TABLE mensajes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversacion_id UUID NOT NULL REFERENCES conversaciones(id) ON DELETE CASCADE,
  remitente_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo_mensaje tipo_mensaje_enum DEFAULT 'texto',
  contenido TEXT,
  url_media VARCHAR(500),
  url_miniatura_media VARCHAR(500),
  nombre_archivo VARCHAR(255),
  latitud DECIMAL(10,8),
  longitud DECIMAL(11,8),
  esta_leido BOOLEAN DEFAULT false,
  leido_en TIMESTAMP,
  esta_editado BOOLEAN DEFAULT false,
  editado_en TIMESTAMP,
  esta_eliminado BOOLEAN DEFAULT false,
  eliminado_en TIMESTAMP,
  respuesta_a_mensaje_id UUID REFERENCES mensajes(id) ON DELETE SET NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mensajes
CREATE INDEX idx_mensajes_conversacion ON mensajes(conversacion_id);
CREATE INDEX idx_mensajes_remitente ON mensajes(remitente_id);
CREATE INDEX idx_mensajes_creado ON mensajes(creado_en DESC);
CREATE INDEX idx_mensajes_leido ON mensajes(esta_leido);

-- ============================================
-- TABLA: favoritos (Servicios Favoritos)
-- ============================================

CREATE TABLE favoritos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  servicio_id UUID NOT NULL REFERENCES servicios(id) ON DELETE CASCADE,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(usuario_id, servicio_id)
);

CREATE INDEX idx_favoritos_usuario ON favoritos(usuario_id);
CREATE INDEX idx_favoritos_servicio ON favoritos(servicio_id);

-- ============================================
-- TABLA: notificaciones (Notificaciones)
-- ============================================

CREATE TABLE notificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo tipo_notificacion_enum NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  mensaje TEXT NOT NULL,
  url_icono VARCHAR(500),
  url_destino VARCHAR(500),
  datos_adicionales JSONB,
  esta_leido BOOLEAN DEFAULT false,
  leido_en TIMESTAMP,
  enviado_push BOOLEAN DEFAULT false,
  enviado_push_en TIMESTAMP,
  enviado_email BOOLEAN DEFAULT false,
  enviado_email_en TIMESTAMP,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para notificaciones
CREATE INDEX idx_notificaciones_usuario ON notificaciones(usuario_id);
CREATE INDEX idx_notificaciones_leido ON notificaciones(esta_leido);
CREATE INDEX idx_notificaciones_creado ON notificaciones(creado_en DESC);
CREATE INDEX idx_notificaciones_tipo ON notificaciones(tipo);

-- ============================================
-- TABLA: reportes (Reportes/Denuncias)
-- ============================================

CREATE TABLE reportes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reportador_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  usuario_reportado_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  servicio_reportado_id UUID REFERENCES servicios(id) ON DELETE CASCADE,
  tipo_reporte tipo_reporte_enum NOT NULL,
  descripcion TEXT NOT NULL,
  evidencia_urls TEXT[],
  estado estado_reporte_enum DEFAULT 'pendiente',
  notas_moderador TEXT,
  moderador_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  resuelto_en TIMESTAMP,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para reportes
CREATE INDEX idx_reportes_reportador ON reportes(reportador_id);
CREATE INDEX idx_reportes_usuario_reportado ON reportes(usuario_reportado_id);
CREATE INDEX idx_reportes_estado ON reportes(estado);
CREATE INDEX idx_reportes_tipo ON reportes(tipo_reporte);

-- ============================================
-- TABLA: verificaciones_usuarios (Verificaciones)
-- ============================================

CREATE TABLE verificaciones_usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo_verificacion tipo_verificacion_enum NOT NULL,
  valor_verificar VARCHAR(255) NOT NULL,
  codigo_verificacion VARCHAR(10) NOT NULL,
  intentos_fallidos INTEGER DEFAULT 0,
  estado estado_verificacion_enum DEFAULT 'pendiente',
  valido_hasta TIMESTAMP NOT NULL,
  verificado_en TIMESTAMP,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(usuario_id, tipo_verificacion)
);

-- Índices para verificaciones_usuarios
CREATE INDEX idx_verificaciones_usuario ON verificaciones_usuarios(usuario_id);
CREATE INDEX idx_verificaciones_estado ON verificaciones_usuarios(estado);
CREATE INDEX idx_verificaciones_tipo ON verificaciones_usuarios(tipo_verificacion);

-- ============================================
-- TABLA: historial_busquedas (Historial de Búsquedas)
-- ============================================

CREATE TABLE historial_busquedas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  termino_busqueda VARCHAR(255) NOT NULL,
  categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
  filtros_aplicados JSONB,
  total_resultados INTEGER DEFAULT 0,
  latitud DECIMAL(10,8),
  longitud DECIMAL(11,8),
  ciudad VARCHAR(100),
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para historial_busquedas
CREATE INDEX idx_historial_busquedas_usuario ON historial_busquedas(usuario_id);
CREATE INDEX idx_historial_busquedas_termino ON historial_busquedas(termino_busqueda);
CREATE INDEX idx_historial_busquedas_categoria ON historial_busquedas(categoria_id);

-- ============================================
-- TABLA: etiquetas (Etiquetas)
-- ============================================

CREATE TABLE etiquetas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(50) UNIQUE NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  conteo_uso INTEGER DEFAULT 0,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_etiquetas_slug ON etiquetas(slug);
CREATE INDEX idx_etiquetas_uso ON etiquetas(conteo_uso DESC);

-- ============================================
-- TABLA: servicios_etiquetas (Relación Servicios-Etiquetas)
-- ============================================

CREATE TABLE servicios_etiquetas (
  servicio_id UUID REFERENCES servicios(id) ON DELETE CASCADE,
  etiqueta_id UUID REFERENCES etiquetas(id) ON DELETE CASCADE,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(servicio_id, etiqueta_id)
);

CREATE INDEX idx_servicios_etiquetas_servicio ON servicios_etiquetas(servicio_id);
CREATE INDEX idx_servicios_etiquetas_etiqueta ON servicios_etiquetas(etiqueta_id);

-- ============================================
-- TABLA: codigos_promocionales (Códigos Promocionales)
-- ============================================

CREATE TABLE codigos_promocionales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo VARCHAR(50) UNIQUE NOT NULL,
  descripcion TEXT,
  tipo_descuento tipo_descuento_enum NOT NULL,
  valor_descuento DECIMAL(10,2) NOT NULL,
  descuento_maximo DECIMAL(10,2),
  uso_minimo DECIMAL(10,2),
  max_usos_total INTEGER,
  max_usos_por_usuario INTEGER DEFAULT 1,
  usos_realizados INTEGER DEFAULT 0,
  valido_desde TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  valido_hasta TIMESTAMP,
  aplicable_a_servicios UUID[],
  aplicable_a_categorias UUID[],
  esta_activo BOOLEAN DEFAULT true,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para codigos_promocionales
CREATE INDEX idx_codigos_promocionales_codigo ON codigos_promocionales(codigo);
CREATE INDEX idx_codigos_promocionales_activo ON codigos_promocionales(esta_activo);
CREATE INDEX idx_codigos_promocionales_valido ON codigos_promocionales(valido_desde, valido_hasta);

-- ============================================
-- TABLA: uso_codigos_promocionales (Uso de Códigos)
-- ============================================

CREATE TABLE uso_codigos_promocionales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_promocional_id UUID NOT NULL REFERENCES codigos_promocionales(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  descuento_aplicado DECIMAL(10,2) NOT NULL,
  usado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para uso_codigos_promocionales
CREATE INDEX idx_uso_codigos_codigo ON uso_codigos_promocionales(codigo_promocional_id);
CREATE INDEX idx_uso_codigos_usuario ON uso_codigos_promocionales(usuario_id);

-- ============================================
-- TABLA: seguidores_usuarios (Seguidores)
-- ============================================

CREATE TABLE seguidores_usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seguidor_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  seguido_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(seguidor_id, seguido_id),
  CHECK(seguidor_id != seguido_id)
);

CREATE INDEX idx_seguidores_seguidor ON seguidores_usuarios(seguidor_id);
CREATE INDEX idx_seguidores_seguido ON seguidores_usuarios(seguido_id);

-- ============================================
-- TABLA: portafolios (Portafolio del Proveedor)
-- ============================================

CREATE TABLE portafolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proveedor_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  url_imagen VARCHAR(500) NOT NULL,
  url_miniatura VARCHAR(500),
  indice_orden INTEGER DEFAULT 0,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_portafolios_proveedor ON portafolios(proveedor_id);
CREATE INDEX idx_portafolios_categoria ON portafolios(categoria_id);

-- ============================================
-- TABLA: preguntas_frecuentes_servicios (FAQs)
-- ============================================

CREATE TABLE preguntas_frecuentes_servicios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  servicio_id UUID NOT NULL REFERENCES servicios(id) ON DELETE CASCADE,
  pregunta TEXT NOT NULL,
  respuesta TEXT NOT NULL,
  indice_orden INTEGER DEFAULT 0,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_faqs_servicio ON preguntas_frecuentes_servicios(servicio_id);

-- ============================================
-- TABLA: configuracion_app (Configuración)
-- ============================================

CREATE TABLE configuracion_app (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clave VARCHAR(100) UNIQUE NOT NULL,
  valor TEXT NOT NULL,
  tipo_dato VARCHAR(20) DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
  descripcion TEXT,
  es_publico BOOLEAN DEFAULT false,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_configuracion_clave ON configuracion_app(clave);

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función para actualizar actualizado_en automáticamente
CREATE OR REPLACE FUNCTION actualizar_columna_actualizado_en()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a todas las tablas con actualizado_en
CREATE TRIGGER actualizar_usuarios_actualizado_en BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION actualizar_columna_actualizado_en();

CREATE TRIGGER actualizar_categorias_actualizado_en BEFORE UPDATE ON categorias
  FOR EACH ROW EXECUTE FUNCTION actualizar_columna_actualizado_en();

CREATE TRIGGER actualizar_servicios_actualizado_en BEFORE UPDATE ON servicios
  FOR EACH ROW EXECUTE FUNCTION actualizar_columna_actualizado_en();

CREATE TRIGGER actualizar_resenas_actualizado_en BEFORE UPDATE ON resenas
  FOR EACH ROW EXECUTE FUNCTION actualizar_columna_actualizado_en();

CREATE TRIGGER actualizar_conversaciones_actualizado_en BEFORE UPDATE ON conversaciones
  FOR EACH ROW EXECUTE FUNCTION actualizar_columna_actualizado_en();

CREATE TRIGGER actualizar_verificaciones_usuarios_actualizado_en BEFORE UPDATE ON verificaciones_usuarios
  FOR EACH ROW EXECUTE FUNCTION actualizar_columna_actualizado_en();

CREATE TRIGGER actualizar_codigos_promocionales_actualizado_en BEFORE UPDATE ON codigos_promocionales
  FOR EACH ROW EXECUTE FUNCTION actualizar_columna_actualizado_en();

-- Función para actualizar promedio_calificacion en usuarios
CREATE OR REPLACE FUNCTION actualizar_calificacion_usuario()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE usuarios
  SET 
    promedio_calificacion = (
      SELECT COALESCE(AVG(calificacion), 0)
      FROM resenas
      WHERE usuario_valorado_id = NEW.usuario_valorado_id
    ),
    total_resenas = (
      SELECT COUNT(*)
      FROM resenas
      WHERE usuario_valorado_id = NEW.usuario_valorado_id
    )
  WHERE id = NEW.usuario_valorado_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER actualizar_calificacion_usuario_trigger
AFTER INSERT OR UPDATE ON resenas
FOR EACH ROW EXECUTE FUNCTION actualizar_calificacion_usuario();

-- Función para actualizar promedio_calificacion en servicios
CREATE OR REPLACE FUNCTION actualizar_calificacion_servicio()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE servicios
  SET 
    promedio_calificacion = (
      SELECT COALESCE(AVG(calificacion), 0)
      FROM resenas
      WHERE servicio_id = NEW.servicio_id
    ),
    total_resenas = (
      SELECT COUNT(*)
      FROM resenas
      WHERE servicio_id = NEW.servicio_id
    )
  WHERE id = NEW.servicio_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER actualizar_calificacion_servicio_trigger
AFTER INSERT OR UPDATE ON resenas
FOR EACH ROW EXECUTE FUNCTION actualizar_calificacion_servicio();

-- Función para actualizar contadores de favoritos
CREATE OR REPLACE FUNCTION actualizar_conteo_favoritos()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE servicios
    SET conteo_favoritos = conteo_favoritos + 1
    WHERE id = NEW.servicio_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE servicios
    SET conteo_favoritos = GREATEST(conteo_favoritos - 1, 0)
    WHERE id = OLD.servicio_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER actualizar_conteo_favoritos_trigger
AFTER INSERT OR DELETE ON favoritos
FOR EACH ROW EXECUTE FUNCTION actualizar_conteo_favoritos();

-- ============================================
-- TRIGGER: Estadísticas de Respuesta de Usuario
-- ============================================

-- Función para calcular estadísticas de respuesta
CREATE OR REPLACE FUNCTION actualizar_estadisticas_respuesta_usuario()
RETURNS TRIGGER AS $$
DECLARE
    v_promedio_tiempo NUMERIC;
    v_total_conversaciones INTEGER;
    v_total_respondidas INTEGER;
    v_porcentaje NUMERIC;
BEGIN
    -- Calcular tiempo promedio de respuesta
    SELECT COALESCE(AVG(tiempo_respuesta_min), 0)
    INTO v_promedio_tiempo
    FROM (
        SELECT 
            EXTRACT(EPOCH FROM (m2.creado_en - m1.creado_en)) / 60 as tiempo_respuesta_min
        FROM mensajes m1
        INNER JOIN mensajes m2 ON m1.conversacion_id = m2.conversacion_id
        INNER JOIN conversaciones c ON m1.conversacion_id = c.id
        WHERE 
            m1.remitente_id != NEW.remitente_id
            AND m2.remitente_id = NEW.remitente_id
            AND m2.creado_en > m1.creado_en
            AND (c.participante_1_id = NEW.remitente_id OR c.participante_2_id = NEW.remitente_id)
            AND m1.esta_eliminado = false
            AND m2.esta_eliminado = false
            AND NOT EXISTS (
                SELECT 1 FROM mensajes m3 
                WHERE m3.conversacion_id = m1.conversacion_id 
                    AND m3.remitente_id = NEW.remitente_id
                    AND m3.creado_en > m1.creado_en 
                    AND m3.creado_en < m2.creado_en
                    AND m3.esta_eliminado = false
            )
    ) AS tiempos;

    -- Contar conversaciones donde recibió mensajes
    SELECT COUNT(DISTINCT c.id)
    INTO v_total_conversaciones
    FROM conversaciones c
    INNER JOIN mensajes m ON c.id = m.conversacion_id
    WHERE (c.participante_1_id = NEW.remitente_id OR c.participante_2_id = NEW.remitente_id)
        AND m.remitente_id != NEW.remitente_id
        AND m.esta_eliminado = false;

    -- Contar conversaciones donde respondió
    SELECT COUNT(DISTINCT m2.conversacion_id)
    INTO v_total_respondidas
    FROM mensajes m1
    INNER JOIN mensajes m2 ON m1.conversacion_id = m2.conversacion_id
    INNER JOIN conversaciones c ON m1.conversacion_id = c.id
    WHERE 
        m1.remitente_id != NEW.remitente_id
        AND m2.remitente_id = NEW.remitente_id
        AND m2.creado_en > m1.creado_en
        AND (c.participante_1_id = NEW.remitente_id OR c.participante_2_id = NEW.remitente_id)
        AND m1.esta_eliminado = false
        AND m2.esta_eliminado = false;

    -- Calcular porcentaje
    IF v_total_conversaciones > 0 THEN
        v_porcentaje := ROUND((v_total_respondidas::numeric / v_total_conversaciones::numeric) * 100, 2);
    ELSE
        v_porcentaje := 0;
    END IF;

    -- Actualizar usuario
    UPDATE usuarios
    SET 
        tiempo_respuesta_minutos = ROUND(v_promedio_tiempo),
        porcentaje_respuesta = v_porcentaje
    WHERE id = NEW.remitente_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_estadisticas_respuesta
AFTER INSERT ON mensajes
FOR EACH ROW
EXECUTE FUNCTION actualizar_estadisticas_respuesta_usuario();

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista de servicios con información del proveedor
CREATE VIEW servicios_con_proveedor AS
SELECT 
  s.*,
  u.usuario as nombre_usuario_proveedor,
  u.nombre as nombre_proveedor,
  u.apellido as apellido_proveedor,
  u.url_avatar as avatar_proveedor,
  u.promedio_calificacion as calificacion_proveedor,
  u.total_resenas as total_resenas_proveedor,
  u.esta_verificado as proveedor_esta_verificado,
  c.nombre as nombre_categoria,
  c.slug as slug_categoria
FROM servicios s
JOIN usuarios u ON s.proveedor_id = u.id
JOIN categorias c ON s.categoria_id = c.id
WHERE s.eliminado_en IS NULL;

-- ============================================
-- DATOS INICIALES - Configuración
-- ============================================

INSERT INTO configuracion_app (clave, valor, tipo_dato, descripcion, es_publico) VALUES
('porcentaje_comision_plataforma', '15', 'number', 'Porcentaje de comisión de la plataforma', false),
('precio_servicio_minimo', '10', 'number', 'Precio mínimo de servicio', true),
('precio_servicio_maximo', '10000', 'number', 'Precio máximo de servicio', true),
('horas_cancelacion_reserva', '24', 'number', 'Horas antes para cancelar sin penalización', true),
('nombre_app', 'AplicacionServicios', 'string', 'Nombre de la aplicación', true),
('email_soporte', 'soporte@aplicacionservicios.com', 'string', 'Email de soporte', true),
('moneda_predeterminada', 'EUR', 'string', 'Moneda por defecto', true),
('idioma_predeterminado', 'es', 'string', 'Idioma por defecto', true);

-- ============================================
-- DATOS INICIALES - Categorías
-- ============================================

INSERT INTO categorias (nombre, slug, descripcion, color, esta_activo, indice_orden) VALUES
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

-- ============================================
-- USUARIO ADMINISTRADOR
-- ============================================

INSERT INTO usuarios (
  correo, hash_password, usuario, nombre, apellido, telefono, codigo_pais,
  url_avatar, biografia, fecha_nacimiento, esta_verificado, esta_activo,
  promedio_calificacion, total_resenas, idioma, zona_horaria, moneda
) VALUES (
  'admin@aplicacionservicios.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIw8nC8hYq', -- Contraseña: Admin123!
  'admin',
  'Administrador',
  'Sistema',
  '34912345678',
  '+34',
  'https://ui-avatars.com/api/?name=Admin&background=4CAF50&color=fff&size=200',
  'Usuario administrador del sistema. Cuenta de prueba para desarrollo y testing.',
  '1990-01-15',
  true,
  true,
  4.95,
  125,
  'es',
  'Europe/Madrid',
  'EUR'
);

-- ============================================
-- DATOS DE PRUEBA - Usuarios
-- ============================================

DO $$
DECLARE
  v_juan_id UUID;
  v_maria_id UUID;
  v_carlos_id UUID;
  v_ana_id UUID;
  v_pedro_id UUID;
  v_sofia_id UUID;
  v_cat_limpieza UUID;
  v_cat_reparaciones UUID;
  v_cat_clases UUID;
  v_service1_id UUID;
  v_service2_id UUID;
  v_service3_id UUID;
  v_service4_id UUID;
  v_conversacion_id UUID;
BEGIN
  RAISE NOTICE 'Insertando usuarios de prueba...';
  
  -- Usuario Juan (Electricista)
  INSERT INTO usuarios (
    correo, hash_password, usuario, nombre, apellido, telefono, codigo_pais,
    url_avatar, biografia, fecha_nacimiento, esta_verificado, esta_activo,
    promedio_calificacion, total_resenas, idioma, zona_horaria, moneda
  ) VALUES (
    'juan@email.com', 
    '$2b$10$gFWmCnZci9Lu0sIynwsp9.y0yRcAzZDdepskPdcfuZpOgtaiiE3Ty', 
    'juan_electricista', 'Juan', 'Pérez', '34655123456', '+34',
    'https://ui-avatars.com/api/?name=Juan+Perez&background=FF9800&color=fff&size=200',
    'Electricista profesional con 10 años de experiencia. Instalaciones y reparaciones.',
    '1985-05-20', true, true, 4.8, 45, 'es', 'Europe/Madrid', 'EUR'
  ) ON CONFLICT (usuario) DO NOTHING
  RETURNING id INTO v_juan_id;
  
  IF v_juan_id IS NULL THEN
    SELECT id INTO v_juan_id FROM usuarios WHERE usuario = 'juan_electricista';
  END IF;

  -- Usuario María (Limpieza)
  INSERT INTO usuarios (
    correo, hash_password, usuario, nombre, apellido, telefono, codigo_pais,
    url_avatar, biografia, fecha_nacimiento, esta_verificado, esta_activo,
    promedio_calificacion, total_resenas, idioma, zona_horaria, moneda
  ) VALUES (
    'maria@email.com',
    '$2b$10$gFWmCnZci9Lu0sIynwsp9.y0yRcAzZDdepskPdcfuZpOgtaiiE3Ty',
    'maria_limpieza', 'María', 'García', '34677234567', '+34',
    'https://ui-avatars.com/api/?name=Maria+Garcia&background=4CAF50&color=fff&size=200',
    'Servicio de limpieza profesional. Hogares y oficinas. Productos ecológicos.',
    '1990-08-15', true, true, 4.9, 78, 'es', 'Europe/Madrid', 'EUR'
  ) ON CONFLICT (usuario) DO NOTHING
  RETURNING id INTO v_maria_id;
  
  IF v_maria_id IS NULL THEN
    SELECT id INTO v_maria_id FROM usuarios WHERE usuario = 'maria_limpieza';
  END IF;

  -- Usuario Carlos (Plomero)
  INSERT INTO usuarios (
    correo, hash_password, usuario, nombre, apellido, telefono, codigo_pais,
    url_avatar, biografia, fecha_nacimiento, esta_verificado, esta_activo,
    promedio_calificacion, total_resenas, idioma, zona_horaria, moneda
  ) VALUES (
    'carlos@email.com',
    '$2b$10$gFWmCnZci9Lu0sIynwsp9.y0yRcAzZDdepskPdcfuZpOgtaiiE3Ty',
    'carlos_plomero', 'Carlos', 'Rodríguez', '34688345678', '+34',
    'https://ui-avatars.com/api/?name=Carlos+Rodriguez&background=2196F3&color=fff&size=200',
    'Plomero certificado. Reparaciones de emergencia 24/7. Instalaciones.',
    '1982-11-30', true, true, 4.7, 92, 'es', 'Europe/Madrid', 'EUR'
  ) ON CONFLICT (usuario) DO NOTHING
  RETURNING id INTO v_carlos_id;
  
  IF v_carlos_id IS NULL THEN
    SELECT id INTO v_carlos_id FROM usuarios WHERE usuario = 'carlos_plomero';
  END IF;

  -- Usuario Ana (Cliente)
  INSERT INTO usuarios (
    correo, hash_password, usuario, nombre, apellido, telefono, codigo_pais,
    url_avatar, biografia, idioma, zona_horaria, moneda
  ) VALUES (
    'ana@email.com',
    '$2b$10$gFWmCnZci9Lu0sIynwsp9.y0yRcAzZDdepskPdcfuZpOgtaiiE3Ty',
    'ana_cliente', 'Ana', 'Martínez', '34699456789', '+34',
    'https://ui-avatars.com/api/?name=Ana+Martinez&background=E91E63&color=fff&size=200',
    'Cliente frecuente de servicios del hogar.', 'es', 'Europe/Madrid', 'EUR'
  ) ON CONFLICT (usuario) DO NOTHING
  RETURNING id INTO v_ana_id;
  
  IF v_ana_id IS NULL THEN
    SELECT id INTO v_ana_id FROM usuarios WHERE usuario = 'ana_cliente';
  END IF;

  -- Usuario Pedro (Cliente)
  INSERT INTO usuarios (
    correo, hash_password, usuario, nombre, apellido, telefono, codigo_pais,
    url_avatar, biografia, idioma, zona_horaria, moneda
  ) VALUES (
    'pedro@email.com',
    '$2b$10$gFWmCnZci9Lu0sIynwsp9.y0yRcAzZDdepskPdcfuZpOgtaiiE3Ty',
    'pedro_cliente', 'Pedro', 'López', '34611567890', '+34',
    'https://ui-avatars.com/api/?name=Pedro+Lopez&background=9C27B0&color=fff&size=200',
    'Me gusta contratar servicios de calidad.', 'es', 'Europe/Madrid', 'EUR'
  ) ON CONFLICT (usuario) DO NOTHING
  RETURNING id INTO v_pedro_id;
  
  IF v_pedro_id IS NULL THEN
    SELECT id INTO v_pedro_id FROM usuarios WHERE usuario = 'pedro_cliente';
  END IF;

  -- Usuario Sofía (Profesora)
  INSERT INTO usuarios (
    correo, hash_password, usuario, nombre, apellido, telefono, codigo_pais,
    url_avatar, biografia, fecha_nacimiento, esta_verificado, esta_activo,
    promedio_calificacion, total_resenas, idioma, zona_horaria, moneda
  ) VALUES (
    'sofia@email.com',
    '$2b$10$gFWmCnZci9Lu0sIynwsp9.y0yRcAzZDdepskPdcfuZpOgtaiiE3Ty',
    'sofia_profesional', 'Sofía', 'Hernández', '34622678901', '+34',
    'https://ui-avatars.com/api/?name=Sofia+Hernandez&background=00BCD4&color=fff&size=200',
    'Profesora de inglés y matemáticas. Clases particulares online y presenciales.',
    '1988-03-25', true, true, 4.85, 34, 'es', 'Europe/Madrid', 'EUR'
  ) ON CONFLICT (usuario) DO NOTHING
  RETURNING id INTO v_sofia_id;
  
  IF v_sofia_id IS NULL THEN
    SELECT id INTO v_sofia_id FROM usuarios WHERE usuario = 'sofia_profesional';
  END IF;

  -- Obtener IDs de categorías
  SELECT id INTO v_cat_limpieza FROM categorias WHERE slug = 'limpieza-hogar';
  SELECT id INTO v_cat_reparaciones FROM categorias WHERE slug = 'reparaciones';
  SELECT id INTO v_cat_clases FROM categorias WHERE slug = 'clases-particulares';

  -- ============================================
  -- DATOS DE PRUEBA - Servicios
  -- ============================================
  
  RAISE NOTICE 'Insertando servicios...';
  
  -- Servicio de Juan
  INSERT INTO servicios (
    proveedor_id, categoria_id, titulo, descripcion,
    tipo_precio, precio, moneda, duracion_minutos, tipo_ubicacion,
    ciudad, estado, pais, esta_activo, es_destacado, vistas
  ) VALUES (
    v_juan_id, v_cat_reparaciones,
    'Instalación Eléctrica Profesional',
    'Servicio completo de instalaciones eléctricas residenciales y comerciales. Incluye cableado, tomas, interruptores y cuadro eléctrico.',
    'fijo', 150.00, 'EUR', 240, 'at_client',
    'Madrid', 'Madrid', 'España', true, true, 245
  ) RETURNING id INTO v_service1_id;

  -- Servicio de María
  INSERT INTO servicios (
    proveedor_id, categoria_id, titulo, descripcion,
    tipo_precio, precio, moneda, duracion_minutos, tipo_ubicacion,
    ciudad, estado, pais, esta_activo, es_destacado, vistas
  ) VALUES (
    v_maria_id, v_cat_limpieza,
    'Limpieza Profunda de Hogar',
    'Limpieza completa y profunda de tu hogar. Incluye todas las habitaciones, cocina, baños. Productos ecológicos de alta calidad.',
    'fijo', 80.00, 'EUR', 180, 'at_client',
    'Madrid', 'Madrid', 'España', true, true, 387
  ) RETURNING id INTO v_service2_id;

  -- Servicio de Carlos
  INSERT INTO servicios (
    proveedor_id, categoria_id, titulo, descripcion,
    tipo_precio, precio, moneda, duracion_minutos, tipo_ubicacion,
    ciudad, estado, pais, esta_activo, vistas
  ) VALUES (
    v_carlos_id, v_cat_reparaciones,
    'Reparación de Plomería',
    'Reparación de fugas, instalación de grifería, destapado de tuberías. Servicio de emergencia disponible.',
    'por_hora', 45.00, 'EUR', 60, 'at_client',
    'Madrid', 'Madrid', 'España', true, 198
  ) RETURNING id INTO v_service3_id;

  -- Servicio de Sofía
  INSERT INTO servicios (
    proveedor_id, categoria_id, titulo, descripcion,
    tipo_precio, precio, moneda, duracion_minutos, tipo_ubicacion,
    ciudad, estado, pais, esta_activo, es_destacado, vistas
  ) VALUES (
    v_sofia_id, v_cat_clases,
    'Clases de Inglés - Todos los niveles',
    'Clases particulares de inglés online y presenciales. Preparación para exámenes oficiales. Todos los niveles.',
    'por_hora', 25.00, 'EUR', 60, 'flexible',
    'Valencia', 'Valencia', 'España', true, true, 156
  ) RETURNING id INTO v_service4_id;

  -- ============================================
  -- DATOS DE PRUEBA - Conversaciones y Mensajes
  -- ============================================
  
  RAISE NOTICE 'Insertando conversaciones...';
  
  -- Conversación entre Pedro y María
  INSERT INTO conversaciones (
    participante_1_id, participante_2_id, servicio_id,
    texto_ultimo_mensaje, ultimo_mensaje_en, ultimo_mensaje_remitente_id,
    no_leidos_p1, no_leidos_p2
  ) VALUES (
    v_pedro_id, v_maria_id, v_service2_id,
    'Perfecto, nos vemos el sábado',
    CURRENT_TIMESTAMP - INTERVAL '2 hours',
    v_pedro_id,
    0, 1
  ) RETURNING id INTO v_conversacion_id;

  -- Mensajes de la conversación
  INSERT INTO mensajes (conversacion_id, remitente_id, tipo_mensaje, contenido, esta_leido, leido_en, creado_en)
  VALUES 
    (v_conversacion_id, v_pedro_id, 'texto', 
     'Hola María, necesito limpieza profunda de mi departamento. ¿Cuándo puedes?',
     true, CURRENT_TIMESTAMP - INTERVAL '3 hours 50 minutes',
     CURRENT_TIMESTAMP - INTERVAL '4 hours'),
    
    (v_conversacion_id, v_maria_id, 'texto',
     'Hola Pedro, ¿qué tal el sábado a las 9am?',
     true, CURRENT_TIMESTAMP - INTERVAL '2 hours 50 minutes',
     CURRENT_TIMESTAMP - INTERVAL '3 hours'),
    
    (v_conversacion_id, v_pedro_id, 'texto',
     'Perfecto, nos vemos el sábado',
     false, null,
     CURRENT_TIMESTAMP - INTERVAL '2 hours');

  -- ============================================
  -- DATOS DE PRUEBA - Reseñas
  -- ============================================
  
  RAISE NOTICE 'Insertando reseñas...';
  
  INSERT INTO resenas (servicio_id, revisor_id, usuario_valorado_id, calificacion, comentario)
  VALUES
    (v_service2_id, v_pedro_id, v_maria_id, 5, 'Excelente servicio. María es muy profesional y dejó mi casa impecable.'),
    (v_service2_id, v_ana_id, v_maria_id, 5, 'Muy recomendable. Puntual y eficiente.');

  RAISE NOTICE 'Datos de prueba insertados correctamente!';
  
END $$;

-- ============================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- ============================================

COMMENT ON TABLE usuarios IS 'Tabla principal de usuarios de la plataforma';
COMMENT ON TABLE servicios IS 'Servicios publicados por los proveedores';
COMMENT ON TABLE resenas IS 'Valoraciones y reseñas de servicios';
COMMENT ON TABLE conversaciones IS 'Conversaciones de chat entre usuarios';
COMMENT ON TABLE mensajes IS 'Mensajes individuales en las conversaciones';
COMMENT ON FUNCTION actualizar_estadisticas_respuesta_usuario() IS 
'Calcula y actualiza las estadísticas de tiempo de respuesta y porcentaje de respuesta del usuario.
- tiempo_respuesta_minutos: Promedio de minutos que tarda el usuario en responder mensajes.
- porcentaje_respuesta: Porcentaje de conversaciones donde el usuario ha respondido.';

-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================

SELECT 'Tablas creadas: ' || COUNT(*) as resultado FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

SELECT 'Vistas creadas: ' || COUNT(*) as resultado FROM information_schema.views 
WHERE table_schema = 'public';

SELECT 'Índices creados: ' || COUNT(*) as resultado FROM pg_indexes 
WHERE schemaname = 'public';

SELECT 'Triggers creados: ' || COUNT(*) as resultado FROM pg_trigger 
WHERE NOT tgisinternal;

-- Mostrar usuarios creados
SELECT 'Usuarios de prueba creados:' as info;
SELECT usuario, nombre, apellido, correo, esta_verificado 
FROM usuarios 
ORDER BY creado_en;

-- ============================================
-- ✅ INSTALACIÓN COMPLETADA
-- ============================================
-- 
-- 👤 Usuario administrador:
-- Email: admin@aplicacionservicios.com
-- Contraseña: Admin123!
-- Usuario: admin
--
-- 👥 Usuarios de prueba (contraseña: password123):
-- - juan_electricista / juan@email.com
-- - maria_limpieza / maria@email.com
-- - carlos_plomero / carlos@email.com
-- - ana_cliente / ana@email.com
-- - pedro_cliente / pedro@email.com
-- - sofia_profesional / sofia@email.com
--
-- ============================================
