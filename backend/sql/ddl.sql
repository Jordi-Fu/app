-- ============================================
-- CREACIÃ“N DE EXTENSIONES
-- ============================================

-- Habilitar UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- CREACIÃ“N DE TIPOS ENUM
-- ============================================


-- Tipos de precio
CREATE TYPE tipo_precio_enum AS ENUM ('fijo', 'por_hora');

-- Tipos de mensaje
CREATE TYPE tipo_mensaje_enum AS ENUM ('texto', 'imagen', 'archivo', 'ubicacion', 'audio', 'video');

-- Tipos de notificaciÃ³n
CREATE TYPE tipo_notificacion_enum AS ENUM ('mensaje', 'valoracion', 'sistema', 'promocion');

-- Tipos de reporte
CREATE TYPE tipo_reporte_enum AS ENUM ('spam', 'inapropiado', 'fraude', 'acoso', 'perfil_falso', 'otro');

-- Estados de reporte
CREATE TYPE estado_reporte_enum AS ENUM ('pendiente', 'en_revision', 'resuelto', 'descartado');

-- Tipos de verificaciÃ³n
CREATE TYPE tipo_verificacion_enum AS ENUM ('email', 'telefono');

-- Estados de verificaciÃ³n
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

-- Ãndices para usuarios
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
  pais VARCHAR(100) NOT NULL DEFAULT 'EspaÃ±a',
  latitud DECIMAL(10,8),
  longitud DECIMAL(11,8),
  predeterminada BOOLEAN DEFAULT false,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_direcciones_usuarios_usuario ON direcciones_usuarios(usuario_id);
CREATE INDEX idx_direcciones_usuarios_ubicacion ON direcciones_usuarios(latitud, longitud);

-- ============================================
-- TABLA: categories (CategorÃ­as de Servicios)
-- ============================================

CREATE TABLE categorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  descripcion TEXT,
  url_icono VARCHAR(500),
  color VARCHAR(7), -- CÃ³digo hexadecimal de color
  padre_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
  esta_activo BOOLEAN DEFAULT true,
  indice_orden INTEGER DEFAULT 0,
  conteo_servicios INTEGER DEFAULT 0,
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
  titulo VARCHAR(200) NOT NULL,
  descripcion TEXT NOT NULL,
  tipo_precio tipo_precio_enum NOT NULL,
  precio DECIMAL(10,2),
  moneda VARCHAR(3) DEFAULT 'EUR',
  tipo_ubicacion VARCHAR(50) NOT NULL,
  direccion TEXT,
  ciudad VARCHAR(100),
  estado VARCHAR(100),
  pais VARCHAR(100),
  codigo_postal VARCHAR(20),
  latitud DECIMAL(10,8),
  longitud DECIMAL(11,8),
  esta_activo BOOLEAN DEFAULT true,
  es_destacado BOOLEAN DEFAULT false,
  esta_verificado BOOLEAN DEFAULT false,
  vistas INTEGER DEFAULT 0,
  conteo_favoritos INTEGER DEFAULT 0,
  promedio_calificacion DECIMAL(3,2) DEFAULT 0.00 CHECK (promedio_calificacion >= 0 AND promedio_calificacion <= 5),
  total_resenas INTEGER DEFAULT 0,
  tiempo_respuesta_horas INTEGER,
  incluye TEXT, -- QuÃ© incluye el servicio
  no_incluye TEXT, -- QuÃ© no incluye
  url_video VARCHAR(500),
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  eliminado_en TIMESTAMP
);

-- Ãndices para servicios
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
-- TABLA: service_images (ImÃ¡genes de Servicios)
-- ============================================

CREATE TABLE imagenes_servicios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  servicio_id UUID NOT NULL REFERENCES servicios(id) ON DELETE CASCADE,
  url_imagen VARCHAR(500) NOT NULL,
  url_miniatura VARCHAR(500),
  pie_de_foto TEXT,
  es_principal BOOLEAN DEFAULT false,
  indice_orden INTEGER DEFAULT 0,
  ancho INTEGER,
  alto INTEGER,
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
  dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6), -- 0=Domingo, 6=SÃ¡bado
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
  esta_disponible BOOLEAN DEFAULT false,
  hora_inicio TIME,
  hora_fin TIME,
  motivo TEXT,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_excepciones_servicio ON excepciones_servicios(servicio_id);
CREATE INDEX idx_excepciones_fecha ON excepciones_servicios(fecha_excepcion);




-- ============================================
-- TABLA: reviews (Valoraciones y ReseÃ±as)
-- ============================================

CREATE TABLE resenas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  servicio_id UUID NOT NULL REFERENCES servicios(id) ON DELETE CASCADE,
  revisor_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  usuario_valorado_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  calificacion INTEGER NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
  titulo VARCHAR(200),
  comentario TEXT,
  ventajas TEXT,
  desventajas TEXT,
  es_anonimo BOOLEAN DEFAULT false,
  respuesta TEXT,
  fecha_respuesta TIMESTAMP,
  es_destacada BOOLEAN DEFAULT false,
  votos_utiles INTEGER DEFAULT 0,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(servicio_id, revisor_id)
);

-- Ãndices para reseÃ±as
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
  ultimo_mensaje_remitente_id UUID REFERENCES usuarios(id),
  no_leidos_p1 INTEGER DEFAULT 0,
  no_leidos_p2 INTEGER DEFAULT 0,
  esta_archivado_p1 BOOLEAN DEFAULT false,
  esta_archivado_p2 BOOLEAN DEFAULT false,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(participante_1_id, participante_2_id, servicio_id)
);

-- Ãndices para conversaciones
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
  latitud DECIMAL(10,8), -- Para ubicaciones compartidas
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

-- Ãndices para mensajes
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
  titulo VARCHAR(200) NOT NULL,
  contenido TEXT NOT NULL,
  url_imagen VARCHAR(500),
  id_relacionado UUID,
  tipo_relacionado VARCHAR(50), -- 'reserva', 'mensaje', 'resena', etc.
  esta_leido BOOLEAN DEFAULT false,
  leido_en TIMESTAMP,
  url_accion VARCHAR(500),
  etiqueta_accion VARCHAR(100),
  push_enviado BOOLEAN DEFAULT false,
  push_enviado_en TIMESTAMP,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ãndices para notificaciones
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
  resena_reportada_id UUID REFERENCES resenas(id) ON DELETE CASCADE,
  mensaje_reportado_id UUID REFERENCES mensajes(id) ON DELETE CASCADE,
  tipo_reporte tipo_reporte_enum NOT NULL,
  descripcion TEXT NOT NULL,
  urls_evidencia TEXT[], -- Array de URLs de evidencia
  estado estado_reporte_enum DEFAULT 'pendiente',
  notas_admin TEXT,
  resuelto_por UUID REFERENCES usuarios(id),
  resuelto_en TIMESTAMP,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ãndices para reportes
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
  tipo_documento VARCHAR(50), -- 'pasaporte', 'licencia', 'dni', etc.
  numero_documento VARCHAR(100),
  url_documento VARCHAR(500),
  url_documento_reverso VARCHAR(500),
  url_selfie VARCHAR(500),
  estado estado_verificacion_enum DEFAULT 'pendiente',
  verificado_por UUID REFERENCES usuarios(id),
  verificado_en TIMESTAMP,
  expira_en TIMESTAMP,
  razon_rechazo TEXT,
  notas TEXT,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(usuario_id, tipo_verificacion)
);

-- Ãndices para verificaciones_usuarios
CREATE INDEX idx_verificaciones_usuario ON verificaciones_usuarios(usuario_id);
CREATE INDEX idx_verificaciones_estado ON verificaciones_usuarios(estado);
CREATE INDEX idx_verificaciones_tipo ON verificaciones_usuarios(tipo_verificacion);

-- ============================================
-- TABLA: historial_busquedas (Historial de BÃºsquedas)
-- ============================================

CREATE TABLE historial_busquedas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  termino_busqueda VARCHAR(255) NOT NULL,
  categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
  filtros JSONB, -- Filtros aplicados en formato JSON
  ubicacion VARCHAR(200),
  latitud DECIMAL(10,8),
  longitud DECIMAL(11,8),
  conteo_resultados INTEGER,
  servicio_clickeado_id UUID REFERENCES servicios(id) ON DELETE SET NULL,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ãndices para historial_busquedas
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
-- TABLA: servicios_etiquetas (RelaciÃ³n Servicios-Etiquetas)
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
-- TABLA: codigos_promocionales (CÃ³digos Promocionales)
-- ============================================

