-- ============================================
-- DATOS DE PRUEBA - SEED DATA
-- ============================================
-- Script unificado con todos los datos de prueba
-- Ejecutar DESPUÉS de 01_ddl_database.sql
-- ============================================

-- ============================================
-- CONFIGURACIONES INICIALES DE LA APP
-- ============================================

INSERT INTO configuracion_app (clave, valor, tipo_dato, descripcion, es_publico) VALUES
('porcentaje_comision_plataforma', '15', 'number', 'Porcentaje de comisión de la plataforma', false),
('precio_servicio_minimo', '10', 'number', 'Precio mínimo de servicio', true),
('precio_servicio_maximo', '10000', 'number', 'Precio máximo de servicio', true),
('horas_cancelacion_reserva', '24', 'number', 'Horas antes para cancelar sin penalización', true),
('nombre_app', 'AplicacionServicios', 'string', 'Nombre de la aplicación', true),
('email_soporte', 'soporte@aplicacionservicios.com', 'string', 'Email de soporte', true),
('moneda_predeterminada', '€', 'string', 'Moneda por defecto', true),
('idioma_predeterminado', 'es', 'string', 'Idioma por defecto', true);

-- ============================================
-- CATEGORÍAS PRINCIPALES
-- ============================================

INSERT INTO categorias (nombre, slug, descripcion, url_icono, color, esta_activo, indice_orden) VALUES
-- Categorías principales
('Hogar y Mantenimiento', 'hogar-mantenimiento', 'Servicios de mantenimiento y reparación para el hogar', '🔧', '#3B82F6', true, 1),
('Construcción y Remodelación', 'construccion-remodelacion', 'Servicios de construcción, remodelaciones y obras', '🏗️', '#F59E0B', true, 2),
('Limpieza y Aseo', 'limpieza-aseo', 'Servicios de limpieza doméstica y lavandería', '🧹', '#10B981', true, 3),
('Jardinería y Exteriores', 'jardineria-exteriores', 'Servicios de jardinería y mantenimiento de áreas verdes', '🌿', '#22C55E', true, 4),
('Servicios de Emergencia', 'servicios-emergencia', 'Servicios urgentes de cerrajería y gas', '🚨', '#EF4444', true, 5),
('Tecnología y Soporte Técnico', 'tecnologia-soporte', 'Reparación de dispositivos y soporte técnico', '💻', '#8B5CF6', true, 6),
('Transporte y Mensajería', 'transporte-mensajeria', 'Servicios de transporte privado y mensajería', '🚗', '#06B6D4', true, 7),
('Alimentación y Delivery', 'alimentacion-delivery', 'Servicios de comida a domicilio', '🍳', '#F97316', true, 8),
('Cuidado Personal y Estética', 'cuidado-personal-estetica', 'Servicios de belleza y cuidado personal', '💅', '#EC4899', true, 9),
('Salud y Cuidado Familiar', 'salud-cuidado-familiar', 'Cuidado de adultos mayores y niños', '❤️', '#F43F5E', true, 10),
('Educación y Enseñanza', 'educacion-ensenanza', 'Clases particulares, tutorías y capacitación', '📚', '#6366F1', true, 11),
('Seguridad y Control de Plagas', 'seguridad-control-plagas', 'Servicios de fumigación y control de plagas', '🛡️', '#64748B', true, 12);

-- ============================================
-- SUBCATEGORÍAS
-- ============================================

-- Subcategorías de Hogar y Mantenimiento
INSERT INTO categorias (nombre, slug, descripcion, url_icono, color, padre_id, esta_activo, indice_orden)
SELECT 'Plomería', 'plomeria', 'Reparación e instalación de tuberías y sanitarios', '', '#3B82F6', id, true, 1
FROM categorias WHERE slug = 'hogar-mantenimiento';

INSERT INTO categorias (nombre, slug, descripcion, url_icono, color, padre_id, esta_activo, indice_orden)
SELECT 'Electricidad', 'electricidad', 'Instalaciones y reparaciones eléctricas', '', '#3B82F6', id, true, 2
FROM categorias WHERE slug = 'hogar-mantenimiento';

INSERT INTO categorias (nombre, slug, descripcion, url_icono, color, padre_id, esta_activo, indice_orden)
SELECT 'Albañilería', 'albanileria', 'Trabajos de albañilería y construcción menor', '', '#3B82F6', id, true, 3
FROM categorias WHERE slug = 'hogar-mantenimiento';

INSERT INTO categorias (nombre, slug, descripcion, url_icono, color, padre_id, esta_activo, indice_orden)
SELECT 'Pintura', 'pintura', 'Servicios de pintura interior y exterior', '', '#3B82F6', id, true, 4
FROM categorias WHERE slug = 'hogar-mantenimiento';

INSERT INTO categorias (nombre, slug, descripcion, url_icono, color, padre_id, esta_activo, indice_orden)
SELECT 'Carpintería', 'carpinteria', 'Trabajos en madera y muebles', '', '#3B82F6', id, true, 5
FROM categorias WHERE slug = 'hogar-mantenimiento';

-- Subcategorías de Construcción y Remodelación
INSERT INTO categorias (nombre, slug, descripcion, url_icono, color, padre_id, esta_activo, indice_orden)
SELECT 'Remodelaciones', 'remodelaciones', 'Remodelación integral de espacios', '', '#F59E0B', id, true, 1
FROM categorias WHERE slug = 'construccion-remodelacion';

INSERT INTO categorias (nombre, slug, descripcion, url_icono, color, padre_id, esta_activo, indice_orden)
SELECT 'Reparaciones estructurales', 'reparaciones-estructurales', 'Reparaciones de estructura y cimientos', '', '#F59E0B', id, true, 2
FROM categorias WHERE slug = 'construccion-remodelacion';

-- Subcategorías de Limpieza y Aseo
INSERT INTO categorias (nombre, slug, descripcion, url_icono, color, padre_id, esta_activo, indice_orden)
SELECT 'Limpieza doméstica', 'limpieza-domestica', 'Limpieza general del hogar', '', '#10B981', id, true, 1
FROM categorias WHERE slug = 'limpieza-aseo';

INSERT INTO categorias (nombre, slug, descripcion, url_icono, color, padre_id, esta_activo, indice_orden)
SELECT 'Lavandería y planchado', 'lavanderia-planchado', 'Servicios de lavandería y planchado de ropa', '', '#10B981', id, true, 2
FROM categorias WHERE slug = 'limpieza-aseo';

-- Subcategorías de Jardinería y Exteriores
INSERT INTO categorias (nombre, slug, descripcion, url_icono, color, padre_id, esta_activo, indice_orden)
SELECT 'Jardinería', 'jardineria', 'Diseño y cuidado de jardines', '', '#22C55E', id, true, 1
FROM categorias WHERE slug = 'jardineria-exteriores';

INSERT INTO categorias (nombre, slug, descripcion, url_icono, color, padre_id, esta_activo, indice_orden)
SELECT 'Mantenimiento de áreas verdes', 'mantenimiento-areas-verdes', 'Mantenimiento de césped y áreas verdes', '', '#22C55E', id, true, 2
FROM categorias WHERE slug = 'jardineria-exteriores';

-- Subcategorías de Servicios de Emergencia
INSERT INTO categorias (nombre, slug, descripcion, url_icono, color, padre_id, esta_activo, indice_orden)
SELECT 'Cerrajería', 'cerrajeria', 'Apertura de cerraduras y cambio de llaves', '', '#EF4444', id, true, 1
FROM categorias WHERE slug = 'servicios-emergencia';

INSERT INTO categorias (nombre, slug, descripcion, url_icono, color, padre_id, esta_activo, indice_orden)
SELECT 'Servicio de gas', 'servicio-gas', 'Reparación e instalación de gas', '', '#EF4444', id, true, 2
FROM categorias WHERE slug = 'servicios-emergencia';

-- Subcategorías de Tecnología y Soporte Técnico
INSERT INTO categorias (nombre, slug, descripcion, url_icono, color, padre_id, esta_activo, indice_orden)
SELECT 'Reparación de celulares', 'reparacion-celulares', 'Reparación de teléfonos móviles', '', '#8B5CF6', id, true, 1
FROM categorias WHERE slug = 'tecnologia-soporte';

INSERT INTO categorias (nombre, slug, descripcion, url_icono, color, padre_id, esta_activo, indice_orden)
SELECT 'Soporte técnico básico', 'soporte-tecnico-basico', 'Soporte técnico para computadoras', '', '#8B5CF6', id, true, 2
FROM categorias WHERE slug = 'tecnologia-soporte';

INSERT INTO categorias (nombre, slug, descripcion, url_icono, color, padre_id, esta_activo, indice_orden)
SELECT 'Reparación de electrodomésticos', 'reparacion-electrodomesticos', 'Reparación de electrodomésticos del hogar', '', '#8B5CF6', id, true, 3
FROM categorias WHERE slug = 'tecnologia-soporte';

-- Subcategorías de Transporte y Mensajería
INSERT INTO categorias (nombre, slug, descripcion, url_icono, color, padre_id, esta_activo, indice_orden)
SELECT 'Transporte privado', 'transporte-privado', 'Servicio de transporte privado de personas', '', '#06B6D4', id, true, 1
FROM categorias WHERE slug = 'transporte-mensajeria';

INSERT INTO categorias (nombre, slug, descripcion, url_icono, color, padre_id, esta_activo, indice_orden)
SELECT 'Mensajería y mandados', 'mensajeria-mandados', 'Servicio de mensajería y mandados', '', '#06B6D4', id, true, 2
FROM categorias WHERE slug = 'transporte-mensajeria';

-- Subcategoría de Alimentación y Delivery
INSERT INTO categorias (nombre, slug, descripcion, url_icono, color, padre_id, esta_activo, indice_orden)
SELECT 'Servicio de comida a domicilio', 'comida-domicilio', 'Preparación y entrega de comida a domicilio', '', '#F97316', id, true, 1
FROM categorias WHERE slug = 'alimentacion-delivery';

-- Subcategorías de Cuidado Personal y Estética
INSERT INTO categorias (nombre, slug, descripcion, url_icono, color, padre_id, esta_activo, indice_orden)
SELECT 'Estética', 'estetica', 'Servicios de estética y belleza', '', '#EC4899', id, true, 1
FROM categorias WHERE slug = 'cuidado-personal-estetica';

INSERT INTO categorias (nombre, slug, descripcion, url_icono, color, padre_id, esta_activo, indice_orden)
SELECT 'Peluquería', 'peluqueria', 'Corte, peinado y tratamientos capilares', '', '#EC4899', id, true, 2
FROM categorias WHERE slug = 'cuidado-personal-estetica';

-- Subcategorías de Salud y Cuidado Familiar
INSERT INTO categorias (nombre, slug, descripcion, url_icono, color, padre_id, esta_activo, indice_orden)
SELECT 'Cuidado de adultos mayores', 'cuidado-adultos-mayores', 'Cuidado y acompañamiento de personas mayores', '', '#F43F5E', id, true, 1
FROM categorias WHERE slug = 'salud-cuidado-familiar';

INSERT INTO categorias (nombre, slug, descripcion, url_icono, color, padre_id, esta_activo, indice_orden)
SELECT 'Cuidado de niños (niñeras)', 'cuidado-ninos', 'Servicios de niñera y cuidado infantil', '', '#F43F5E', id, true, 2
FROM categorias WHERE slug = 'salud-cuidado-familiar';

-- Subcategorías de Educación y Enseñanza
INSERT INTO categorias (nombre, slug, descripcion, url_icono, color, padre_id, esta_activo, indice_orden)
SELECT 'Clases particulares', 'clases-particulares', 'Clases particulares de diversas materias', '', '#6366F1', id, true, 1
FROM categorias WHERE slug = 'educacion-ensenanza';

