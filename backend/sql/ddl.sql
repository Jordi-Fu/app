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