CREATE TABLE codigos_promocionales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo VARCHAR(50) UNIQUE NOT NULL,
  descripcion TEXT,
  tipo_descuento tipo_descuento_enum NOT NULL,
  valor_descuento DECIMAL(10,2) NOT NULL,
  monto_descuento_maximo DECIMAL(10,2), -- Descuento mÃ¡ximo para porcentajes
  usos_maximos INTEGER,
  usos_maximos_por_usuario INTEGER DEFAULT 1,
  conteo_usos INTEGER DEFAULT 0,
  monto_compra_minimo DECIMAL(10,2),
  categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL, -- EspecÃ­fico para categorÃ­a
  servicios_aplicables UUID[], -- Array de IDs de servicios aplicables
  valido_desde TIMESTAMP NOT NULL,
  valido_hasta TIMESTAMP NOT NULL,
  esta_activo BOOLEAN DEFAULT true,
  creado_por UUID REFERENCES usuarios(id),
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ãndices para codigos_promocionales
CREATE INDEX idx_codigos_promocionales_codigo ON codigos_promocionales(codigo);
CREATE INDEX idx_codigos_promocionales_activo ON codigos_promocionales(esta_activo);
CREATE INDEX idx_codigos_promocionales_valido ON codigos_promocionales(valido_desde, valido_hasta);

-- ============================================
-- TABLA: uso_codigos_promocionales (Uso de CÃ³digos)
-- ============================================

CREATE TABLE uso_codigos_promocionales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_promocional_id UUID NOT NULL REFERENCES codigos_promocionales(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  monto_descuento DECIMAL(10,2) NOT NULL,
  usado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ãndices para uso_codigos_promocionales
CREATE INDEX idx_uso_codigos_codigo ON uso_codigos_promocionales(codigo_promocional_id);
CREATE INDEX idx_uso_codigos_usuario ON uso_codigos_promocionales(usuario_id);
-- (booking_id removed)

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
  titulo VARCHAR(200) NOT NULL,
  descripcion TEXT,
  url_imagen VARCHAR(500) NOT NULL,
  url_miniatura VARCHAR(500),
  categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
  indice_orden INTEGER DEFAULT 0,
  es_destacado BOOLEAN DEFAULT false,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_portafolios_proveedor ON portafolios(proveedor_id);
CREATE INDEX idx_portafolios_categoria ON portafolios(categoria_id);

-- ============================================
-- TABLA: preguntas_frecuentes_servicios (Preguntas Frecuentes)
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

CREATE INDEX idx_preguntas_frecuentes_servicio ON preguntas_frecuentes_servicios(servicio_id);

-- ============================================
-- TABLA: usuarios_bloqueados (Usuarios Bloqueados)
-- ============================================

CREATE TABLE usuarios_bloqueados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bloqueador_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  bloqueado_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  razon TEXT,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(bloqueador_id, bloqueado_id),
  CHECK(bloqueador_id != bloqueado_id)
);

CREATE INDEX idx_bloqueados_bloqueador ON usuarios_bloqueados(bloqueador_id);
CREATE INDEX idx_bloqueados_bloqueado ON usuarios_bloqueados(bloqueado_id);

-- ============================================
-- TABLA: configuracion_app (ConfiguraciÃ³n de la App)
-- ============================================