INSERT INTO categorias (nombre, slug, descripcion, url_icono, color, padre_id, esta_activo, indice_orden)
SELECT 'Tutorías académicas', 'tutorias-academicas', 'Tutorías y asesorías académicas', '', '#6366F1', id, true, 2
FROM categorias WHERE slug = 'educacion-ensenanza';

INSERT INTO categorias (nombre, slug, descripcion, url_icono, color, padre_id, esta_activo, indice_orden)
SELECT 'Enseñanza de idiomas', 'ensenanza-idiomas', 'Clases de idiomas extranjeros', '', '#6366F1', id, true, 3
FROM categorias WHERE slug = 'educacion-ensenanza';

INSERT INTO categorias (nombre, slug, descripcion, url_icono, color, padre_id, esta_activo, indice_orden)
SELECT 'Apoyo escolar', 'apoyo-escolar', 'Ayuda con tareas y estudios escolares', '', '#6366F1', id, true, 4
FROM categorias WHERE slug = 'educacion-ensenanza';

INSERT INTO categorias (nombre, slug, descripcion, url_icono, color, padre_id, esta_activo, indice_orden)
SELECT 'Capacitación técnica', 'capacitacion-tecnica', 'Capacitación en habilidades técnicas y oficios', '', '#6366F1', id, true, 5
FROM categorias WHERE slug = 'educacion-ensenanza';

-- Subcategoría de Seguridad y Control de Plagas
INSERT INTO categorias (nombre, slug, descripcion, url_icono, color, padre_id, esta_activo, indice_orden)
SELECT 'Fumigación', 'fumigacion', 'Servicios de fumigación y control de plagas', '', '#64748B', id, true, 1
FROM categorias WHERE slug = 'seguridad-control-plagas';


-- ============================================
-- USUARIO ADMINISTRADOR
-- ============================================

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
  false,
  4.95,
  125,
  'es',
  'Europe/Madrid',
  '€',
  true,
  true,
  false,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);


-- ============================================
-- BLOQUE PRINCIPAL DE DATOS DE PRUEBA
-- ============================================

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
  
  -- Variables para almacenar IDs de categorías principales
  v_cat_hogar UUID;
  v_cat_construccion UUID;
  v_cat_limpieza UUID;
  v_cat_jardineria UUID;
  v_cat_emergencia UUID;
  v_cat_tecnologia UUID;
  v_cat_transporte UUID;
  v_cat_alimentacion UUID;
  v_cat_estetica UUID;
  v_cat_salud UUID;
  v_cat_educacion UUID;
  v_cat_seguridad UUID;
  -- Variables para subcategorías más usadas
  v_subcat_electricidad UUID;
  v_subcat_plomeria UUID;
  v_subcat_limpieza_domestica UUID;
  v_subcat_clases UUID;
  
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
  -- OBTENER ID DE ADMIN
  -- ============================================
  SELECT id INTO v_admin_id FROM usuarios WHERE usuario = 'admin';
  
  -- ============================================
  -- CREAR USUARIOS DE PRUEBA
  -- ============================================
  RAISE NOTICE 'Creando usuarios de prueba...';
  
  -- Juan - Electricista
  INSERT INTO usuarios (
    correo, hash_password, usuario, nombre, apellido, telefono, codigo_pais,
    url_avatar, biografia, fecha_nacimiento, esta_verificado, esta_activo,
    promedio_calificacion, total_resenas, idioma, zona_horaria, moneda
  ) VALUES
    ('juan@email.com', '$2b$10$gFWmCnZci9Lu0sIynwsp9.y0yRcAzZDdepskPdcfuZpOgtaiiE3Ty', 
     'juan_electricista', 'Juan', 'Martínez', '34666111222', '+34',
     'https://ui-avatars.com/api/?name=Juan&background=FF9800&color=fff&size=200',
     'Electricista profesional con 10 años de experiencia', '1985-03-15', true, true, 4.8, 45, 'es', 'Europe/Madrid', '€')
  ON CONFLICT (usuario) DO NOTHING;
  
  -- María - Limpieza
  INSERT INTO usuarios (
    correo, hash_password, usuario, nombre, apellido, telefono, codigo_pais,
    url_avatar, biografia, fecha_nacimiento, esta_verificado, esta_activo,
    promedio_calificacion, total_resenas, idioma, zona_horaria, moneda
  ) VALUES
    ('maria@email.com', '$2b$10$gFWmCnZci9Lu0sIynwsp9.y0yRcAzZDdepskPdcfuZpOgtaiiE3Ty', 
     'maria_limpieza', 'María', 'García', '34666222333', '+34',
     'https://ui-avatars.com/api/?name=Maria&background=4CAF50&color=fff&size=200',
     'Servicio profesional de limpieza con productos ecológicos', '1990-07-22', true, true, 4.9, 78, 'es', 'Europe/Madrid', '€')
  ON CONFLICT (usuario) DO NOTHING;
  
  -- Carlos - Plomero
  INSERT INTO usuarios (
    correo, hash_password, usuario, nombre, apellido, telefono, codigo_pais,
    url_avatar, biografia, fecha_nacimiento, esta_verificado, esta_activo,
    promedio_calificacion, total_resenas, idioma, zona_horaria, moneda
  ) VALUES
    ('carlos@email.com', '$2b$10$gFWmCnZci9Lu0sIynwsp9.y0yRcAzZDdepskPdcfuZpOgtaiiE3Ty', 
     'carlos_plomero', 'Carlos', 'López', '34666333444', '+34',
     'https://ui-avatars.com/api/?name=Carlos&background=2196F3&color=fff&size=200',
     'Plomero certificado - Emergencias 24/7', '1988-11-10', true, true, 4.7, 92, 'es', 'Europe/Madrid', '€')
  ON CONFLICT (usuario) DO NOTHING;
  
  -- Ana - Cliente
  INSERT INTO usuarios (
    correo, hash_password, usuario, nombre, apellido, telefono, codigo_pais,
    url_avatar, biografia, fecha_nacimiento, esta_verificado, esta_activo,
    idioma, zona_horaria, moneda
  ) VALUES
    ('ana@email.com', '$2b$10$gFWmCnZci9Lu0sIynwsp9.y0yRcAzZDdepskPdcfuZpOgtaiiE3Ty', 
     'ana_cliente', 'Ana', 'Rodríguez', '34666444555', '+34',
     'https://ui-avatars.com/api/?name=Ana&background=E91E63&color=fff&size=200',
     'Cliente activa de la plataforma', '1992-05-18', true, true, 'es', 'Europe/Madrid', '€')
  ON CONFLICT (usuario) DO NOTHING;
  
  -- Pedro - Cliente
  INSERT INTO usuarios (
    correo, hash_password, usuario, nombre, apellido, telefono, codigo_pais,
    url_avatar, biografia, fecha_nacimiento, esta_verificado, esta_activo,
    idioma, zona_horaria, moneda
  ) VALUES
    ('pedro@email.com', '$2b$10$gFWmCnZci9Lu0sIynwsp9.y0yRcAzZDdepskPdcfuZpOgtaiiE3Ty', 
     'pedro_cliente', 'Pedro', 'Fernández', '34666555666', '+34',
     'https://ui-avatars.com/api/?name=Pedro&background=9C27B0&color=fff&size=200',
     'Buscando servicios de calidad', '1987-09-25', true, true, 'es', 'Europe/Madrid', '€')
  ON CONFLICT (usuario) DO NOTHING;
  
  -- Sofía - Profesora
  INSERT INTO usuarios (
    correo, hash_password, usuario, nombre, apellido, telefono, codigo_pais,
    url_avatar, biografia, fecha_nacimiento, esta_verificado, esta_activo,
    promedio_calificacion, total_resenas, idioma, zona_horaria, moneda
  ) VALUES
    ('sofia@email.com', '$2b$10$gFWmCnZci9Lu0sIynwsp9.y0yRcAzZDdepskPdcfuZpOgtaiiE3Ty', 
     'sofia_profesional', 'Sofía', 'Torres', '34666777888', '+34',
     'https://ui-avatars.com/api/?name=Sofia&background=00BCD4&color=fff&size=200',
     'Profesora certificada de inglés y matemáticas', '1991-12-08', true, true, 4.85, 34, 'es', 'Europe/Madrid', '€')
  ON CONFLICT (usuario) DO NOTHING;
  
  -- Obtener IDs de usuarios
  SELECT id INTO v_juan_id FROM usuarios WHERE usuario = 'juan_electricista';
  SELECT id INTO v_maria_id FROM usuarios WHERE usuario = 'maria_limpieza';
  SELECT id INTO v_carlos_id FROM usuarios WHERE usuario = 'carlos_plomero';
  SELECT id INTO v_ana_id FROM usuarios WHERE usuario = 'ana_cliente';
  SELECT id INTO v_pedro_id FROM usuarios WHERE usuario = 'pedro_cliente';
  SELECT id INTO v_sofia_id FROM usuarios WHERE usuario = 'sofia_profesional';
  
  -- ============================================
  -- OBTENER IDs DE CATEGORÍAS PRINCIPALES
  -- ============================================
  SELECT id INTO v_cat_hogar FROM categorias WHERE slug = 'hogar-mantenimiento';
  SELECT id INTO v_cat_construccion FROM categorias WHERE slug = 'construccion-remodelacion';
  SELECT id INTO v_cat_limpieza FROM categorias WHERE slug = 'limpieza-aseo';
  SELECT id INTO v_cat_jardineria FROM categorias WHERE slug = 'jardineria-exteriores';
  SELECT id INTO v_cat_emergencia FROM categorias WHERE slug = 'servicios-emergencia';
  SELECT id INTO v_cat_tecnologia FROM categorias WHERE slug = 'tecnologia-soporte';
  SELECT id INTO v_cat_transporte FROM categorias WHERE slug = 'transporte-mensajeria';
  SELECT id INTO v_cat_alimentacion FROM categorias WHERE slug = 'alimentacion-delivery';
  SELECT id INTO v_cat_estetica FROM categorias WHERE slug = 'cuidado-personal-estetica';
  SELECT id INTO v_cat_salud FROM categorias WHERE slug = 'salud-cuidado-familiar';
  SELECT id INTO v_cat_educacion FROM categorias WHERE slug = 'educacion-ensenanza';
  SELECT id INTO v_cat_seguridad FROM categorias WHERE slug = 'seguridad-control-plagas';
  -- Obtener IDs de subcategorías más usadas
  SELECT id INTO v_subcat_electricidad FROM categorias WHERE slug = 'electricidad';
  SELECT id INTO v_subcat_plomeria FROM categorias WHERE slug = 'plomeria';
  SELECT id INTO v_subcat_limpieza_domestica FROM categorias WHERE slug = 'limpieza-domestica';
  SELECT id INTO v_subcat_clases FROM categorias WHERE slug = 'clases-particulares';
  
  -- ============================================
  -- DIRECCIONES DE USUARIOS
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
  -- SERVICIOS
  -- ============================================
  RAISE NOTICE 'Insertando servicios...';
  
  -- Servicio 1: Instalación eléctrica por Juan (subcategoría Electricidad)
  INSERT INTO servicios (
    proveedor_id, categoria_id, titulo, descripcion,
    tipo_precio, precio, moneda,
    tipo_ubicacion, ciudad, estado, pais, latitud, longitud,
    esta_activo, es_destacado, vistas, promedio_calificacion, total_resenas
  ) VALUES (
    v_juan_id, v_subcat_electricidad,
    'Instalación y Reparación Eléctrica Residencial',
    'Servicio profesional de electricidad para tu hogar. Incluye: instalación de contactos, apagadores, lámparas, ventiladores de techo, reparación de cortocircuitos, actualización de tableros eléctricos, instalación de timbres y porteros eléctricos. Trabajo garantizado y materiales de primera calidad. Atención 24/7 para emergencias.',
    'por_hora', 35.00, '€',
    'domicilio_cliente', 'Madrid', 'Madrid', 'España', 40.4168, -3.7038,
    true, true, 245, 4.8, 45
  ) RETURNING id INTO v_service1_id;
  
  -- Servicio 2: Limpieza profunda por María (subcategoría Limpieza doméstica)
  INSERT INTO servicios (
    proveedor_id, categoria_id, titulo, descripcion,
    tipo_precio, precio, moneda,
    tipo_ubicacion, ciudad, estado, pais, latitud, longitud,
    esta_activo, es_destacado, vistas, promedio_calificacion, total_resenas
  ) VALUES (
    v_maria_id, v_subcat_limpieza_domestica,
    'Limpieza Profunda de Hogar y Oficina',
    'Servicio completo de limpieza profesional. Incluye: barrido y fregado de suelos, limpieza de baños y cocina, desempolvado de muebles, limpieza de ventanas, aspirado de alfombras. Llevamos nuestros propios productos de limpieza ecológicos. Personal capacitado y confiable. Disponible fines de semana.',
    'fijo', 80.00, '€',
    'domicilio_cliente', 'Barcelona', 'Barcelona', 'España', 41.3851, 2.1734,
    true, true, 387, 4.9, 78
  ) RETURNING id INTO v_service2_id;
  
  -- Servicio 3: Plomería por Carlos (subcategoría Plomería)
  INSERT INTO servicios (
    proveedor_id, categoria_id, titulo, descripcion,
    tipo_precio, precio, moneda,
    tipo_ubicacion, ciudad, estado, pais, latitud, longitud,
    esta_activo, vistas, promedio_calificacion, total_resenas
  ) VALUES (
    v_carlos_id, v_subcat_plomeria,
    'Plomería Residencial y Comercial',
    'Servicios completos de plomería: reparación de fugas, desatasco de tuberías, instalación de grifos y sanitarios, reparación de calentadores, instalación de depósitos, mantenimiento preventivo. Servicio de emergencia disponible. Presupuesto sin compromiso.',
    'por_hora', 40.00, '€',
    'domicilio_cliente', 'Barcelona', 'Barcelona', 'España', 41.3887, 2.1590,
    true, 198, 4.7, 92
  ) RETURNING id INTO v_service3_id;
  
  -- Servicio 4: Clases de inglés por Sofía (subcategoría Enseñanza de idiomas)
  INSERT INTO servicios (
    proveedor_id, categoria_id, titulo, descripcion,
    tipo_precio, precio, moneda,
    tipo_ubicacion, ciudad, estado, pais, latitud, longitud,
    esta_activo, es_destacado, vistas, promedio_calificacion, total_resenas
  ) VALUES (
    v_sofia_id, v_subcat_clases,
    'Clases Particulares de Inglés Online',
    'Clases personalizadas de inglés para todos los niveles (A1-C2). Preparación para exámenes TOEFL, IELTS, Cambridge. Conversación, gramática, escritura. Material didáctico incluido. Horarios flexibles. Primera clase de prueba gratis. Metodología comunicativa y dinámica.',
    'por_hora', 25.00, '€',
    'remoto', 'Valencia', 'Valencia', 'España', 39.4699, -0.3763,
    true, true, 156, 4.85, 34
  ) RETURNING id INTO v_service4_id;
  
  -- Servicio 5: Clases de matemáticas por Sofía (subcategoría Clases particulares)
  INSERT INTO servicios (
    proveedor_id, categoria_id, titulo, descripcion,
    tipo_precio, precio, moneda,
    tipo_ubicacion, ciudad, estado, pais,
    esta_activo, vistas
  ) VALUES (
    v_sofia_id, v_subcat_clases,
    'Asesorías de Matemáticas - Todos los Niveles',
    'Asesorías personalizadas de matemáticas: primaria, secundaria, bachillerato y universidad. Álgebra, cálculo, geometría, trigonometría, estadística. Explicaciones claras y pacientes. Resolución de ejercicios paso a paso. Material de apoyo incluido.',
    'por_hora', 28.00, '€',
    'flexible', 'Valencia', 'Valencia', 'España',
    true, 89
  ) RETURNING id INTO v_service5_id;
  
  -- Servicio 6: Mantenimiento por Juan (subcategoría Electricidad)
  INSERT INTO servicios (
    proveedor_id, categoria_id, titulo, descripcion,
    tipo_precio, precio, moneda,
    tipo_ubicacion, ciudad, estado, pais,
    esta_activo, vistas
  ) VALUES (
    v_juan_id, v_subcat_electricidad,
    'Mantenimiento Preventivo Eléctrico',
    'Servicio de mantenimiento preventivo para tu instalación eléctrica. Incluye: revisión de cuadro eléctrico, verificación de conexiones, prueba de circuitos, informe de condiciones. Previene accidentes y ahorra energía.',
    'fijo', 120.00, '€',
    'domicilio_cliente', 'Madrid', 'Madrid', 'España',
    true, 67
  ) RETURNING id INTO v_service6_id;
  
  -- ============================================
  -- IMÁGENES DE SERVICIOS
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
  -- DISPONIBILIDAD DE SERVICIOS
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
  -- EXCEPCIONES DE DISPONIBILIDAD
  -- ============================================
  RAISE NOTICE 'Insertando excepciones de disponibilidad...';
  
  INSERT INTO excepciones_servicios (servicio_id, fecha_excepcion, esta_disponible, motivo)
  VALUES
    (v_service1_id, '2026-01-01', false, 'Día festivo - Año Nuevo'),
    (v_service6_id, '2026-01-01', false, 'Día festivo - Año Nuevo'),
    (v_service2_id, '2025-12-25', false, 'Navidad');
  
  -- ============================================
  -- RESEÑAS
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
  -- ETIQUETAS (TAGS)
  -- ============================================
  RAISE NOTICE 'Insertando etiquetas...';
  
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
  -- RELACIÓN SERVICIOS-ETIQUETAS
  -- ============================================
  RAISE NOTICE 'Insertando relación servicios-etiquetas...';
  
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
  -- CONVERSACIONES
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
    CURRENT_TIMESTAMP - INTERVAL '2 hours',
    v_pedro_id, 0, 1
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
  -- MENSAJES
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
  
  -- Mensajes de la conversación Pedro-María
  INSERT INTO mensajes (conversacion_id, remitente_id, tipo_mensaje, contenido, esta_leido, leido_en, creado_en)
  SELECT id, v_pedro_id, 'texto', 'Hola María, necesito limpieza profunda de mi departamento. ¿Cuándo puedes?', true,
    CURRENT_TIMESTAMP - INTERVAL '4 hours', CURRENT_TIMESTAMP - INTERVAL '4 hours'
  FROM conversaciones WHERE participante_1_id = v_pedro_id AND participante_2_id = v_maria_id;
  
  INSERT INTO mensajes (conversacion_id, remitente_id, tipo_mensaje, contenido, esta_leido, leido_en, creado_en)
  SELECT id, v_maria_id, 'texto', 'Hola Pedro, ¿qué tal el sábado a las 9am?', true,
    CURRENT_TIMESTAMP - INTERVAL '3 hours', CURRENT_TIMESTAMP - INTERVAL '3 hours'
  FROM conversaciones WHERE participante_1_id = v_pedro_id AND participante_2_id = v_maria_id;
  
  INSERT INTO mensajes (conversacion_id, remitente_id, tipo_mensaje, contenido, esta_leido, leido_en, creado_en)
  SELECT id, v_pedro_id, 'texto', 'Claro que sí, el sábado a las 9am está perfecto.', false, null,
    CURRENT_TIMESTAMP - INTERVAL '2 hours'
  FROM conversaciones WHERE participante_1_id = v_pedro_id AND participante_2_id = v_maria_id;
  
  -- ============================================
  -- FAVORITOS
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
  -- NOTIFICACIONES
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
  -- SEGUIDORES
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
  -- FAQs DE SERVICIOS
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
  -- CÓDIGOS PROMOCIONALES
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
  -- HISTORIAL DE BÚSQUEDAS
  -- ============================================
  RAISE NOTICE 'Insertando historial de búsquedas...';
  
  INSERT INTO historial_busquedas (usuario_id, termino_busqueda, categoria_id, ubicacion, conteo_resultados, servicio_clickeado_id, creado_en)
  VALUES
    (v_ana_id, 'electricista', v_subcat_electricidad, 'Madrid', 5, v_service1_id, CURRENT_TIMESTAMP - INTERVAL '7 days'),
    (v_ana_id, 'limpieza', v_subcat_limpieza_domestica, 'Madrid', 8, v_service2_id, CURRENT_TIMESTAMP - INTERVAL '5 days'),
    (v_ana_id, 'clases inglés', v_subcat_clases, 'Online', 12, v_service4_id, CURRENT_TIMESTAMP - INTERVAL '2 days'),
    (v_pedro_id, 'plomero urgente', v_subcat_plomeria, 'Barcelona', 6, v_service3_id, CURRENT_TIMESTAMP - INTERVAL '10 days'),
    (v_pedro_id, 'limpieza profunda', v_subcat_limpieza_domestica, 'Barcelona', 9, v_service2_id, CURRENT_TIMESTAMP - INTERVAL '4 days');
  
  -- ============================================
  -- REPORTES (EJEMPLO)
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
  
  RAISE NOTICE '✅ Datos de prueba insertados correctamente!';
  
END $$;


-- ============================================
-- DATOS ADICIONALES CON UUIDs ESPECÍFICOS
-- ============================================
-- Categorías adicionales con jerarquía padre-hijo
-- IMPORTANTE: Primero insertar categorías padre, luego las hijas

-- Paso 1: Categorías PADRE (sin padre_id)
INSERT INTO categorias (id, nombre, slug, descripcion, url_icono, color, padre_id, esta_activo, indice_orden)
VALUES
('c0000000-0000-0000-0000-000000000001','Hogar','hogar-cat','Servicios para el hogar','https://cdn.example.com/icons/home.svg','#2E86AB',NULL,true,11),
('c0000000-0000-0000-0000-000000000004','Tecnología Avanzada','tecnologia-avanzada','Soporte y servicios tecnológicos avanzados','https://cdn.example.com/icons/tech.svg','#F39C12',NULL,true,14),
('c0000000-0000-0000-0000-000000000006','Diseño Gráfico','diseno-grafico','Diseño gráfico y digital','https://cdn.example.com/icons/design.svg','#E74C3C',NULL,true,16),
('c0000000-0000-0000-0000-000000000007','Marketing Digital','marketing-digital','Publicidad y redes sociales','https://cdn.example.com/icons/marketing.svg','#7DCEA0',NULL,true,17),
('c0000000-0000-0000-0000-000000000008','Clases Online','clases-online','Clases y tutorías online','https://cdn.example.com/icons/education.svg','#5DADE2',NULL,true,18),
('c0000000-0000-0000-0000-000000000009','Salud y Bienestar Plus','salud-bienestar-plus','Servicios de bienestar premium','https://cdn.example.com/icons/wellness.svg','#48C9B0',NULL,true,19),
('c0000000-0000-0000-0000-000000000010','Mascotas y Animales','mascotas-animales','Cuidado y paseos de mascotas','https://cdn.example.com/icons/pet.svg','#AAB7B8',NULL,true,20)
ON CONFLICT (id) DO UPDATE
SET
  nombre = EXCLUDED.nombre,
  slug = EXCLUDED.slug,
  descripcion = EXCLUDED.descripcion,
  url_icono = EXCLUDED.url_icono,
  color = EXCLUDED.color,
  padre_id = EXCLUDED.padre_id,
  esta_activo = EXCLUDED.esta_activo,
  indice_orden = EXCLUDED.indice_orden,
  actualizado_en = CURRENT_TIMESTAMP;