CREATE TABLE configuracion_app (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clave VARCHAR(100) UNIQUE NOT NULL,
  valor TEXT NOT NULL,
  tipo_dato VARCHAR(20) DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
  descripcion TEXT,
  es_publico BOOLEAN DEFAULT false, -- Si es visible para clientes
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLA: registros_auditoria (Logs de AuditorÃ­a)
-- ============================================

CREATE TABLE registros_auditoria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  accion VARCHAR(100) NOT NULL,
  nombre_tabla VARCHAR(100),
  id_registro UUID,
  valores_antiguos JSONB,
  valores_nuevos JSONB,
  direccion_ip VARCHAR(45),
  agente_usuario TEXT,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_registros_auditoria_usuario ON registros_auditoria(usuario_id);
CREATE INDEX idx_registros_auditoria_accion ON registros_auditoria(accion);
CREATE INDEX idx_registros_auditoria_tabla ON registros_auditoria(nombre_tabla);
CREATE INDEX idx_registros_auditoria_creado ON registros_auditoria(creado_en DESC);

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- FunciÃ³n para actualizar actualizado_en automÃ¡ticamente
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

-- FunciÃ³n para actualizar promedio_calificacion en usuarios
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

-- FunciÃ³n para actualizar promedio_calificacion en servicios
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

-- FunciÃ³n para actualizar contadores de favoritos
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
-- VISTAS ÃšTILES
-- ============================================

-- Vista de servicios con informaciÃ³n del proveedor
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

-- Vista de bookings completos
-- (Vista de reservas eliminada)

-- ============================================
-- DATOS INICIALES
-- ============================================

-- Insertar configuraciones iniciales
INSERT INTO configuracion_app (clave, valor, tipo_dato, descripcion, es_publico) VALUES
('porcentaje_comision_plataforma', '15', 'number', 'Porcentaje de comisiÃ³n de la plataforma', false),
('precio_servicio_minimo', '10', 'number', 'Precio mÃ­nimo de servicio', true),
('precio_servicio_maximo', '10000', 'number', 'Precio mÃ¡ximo de servicio', true),
('horas_cancelacion_reserva', '24', 'number', 'Horas antes para cancelar sin penalizaciÃ³n', true),
('nombre_app', 'AplicacionServicios', 'string', 'Nombre de la aplicaciÃ³n', true),
('email_soporte', 'soporte@aplicacionservicios.com', 'string', 'Email de soporte', true),
('moneda_predeterminada', 'EUR', 'string', 'Moneda por defecto', true),
('idioma_predeterminado', 'es', 'string', 'Idioma por defecto', true);

-- Insertar categorÃ­as principales
INSERT INTO categorias (nombre, slug, descripcion, color, esta_activo, indice_orden) VALUES
('Limpieza del Hogar', 'limpieza-hogar', 'Servicios de limpieza residencial y profesional', '#4CAF50', true, 1),
('Reparaciones', 'reparaciones', 'PlomerÃ­a, electricidad, carpinterÃ­a y mÃ¡s', '#FF9800', true, 2),
('Clases Particulares', 'clases-particulares', 'TutorÃ­as y clases privadas', '#2196F3', true, 3),
('Belleza y EstÃ©tica', 'belleza-estetica', 'PeluquerÃ­a, manicure, maquillaje', '#E91E63', true, 4),
('Transporte y Mudanzas', 'transporte-mudanzas', 'Servicios de transporte y mudanzas', '#9C27B0', true, 5),
('TecnologÃ­a', 'tecnologia', 'ReparaciÃ³n de computadoras, celulares, etc.', '#3F51B5', true, 6),
('FotografÃ­a y Video', 'fotografia-video', 'FotografÃ­a profesional y videografÃ­a', '#00BCD4', true, 7),
('Eventos y Catering', 'eventos-catering', 'OrganizaciÃ³n de eventos y catering', '#FFC107', true, 8),
('Salud y Bienestar', 'salud-bienestar', 'Masajes, yoga, entrenamiento personal', '#8BC34A', true, 9),
('JardinerÃ­a', 'jardineria', 'Cuidado de jardines y paisajismo', '#4CAF50', true, 10);


-- ============================================
-- USUARIO DE PRUEBA
-- ============================================

-- Insertar usuario de prueba (contraseÃ±a: Admin123!)
-- El hash corresponde a la contraseÃ±a "Admin123!" usando bcrypt
INSERT INTO usuarios (
  id,
  correo,
  hash_password,
  usuario,
  nombre,
  apellido,
  telefono,
  codigo_pais,
  url_avatar,
  biografia,
  fecha_nacimiento,
  esta_verificado,
  esta_activo,
  esta_en_linea,
  promedio_calificacion,
  total_resenas,
  idioma,
  zona_horaria,
  moneda,
  notificaciones_email,
  notificaciones_push,
  notificaciones_sms,
  creado_en,
  actualizado_en
) VALUES (
  gen_random_uuid(),
  'admin@aplicacionservicios.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIw8nC8hYq', -- ContraseÃ±a: Admin123!
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
  false,
  4.95,
  125,
  'es',
  'Europe/Madrid',
  'EUR',
  true,
  true,
  false,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- ============================================
-- COMENTARIOS Y DOCUMENTACIÃ“N
-- ============================================

COMMENT ON TABLE usuarios IS 'Tabla principal de usuarios de la plataforma';
COMMENT ON TABLE servicios IS 'Servicios publicados por los proveedores';
COMMENT ON TABLE resenas IS 'Valoraciones y reseÃ±as de servicios';
COMMENT ON TABLE conversaciones IS 'Conversaciones de chat entre usuarios';
COMMENT ON TABLE mensajes IS 'Mensajes individuales en las conversaciones';

COMMENT ON TABLE notificaciones IS 'Sistema de notificaciones push e in-app';

-- ============================================
-- FIN DEL SCRIPT
-- ============================================

-- Para verificar que todo se creÃ³ correctamente:
SELECT 'Tables created: ' || COUNT(*) FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

SELECT 'Views created: ' || COUNT(*) FROM information_schema.views 
WHERE table_schema = 'public';

SELECT 'Indexes created: ' || COUNT(*) FROM pg_indexes 
WHERE schemaname = 'public';

-- ============================================
-- âœ… INSTALACIÃ“N COMPLETADA
-- ============================================
-- Si ves los resultados de las queries anteriores, la base de datos estÃ¡ lista.
-- 
-- ðŸ‘¤ Usuario de prueba creado:
-- Email: admin@aplicacionservicios.com
-- ContraseÃ±a: Admin123!
-- Usuario: admin

-- ============================================
-- SCRIPT PARA CORREGIR MENSAJES DEL CHAT PEDRO-MARÍA
-- ============================================

DO $$
DECLARE
  v_pedro_id UUID;
  v_maria_id UUID;
  v_conversacion_id UUID;
BEGIN
  -- Obtener IDs de Pedro y María
  SELECT id INTO v_pedro_id FROM usuarios WHERE usuario = 'pedro_electric' OR nombre = 'Pedro' LIMIT 1;
  SELECT id INTO v_maria_id FROM usuarios WHERE usuario = 'maria_clean' OR nombre = 'María' LIMIT 1;
  
  RAISE NOTICE 'Pedro ID: %', v_pedro_id;
  RAISE NOTICE 'María ID: %', v_maria_id;
  
  -- Obtener ID de la conversación entre Pedro y María
  SELECT id INTO v_conversacion_id 
  FROM conversaciones 
  WHERE (participante_1_id = v_pedro_id AND participante_2_id = v_maria_id)
     OR (participante_1_id = v_maria_id AND participante_2_id = v_pedro_id)
  LIMIT 1;
  
  RAISE NOTICE 'Conversación ID: %', v_conversacion_id;
  
  IF v_conversacion_id IS NOT NULL THEN
    -- Eliminar mensajes existentes de esta conversación
    DELETE FROM mensajes WHERE conversacion_id = v_conversacion_id;
    RAISE NOTICE 'Mensajes eliminados de la conversación';
    
    -- Reinsertar mensajes con el orden correcto
    -- Mensaje 1: Pedro inicia la conversación (hace 4 horas)
    INSERT INTO mensajes (conversacion_id, remitente_id, tipo_mensaje, contenido, esta_leido, leido_en, creado_en)
    VALUES (
      v_conversacion_id,
      v_pedro_id,
      'texto',
      'Hola María, necesito limpieza profunda de mi departamento. ¿Cuándo puedes?',
      true,
      CURRENT_TIMESTAMP - INTERVAL '4 hours',
      CURRENT_TIMESTAMP - INTERVAL '4 hours'
    );
    
    -- Mensaje 2: María responde (hace 3 horas)
    INSERT INTO mensajes (conversacion_id, remitente_id, tipo_mensaje, contenido, esta_leido, leido_en, creado_en)
    VALUES (
      v_conversacion_id,
      v_maria_id,
      'texto',
      'Hola Pedro, ¿qué tal el sábado a las 9am?',
      true,
      CURRENT_TIMESTAMP - INTERVAL '3 hours',
      CURRENT_TIMESTAMP - INTERVAL '3 hours'
    );
    
    -- Mensaje 3: Pedro confirma (hace 2 horas)
    INSERT INTO mensajes (conversacion_id, remitente_id, tipo_mensaje, contenido, esta_leido, leido_en, creado_en)
    VALUES (
      v_conversacion_id,
      v_pedro_id,
      'texto',
      'Claro que sí, el sábado a las 9am está perfecto.',
      false,
      null,
      CURRENT_TIMESTAMP - INTERVAL '2 hours'
    );
    
    -- Actualizar último mensaje de la conversación
    UPDATE conversaciones 
    SET texto_ultimo_mensaje = 'Claro que sí, el sábado a las 9am está perfecto.',
        ultimo_mensaje_en = CURRENT_TIMESTAMP - INTERVAL '2 hours',
        ultimo_mensaje_remitente_id = v_pedro_id
    WHERE id = v_conversacion_id;
    
    RAISE NOTICE 'Mensajes reinsertados correctamente';
  ELSE
    RAISE NOTICE 'No se encontró conversación entre Pedro y María';
  END IF;
END $$;

-- Verificar los mensajes
SELECT 
  m.id,
  m.remitente_id,
  u.nombre as remitente_nombre,
  m.contenido,
  m.creado_en
FROM mensajes m
JOIN usuarios u ON m.remitente_id = u.id
JOIN conversaciones c ON m.conversacion_id = c.id
WHERE (c.participante_1_id IN (SELECT id FROM usuarios WHERE nombre IN ('Pedro', 'María'))
   AND c.participante_2_id IN (SELECT id FROM usuarios WHERE nombre IN ('Pedro', 'María')))
ORDER BY m.creado_en ASC;




-- ============================================
-- DATOS DE PRUEBA ADICIONALES
-- ============================================
-- Este script contiene datos de prueba para tablas sin datos iniciales
-- Ejecutar después del DDL principal
-- ============================================

-- Para este script, primero necesitamos obtener los IDs de los usuarios y categorías insertados
-- Los UUIDs se generarán automáticamente, así que usaremos variables temporales

DO $$
DECLARE
  -- Variables para almacenar IDs de usuarios
  v_admin_id UUID;
  v_juan_id UUID;
  v_maria_id UUID;
  v_carlos_id UUID;
  v_ana_id UUID;
  v_pedro_id UUID;
  v_sofia_id UUID;
  
  -- Variables para almacenar IDs de categorías
  v_cat_limpieza UUID;
  v_cat_reparaciones UUID;
  v_cat_clases UUID;
  v_cat_belleza UUID;
  v_cat_transporte UUID;
  v_cat_tecnologia UUID;
  v_cat_fotografia UUID;
  v_cat_eventos UUID;
  v_cat_salud UUID;
  v_cat_jardineria UUID;
  
  -- Variables para almacenar IDs de servicios
  v_service1_id UUID;
  v_service2_id UUID;
  v_service3_id UUID;
  v_service4_id UUID;
  v_service5_id UUID;
  v_service6_id UUID;
  
  -- Variables para tags
  v_tag_rapido UUID;
  v_tag_economico UUID;
  v_tag_profesional UUID;
  v_tag_domicilio UUID;
  v_tag_emergencia UUID;
  
BEGIN
  -- ============================================
  -- OBTENER IDs DE USUARIOS EXISTENTES
  -- ============================================
  SELECT id INTO v_admin_id FROM usuarios WHERE usuario = 'admin';
  
  -- Crear usuarios de prueba adicionales si no existen
  INSERT INTO usuarios (
    correo, hash_password, usuario, nombre, apellido, telefono, codigo_pais,
    url_avatar, biografia, fecha_nacimiento, esta_verificado, esta_activo,
    promedio_calificacion, total_resenas, idioma, zona_horaria, moneda
  ) VALUES
    ('juan@email.com', '$2b$10$gFWmCnZci9Lu0sIynwsp9.y0yRcAzZDdepskPdcfuZpOgtaiiE3Ty', 
     'juan_electricista', 'Juan', 'Martínez', '34666111222', '+34',
     'https://ui-avatars.com/api/?name=Juan&background=FF9800&color=fff&size=200',
     'Electricista profesional con 10 años de experiencia', '1985-03-15', true, true, 4.8, 45, 'es', 'Europe/Madrid', 'EUR')
  ON CONFLICT (usuario) DO NOTHING;
  
  INSERT INTO usuarios (
    correo, hash_password, usuario, nombre, apellido, telefono, codigo_pais,
    url_avatar, biografia, fecha_nacimiento, esta_verificado, esta_activo,
    promedio_calificacion, total_resenas, idioma, zona_horaria, moneda
  ) VALUES
    ('maria@email.com', '$2b$10$gFWmCnZci9Lu0sIynwsp9.y0yRcAzZDdepskPdcfuZpOgtaiiE3Ty', 
     'maria_limpieza', 'María', 'García', '34666222333', '+34',
     'https://ui-avatars.com/api/?name=Maria&background=4CAF50&color=fff&size=200',
     'Servicio profesional de limpieza con productos ecológicos', '1990-07-22', true, true, 4.9, 78, 'es', 'Europe/Madrid', 'EUR')
  ON CONFLICT (usuario) DO NOTHING;
  
  INSERT INTO usuarios (
    correo, hash_password, usuario, nombre, apellido, telefono, codigo_pais,
    url_avatar, biografia, fecha_nacimiento, esta_verificado, esta_activo,
    promedio_calificacion, total_resenas, idioma, zona_horaria, moneda
  ) VALUES
    ('carlos@email.com', '$2b$10$gFWmCnZci9Lu0sIynwsp9.y0yRcAzZDdepskPdcfuZpOgtaiiE3Ty', 
     'carlos_plomero', 'Carlos', 'López', '34666333444', '+34',
     'https://ui-avatars.com/api/?name=Carlos&background=2196F3&color=fff&size=200',
     'Plomero certificado - Emergencias 24/7', '1988-11-10', true, true, 4.7, 92, 'es', 'Europe/Madrid', 'EUR')
  ON CONFLICT (usuario) DO NOTHING;
  
  INSERT INTO usuarios (
    correo, hash_password, usuario, nombre, apellido, telefono, codigo_pais,
    url_avatar, biografia, fecha_nacimiento, esta_verificado, esta_activo,
    idioma, zona_horaria, moneda
  ) VALUES
    ('ana@email.com', '$2b$10$gFWmCnZci9Lu0sIynwsp9.y0yRcAzZDdepskPdcfuZpOgtaiiE3Ty', 
     'ana_cliente', 'Ana', 'Rodríguez', '34666444555', '+34',
     'https://ui-avatars.com/api/?name=Ana&background=E91E63&color=fff&size=200',
     'Cliente activa de la plataforma', '1992-05-18', true, true, 'es', 'Europe/Madrid', 'EUR')
  ON CONFLICT (usuario) DO NOTHING;
  
  INSERT INTO usuarios (
    correo, hash_password, usuario, nombre, apellido, telefono, codigo_pais,
    url_avatar, biografia, fecha_nacimiento, esta_verificado, esta_activo,
    idioma, zona_horaria, moneda
  ) VALUES
    ('pedro@email.com', '$2b$10$gFWmCnZci9Lu0sIynwsp9.y0yRcAzZDdepskPdcfuZpOgtaiiE3Ty', 
     'pedro_cliente', 'Pedro', 'Fernández', '34666555666', '+34',
     'https://ui-avatars.com/api/?name=Pedro&background=9C27B0&color=fff&size=200',
     'Buscando servicios de calidad', '1987-09-25', true, true, 'es', 'Europe/Madrid', 'EUR')
  ON CONFLICT (usuario) DO NOTHING;
  
  INSERT INTO usuarios (
    correo, hash_password, usuario, nombre, apellido, telefono, codigo_pais,
    url_avatar, biografia, fecha_nacimiento, esta_verificado, esta_activo,
    promedio_calificacion, total_resenas, idioma, zona_horaria, moneda
  ) VALUES
    ('sofia@email.com', '$2b$10$gFWmCnZci9Lu0sIynwsp9.y0yRcAzZDdepskPdcfuZpOgtaiiE3Ty', 
     'sofia_profesional', 'Sofía', 'Torres', '34666777888', '+34',
     'https://ui-avatars.com/api/?name=Sofia&background=00BCD4&color=fff&size=200',
     'Profesora certificada de inglés y matemáticas', '1991-12-08', true, true, 4.85, 34, 'es', 'Europe/Madrid', 'EUR')
  ON CONFLICT (usuario) DO NOTHING;
  
  -- Obtener IDs de usuarios
  SELECT id INTO v_juan_id FROM usuarios WHERE usuario = 'juan_electricista';
  SELECT id INTO v_maria_id FROM usuarios WHERE usuario = 'maria_limpieza';
  SELECT id INTO v_carlos_id FROM usuarios WHERE usuario = 'carlos_plomero';
  SELECT id INTO v_ana_id FROM usuarios WHERE usuario = 'ana_cliente';
  SELECT id INTO v_pedro_id FROM usuarios WHERE usuario = 'pedro_cliente';
  SELECT id INTO v_sofia_id FROM usuarios WHERE usuario = 'sofia_profesional';
  
  -- ============================================
  -- OBTENER IDs DE CATEGORÍAS EXISTENTES
  -- ============================================
  SELECT id INTO v_cat_limpieza FROM categorias WHERE slug = 'limpieza-hogar';
  SELECT id INTO v_cat_reparaciones FROM categorias WHERE slug = 'reparaciones';
  SELECT id INTO v_cat_clases FROM categorias WHERE slug = 'clases-particulares';
  SELECT id INTO v_cat_belleza FROM categorias WHERE slug = 'belleza-estetica';
  SELECT id INTO v_cat_transporte FROM categorias WHERE slug = 'transporte-mudanzas';
  SELECT id INTO v_cat_tecnologia FROM categorias WHERE slug = 'tecnologia';
  SELECT id INTO v_cat_fotografia FROM categorias WHERE slug = 'fotografia-video';
  SELECT id INTO v_cat_eventos FROM categorias WHERE slug = 'eventos-catering';
  SELECT id INTO v_cat_salud FROM categorias WHERE slug = 'salud-bienestar';
  SELECT id INTO v_cat_jardineria FROM categorias WHERE slug = 'jardineria';
  
  -- ============================================
  -- INSERTAR DIRECCIONES DE USUARIO
  -- ============================================
  RAISE NOTICE 'Insertando direcciones de usuarios...';
  
  INSERT INTO direcciones_usuarios (usuario_id, etiqueta, direccion_linea1, direccion_linea2, ciudad, estado, codigo_postal, pais, latitud, longitud, predeterminada)
  VALUES
    (v_juan_id, 'casa', 'Calle Gran Vía 123', 'Piso 3', 'Madrid', 'Madrid', '28013', 'España', 40.4168, -3.7038, true),
    (v_maria_id, 'casa', 'Paseo de Gracia 456', 'Atico', 'Barcelona', 'Barcelona', '08007', 'España', 41.3851, 2.1734, true),
    (v_carlos_id, 'trabajo', 'Avenida Diagonal 789', 'Local B', 'Barcelona', 'Barcelona', '08029', 'España', 41.3887, 2.1590, true),
    (v_ana_id, 'casa', 'Calle Serrano 321', 'Piso 2A', 'Madrid', 'Madrid', '28001', 'España', 40.4238, -3.6889, true),
    (v_ana_id, 'trabajo', 'Paseo de la Castellana 555', 'Piso 10', 'Madrid', 'Madrid', '28046', 'España', 40.4473, -3.6895, false),
    (v_sofia_id, 'casa', 'Calle Mayor 234', 'Piso 1B', 'Valencia', 'Valencia', '46001', 'España', 39.4699, -0.3763, true);
  
  -- ============================================
  -- INSERTAR SERVICIOS
  -- ============================================
  RAISE NOTICE 'Insertando servicios...';
  
  -- Servicio 1: Instalación eléctrica por Juan
  INSERT INTO servicios (
    proveedor_id, categoria_id, titulo, descripcion,
    tipo_precio, precio, moneda,
    tipo_ubicacion, ciudad, estado, pais, latitud, longitud,
    esta_activo, es_destacado, vistas, promedio_calificacion, total_resenas
  ) VALUES (
    v_juan_id, v_cat_reparaciones,
    'Instalación y Reparación Eléctrica Residencial',
    'Servicio profesional de electricidad para tu hogar. Incluye: instalación de contactos, apagadores, lámparas, ventiladores de techo, reparación de cortocircuitos, actualización de tableros eléctricos, instalación de timbres y porteros eléctricos. Trabajo garantizado y materiales de primera calidad. Atención 24/7 para emergencias.',
    'por_hora', 35.00, 'EUR',
    'domicilio_cliente', 'Madrid', 'Madrid', 'España', 40.4168, -3.7038,
    true, true, 245, 4.8, 45
  ) RETURNING id INTO v_service1_id;
  
  -- Servicio 2: Limpieza profunda por María
  INSERT INTO servicios (
    proveedor_id, categoria_id, titulo, descripcion,
    tipo_precio, precio, moneda,
    tipo_ubicacion, ciudad, estado, pais, latitud, longitud,
    esta_activo, es_destacado, vistas, promedio_calificacion, total_resenas
  ) VALUES (
    v_maria_id, v_cat_limpieza,
    'Limpieza Profunda de Hogar y Oficina',
    'Servicio completo de limpieza profesional. Incluye: barrido y fregado de suelos, limpieza de baños y cocina, desempolvado de muebles, limpieza de ventanas, aspirado de alfombras. Llevamos nuestros propios productos de limpieza ecológicos. Personal capacitado y confiable. Disponible fines de semana.',
    'fijo', 80.00, 'EUR',
    'domicilio_cliente', 'Barcelona', 'Barcelona', 'España', 41.3851, 2.1734,
    true, true, 387, 4.9, 78
  ) RETURNING id INTO v_service2_id;
  
  -- Servicio 3: Plomería por Carlos
  INSERT INTO servicios (
    proveedor_id, categoria_id, titulo, descripcion,
    tipo_precio, precio, moneda,
    tipo_ubicacion, ciudad, estado, pais, latitud, longitud,
    esta_activo, vistas, promedio_calificacion, total_resenas
  ) VALUES (
    v_carlos_id, v_cat_reparaciones,
    'Plomería Residencial y Comercial',
    'Servicios completos de plomería: reparación de fugas, desatasco de tuberías, instalación de grifos y sanitarios, reparación de calentadores, instalación de depósitos, mantenimiento preventivo. Servicio de emergencia disponible. Presupuesto sin compromiso.',
    'por_hora', 40.00, 'EUR',
    'domicilio_cliente', 'Barcelona', 'Barcelona', 'España', 41.3887, 2.1590,
    true, 198, 4.7, 92
  ) RETURNING id INTO v_service3_id;
  
  -- Servicio 4: Clases de inglés por Sofía
  INSERT INTO servicios (
    proveedor_id, categoria_id, titulo, descripcion,
    tipo_precio, precio, moneda,
    tipo_ubicacion, ciudad, estado, pais, latitud, longitud,
    esta_activo, es_destacado, vistas, promedio_calificacion, total_resenas
  ) VALUES (
    v_sofia_id, v_cat_clases,
    'Clases Particulares de Inglés Online',
    'Clases personalizadas de inglés para todos los niveles (A1-C2). Preparación para exámenes TOEFL, IELTS, Cambridge. Conversación, gramática, escritura. Material didáctico incluido. Horarios flexibles. Primera clase de prueba gratis. Metodología comunicativa y dinámica.',
    'por_hora', 25.00, 'EUR',
    'remoto', 'Valencia', 'Valencia', 'España', 39.4699, -0.3763,
    true, true, 156, 4.85, 34
  ) RETURNING id INTO v_service4_id;
  
  -- Servicio 5: Clases de matemáticas por Sofía
  INSERT INTO servicios (
    proveedor_id, categoria_id, titulo, descripcion,
    tipo_precio, precio, moneda,
    tipo_ubicacion, ciudad, estado, pais,
    esta_activo, vistas
  ) VALUES (
    v_sofia_id, v_cat_clases,
    'Asesorías de Matemáticas - Todos los Niveles',
    'Asesorías personalizadas de matemáticas: primaria, secundaria, bachillerato y universidad. Álgebra, cálculo, geometría, trigonometría, estadística. Explicaciones claras y pacientes. Resolución de ejercicios paso a paso. Material de apoyo incluido.',
    'por_hora', 28.00, 'EUR',
    'flexible', 'Valencia', 'Valencia', 'España',
    true, 89
  ) RETURNING id INTO v_service5_id;
  
  -- Servicio 6: Mantenimiento por Juan
  INSERT INTO servicios (
    proveedor_id, categoria_id, titulo, descripcion,
    tipo_precio, precio, moneda,
    tipo_ubicacion, ciudad, estado, pais,
    esta_activo, vistas
  ) VALUES (
    v_juan_id, v_cat_reparaciones,
    'Mantenimiento Preventivo Eléctrico',
    'Servicio de mantenimiento preventivo para tu instalación eléctrica. Incluye: revisión de cuadro eléctrico, verificación de conexiones, prueba de circuitos, informe de condiciones. Previene accidentes y ahorra energía.',
    'fijo', 120.00, 'EUR',
    'domicilio_cliente', 'Madrid', 'Madrid', 'España',
    true, 67
  ) RETURNING id INTO v_service6_id;
  
  -- ============================================
  -- INSERTAR IMÁGENES DE SERVICIOS
  -- ============================================
  RAISE NOTICE 'Insertando imágenes de servicios...';
  
  -- Imágenes para servicio de electricidad
  INSERT INTO imagenes_servicios (servicio_id, url_imagen, url_miniatura, pie_de_foto, es_principal, indice_orden)
  VALUES
    (v_service1_id, 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4', 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=200', 'Instalación eléctrica profesional', true, 1),
    (v_service1_id, 'https://images.unsplash.com/photo-1613665813446-82a78c468a1d', 'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?w=200', 'Cuadro eléctrico moderno', false, 2),
    (v_service1_id, 'https://images.unsplash.com/photo-1590852498113-c1cf6b21aaa8', 'https://images.unsplash.com/photo-1590852498113-c1cf6b21aaa8?w=200', 'Herramientas profesionales', false, 3);
  
  -- Imágenes para servicio de limpieza
  INSERT INTO imagenes_servicios (servicio_id, url_imagen, url_miniatura, pie_de_foto, es_principal, indice_orden)
  VALUES
    (v_service2_id, 'https://images.unsplash.com/photo-1581578731548-c64695cc6952', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200', 'Limpieza profesional de hogar', true, 1),
    (v_service2_id, 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50', 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=200', 'Productos de limpieza ecológicos', false, 2);
  
  -- Imágenes para servicio de plomería
  INSERT INTO imagenes_servicios (servicio_id, url_imagen, url_miniatura, pie_de_foto, es_principal, indice_orden)
  VALUES
    (v_service3_id, 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39', 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=200', 'Reparación profesional de plomería', true, 1),
    (v_service3_id, 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d', 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=200', 'Instalación de grifería', false, 2);
  
  -- Imágenes para clases de inglés
  INSERT INTO imagenes_servicios (servicio_id, url_imagen, url_miniatura, pie_de_foto, es_principal, indice_orden)
  VALUES
    (v_service4_id, 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d', 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=200', 'Clases online personalizadas', true, 1);
  
  -- ============================================
  -- INSERTAR DISPONIBILIDAD DE SERVICIOS
  -- ============================================
  RAISE NOTICE 'Insertando disponibilidad de servicios...';
  
  -- Disponibilidad Juan (Lunes a Viernes 8am-6pm)
  INSERT INTO disponibilidad_servicios (servicio_id, dia_semana, hora_inicio, hora_fin, esta_disponible)
  VALUES
    (v_service1_id, 1, '08:00', '18:00', true),
    (v_service1_id, 2, '08:00', '18:00', true),
    (v_service1_id, 3, '08:00', '18:00', true),
    (v_service1_id, 4, '08:00', '18:00', true),
    (v_service1_id, 5, '08:00', '18:00', true),
    (v_service1_id, 6, '09:00', '14:00', true),
    (v_service6_id, 1, '08:00', '18:00', true),
    (v_service6_id, 2, '08:00', '18:00', true),
    (v_service6_id, 3, '08:00', '18:00', true),
    (v_service6_id, 4, '08:00', '18:00', true),
    (v_service6_id, 5, '08:00', '18:00', true);
  
  -- Disponibilidad María (Lunes a Sábado 7am-7pm)
  INSERT INTO disponibilidad_servicios (servicio_id, dia_semana, hora_inicio, hora_fin, esta_disponible)
  VALUES
    (v_service2_id, 1, '07:00', '19:00', true),
    (v_service2_id, 2, '07:00', '19:00', true),
    (v_service2_id, 3, '07:00', '19:00', true),
    (v_service2_id, 4, '07:00', '19:00', true),
    (v_service2_id, 5, '07:00', '19:00', true),
    (v_service2_id, 6, '08:00', '17:00', true),
    (v_service2_id, 0, '09:00', '15:00', true);
  
  -- Disponibilidad Carlos (Todos los días)
  INSERT INTO disponibilidad_servicios (servicio_id, dia_semana, hora_inicio, hora_fin, esta_disponible)
  VALUES
    (v_service3_id, 0, '08:00', '20:00', true),
    (v_service3_id, 1, '07:00', '21:00', true),
    (v_service3_id, 2, '07:00', '21:00', true),
    (v_service3_id, 3, '07:00', '21:00', true),
    (v_service3_id, 4, '07:00', '21:00', true),
    (v_service3_id, 5, '07:00', '21:00', true),
    (v_service3_id, 6, '08:00', '20:00', true);
  
  -- Disponibilidad Sofía (Lunes a Viernes 3pm-9pm, Sábados 9am-2pm)
  INSERT INTO disponibilidad_servicios (servicio_id, dia_semana, hora_inicio, hora_fin, esta_disponible)
  VALUES
    (v_service4_id, 1, '15:00', '21:00', true),
    (v_service4_id, 2, '15:00', '21:00', true),
    (v_service4_id, 3, '15:00', '21:00', true),
    (v_service4_id, 4, '15:00', '21:00', true),
    (v_service4_id, 5, '15:00', '21:00', true),
    (v_service4_id, 6, '09:00', '14:00', true),
    (v_service5_id, 1, '15:00', '21:00', true),
    (v_service5_id, 2, '15:00', '21:00', true),
    (v_service5_id, 3, '15:00', '21:00', true),
    (v_service5_id, 4, '15:00', '21:00', true),
    (v_service5_id, 5, '15:00', '21:00', true),
    (v_service5_id, 6, '09:00', '14:00', true);
  
  -- ============================================
  -- INSERTAR EXCEPCIONES DE DISPONIBILIDAD
  -- ============================================
  RAISE NOTICE 'Insertando excepciones de disponibilidad...';
  
  -- Juan no disponible el 1 de enero (Año Nuevo)
  INSERT INTO excepciones_servicios (servicio_id, fecha_excepcion, esta_disponible, motivo)
  VALUES
    (v_service1_id, '2026-01-01', false, 'Día festivo - Año Nuevo'),
    (v_service6_id, '2026-01-01', false, 'Día festivo - Año Nuevo');
  
  -- María no disponible el 25 de diciembre
  INSERT INTO excepciones_servicios (servicio_id, fecha_excepcion, esta_disponible, motivo)
  VALUES
    (v_service2_id, '2025-12-25', false, 'Navidad');
  
  -- ============================================
  -- INSERTAR REVIEWS/RESEÑAS
  -- ============================================
  RAISE NOTICE 'Insertando reseñas...';
  
  -- Reviews para el servicio de electricidad de Juan
  INSERT INTO resenas (servicio_id, revisor_id, usuario_valorado_id, calificacion, titulo, comentario)
  VALUES
    (v_service1_id, v_ana_id, v_juan_id, 5, 'Excelente servicio', 
     'Juan es muy profesional y puntual. Resolvió el problema eléctrico de mi casa rápidamente. Lo recomiendo ampliamente.'),
    (v_service1_id, v_pedro_id, v_juan_id, 5, 'Muy recomendable',
     'Trabajo impecable, precios justos y garantía en su trabajo. Definitivamente lo volveré a contratar.'),
    (v_service1_id, v_sofia_id, v_juan_id, 4, 'Buen trabajo',
     'Hizo un buen trabajo instalando varios enchufes en mi casa. Tardó un poco más de lo esperado pero quedó bien.');
  
  -- Reviews para el servicio de limpieza de María
  INSERT INTO resenas (servicio_id, revisor_id, usuario_valorado_id, calificacion, titulo, comentario, ventajas, respuesta, fecha_respuesta)
  VALUES
    (v_service2_id, v_ana_id, v_maria_id, 5, 'Dejó mi casa impecable',
     'María y su equipo dejaron mi casa súper limpia. Muy detallistas y cuidadosos con los muebles.',
     'Puntualidad, calidad, productos ecológicos', '¡Muchas gracias Ana! Es un placer trabajar para ti.', CURRENT_TIMESTAMP - INTERVAL '2 days'),
    (v_service2_id, v_pedro_id, v_maria_id, 5, 'Súper profesional',
     'El mejor servicio de limpieza que he contratado. María es muy profesional y confiable.', 
     'Excelente atención, muy profesional', null, null),
    (v_service2_id, v_juan_id, v_maria_id, 5, 'Recomendadísimo',
     'Contraté a María para limpiar mi oficina y quedó perfecta. Muy eficiente.', null, null, null);
  
  -- Reviews para el servicio de plomería de Carlos
  INSERT INTO resenas (servicio_id, revisor_id, usuario_valorado_id, calificacion, titulo, comentario)
  VALUES
    (v_service3_id, v_ana_id, v_carlos_id, 5, 'Solucionó la fuga rápidamente',
     'Carlos llegó rápido y arregló la fuga de agua en mi baño. Muy profesional y limpio en su trabajo.'),
    (v_service3_id, v_pedro_id, v_carlos_id, 4, 'Buen servicio',
     'Hizo un buen trabajo, aunque el precio fue un poco alto. Pero la calidad lo vale.');
  
  -- Reviews para las clases de inglés de Sofía
  INSERT INTO resenas (servicio_id, revisor_id, usuario_valorado_id, calificacion, titulo, comentario)
  VALUES
    (v_service4_id, v_ana_id, v_sofia_id, 5, 'Excelente profesora',
     'Sofía es una profesora muy paciente y preparada. He mejorado mucho mi inglés con sus clases.'),
    (v_service4_id, v_pedro_id, v_sofia_id, 5, 'Muy recomendable',
     'Las clases son muy dinámicas y personalizadas. Aprendí más en 2 meses que en años de escuela.');
  
  -- ============================================
  -- INSERTAR TAGS
  -- ============================================
  RAISE NOTICE 'Insertando tags...';
  
  INSERT INTO etiquetas (nombre, slug, conteo_uso) VALUES
    ('Servicio Rápido', 'servicio-rapido', 3),
    ('Económico', 'economico', 2),
    ('Profesional', 'profesional', 5),
    ('A Domicilio', 'a-domicilio', 4),
    ('Emergencias', 'emergencias', 2),
    ('Productos Ecológicos', 'productos-ecologicos', 1),
    ('Certificado', 'certificado', 3),
    ('Garantizado', 'garantizado', 2),
    ('Online', 'online', 2),
    ('Flexible', 'flexible', 2);
  
  -- Obtener IDs de tags
  SELECT id INTO v_tag_rapido FROM etiquetas WHERE slug = 'servicio-rapido';
  SELECT id INTO v_tag_economico FROM etiquetas WHERE slug = 'economico';
  SELECT id INTO v_tag_profesional FROM etiquetas WHERE slug = 'profesional';
  SELECT id INTO v_tag_domicilio FROM etiquetas WHERE slug = 'a-domicilio';
  SELECT id INTO v_tag_emergencia FROM etiquetas WHERE slug = 'emergencias';
  
  -- ============================================
  -- INSERTAR RELACIÓN SERVICIOS-TAGS
  -- ============================================
  RAISE NOTICE 'Insertando relación servicios-tags...';
  
  INSERT INTO servicios_etiquetas (servicio_id, etiqueta_id) VALUES
    (v_service1_id, v_tag_profesional),
    (v_service1_id, v_tag_domicilio),
    (v_service1_id, v_tag_emergencia),
    (v_service2_id, v_tag_profesional),
    (v_service2_id, v_tag_domicilio),
    (v_service2_id, (SELECT id FROM etiquetas WHERE slug = 'productos-ecologicos')),
    (v_service3_id, v_tag_profesional),
    (v_service3_id, v_tag_domicilio),
    (v_service3_id, v_tag_emergencia),
    (v_service4_id, (SELECT id FROM etiquetas WHERE slug = 'online')),
    (v_service4_id, v_tag_profesional),
    (v_service4_id, (SELECT id FROM etiquetas WHERE slug = 'certificado')),
    (v_service5_id, (SELECT id FROM etiquetas WHERE slug = 'online')),
    (v_service5_id, (SELECT id FROM etiquetas WHERE slug = 'flexible'));
  
  -- ============================================
  -- INSERTAR CONVERSACIONES
  -- ============================================
  RAISE NOTICE 'Insertando conversaciones...';
  
  -- Conversación entre Ana y Juan sobre servicio eléctrico
  INSERT INTO conversaciones (
    participante_1_id, participante_2_id, servicio_id,
    texto_ultimo_mensaje, ultimo_mensaje_en, ultimo_mensaje_remitente_id,
    no_leidos_p1, no_leidos_p2
  ) VALUES (
    v_ana_id, v_juan_id, v_service1_id,
    '¡Perfecto! Nos vemos mañana entonces. Gracias.',
    CURRENT_TIMESTAMP - INTERVAL '1 day',
    v_ana_id, 0, 0
  );
  
  -- Conversación entre Pedro y María sobre limpieza
  INSERT INTO conversaciones (
    participante_1_id, participante_2_id, servicio_id,
    texto_ultimo_mensaje, ultimo_mensaje_en, ultimo_mensaje_remitente_id,
    no_leidos_p1, no_leidos_p2
  ) VALUES (
    v_pedro_id, v_maria_id, v_service2_id,
    'Claro que sí, el sábado a las 9am está perfecto.',
    CURRENT_TIMESTAMP - INTERVAL '3 hours',
    v_maria_id, 1, 0
  );
  
  -- Conversación entre Sofía y Ana sobre clases
  INSERT INTO conversaciones (
    participante_1_id, participante_2_id, servicio_id,
    texto_ultimo_mensaje, ultimo_mensaje_en, ultimo_mensaje_remitente_id,
    no_leidos_p1, no_leidos_p2
  ) VALUES (
    v_ana_id, v_sofia_id, v_service4_id,
    'Te envío el material por email.',
    CURRENT_TIMESTAMP - INTERVAL '30 minutes',
    v_sofia_id, 1, 0
  );
  
  -- ============================================
  -- INSERTAR MENSAJES
  -- ============================================
  RAISE NOTICE 'Insertando mensajes...';
  
  -- Mensajes de la conversación Ana-Juan
  INSERT INTO mensajes (conversacion_id, remitente_id, tipo_mensaje, contenido, esta_leido, leido_en, creado_en)
  SELECT id, v_ana_id, 'texto', 'Hola Juan, ¿tienes disponibilidad esta semana para revisar mi instalación eléctrica?', true,
    CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '2 days'
  FROM conversaciones WHERE participante_1_id = v_ana_id AND participante_2_id = v_juan_id;
  
  INSERT INTO mensajes (conversacion_id, remitente_id, tipo_mensaje, contenido, esta_leido, leido_en, creado_en)
  SELECT id, v_juan_id, 'texto', 'Hola Ana, sí claro. ¿Te parece bien mañana a las 10am?', true,
    CURRENT_TIMESTAMP - INTERVAL '2 days' + INTERVAL '15 minutes', CURRENT_TIMESTAMP - INTERVAL '2 days' + INTERVAL '15 minutes'
  FROM conversaciones WHERE participante_1_id = v_ana_id AND participante_2_id = v_juan_id;
  
  INSERT INTO mensajes (conversacion_id, remitente_id, tipo_mensaje, contenido, esta_leido, leido_en, creado_en)
  SELECT id, v_ana_id, 'texto', '¡Perfecto! Nos vemos mañana entonces. Gracias.', true,
    CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '1 day'
  FROM conversaciones WHERE participante_1_id = v_ana_id AND participante_2_id = v_juan_id;
  
  -- Mensajes de la conversación Pedro-María (orden cronológico correcto)
  -- Mensaje 1: Pedro inicia la conversación (hace 4 horas)
  INSERT INTO mensajes (conversacion_id, remitente_id, tipo_mensaje, contenido, esta_leido, leido_en, creado_en)
  SELECT id, v_pedro_id, 'texto', 'Hola María, necesito limpieza profunda de mi departamento. ¿Cuándo puedes?', true,
    CURRENT_TIMESTAMP - INTERVAL '4 hours', CURRENT_TIMESTAMP - INTERVAL '4 hours'
  FROM conversaciones WHERE participante_1_id = v_pedro_id AND participante_2_id = v_maria_id;
  
  -- Mensaje 2: María responde (hace 3 horas)
  INSERT INTO mensajes (conversacion_id, remitente_id, tipo_mensaje, contenido, esta_leido, leido_en, creado_en)
  SELECT id, v_maria_id, 'texto', 'Hola Pedro, ¿qué tal el sábado a las 9am?', true,
    CURRENT_TIMESTAMP - INTERVAL '3 hours', CURRENT_TIMESTAMP - INTERVAL '3 hours'
  FROM conversaciones WHERE participante_1_id = v_pedro_id AND participante_2_id = v_maria_id;
  
  -- Mensaje 3: Pedro confirma (hace 2 horas)
  INSERT INTO mensajes (conversacion_id, remitente_id, tipo_mensaje, contenido, esta_leido, leido_en, creado_en)
  SELECT id, v_pedro_id, 'texto', 'Claro que sí, el sábado a las 9am está perfecto.', false, null,
    CURRENT_TIMESTAMP - INTERVAL '2 hours'
  FROM conversaciones WHERE participante_1_id = v_pedro_id AND participante_2_id = v_maria_id;
  
  -- ============================================
  -- INSERTAR FAVORITOS
  -- ============================================
  RAISE NOTICE 'Insertando favoritos...';
  
  INSERT INTO favoritos (usuario_id, servicio_id, creado_en) VALUES
    (v_ana_id, v_service1_id, CURRENT_TIMESTAMP - INTERVAL '5 days'),
    (v_ana_id, v_service2_id, CURRENT_TIMESTAMP - INTERVAL '3 days'),
    (v_ana_id, v_service4_id, CURRENT_TIMESTAMP - INTERVAL '1 day'),
    (v_pedro_id, v_service2_id, CURRENT_TIMESTAMP - INTERVAL '7 days'),
    (v_pedro_id, v_service3_id, CURRENT_TIMESTAMP - INTERVAL '2 days'),
    (v_sofia_id, v_service1_id, CURRENT_TIMESTAMP - INTERVAL '10 days');
  
  -- ============================================
  -- INSERTAR NOTIFICACIONES
  -- ============================================
  RAISE NOTICE 'Insertando notificaciones...';
  
  INSERT INTO notificaciones (usuario_id, tipo, titulo, contenido, id_relacionado, tipo_relacionado, esta_leido, creado_en)
  VALUES
    (v_juan_id, 'mensaje', 'Nuevo mensaje de Ana', 'Ana te ha enviado un mensaje sobre "Instalación y Reparación Eléctrica"', 
     v_ana_id, 'mensaje', true, CURRENT_TIMESTAMP - INTERVAL '2 days'),
    (v_juan_id, 'valoracion', 'Nueva reseña', 'Ana dejó una reseña de 5 estrellas en tu servicio', 
     v_ana_id, 'resena', true, CURRENT_TIMESTAMP - INTERVAL '1 day'),
    (v_maria_id, 'mensaje', 'Nuevo mensaje de Pedro', 'Pedro te ha enviado un mensaje', 
     v_pedro_id, 'mensaje', false, CURRENT_TIMESTAMP - INTERVAL '4 hours'),
    (v_ana_id, 'sistema', 'Bienvenida', '¡Bienvenida a nuestra plataforma de servicios!', 
     null, 'sistema', true, CURRENT_TIMESTAMP - INTERVAL '30 days'),
    (v_sofia_id, 'valoracion', 'Nueva reseña', 'Ana dejó una reseña de 5 estrellas en tu servicio de inglés', 
     v_ana_id, 'resena', false, CURRENT_TIMESTAMP - INTERVAL '12 hours');
  
  -- ============================================
  -- INSERTAR SEGUIDORES
  -- ============================================
  RAISE NOTICE 'Insertando seguidores...';
  
  INSERT INTO seguidores_usuarios (seguidor_id, seguido_id, creado_en) VALUES
    (v_ana_id, v_juan_id, CURRENT_TIMESTAMP - INTERVAL '10 days'),
    (v_ana_id, v_maria_id, CURRENT_TIMESTAMP - INTERVAL '8 days'),
    (v_ana_id, v_sofia_id, CURRENT_TIMESTAMP - INTERVAL '5 days'),
    (v_pedro_id, v_maria_id, CURRENT_TIMESTAMP - INTERVAL '15 days'),
    (v_pedro_id, v_carlos_id, CURRENT_TIMESTAMP - INTERVAL '7 days'),
    (v_sofia_id, v_juan_id, CURRENT_TIMESTAMP - INTERVAL '20 days');
  
  -- ============================================
  -- INSERTAR PORTAFOLIO
  -- ============================================
  RAISE NOTICE 'Insertando items de portafolio...';
  
  -- Portafolio de Juan
  INSERT INTO portafolios (proveedor_id, titulo, descripcion, url_imagen, url_miniatura, categoria_id, indice_orden, es_destacado)
  VALUES
    (v_juan_id, 'Instalación eléctrica residencia Madrid', 'Instalación completa de sistema eléctrico en casa de 3 pisos', 
     'https://images.unsplash.com/photo-1621905252507-b35492cc74b4', 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=300', 
     v_cat_reparaciones, 1, true),
    (v_juan_id, 'Actualización de cuadro eléctrico', 'Modernización de cuadro eléctrico con magnetotérmicos de última generación', 
     'https://images.unsplash.com/photo-1613665813446-82a78c468a1d', 'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?w=300', 
     v_cat_reparaciones, 2, false);
  
  -- Portafolio de María
  INSERT INTO portafolios (proveedor_id, titulo, descripcion, url_imagen, url_miniatura, categoria_id, indice_orden, es_destacado)
  VALUES
    (v_maria_id, 'Limpieza profunda oficina corporativa', 'Limpieza completa de oficina de 500m²', 
     'https://images.unsplash.com/photo-1581578731548-c64695cc6952', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300', 
     v_cat_limpieza, 1, true),
    (v_maria_id, 'Limpieza post-construcción', 'Limpieza profunda después de remodelación', 
     'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50', 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=300', 
     v_cat_limpieza, 2, true);
  
  -- ============================================
  -- INSERTAR FAQs DE SERVICIOS
  -- ============================================
  RAISE NOTICE 'Insertando FAQs de servicios...';
  
  -- FAQs del servicio de electricidad
  INSERT INTO preguntas_frecuentes_servicios (servicio_id, pregunta, respuesta, indice_orden) VALUES
    (v_service1_id, '¿Incluye materiales?', 'Los materiales básicos están incluidos. Para materiales especiales se cotiza por separado.', 1),
    (v_service1_id, '¿Dan garantía?', 'Sí, todos los trabajos tienen garantía de 6 meses.', 2),
    (v_service1_id, '¿Atienden emergencias?', 'Sí, tenemos servicio de emergencias 24/7 con cargo adicional.', 3);
  
  -- FAQs del servicio de limpieza
  INSERT INTO preguntas_frecuentes_servicios (servicio_id, pregunta, respuesta, indice_orden) VALUES
    (v_service2_id, '¿Traen sus productos de limpieza?', 'Sí, llevamos todos los productos y equipo necesario.', 1),
    (v_service2_id, '¿Cuánto tiempo tardan?', 'Depende del tamaño del espacio, generalmente 3-4 horas para una casa estándar.', 2),
    (v_service2_id, '¿Trabajan fines de semana?', 'Sí, trabajamos de lunes a domingo.', 3);
  
  -- FAQs del servicio de plomería
  INSERT INTO preguntas_frecuentes_servicios (servicio_id, pregunta, respuesta, indice_orden) VALUES
    (v_service3_id, '¿El presupuesto tiene costo?', 'No, el presupuesto es gratuito.', 1),
    (v_service3_id, '¿Cómo cobran?', 'Depende del trabajo, puede ser por hora o por proyecto completo.', 2);
  
  -- FAQs del servicio de inglés
  INSERT INTO preguntas_frecuentes_servicios (servicio_id, pregunta, respuesta, indice_orden) VALUES
    (v_service4_id, '¿La primera clase es gratis?', 'Sí, la primera clase de 30 minutos es de prueba sin costo.', 1),
    (v_service4_id, '¿Qué plataforma usas?', 'Usamos Zoom o Google Meet, la que prefieras.', 2),
    (v_service4_id, '¿Tienes certificaciones?', 'Sí, cuento con certificación TEFL y Cambridge.', 3);
  
  -- ============================================
  -- INSERTAR CÓDIGOS PROMOCIONALES
  -- ============================================
  RAISE NOTICE 'Insertando códigos promocionales...';
  
  INSERT INTO codigos_promocionales (
    codigo, descripcion, tipo_descuento, valor_descuento, monto_descuento_maximo,
    usos_maximos, usos_maximos_por_usuario, monto_compra_minimo,
    valido_desde, valido_hasta, esta_activo, creado_por
  ) VALUES
    ('BIENVENIDA20', 'Descuento de bienvenida del 20% para nuevos usuarios', 'porcentaje', 20.00, 50.00,
     100, 1, 30.00,
     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '90 days', true, v_admin_id),
    ('LIMPIEZA10', 'Descuento de 10€ en servicios de limpieza', 'fijo', 10.00, null,
     50, 1, 50.00,
     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', true, v_admin_id),
    ('VERANO2026', 'Promoción de verano - 15% de descuento', 'porcentaje', 15.00, 30.00,
     200, 2, 20.00,
     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '120 days', true, v_admin_id);
  
  -- ============================================
  -- INSERTAR HISTORIAL DE BÚSQUEDAS
  -- ============================================
  RAISE NOTICE 'Insertando historial de búsquedas...';
  
  INSERT INTO historial_busquedas (usuario_id, termino_busqueda, categoria_id, ubicacion, conteo_resultados, servicio_clickeado_id, creado_en)
  VALUES
    (v_ana_id, 'electricista', v_cat_reparaciones, 'Madrid', 5, v_service1_id, CURRENT_TIMESTAMP - INTERVAL '7 days'),
    (v_ana_id, 'limpieza', v_cat_limpieza, 'Madrid', 8, v_service2_id, CURRENT_TIMESTAMP - INTERVAL '5 days'),
    (v_ana_id, 'clases inglés', v_cat_clases, 'Online', 12, v_service4_id, CURRENT_TIMESTAMP - INTERVAL '2 days'),
    (v_pedro_id, 'plomero urgente', v_cat_reparaciones, 'Barcelona', 6, v_service3_id, CURRENT_TIMESTAMP - INTERVAL '10 days'),
    (v_pedro_id, 'limpieza profunda', v_cat_limpieza, 'Barcelona', 9, v_service2_id, CURRENT_TIMESTAMP - INTERVAL '4 days');
  
  -- ============================================
  -- INSERTAR REPORTES (EJEMPLO)
  -- ============================================
  RAISE NOTICE 'Insertando reporte de ejemplo...';
  
  INSERT INTO reportes (
    reportador_id, usuario_reportado_id, tipo_reporte, descripcion,
    estado, creado_en
  ) VALUES (
    v_pedro_id, v_juan_id, 'otro', 'El proveedor canceló el servicio en el último momento sin previo aviso.',
    'resuelto', CURRENT_TIMESTAMP - INTERVAL '20 days'
  );
  
  -- ============================================
  -- ACTUALIZAR CONTADORES
  -- ============================================
  RAISE NOTICE 'Actualizando contadores...';
  
  -- Actualizar contador de servicios en categorías
  UPDATE categorias SET conteo_servicios = (
    SELECT COUNT(*) FROM servicios WHERE categoria_id = categorias.id AND esta_activo = true
  );
  
  -- Actualizar contador de servicios totales en usuarios proveedores
  UPDATE usuarios SET total_servicios = (
    SELECT COUNT(*) FROM servicios WHERE proveedor_id = usuarios.id AND esta_activo = true
  );
  
  RAISE NOTICE 'Datos de prueba insertados correctamente!';
  
END $$;

-- ============================================
-- VERIFICACIÓN DE DATOS
-- ============================================

-- Contar registros insertados
SELECT 'Usuarios' as tabla, COUNT(*) as registros FROM usuarios
UNION ALL
SELECT 'Direcciones', COUNT(*) FROM direcciones_usuarios
UNION ALL
SELECT 'Categorías', COUNT(*) FROM categorias
UNION ALL
SELECT 'Servicios', COUNT(*) FROM servicios
UNION ALL
SELECT 'Imágenes de servicios', COUNT(*) FROM imagenes_servicios
UNION ALL
SELECT 'Disponibilidad', COUNT(*) FROM disponibilidad_servicios
UNION ALL
SELECT 'Reseñas', COUNT(*) FROM resenas
UNION ALL
SELECT 'Conversaciones', COUNT(*) FROM conversaciones
UNION ALL
SELECT 'Mensajes', COUNT(*) FROM mensajes
UNION ALL
SELECT 'Favoritos', COUNT(*) FROM favoritos
UNION ALL
SELECT 'Notificaciones', COUNT(*) FROM notificaciones
UNION ALL
SELECT 'Etiquetas', COUNT(*) FROM etiquetas
UNION ALL
SELECT 'Seguidores', COUNT(*) FROM seguidores_usuarios
UNION ALL
SELECT 'Portafolio', COUNT(*) FROM portafolios
UNION ALL
SELECT 'FAQs', COUNT(*) FROM preguntas_frecuentes_servicios
UNION ALL
SELECT 'Códigos Promocionales', COUNT(*) FROM codigos_promocionales
UNION ALL
SELECT 'Historial búsquedas', COUNT(*) FROM historial_busquedas
UNION ALL
SELECT 'Reportes', COUNT(*) FROM reportes;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
-- ============================================
-- TRIGGER: Actualizar estadísticas de respuesta del usuario
-- Calcula tiempo_respuesta_minutos y porcentaje_respuesta
-- Se ejecuta cada vez que se inserta un mensaje nuevo
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
    -- Se considera el tiempo entre el último mensaje recibido y la respuesta del usuario
    SELECT COALESCE(AVG(tiempo_respuesta_min), 0)
    INTO v_promedio_tiempo
    FROM (
        SELECT 
            EXTRACT(EPOCH FROM (m2.creado_en - m1.creado_en)) / 60 as tiempo_respuesta_min
        FROM mensajes m1
        INNER JOIN mensajes m2 ON m1.conversacion_id = m2.conversacion_id
        INNER JOIN conversaciones c ON m1.conversacion_id = c.id
        WHERE 
            -- m1 es el mensaje recibido (no enviado por el usuario)
            m1.remitente_id != NEW.remitente_id
            -- m2 es la respuesta del usuario
            AND m2.remitente_id = NEW.remitente_id
            -- La respuesta es posterior al mensaje recibido
            AND m2.creado_en > m1.creado_en
            -- El usuario es participante de la conversación
            AND (c.participante_1_id = NEW.remitente_id OR c.participante_2_id = NEW.remitente_id)
            -- No contar mensajes eliminados
            AND m1.esta_eliminado = false
            AND m2.esta_eliminado = false
            -- Solo considerar la primera respuesta después de cada mensaje
            AND NOT EXISTS (
                SELECT 1 FROM mensajes m3 
                WHERE m3.conversacion_id = m1.conversacion_id 
                    AND m3.remitente_id = NEW.remitente_id
                    AND m3.creado_en > m1.creado_en 
                    AND m3.creado_en < m2.creado_en
                    AND m3.esta_eliminado = false
            )
    ) AS tiempos;

    -- Contar total de conversaciones donde el usuario ha recibido al menos un mensaje
    SELECT COUNT(DISTINCT c.id)
    INTO v_total_conversaciones
    FROM conversaciones c
    INNER JOIN mensajes m ON c.id = m.conversacion_id
    WHERE (c.participante_1_id = NEW.remitente_id OR c.participante_2_id = NEW.remitente_id)
        AND m.remitente_id != NEW.remitente_id
        AND m.esta_eliminado = false;

    -- Contar conversaciones donde el usuario ha respondido
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

    -- Calcular porcentaje de respuesta
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

-- Crear trigger que se ejecuta después de insertar un mensaje
DROP TRIGGER IF EXISTS trigger_actualizar_estadisticas_respuesta ON mensajes;

CREATE TRIGGER trigger_actualizar_estadisticas_respuesta
AFTER INSERT ON mensajes
FOR EACH ROW
EXECUTE FUNCTION actualizar_estadisticas_respuesta_usuario();

-- Comentario explicativo
COMMENT ON FUNCTION actualizar_estadisticas_respuesta_usuario() IS 
'Calcula y actualiza las estadísticas de tiempo de respuesta y porcentaje de respuesta del usuario.
- tiempo_respuesta_minutos: Promedio de minutos que tarda el usuario en responder mensajes.
- porcentaje_respuesta: Porcentaje de conversaciones donde el usuario ha respondido.';