-- Paso 2: Categorías HIJAS (con padre_id)
INSERT INTO categorias (id, nombre, slug, descripcion, url_icono, color, padre_id, esta_activo, indice_orden)
VALUES
('c0000000-0000-0000-0000-000000000002','Limpieza Hogar','limpieza-hogar-sub','Limpieza general y profunda','https://cdn.example.com/icons/cleaning.svg','#28B463','c0000000-0000-0000-0000-000000000001',true,12),
('c0000000-0000-0000-0000-000000000003','Reparaciones Hogar','reparaciones-hogar-sub','Arreglos y mantenimiento','https://cdn.example.com/icons/tools.svg','#AF7AC5','c0000000-0000-0000-0000-000000000001',true,13),
('c0000000-0000-0000-0000-000000000005','Soporte PC','soporte-pc-sub','Formateo, optimización, soporte','https://cdn.example.com/icons/laptop.svg','#1F618D','c0000000-0000-0000-0000-000000000004',true,15)
ON CONFLICT (id) DO UPDATE
SET
  nombre = EXCLUDED.nombre,
  slug = EXCLUDED.slug,
  descripcion = EXCLUDED.descripcion,
  url_icono = EXCLUDED.url_icono,
  color = EXCLUDED.color,
  padre_id = EXCLUDED.padre_id,
  esta_activo = EXCLUDED.esta_activo,
  indice_orden = EXCLUDED.indice_orden,
  actualizado_en = CURRENT_TIMESTAMP;

-- ============================================
-- 16 USUARIOS PROVEEDORES ADICIONALES
-- (Requeridos para los 40 servicios adicionales)
-- ============================================

INSERT INTO usuarios (id, correo, hash_password, usuario, nombre, apellido, telefono, codigo_pais, url_avatar, biografia, esta_verificado, esta_activo, promedio_calificacion, total_resenas, idioma, zona_horaria, moneda)
VALUES 
('018de432-0d71-4d8e-8b24-181c266f2a97', 'proveedor01@test.com', '$2b$10$gFWmCnZci9Lu0sIynwsp9.y0yRcAzZDdepskPdcfuZpOgtaiiE3Ty', 'proveedor01', 'Laura', 'Sánchez', '34611111111', '+34', 'https://ui-avatars.com/api/?name=Laura&background=2E86AB&color=fff', 'Profesional de limpieza con 5 años de experiencia', true, true, 4.6, 10, 'es', 'Europe/Madrid', '€'),
('060a39a7-621b-42ab-9249-a7383a8eb7b4', 'proveedor02@test.com', '$2b$10$gFWmCnZci9Lu0sIynwsp9.y0yRcAzZDdepskPdcfuZpOgtaiiE3Ty', 'proveedor02', 'Miguel', 'Torres', '34611111112', '+34', 'https://ui-avatars.com/api/?name=Miguel&background=AF7AC5&color=fff', 'Manitas profesional, montaje y reparaciones', true, true, 4.8, 12, 'es', 'Europe/Madrid', '€'),
('1f7c40ba-aa81-4aa3-835a-20b283b17c57', 'proveedor03@test.com', '$2b$10$gFWmCnZci9Lu0sIynwsp9.y0yRcAzZDdepskPdcfuZpOgtaiiE3Ty', 'proveedor03', 'David', 'Ruiz', '34611111113', '+34', 'https://ui-avatars.com/api/?name=David&background=1F618D&color=fff', 'Técnico informático certificado', true, true, 4.7, 18, 'es', 'Europe/Madrid', '€'),
('624fb14b-cda2-4def-8775-12cf6d5b4acb', 'proveedor04@test.com', '$2b$10$gFWmCnZci9Lu0sIynwsp9.y0yRcAzZDdepskPdcfuZpOgtaiiE3Ty', 'proveedor04', 'Carmen', 'Díaz', '34611111114', '+34', 'https://ui-avatars.com/api/?name=Carmen&background=E74C3C&color=fff', 'Diseñadora gráfica freelance', true, true, 4.5, 20, 'es', 'Europe/Madrid', '€'),
('7243312e-bb97-4960-9dbf-d4052208018f', 'proveedor05@test.com', '$2b$10$gFWmCnZci9Lu0sIynwsp9.y0yRcAzZDdepskPdcfuZpOgtaiiE3Ty', 'proveedor05', 'Pablo', 'Navarro', '34611111115', '+34', 'https://ui-avatars.com/api/?name=Pablo&background=7DCEA0&color=fff', 'Community manager y estratega digital', true, true, 4.2, 15, 'es', 'Europe/Madrid', '€'),
('782d0d95-fcca-4c40-bc8e-6abd1d998127', 'proveedor06@test.com', '$2b$10$gFWmCnZci9Lu0sIynwsp9.y0yRcAzZDdepskPdcfuZpOgtaiiE3Ty', 'proveedor06', 'Elena', 'Moreno', '34611111116', '+34', 'https://ui-avatars.com/api/?name=Elena&background=5DADE2&color=fff', 'Profesora particular de matemáticas y física', true, true, 4.9, 22, 'es', 'Europe/Madrid', '€'),
('81399510-7b33-46d5-8806-0cdfe5986470', 'proveedor07@test.com', '$2b$10$gFWmCnZci9Lu0sIynwsp9.y0yRcAzZDdepskPdcfuZpOgtaiiE3Ty', 'proveedor07', 'Roberto', 'Jiménez', '34611111117', '+34', 'https://ui-avatars.com/api/?name=Roberto&background=48C9B0&color=fff', 'Masajista y entrenador personal certificado', true, true, 4.4, 12, 'es', 'Europe/Madrid', '€'),
('96808fea-c124-43b7-9068-15f99f0e005c', 'proveedor08@test.com', '$2b$10$gFWmCnZci9Lu0sIynwsp9.y0yRcAzZDdepskPdcfuZpOgtaiiE3Ty', 'proveedor08', 'Lucía', 'Herrera', '34611111118', '+34', 'https://ui-avatars.com/api/?name=Lucia&background=AAB7B8&color=fff', 'Cuidadora de mascotas profesional', true, true, 4.8, 25, 'es', 'Europe/Madrid', '€'),
('983b9c31-2017-4a26-b9fa-65284050d26f', 'proveedor09@test.com', '$2b$10$gFWmCnZci9Lu0sIynwsp9.y0yRcAzZDdepskPdcfuZpOgtaiiE3Ty', 'proveedor09', 'Andrés', 'Castro', '34611111119', '+34', 'https://ui-avatars.com/api/?name=Andres&background=28B463&color=fff', 'Servicio de limpieza premium', true, true, 4.7, 11, 'es', 'Europe/Madrid', '€'),
('b2cc63ee-cd3e-4a60-ae7f-d2822778ed54', 'proveedor10@test.com', '$2b$10$gFWmCnZci9Lu0sIynwsp9.y0yRcAzZDdepskPdcfuZpOgtaiiE3Ty', 'proveedor10', 'Isabel', 'Vega', '34611111120', '+34', 'https://ui-avatars.com/api/?name=Isabel&background=F39C12&color=fff', 'Fontanera profesional con 8 años de experiencia', true, true, 4.1, 9, 'es', 'Europe/Madrid', '€'),
('b86bcd2b-48fd-4b89-b4c5-3466de152099', 'proveedor11@test.com', '$2b$10$gFWmCnZci9Lu0sIynwsp9.y0yRcAzZDdepskPdcfuZpOgtaiiE3Ty', 'proveedor11', 'Fernando', 'Ortiz', '34611111121', '+34', 'https://ui-avatars.com/api/?name=Fernando&background=3498DB&color=fff', 'Soporte técnico remoto especializado', true, true, 4.9, 31, 'es', 'Europe/Madrid', '€'),
('c0ffa176-8858-41f9-a09f-ec87807c62b8', 'proveedor12@test.com', '$2b$10$gFWmCnZci9Lu0sIynwsp9.y0yRcAzZDdepskPdcfuZpOgtaiiE3Ty', 'proveedor12', 'Sara', 'Molina', '34611111122', '+34', 'https://ui-avatars.com/api/?name=Sara&background=9B59B6&color=fff', 'Diseñadora de banners y material gráfico', true, true, 4.4, 7, 'es', 'Europe/Madrid', '€'),
('cb4c48e9-a44d-4be7-a1aa-f015a3a02b16', 'proveedor13@test.com', '$2b$10$gFWmCnZci9Lu0sIynwsp9.y0yRcAzZDdepskPdcfuZpOgtaiiE3Ty', 'proveedor13', 'Jorge', 'Delgado', '34611111123', '+34', 'https://ui-avatars.com/api/?name=Jorge&background=1ABC9C&color=fff', 'Especialista en Google Ads y email marketing', true, true, 4.0, 6, 'es', 'Europe/Madrid', '€'),
('d30c2a59-dfb4-4f9a-9b7a-98a5033d615f', 'proveedor14@test.com', '$2b$10$gFWmCnZci9Lu0sIynwsp9.y0yRcAzZDdepskPdcfuZpOgtaiiE3Ty', 'proveedor14', 'Patricia', 'Romero', '34611111124', '+34', 'https://ui-avatars.com/api/?name=Patricia&background=E67E22&color=fff', 'Profesora de inglés nativa certificada', true, true, 4.8, 40, 'es', 'Europe/Madrid', '€'),
('def344f6-6f59-4091-bf49-b070ce6f7538', 'proveedor15@test.com', '$2b$10$gFWmCnZci9Lu0sIynwsp9.y0yRcAzZDdepskPdcfuZpOgtaiiE3Ty', 'proveedor15', 'Ricardo', 'Fuentes', '34611111125', '+34', 'https://ui-avatars.com/api/?name=Ricardo&background=16A085&color=fff', 'Instructor de yoga y meditación', true, true, 4.2, 4, 'es', 'Europe/Madrid', '€'),
('e2060f0c-20ac-4c04-8cf5-7257cc417606', 'proveedor16@test.com', '$2b$10$gFWmCnZci9Lu0sIynwsp9.y0yRcAzZDdepskPdcfuZpOgtaiiE3Ty', 'proveedor16', 'Marina', 'Guerrero', '34611111126', '+34', 'https://ui-avatars.com/api/?name=Marina&background=D35400&color=fff', 'Cuidadora de gatos y pequeños animales', true, true, 4.6, 9, 'es', 'Europe/Madrid', '€')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 40 SERVICIOS ADICIONALES
-- (Requiere que existan los proveedores con estos UUIDs)
-- ============================================

INSERT INTO servicios (id, proveedor_id, categoria_id, titulo, descripcion, tipo_precio, precio, moneda, tipo_ubicacion, direccion, ciudad, estado, pais, codigo_postal, latitud, longitud, esta_activo, es_destacado, esta_verificado, vistas, conteo_favoritos, promedio_calificacion, total_resenas, tiempo_respuesta_horas, incluye, no_incluye, url_video)
VALUES
('a0000000-0000-0000-0000-000000000001','018de432-0d71-4d8e-8b24-181c266f2a97','c0000000-0000-0000-0000-000000000002',
'Limpieza de apartamento (2h)','Limpieza de cocina, baño y zonas comunes.','por_hora',18.00,'€','a_domicilio','Calle Mayor 1','Barcelona','Barcelona','España','08001',41.38790000,2.16992000,true,false,true,120,9,4.60,10,2,'Productos básicos, aspirado, fregado','No incluye limpieza de horno','https://video.example.com/v/clean1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO servicios (id, proveedor_id, categoria_id, titulo, descripcion, tipo_precio, precio, moneda, tipo_ubicacion, direccion, ciudad, estado, pais, codigo_postal, latitud, longitud, esta_activo, es_destacado, esta_verificado, vistas, conteo_favoritos, promedio_calificacion, total_resenas, tiempo_respuesta_horas, incluye, no_incluye, url_video)
VALUES
('a0000000-0000-0000-0000-000000000002','060a39a7-621b-42ab-9249-a7383a8eb7b4','c0000000-0000-0000-0000-000000000003',
'Manitas: montaje de muebles','Montaje de muebles tipo IKEA y ajustes.','fijo',45.00,'€','a_domicilio','Av. Diagonal 100','Barcelona','Barcelona','España','08019',41.39480000,2.14260000,true,true,true,98,14,4.80,12,3,'Montaje completo, nivelado','No incluye transporte del mueble','https://video.example.com/v/handy1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO servicios (id, proveedor_id, categoria_id, titulo, descripcion, tipo_precio, precio, moneda, tipo_ubicacion, direccion, ciudad, estado, pais, codigo_postal, latitud, longitud, esta_activo, es_destacado, esta_verificado, vistas, conteo_favoritos, promedio_calificacion, total_resenas, tiempo_respuesta_horas, incluye, no_incluye, url_video)
VALUES
('a0000000-0000-0000-0000-000000000003','1f7c40ba-aa81-4aa3-835a-20b283b17c57','c0000000-0000-0000-0000-000000000005',
'Formateo y puesta a punto','Instalación sistema, drivers y optimización.','fijo',60.00,'€','a_domicilio','C/ Aragó 50','Barcelona','Barcelona','España','08015',41.38270000,2.15380000,true,false,true,210,22,4.70,18,6,'Instalación, antivirus básico','No incluye licencia Windows','https://video.example.com/v/pc1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO servicios (id, proveedor_id, categoria_id, titulo, descripcion, tipo_precio, precio, moneda, tipo_ubicacion, direccion, ciudad, estado, pais, codigo_postal, latitud, longitud, esta_activo, es_destacado, esta_verificado, vistas, conteo_favoritos, promedio_calificacion, total_resenas, tiempo_respuesta_horas, incluye, no_incluye, url_video)
VALUES
('a0000000-0000-0000-0000-000000000004','624fb14b-cda2-4def-8775-12cf6d5b4acb','c0000000-0000-0000-0000-000000000006',
'Logo básico para tu marca','3 propuestas + 2 revisiones.','fijo',90.00,'€','remoto',NULL,'Madrid','Madrid','España','28001',40.41680000,-3.70380000,true,false,true,340,33,4.50,20,12,'PNG/SVG, paleta de color','No incluye manual de marca completo','https://video.example.com/v/logo1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO servicios (id, proveedor_id, categoria_id, titulo, descripcion, tipo_precio, precio, moneda, tipo_ubicacion, direccion, ciudad, estado, pais, codigo_postal, latitud, longitud, esta_activo, es_destacado, esta_verificado, vistas, conteo_favoritos, promedio_calificacion, total_resenas, tiempo_respuesta_horas, incluye, no_incluye, url_video)
VALUES
('a0000000-0000-0000-0000-000000000005','7243312e-bb97-4960-9dbf-d4052208018f','c0000000-0000-0000-0000-000000000007',
'Gestión de Instagram (mensual)','Calendario + 12 posts + métricas.','fijo',250.00,'€','remoto',NULL,'Valencia','Valencia','España','46001',39.46990000,-0.37630000,true,true,false,410,51,4.20,15,24,'Plan de contenido, copies','No incluye inversión en ads','https://video.example.com/v/ig1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO servicios (id, proveedor_id, categoria_id, titulo, descripcion, tipo_precio, precio, moneda, tipo_ubicacion, direccion, ciudad, estado, pais, codigo_postal, latitud, longitud, esta_activo, es_destacado, esta_verificado, vistas, conteo_favoritos, promedio_calificacion, total_resenas, tiempo_respuesta_horas, incluye, no_incluye, url_video)
VALUES
('a0000000-0000-0000-0000-000000000006','782d0d95-fcca-4c40-bc8e-6abd1d998127','c0000000-0000-0000-0000-000000000008',
'Clases de matemáticas (ESO)','Refuerzo y preparación de exámenes.','por_hora',20.00,'€','mixto',NULL,'Sevilla','Sevilla','España','41001',37.38910000,-5.98450000,true,false,true,175,18,4.90,22,4,'Material y ejercicios','No incluye desplazamientos fuera de zona','https://video.example.com/v/math1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO servicios (id, proveedor_id, categoria_id, titulo, descripcion, tipo_precio, precio, moneda, tipo_ubicacion, direccion, ciudad, estado, pais, codigo_postal, latitud, longitud, esta_activo, es_destacado, esta_verificado, vistas, conteo_favoritos, promedio_calificacion, total_resenas, tiempo_respuesta_horas, incluye, no_incluye, url_video)
VALUES
('a0000000-0000-0000-0000-000000000007','81399510-7b33-46d5-8806-0cdfe5986470','c0000000-0000-0000-0000-000000000009',
'Masaje relajante 60min','Masaje descontracturante suave.','fijo',40.00,'€','a_domicilio','C/ San Juan 12','Bilbao','Bizkaia','España','48001',43.26300000,-2.93500000,true,false,false,90,7,4.30,8,5,'Aceites, camilla portátil','No incluye fisioterapia clínica','https://video.example.com/v/massage1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO servicios (id, proveedor_id, categoria_id, titulo, descripcion, tipo_precio, precio, moneda, tipo_ubicacion, direccion, ciudad, estado, pais, codigo_postal, latitud, longitud, esta_activo, es_destacado, esta_verificado, vistas, conteo_favoritos, promedio_calificacion, total_resenas, tiempo_respuesta_horas, incluye, no_incluye, url_video)
VALUES
('a0000000-0000-0000-0000-000000000008','96808fea-c124-43b7-9068-15f99f0e005c','c0000000-0000-0000-0000-000000000010',
'Paseo de perros (30min)','Paseos individuales o en pareja compatible.','por_hora',12.00,'€','a_domicilio',NULL,'Barcelona','Barcelona','España','08002',41.38510000,2.17340000,true,true,true,260,27,4.80,25,2,'Agua, reporte básico','No incluye adiestramiento','https://video.example.com/v/dog1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO servicios (id, proveedor_id, categoria_id, titulo, descripcion, tipo_precio, precio, moneda, tipo_ubicacion, direccion, ciudad, estado, pais, codigo_postal, latitud, longitud, esta_activo, es_destacado, esta_verificado, vistas, conteo_favoritos, promedio_calificacion, total_resenas, tiempo_respuesta_horas, incluye, no_incluye, url_video)
VALUES
('a0000000-0000-0000-0000-000000000009','983b9c31-2017-4a26-b9fa-65284050d26f','c0000000-0000-0000-0000-000000000002',
'Limpieza profunda (3h)','Cocina a fondo, baño y polvo detallado.','por_hora',22.00,'€','a_domicilio',NULL,'Madrid','Madrid','España','28002',40.42800000,-3.67900000,true,false,true,155,16,4.70,11,3,'Productos premium','No incluye cristales exteriores','https://video.example.com/v/clean2')
ON CONFLICT (id) DO NOTHING;

INSERT INTO servicios (id, proveedor_id, categoria_id, titulo, descripcion, tipo_precio, precio, moneda, tipo_ubicacion, direccion, ciudad, estado, pais, codigo_postal, latitud, longitud, esta_activo, es_destacado, esta_verificado, vistas, conteo_favoritos, promedio_calificacion, total_resenas, tiempo_respuesta_horas, incluye, no_incluye, url_video)
VALUES
('a0000000-0000-0000-0000-000000000010','b2cc63ee-cd3e-4a60-ae7f-d2822778ed54','c0000000-0000-0000-0000-000000000003',
'Reparación básica de fontanería','Cambio de grifo, sifón o pequeñas fugas.','fijo',50.00,'€','a_domicilio',NULL,'Valencia','Valencia','España','46002',39.47020000,-0.37680000,true,false,false,130,10,4.10,9,8,'Diagnóstico y mano de obra','No incluye piezas especiales','https://video.example.com/v/plumb1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO servicios (id, proveedor_id, categoria_id, titulo, descripcion, tipo_precio, precio, moneda, tipo_ubicacion, direccion, ciudad, estado, pais, codigo_postal, latitud, longitud, esta_activo, es_destacado, esta_verificado, vistas, conteo_favoritos, promedio_calificacion, total_resenas, tiempo_respuesta_horas, incluye, no_incluye, url_video)
VALUES
('a0000000-0000-0000-0000-000000000011','b86bcd2b-48fd-4b89-b4c5-3466de152099','c0000000-0000-0000-0000-000000000005',
'Soporte remoto (1h)','Resolución de problemas por videollamada.','por_hora',25.00,'€','remoto',NULL,'Zaragoza','Zaragoza','España','50001',41.64880000,-0.88910000,true,true,true,300,29,4.90,31,1,'Diagnóstico, limpieza software','No incluye reparaciones hardware','https://video.example.com/v/remote1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO servicios (id, proveedor_id, categoria_id, titulo, descripcion, tipo_precio, precio, moneda, tipo_ubicacion, direccion, ciudad, estado, pais, codigo_postal, latitud, longitud, esta_activo, es_destacado, esta_verificado, vistas, conteo_favoritos, promedio_calificacion, total_resenas, tiempo_respuesta_horas, incluye, no_incluye, url_video)
VALUES
('a0000000-0000-0000-0000-000000000012','c0ffa176-8858-41f9-a09f-ec87807c62b8','c0000000-0000-0000-0000-000000000006',
'Pack 5 banners para redes','Diseños listos para publicar.','fijo',70.00,'€','remoto',NULL,'Málaga','Málaga','España','29001',36.72130000,-4.42140000,true,false,true,145,12,4.40,7,10,'5 diseños, 2 revisiones','No incluye copywriting','https://video.example.com/v/banner1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO servicios (id, proveedor_id, categoria_id, titulo, descripcion, tipo_precio, precio, moneda, tipo_ubicacion, direccion, ciudad, estado, pais, codigo_postal, latitud, longitud, esta_activo, es_destacado, esta_verificado, vistas, conteo_favoritos, promedio_calificacion, total_resenas, tiempo_respuesta_horas, incluye, no_incluye, url_video)
VALUES
('a0000000-0000-0000-0000-000000000013','cb4c48e9-a44d-4be7-a1aa-f015a3a02b16','c0000000-0000-0000-0000-000000000007',
'Campaña Google Ads (setup)','Configuración de cuenta y 1 campaña.','fijo',120.00,'€','remoto',NULL,'Madrid','Madrid','España','28010',40.43190000,-3.70570000,true,false,false,220,19,4.00,6,48,'Estructura, keywords','No incluye presupuesto publicitario','https://video.example.com/v/ads1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO servicios (id, proveedor_id, categoria_id, titulo, descripcion, tipo_precio, precio, moneda, tipo_ubicacion, direccion, ciudad, estado, pais, codigo_postal, latitud, longitud, esta_activo, es_destacado, esta_verificado, vistas, conteo_favoritos, promedio_calificacion, total_resenas, tiempo_respuesta_horas, incluye, no_incluye, url_video)
VALUES
('a0000000-0000-0000-0000-000000000014','d30c2a59-dfb4-4f9a-9b7a-98a5033d615f','c0000000-0000-0000-0000-000000000008',
'Clases de inglés conversación','Enfoque speaking, nivel A2-B2.','por_hora',18.00,'€','remoto',NULL,'Barcelona','Barcelona','España','08005',41.40360000,2.18990000,true,true,true,500,66,4.80,40,3,'Material y feedback','No incluye certificación oficial','https://video.example.com/v/eng1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO servicios (id, proveedor_id, categoria_id, titulo, descripcion, tipo_precio, precio, moneda, tipo_ubicacion, direccion, ciudad, estado, pais, codigo_postal, latitud, longitud, esta_activo, es_destacado, esta_verificado, vistas, conteo_favoritos, promedio_calificacion, total_resenas, tiempo_respuesta_horas, incluye, no_incluye, url_video)
VALUES
('a0000000-0000-0000-0000-000000000015','def344f6-6f59-4091-bf49-b070ce6f7538','c0000000-0000-0000-0000-000000000009',
'Yoga suave (sesión 45min)','Yoga para movilidad y respiración.','fijo',0.00,'€','remoto',NULL,'Alicante','Alicante','España','03001',38.34520000,-0.48100000,true,false,false,80,5,4.20,4,6,'Sesión guiada','No incluye plan personalizado','https://video.example.com/v/yoga1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO servicios (id, proveedor_id, categoria_id, titulo, descripcion, tipo_precio, precio, moneda, tipo_ubicacion, direccion, ciudad, estado, pais, codigo_postal, latitud, longitud, esta_activo, es_destacado, esta_verificado, vistas, conteo_favoritos, promedio_calificacion, total_resenas, tiempo_respuesta_horas, incluye, no_incluye, url_video)
VALUES
('a0000000-0000-0000-0000-000000000016','e2060f0c-20ac-4c04-8cf5-7257cc417606','c0000000-0000-0000-0000-000000000010',
'Cuidado de gatos (visita)','Visita diaria: comida, agua y arenero.','fijo',15.00,'€','a_domicilio',NULL,'Madrid','Madrid','España','28003',40.44690000,-3.70040000,true,false,true,115,11,4.60,9,2,'Reporte con fotos','No incluye medicación inyectable','https://video.example.com/v/cat1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO servicios (id, proveedor_id, categoria_id, titulo, descripcion, tipo_precio, precio, moneda, tipo_ubicacion, direccion, ciudad, estado, pais, codigo_postal, latitud, longitud, esta_activo, es_destacado, esta_verificado, vistas, conteo_favoritos, promedio_calificacion, total_resenas, tiempo_respuesta_horas, incluye, no_incluye, url_video)
VALUES ('a0000000-0000-0000-0000-000000000017','018de432-0d71-4d8e-8b24-181c266f2a97','c0000000-0000-0000-0000-000000000003','Pintura de habitación','Pintado de una habitación estándar.','fijo',150.00,'€','a_domicilio',NULL,'Barcelona','Barcelona','España','08008',41.39540000,2.16180000,true,false,false,60,4,4.10,3,24,'Protección de suelo, 2 manos','No incluye pintura especial','https://video.example.com/v/paint1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO servicios (id, proveedor_id, categoria_id, titulo, descripcion, tipo_precio, precio, moneda, tipo_ubicacion, direccion, ciudad, estado, pais, codigo_postal, latitud, longitud, esta_activo, es_destacado, esta_verificado, vistas, conteo_favoritos, promedio_calificacion, total_resenas, tiempo_respuesta_horas, incluye, no_incluye, url_video)
VALUES ('a0000000-0000-0000-0000-000000000018','060a39a7-621b-42ab-9249-a7383a8eb7b4','c0000000-0000-0000-0000-000000000002','Limpieza fin de obra (por m2)','Limpieza post reforma ligera.','fijo',120.00,'€','a_domicilio',NULL,'Madrid','Madrid','España','28004',40.42300000,-3.69900000,true,true,false,140,13,4.30,6,12,'Polvo, suelos, cristales interiores','No incluye retirada de escombros','https://video.example.com/v/post1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO servicios (id, proveedor_id, categoria_id, titulo, descripcion, tipo_precio, precio, moneda, tipo_ubicacion, direccion, ciudad, estado, pais, codigo_postal, latitud, longitud, esta_activo, es_destacado, esta_verificado, vistas, conteo_favoritos, promedio_calificacion, total_resenas, tiempo_respuesta_horas, incluye, no_incluye, url_video)
VALUES ('a0000000-0000-0000-0000-000000000019','1f7c40ba-aa81-4aa3-835a-20b283b17c57','c0000000-0000-0000-0000-000000000005','Instalación impresora + wifi','Configuro impresora y red doméstica.','fijo',35.00,'€','a_domicilio',NULL,'Valencia','Valencia','España','46010',39.48690000,-0.36490000,true,false,true,88,8,4.50,8,6,'Drivers, test impresión','No incluye router nuevo','https://video.example.com/v/print1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO servicios (id, proveedor_id, categoria_id, titulo, descripcion, tipo_precio, precio, moneda, tipo_ubicacion, direccion, ciudad, estado, pais, codigo_postal, latitud, longitud, esta_activo, es_destacado, esta_verificado, vistas, conteo_favoritos, promedio_calificacion, total_resenas, tiempo_respuesta_horas, incluye, no_incluye, url_video)
VALUES ('a0000000-0000-0000-0000-000000000020','624fb14b-cda2-4def-8775-12cf6d5b4acb','c0000000-0000-0000-0000-000000000006','Tarjeta de visita','Diseño para imprimir (2 caras).','fijo',25.00,'€','remoto',NULL,'Madrid','Madrid','España','28005',40.41080000,-3.70740000,true,false,true,70,6,4.20,5,24,'PDF listo para imprenta','No incluye impresión','https://video.example.com/v/card1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO servicios (id, proveedor_id, categoria_id, titulo, descripcion, tipo_precio, precio, moneda, tipo_ubicacion, direccion, ciudad, estado, pais, codigo_postal, latitud, longitud, esta_activo, es_destacado, esta_verificado, vistas, conteo_favoritos, promedio_calificacion, total_resenas, tiempo_respuesta_horas, incluye, no_incluye, url_video)
VALUES ('a0000000-0000-0000-0000-000000000021','7243312e-bb97-4960-9dbf-d4052208018f','c0000000-0000-0000-0000-000000000007','Auditoría SEO básica','Revisión on-page y recomendaciones.','fijo',80.00,'€','remoto',NULL,'Valencia','Valencia','España','46003',39.47640000,-0.37500000,true,false,false,95,9,4.10,4,48,'Checklist y documento','No incluye implementación','https://video.example.com/v/seo1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO servicios (id, proveedor_id, categoria_id, titulo, descripcion, tipo_precio, precio, moneda, tipo_ubicacion, direccion, ciudad, estado, pais, codigo_postal, latitud, longitud, esta_activo, es_destacado, esta_verificado, vistas, conteo_favoritos, promedio_calificacion, total_resenas, tiempo_respuesta_horas, incluye, no_incluye, url_video)
VALUES ('a0000000-0000-0000-0000-000000000022','782d0d95-fcca-4c40-bc8e-6abd1d998127','c0000000-0000-0000-0000-000000000008','Clases de física (Bachillerato)','Problemas y preparación EBAU.','por_hora',22.00,'€','mixto',NULL,'Sevilla','Sevilla','España','41002',37.39720000,-5.98690000,true,false,true,140,12,4.70,10,6,'Ejercicios y simulacros','No incluye academia','https://video.example.com/v/phy1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO servicios (id, proveedor_id, categoria_id, titulo, descripcion, tipo_precio, precio, moneda, tipo_ubicacion, direccion, ciudad, estado, pais, codigo_postal, latitud, longitud, esta_activo, es_destacado, esta_verificado, vistas, conteo_favoritos, promedio_calificacion, total_resenas, tiempo_respuesta_horas, incluye, no_incluye, url_video)
VALUES ('a0000000-0000-0000-0000-000000000023','81399510-7b33-46d5-8806-0cdfe5986470','c0000000-0000-0000-0000-000000000009','Entrenamiento personal (1h)','Rutina adaptada y seguimiento.','por_hora',30.00,'€','a_domicilio',NULL,'Bilbao','Bizkaia','España','48002',43.26200000,-2.94800000,true,true,false,160,21,4.40,12,4,'Calentamiento, rutina','No incluye dieta','https://video.example.com/v/train1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO servicios (id, proveedor_id, categoria_id, titulo, descripcion, tipo_precio, precio, moneda, tipo_ubicacion, direccion, ciudad, estado, pais, codigo_postal, latitud, longitud, esta_activo, es_destacado, esta_verificado, vistas, conteo_favoritos, promedio_calificacion, total_resenas, tiempo_respuesta_horas, incluye, no_incluye, url_video)
VALUES ('a0000000-0000-0000-0000-000000000024','96808fea-c124-43b7-9068-15f99f0e005c','c0000000-0000-0000-0000-000000000010','Adiestramiento básico (sesión)','Órdenes básicas y conducta en paseo.','por_hora',28.00,'€','a_domicilio',NULL,'Barcelona','Barcelona','España','08003',41.38730000,2.18150000,true,false,true,190,23,4.60,14,4,'Guía y ejercicios','No incluye collar especial','https://video.example.com/v/trainDog1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO servicios (id, proveedor_id, categoria_id, titulo, descripcion, tipo_precio, precio, moneda, tipo_ubicacion, direccion, ciudad, estado, pais, codigo_postal, latitud, longitud, esta_activo, es_destacado, esta_verificado, vistas, conteo_favoritos, promedio_calificacion, total_resenas, tiempo_respuesta_horas, incluye, no_incluye, url_video)
VALUES ('a0000000-0000-0000-0000-000000000025','983b9c31-2017-4a26-b9fa-65284050d26f','c0000000-0000-0000-0000-000000000003','Electricista: enchufe y lámpara','Instalación o sustitución básica.','fijo',55.00,'€','a_domicilio',NULL,'Madrid','Madrid','España','28006',40.43260000,-3.68170000,true,false,true,110,9,4.30,7,8,'Mano de obra','No incluye materiales premium','https://video.example.com/v/elect1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO servicios (id, proveedor_id, categoria_id, titulo, descripcion, tipo_precio, precio, moneda, tipo_ubicacion, direccion, ciudad, estado, pais, codigo_postal, latitud, longitud, esta_activo, es_destacado, esta_verificado, vistas, conteo_favoritos, promedio_calificacion, total_resenas, tiempo_respuesta_horas, incluye, no_incluye, url_video)
VALUES ('a0000000-0000-0000-0000-000000000026','b2cc63ee-cd3e-4a60-ae7f-d2822778ed54','c0000000-0000-0000-0000-000000000002','Plancha a domicilio (1h)','Planchado de ropa por hora.','por_hora',16.00,'€','a_domicilio',NULL,'Valencia','Valencia','España','46004',39.46570000,-0.37740000,true,false,false,75,5,4.00,3,6,'Planchado estándar','No incluye lavado','https://video.example.com/v/iron1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO servicios (id, proveedor_id, categoria_id, titulo, descripcion, tipo_precio, precio, moneda, tipo_ubicacion, direccion, ciudad, estado, pais, codigo_postal, latitud, longitud, esta_activo, es_destacado, esta_verificado, vistas, conteo_favoritos, promedio_calificacion, total_resenas, tiempo_respuesta_horas, incluye, no_incluye, url_video)
VALUES ('a0000000-0000-0000-0000-000000000027','b86bcd2b-48fd-4b89-b4c5-3466de152099','c0000000-0000-0000-0000-000000000005','Optimización PC gaming','Ajustes de rendimiento y drivers.','fijo',75.00,'€','a_domicilio',NULL,'Zaragoza','Zaragoza','España','50002',41.64220000,-0.88770000,true,true,true,260,30,4.80,16,2,'Drivers, benchmarks','No incluye upgrade hardware','https://video.example.com/v/gaming1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO servicios (id, proveedor_id, categoria_id, titulo, descripcion, tipo_precio, precio, moneda, tipo_ubicacion, direccion, ciudad, estado, pais, codigo_postal, latitud, longitud, esta_activo, es_destacado, esta_verificado, vistas, conteo_favoritos, promedio_calificacion, total_resenas, tiempo_respuesta_horas, incluye, no_incluye, url_video)
VALUES ('a0000000-0000-0000-0000-000000000028','c0ffa176-8858-41f9-a09f-ec87807c62b8','c0000000-0000-0000-0000-000000000006','Plantilla CV ATS','Diseño limpio + versión Word.','fijo',20.00,'€','remoto',NULL,'Málaga','Málaga','España','29002',36.71260000,-4.42780000,true,false,true,180,15,4.60,12,24,'PDF + DOCX','No incluye redacción completa','https://video.example.com/v/cv1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO servicios (id, proveedor_id, categoria_id, titulo, descripcion, tipo_precio, precio, moneda, tipo_ubicacion, direccion, ciudad, estado, pais, codigo_postal, latitud, longitud, esta_activo, es_destacado, esta_verificado, vistas, conteo_favoritos, promedio_calificacion, total_resenas, tiempo_respuesta_horas, incluye, no_incluye, url_video)
VALUES ('a0000000-0000-0000-0000-000000000029','cb4c48e9-a44d-4be7-a1aa-f015a3a02b16','c0000000-0000-0000-0000-000000000007','Email marketing (setup)','Automatización básica y plantilla.','fijo',65.00,'€','remoto',NULL,'Madrid','Madrid','España','28011',40.40780000,-3.73170000,true,false,false,120,10,4.10,5,48,'Segmentación y plantilla','No incluye copy semanal','https://video.example.com/v/email1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO servicios (id, proveedor_id, categoria_id, titulo, descripcion, tipo_precio, precio, moneda, tipo_ubicacion, direccion, ciudad, estado, pais, codigo_postal, latitud, longitud, esta_activo, es_destacado, esta_verificado, vistas, conteo_favoritos, promedio_calificacion, total_resenas, tiempo_respuesta_horas, incluye, no_incluye, url_video)
VALUES ('a0000000-0000-0000-0000-000000000030','d30c2a59-dfb4-4f9a-9b7a-98a5033d615f','c0000000-0000-0000-0000-000000000008','Preparación entrevista (1h)','Simulación + feedback.','por_hora',25.00,'€','remoto',NULL,'Barcelona','Barcelona','España','08010',41.39400000,2.17500000,true,true,true,210,20,4.70,9,6,'Guía y recomendaciones','No incluye CV','https://video.example.com/v/interview1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO servicios (id, proveedor_id, categoria_id, titulo, descripcion, tipo_precio, precio, moneda, tipo_ubicacion, direccion, ciudad, estado, pais, codigo_postal, latitud, longitud, esta_activo, es_destacado, esta_verificado, vistas, conteo_favoritos, promedio_calificacion, total_resenas, tiempo_respuesta_horas, incluye, no_incluye, url_video)
VALUES ('a0000000-0000-0000-0000-000000000031','def344f6-6f59-4091-bf49-b070ce6f7538','c0000000-0000-0000-0000-000000000009','Meditación guiada (30min)','Sesión para reducir estrés.','fijo',0.00,'€','remoto',NULL,'Alicante','Alicante','España','03002',38.34360000,-0.48400000,true,false,false,65,3,4.00,2,2,'Sesión guiada','No incluye seguimiento','https://video.example.com/v/med1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO servicios (id, proveedor_id, categoria_id, titulo, descripcion, tipo_precio, precio, moneda, tipo_ubicacion, direccion, ciudad, estado, pais, codigo_postal, latitud, longitud, esta_activo, es_destacado, esta_verificado, vistas, conteo_favoritos, promedio_calificacion, total_resenas, tiempo_respuesta_horas, incluye, no_incluye, url_video)
VALUES ('a0000000-0000-0000-0000-000000000032','e2060f0c-20ac-4c04-8cf5-7257cc417606','c0000000-0000-0000-0000-000000000010','Corte de uñas mascota','Servicio básico en casa.','fijo',10.00,'€','a_domicilio',NULL,'Madrid','Madrid','España','28012',40.41530000,-3.70740000,true,false,true,50,4,4.20,3,12,'Corte y revisión','No incluye peluquería completa','https://video.example.com/v/pet1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO servicios (id, proveedor_id, categoria_id, titulo, descripcion, tipo_precio, precio, moneda, tipo_ubicacion, direccion, ciudad, estado, pais, codigo_postal, latitud, longitud, esta_activo, es_destacado, esta_verificado, vistas, conteo_favoritos, promedio_calificacion, total_resenas, tiempo_respuesta_horas, incluye, no_incluye, url_video)
VALUES ('a0000000-0000-0000-0000-000000000033','018de432-0d71-4d8e-8b24-181c266f2a97','c0000000-0000-0000-0000-000000000002','Limpieza de oficinas (2h)','Limpieza de zona de trabajo y baño.','por_hora',20.00,'€','a_domicilio',NULL,'Barcelona','Barcelona','España','08018',41.40880000,2.19750000,true,false,false,105,9,4.30,6,4,'Consumibles básicos','No incluye limpieza industrial','https://video.example.com/v/office1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO servicios (id, proveedor_id, categoria_id, titulo, descripcion, tipo_precio, precio, moneda, tipo_ubicacion, direccion, ciudad, estado, pais, codigo_postal, latitud, longitud, esta_activo, es_destacado, esta_verificado, vistas, conteo_favoritos, promedio_calificacion, total_resenas, tiempo_respuesta_horas, incluye, no_incluye, url_video)
VALUES ('a0000000-0000-0000-0000-000000000034','060a39a7-621b-42ab-9249-a7383a8eb7b4','c0000000-0000-0000-0000-000000000003','Cambio de cerradura','Sustitución de cerradura estándar.','fijo',85.00,'€','a_domicilio',NULL,'Madrid','Madrid','España','28013',40.41800000,-3.70990000,true,true,true,145,11,4.50,8,3,'Mano de obra, ajuste','No incluye cerradura alta seguridad','https://video.example.com/v/lock1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO servicios (id, proveedor_id, categoria_id, titulo, descripcion, tipo_precio, precio, moneda, tipo_ubicacion, direccion, ciudad, estado, pais, codigo_postal, latitud, longitud, esta_activo, es_destacado, esta_verificado, vistas, conteo_favoritos, promedio_calificacion, total_resenas, tiempo_respuesta_horas, incluye, no_incluye, url_video)
VALUES ('a0000000-0000-0000-0000-000000000035','1f7c40ba-aa81-4aa3-835a-20b283b17c57','c0000000-0000-0000-0000-000000000004','Configuración domótica básica','Conecto dispositivos a la red y app.','fijo',55.00,'€','a_domicilio',NULL,'Valencia','Valencia','España','46020',39.49200000,-0.36300000,true,false,true,95,8,4.40,5,12,'Configuración 3 dispositivos','No incluye compra de dispositivos','https://video.example.com/v/iot1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO servicios (id, proveedor_id, categoria_id, titulo, descripcion, tipo_precio, precio, moneda, tipo_ubicacion, direccion, ciudad, estado, pais, codigo_postal, latitud, longitud, esta_activo, es_destacado, esta_verificado, vistas, conteo_favoritos, promedio_calificacion, total_resenas, tiempo_respuesta_horas, incluye, no_incluye, url_video)
VALUES ('a0000000-0000-0000-0000-000000000036','624fb14b-cda2-4def-8775-12cf6d5b4acb','c0000000-0000-0000-0000-000000000006','Portada para ebook','Diseño de portada profesional.','fijo',60.00,'€','remoto',NULL,'Madrid','Madrid','España','28014',40.41550000,-3.69200000,true,false,true,110,14,4.70,9,24,'JPG/PNG alta','No incluye maquetación interior','https://video.example.com/v/ebook1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO servicios (id, proveedor_id, categoria_id, titulo, descripcion, tipo_precio, precio, moneda, tipo_ubicacion, direccion, ciudad, estado, pais, codigo_postal, latitud, longitud, esta_activo, es_destacado, esta_verificado, vistas, conteo_favoritos, promedio_calificacion, total_resenas, tiempo_respuesta_horas, incluye, no_incluye, url_video)
VALUES ('a0000000-0000-0000-0000-000000000037','7243312e-bb97-4960-9dbf-d4052208018f','c0000000-0000-0000-0000-000000000007','Gestión TikTok (mensual)','8 vídeos editados + calendario.','fijo',220.00,'€','remoto',NULL,'Valencia','Valencia','España','46005',39.46000000,-0.35200000,true,false,false,200,17,4.00,6,24,'Edición básica','No incluye grabación presencial','https://video.example.com/v/tiktok1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO servicios (id, proveedor_id, categoria_id, titulo, descripcion, tipo_precio, precio, moneda, tipo_ubicacion, direccion, ciudad, estado, pais, codigo_postal, latitud, longitud, esta_activo, es_destacado, esta_verificado, vistas, conteo_favoritos, promedio_calificacion, total_resenas, tiempo_respuesta_horas, incluye, no_incluye, url_video)
VALUES ('a0000000-0000-0000-0000-000000000038','782d0d95-fcca-4c40-bc8e-6abd1d998127','c0000000-0000-0000-0000-000000000008','Clases de programación (Python)','Fundamentos + ejercicios prácticos.','por_hora',30.00,'€','remoto',NULL,'Sevilla','Sevilla','España','41003',37.38900000,-5.97500000,true,true,true,320,40,4.80,18,6,'Repositorio ejercicios','No incluye certificación','https://video.example.com/v/py1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO servicios (id, proveedor_id, categoria_id, titulo, descripcion, tipo_precio, precio, moneda, tipo_ubicacion, direccion, ciudad, estado, pais, codigo_postal, latitud, longitud, esta_activo, es_destacado, esta_verificado, vistas, conteo_favoritos, promedio_calificacion, total_resenas, tiempo_respuesta_horas, incluye, no_incluye, url_video)
VALUES ('a0000000-0000-0000-0000-000000000039','81399510-7b33-46d5-8806-0cdfe5986470','c0000000-0000-0000-0000-000000000009','Plan de entrenamiento 4 semanas','Rutina personalizada en PDF.','fijo',35.00,'€','remoto',NULL,'Bilbao','Bizkaia','España','48003',43.26800000,-2.93400000,true,false,false,85,6,4.20,4,24,'Rutina + progresión','No incluye videollamadas','https://video.example.com/v/plan1')
ON CONFLICT (id) DO NOTHING;

INSERT INTO servicios (id, proveedor_id, categoria_id, titulo, descripcion, tipo_precio, precio, moneda, tipo_ubicacion, direccion, ciudad, estado, pais, codigo_postal, latitud, longitud, esta_activo, es_destacado, esta_verificado, vistas, conteo_favoritos, promedio_calificacion, total_resenas, tiempo_respuesta_horas, incluye, no_incluye, url_video)
VALUES ('a0000000-0000-0000-0000-000000000040','96808fea-c124-43b7-9068-15f99f0e005c','c0000000-0000-0000-0000-000000000010','Guardería de día (perro)','Cuidado 8h con paseos.','fijo',25.00,'€','a_domicilio',NULL,'Barcelona','Barcelona','España','08009',41.39200000,2.16400000,true,true,true,240,30,4.70,16,2,'2 paseos, agua, fotos','No incluye comida especial','https://video.example.com/v/daycare1')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 25 IMÁGENES DE SERVICIOS ADICIONALES
-- ============================================

INSERT INTO imagenes_servicios (id, servicio_id, url_imagen, url_miniatura, pie_de_foto, es_principal, indice_orden, ancho, alto)
VALUES 
('b0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000001','https://cdn.example.com/services/s1/1.jpg','https://cdn.example.com/services/s1/1_sm.jpg','Antes y después',true,1,1200,800),
('b0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000001','https://cdn.example.com/services/s1/2.jpg','https://cdn.example.com/services/s1/2_sm.jpg','Productos utilizados',false,2,1200,800),
('b0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000002','https://cdn.example.com/services/s2/1.jpg','https://cdn.example.com/services/s2/1_sm.jpg','Montaje en progreso',true,1,1200,800),
('b0000000-0000-0000-0000-000000000004','a0000000-0000-0000-0000-000000000003','https://cdn.example.com/services/s3/1.jpg','https://cdn.example.com/services/s3/1_sm.jpg','Equipo y herramientas',true,1,1200,800),
('b0000000-0000-0000-0000-000000000005','a0000000-0000-0000-0000-000000000004','https://cdn.example.com/services/s4/1.jpg','https://cdn.example.com/services/s4/1_sm.jpg','Ejemplos de logos',true,1,1200,800),
('b0000000-0000-0000-0000-000000000006','a0000000-0000-0000-0000-000000000005','https://cdn.example.com/services/s5/1.jpg','https://cdn.example.com/services/s5/1_sm.jpg','Feed de ejemplo',true,1,1200,800),
('b0000000-0000-0000-0000-000000000007','a0000000-0000-0000-0000-000000000006','https://cdn.example.com/services/s6/1.jpg','https://cdn.example.com/services/s6/1_sm.jpg','Material de clase',true,1,1200,800),
('b0000000-0000-0000-0000-000000000008','a0000000-0000-0000-0000-000000000007','https://cdn.example.com/services/s7/1.jpg','https://cdn.example.com/services/s7/1_sm.jpg','Zona de masaje',true,1,1200,800),
('b0000000-0000-0000-0000-000000000009','a0000000-0000-0000-0000-000000000008','https://cdn.example.com/services/s8/1.jpg','https://cdn.example.com/services/s8/1_sm.jpg','Paseo en parque',true,1,1200,800),
('b0000000-0000-0000-0000-000000000010','a0000000-0000-0000-0000-000000000009','https://cdn.example.com/services/s9/1.jpg','https://cdn.example.com/services/s9/1_sm.jpg','Cocina a fondo',true,1,1200,800),
('b0000000-0000-0000-0000-000000000011','a0000000-0000-0000-0000-000000000010','https://cdn.example.com/services/s10/1.jpg','https://cdn.example.com/services/s10/1_sm.jpg','Reparación de fuga',true,1,1200,800),
('b0000000-0000-0000-0000-000000000012','a0000000-0000-0000-0000-000000000011','https://cdn.example.com/services/s11/1.jpg','https://cdn.example.com/services/s11/1_sm.jpg','Soporte remoto',true,1,1200,800),
('b0000000-0000-0000-0000-000000000013','a0000000-0000-0000-0000-000000000012','https://cdn.example.com/services/s12/1.jpg','https://cdn.example.com/services/s12/1_sm.jpg','Banners',true,1,1200,800),
('b0000000-0000-0000-0000-000000000014','a0000000-0000-0000-0000-000000000013','https://cdn.example.com/services/s13/1.jpg','https://cdn.example.com/services/s13/1_sm.jpg','Panel Ads',true,1,1200,800),
('b0000000-0000-0000-0000-000000000015','a0000000-0000-0000-0000-000000000014','https://cdn.example.com/services/s14/1.jpg','https://cdn.example.com/services/s14/1_sm.jpg','Clases por videollamada',true,1,1200,800),
('b0000000-0000-0000-0000-000000000016','a0000000-0000-0000-0000-000000000015','https://cdn.example.com/services/s15/1.jpg','https://cdn.example.com/services/s15/1_sm.jpg','Yoga en casa',true,1,1200,800),
('b0000000-0000-0000-0000-000000000017','a0000000-0000-0000-0000-000000000016','https://cdn.example.com/services/s16/1.jpg','https://cdn.example.com/services/s16/1_sm.jpg','Visita gatos',true,1,1200,800),
('b0000000-0000-0000-0000-000000000018','a0000000-0000-0000-0000-000000000020','https://cdn.example.com/services/s20/1.jpg','https://cdn.example.com/services/s20/1_sm.jpg','Tarjeta ejemplo',true,1,1200,800),
('b0000000-0000-0000-0000-000000000019','a0000000-0000-0000-0000-000000000021','https://cdn.example.com/services/s21/1.jpg','https://cdn.example.com/services/s21/1_sm.jpg','Informe SEO',true,1,1200,800),
('b0000000-0000-0000-0000-000000000020','a0000000-0000-0000-0000-000000000024','https://cdn.example.com/services/s24/1.jpg','https://cdn.example.com/services/s24/1_sm.jpg','Sesión adiestramiento',true,1,1200,800),
('b0000000-0000-0000-0000-000000000021','a0000000-0000-0000-0000-000000000027','https://cdn.example.com/services/s27/1.jpg','https://cdn.example.com/services/s27/1_sm.jpg','Benchmark',true,1,1200,800),
('b0000000-0000-0000-0000-000000000022','a0000000-0000-0000-0000-000000000028','https://cdn.example.com/services/s28/1.jpg','https://cdn.example.com/services/s28/1_sm.jpg','Plantilla CV',true,1,1200,800),
('b0000000-0000-0000-0000-000000000023','a0000000-0000-0000-0000-000000000033','https://cdn.example.com/services/s33/1.jpg','https://cdn.example.com/services/s33/1_sm.jpg','Oficina',true,1,1200,800),
('b0000000-0000-0000-0000-000000000024','a0000000-0000-0000-0000-000000000038','https://cdn.example.com/services/s38/1.jpg','https://cdn.example.com/services/s38/1_sm.jpg','Código ejemplo',true,1,1200,800),
('b0000000-0000-0000-0000-000000000025','a0000000-0000-0000-0000-000000000040','https://cdn.example.com/services/s40/1.jpg','https://cdn.example.com/services/s40/1_sm.jpg','Guardería',true,1,1200,800)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 15 DISPONIBILIDADES ADICIONALES
-- ============================================

INSERT INTO disponibilidad_servicios (id, servicio_id, dia_semana, hora_inicio, hora_fin, esta_disponible)
VALUES 
('d0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000001',1,'09:00','13:00',true),
('d0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000001',3,'09:00','13:00',true),
('d0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000002',2,'10:00','14:00',true),
('d0000000-0000-0000-0000-000000000004','a0000000-0000-0000-0000-000000000002',5,'16:00','19:00',true),
('d0000000-0000-0000-0000-000000000005','a0000000-0000-0000-0000-000000000003',1,'18:00','21:00',true),
('d0000000-0000-0000-0000-000000000006','a0000000-0000-0000-0000-000000000004',4,'10:00','12:00',true),
('d0000000-0000-0000-0000-000000000007','a0000000-0000-0000-0000-000000000005',2,'09:00','11:00',true),
('d0000000-0000-0000-0000-000000000008','a0000000-0000-0000-0000-000000000006',6,'10:00','13:00',true),
('d0000000-0000-0000-0000-000000000009','a0000000-0000-0000-0000-000000000007',0,'11:00','14:00',true),
('d0000000-0000-0000-0000-000000000010','a0000000-0000-0000-0000-000000000008',1,'08:00','10:00',true),
('d0000000-0000-0000-0000-000000000011','a0000000-0000-0000-0000-000000000011',3,'09:00','18:00',true),
('d0000000-0000-0000-0000-000000000012','a0000000-0000-0000-0000-000000000014',2,'17:00','21:00',true),
('d0000000-0000-0000-0000-000000000013','a0000000-0000-0000-0000-000000000016',5,'09:00','12:00',true),
('d0000000-0000-0000-0000-000000000014','a0000000-0000-0000-0000-000000000038',4,'18:00','20:00',true),
('d0000000-0000-0000-0000-000000000015','a0000000-0000-0000-0000-000000000040',6,'09:00','18:00',true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 5 EXCEPCIONES DE SERVICIOS ADICIONALES
-- ============================================

INSERT INTO excepciones_servicios (id, servicio_id, fecha_excepcion, esta_disponible, hora_inicio, hora_fin, motivo)
VALUES 
('e0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000001','2026-02-02',false,NULL,NULL,'Vacaciones'),
('e0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000006','2026-01-31',true,'10:00','12:00','Apertura extra'),
('e0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000011','2026-02-05',false,NULL,NULL,'No disponible'),
('e0000000-0000-0000-0000-000000000004','a0000000-0000-0000-0000-000000000014','2026-02-10',true,'19:00','21:00','Cambio horario'),
('e0000000-0000-0000-0000-000000000005','a0000000-0000-0000-0000-000000000040','2026-02-01',false,NULL,NULL,'Cupo completo')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 5 RESEÑAS ADICIONALES
-- ============================================

INSERT INTO resenas (id, servicio_id, revisor_id, usuario_valorado_id, calificacion, titulo, comentario, ventajas, desventajas, es_anonimo, respuesta, fecha_respuesta, es_destacada, votos_utiles)
VALUES 
('f0000000-0000-0000-0000-000000000001','a0000000-0000-0000-0000-000000000001',
'624fb14b-cda2-4def-8775-12cf6d5b4acb','018de432-0d71-4d8e-8b24-181c266f2a97',5,
'Impecable','Muy puntual y dejó todo perfecto.','Puntualidad, detalle','Ninguna',false,
'¡Gracias! Encantado de ayudar.','2026-01-20 10:00:00',true,3),
('f0000000-0000-0000-0000-000000000002','a0000000-0000-0000-0000-000000000002',
'7243312e-bb97-4960-9dbf-d4052208018f','060a39a7-621b-42ab-9249-a7383a8eb7b4',5,
'Montaje rápido','Todo estable y bien nivelado.','Rapidez','-',false,
'Gracias por la confianza.','2026-01-18 18:30:00',false,1),
('f0000000-0000-0000-0000-000000000003','a0000000-0000-0000-0000-000000000011',
'018de432-0d71-4d8e-8b24-181c266f2a97','b86bcd2b-48fd-4b89-b4c5-3466de152099',5,
'Solucionado en remoto','Me arregló el problema en 20 minutos.','Eficiente','Ninguna',true,
'¡Me alegro!','2026-01-22 09:15:00',true,5),
('f0000000-0000-0000-0000-000000000004','a0000000-0000-0000-0000-000000000014',
'983b9c31-2017-4a26-b9fa-65284050d26f','d30c2a59-dfb4-4f9a-9b7a-98a5033d615f',4,
'Buenas clases','Conversación fluida y correcciones útiles.','Feedback','Se me pasó rápido',false,
'Gracias, seguimos.','2026-01-21 20:00:00',false,2),
('f0000000-0000-0000-0000-000000000005','a0000000-0000-0000-0000-000000000008',
'060a39a7-621b-42ab-9249-a7383a8eb7b4','96808fea-c124-43b7-9068-15f99f0e005c',5,
'Mi perro feliz','Paseo excelente y reportó con fotos.','Confiable','-',false,
'¡Gracias!','2026-01-19 12:00:00',true,4)
ON CONFLICT (id) DO NOTHING;


-- ============================================
-- VERIFICACIÓN DE DATOS
-- ============================================

SELECT '========================================' as info;
SELECT '  RESUMEN DE DATOS INSERTADOS' as info;
SELECT '========================================' as info;

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
SELECT 'FAQs', COUNT(*) FROM preguntas_frecuentes_servicios
UNION ALL
SELECT 'Códigos Promocionales', COUNT(*) FROM codigos_promocionales
UNION ALL
SELECT 'Historial búsquedas', COUNT(*) FROM historial_busquedas
UNION ALL
SELECT 'Reportes', COUNT(*) FROM reportes;


-- ============================================
-- ✅ DATOS DE PRUEBA COMPLETADOS
-- ============================================
-- 
-- 👤 Usuarios de prueba creados:
-- 
-- ADMINISTRADOR:
--   Email: admin@aplicacionservicios.com
--   Contraseña: Admin123!
--   Usuario: admin
-- 
-- PROVEEDORES DE SERVICIOS:
--   - juan@email.com (juan_electricista) - Electricista
--   - maria@email.com (maria_limpieza) - Limpieza
--   - carlos@email.com (carlos_plomero) - Plomero
--   - sofia@email.com (sofia_profesional) - Profesora
-- 
-- CLIENTES:
--   - ana@email.com (ana_cliente)
--   - pedro@email.com (pedro_cliente)
-- 
-- Contraseña para todos los usuarios de prueba: Test123!
-- 
-- ============================================
