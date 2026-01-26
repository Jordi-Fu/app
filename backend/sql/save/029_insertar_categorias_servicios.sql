-- =====================================================
-- Script: 029_insertar_categorias_servicios.sql
-- Descripción: Insertar categorías y subcategorías de servicios
-- Fecha: 2026-01-26
-- =====================================================

-- Primero limpiar las categorías existentes (opcional, descomentar si se necesita)
-- DELETE FROM categorias WHERE 1=1;

-- =====================================================
-- INSERTAR CATEGORÍAS PRINCIPALES
-- =====================================================

-- 1. Hogar y Mantenimiento
INSERT INTO categorias (id, nombre, slug, descripcion, url_icono, color, padre_id, indice_orden, esta_activo)
VALUES (
  gen_random_uuid(),
  'Hogar y Mantenimiento',
  'hogar-mantenimiento',
  'Servicios de mantenimiento y reparación para el hogar',
  '🔧',
  '#3B82F6',
  NULL,
  1,
  true
) ON CONFLICT (slug) DO UPDATE SET 
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  url_icono = EXCLUDED.url_icono,
  color = EXCLUDED.color,
  indice_orden = EXCLUDED.indice_orden;

-- 2. Construcción y Remodelación
INSERT INTO categorias (id, nombre, slug, descripcion, url_icono, color, padre_id, indice_orden, esta_activo)
VALUES (
  gen_random_uuid(),
  'Construcción y Remodelación',
  'construccion-remodelacion',
  'Servicios de construcción, remodelaciones y obras',
  '🏗️',
  '#F59E0B',
  NULL,
  2,
  true
) ON CONFLICT (slug) DO UPDATE SET 
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  url_icono = EXCLUDED.url_icono,
  color = EXCLUDED.color,
  indice_orden = EXCLUDED.indice_orden;

-- 3. Limpieza y Aseo
INSERT INTO categorias (id, nombre, slug, descripcion, url_icono, color, padre_id, indice_orden, esta_activo)
VALUES (
  gen_random_uuid(),
  'Limpieza y Aseo',
  'limpieza-aseo',
  'Servicios de limpieza doméstica y lavandería',
  '🧹',
  '#10B981',
  NULL,
  3,
  true
) ON CONFLICT (slug) DO UPDATE SET 
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  url_icono = EXCLUDED.url_icono,
  color = EXCLUDED.color,
  indice_orden = EXCLUDED.indice_orden;

-- 4. Jardinería y Exteriores
INSERT INTO categorias (id, nombre, slug, descripcion, url_icono, color, padre_id, indice_orden, esta_activo)
VALUES (
  gen_random_uuid(),
  'Jardinería y Exteriores',
  'jardineria-exteriores',
  'Servicios de jardinería y mantenimiento de áreas verdes',
  '🌿',
  '#22C55E',
  NULL,
  4,
  true
) ON CONFLICT (slug) DO UPDATE SET 
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  url_icono = EXCLUDED.url_icono,
  color = EXCLUDED.color,
  indice_orden = EXCLUDED.indice_orden;

-- 5. Servicios de Emergencia
INSERT INTO categorias (id, nombre, slug, descripcion, url_icono, color, padre_id, indice_orden, esta_activo)
VALUES (
  gen_random_uuid(),
  'Servicios de Emergencia',
  'servicios-emergencia',
  'Servicios urgentes de cerrajería y gas',
  '🚨',
  '#EF4444',
  NULL,
  5,
  true
) ON CONFLICT (slug) DO UPDATE SET 
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  url_icono = EXCLUDED.url_icono,
  color = EXCLUDED.color,
  indice_orden = EXCLUDED.indice_orden;

-- 6. Tecnología y Soporte Técnico
INSERT INTO categorias (id, nombre, slug, descripcion, url_icono, color, padre_id, indice_orden, esta_activo)
VALUES (
  gen_random_uuid(),
  'Tecnología y Soporte Técnico',
  'tecnologia-soporte',
  'Reparación de dispositivos y soporte técnico',
  '💻',
  '#8B5CF6',
  NULL,
  6,
  true
) ON CONFLICT (slug) DO UPDATE SET 
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  url_icono = EXCLUDED.url_icono,
  color = EXCLUDED.color,
  indice_orden = EXCLUDED.indice_orden;

-- 7. Transporte y Mensajería
INSERT INTO categorias (id, nombre, slug, descripcion, url_icono, color, padre_id, indice_orden, esta_activo)
VALUES (
  gen_random_uuid(),
  'Transporte y Mensajería',
  'transporte-mensajeria',
  'Servicios de transporte privado y mensajería',
  '🚗',
  '#06B6D4',
  NULL,
  7,
  true
) ON CONFLICT (slug) DO UPDATE SET 
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  url_icono = EXCLUDED.url_icono,
  color = EXCLUDED.color,
  indice_orden = EXCLUDED.indice_orden;

-- 8. Alimentación y Delivery
INSERT INTO categorias (id, nombre, slug, descripcion, url_icono, color, padre_id, indice_orden, esta_activo)
VALUES (
  gen_random_uuid(),
  'Alimentación y Delivery',
  'alimentacion-delivery',
  'Servicios de comida a domicilio',
  '🍳',
  '#F97316',
  NULL,
  8,
  true
) ON CONFLICT (slug) DO UPDATE SET 
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  url_icono = EXCLUDED.url_icono,
  color = EXCLUDED.color,
  indice_orden = EXCLUDED.indice_orden;

-- 9. Cuidado Personal y Estética
INSERT INTO categorias (id, nombre, slug, descripcion, url_icono, color, padre_id, indice_orden, esta_activo)
VALUES (
  gen_random_uuid(),
  'Cuidado Personal y Estética',
  'cuidado-personal-estetica',
  'Servicios de belleza y cuidado personal',
  '💅',
  '#EC4899',
  NULL,
  9,
  true
) ON CONFLICT (slug) DO UPDATE SET 
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  url_icono = EXCLUDED.url_icono,
  color = EXCLUDED.color,
  indice_orden = EXCLUDED.indice_orden;

-- 10. Salud y Cuidado Familiar
INSERT INTO categorias (id, nombre, slug, descripcion, url_icono, color, padre_id, indice_orden, esta_activo)
VALUES (
  gen_random_uuid(),
  'Salud y Cuidado Familiar',
  'salud-cuidado-familiar',
  'Cuidado de adultos mayores y niños',
  '❤️',
  '#F43F5E',
  NULL,
  10,
  true
) ON CONFLICT (slug) DO UPDATE SET 
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  url_icono = EXCLUDED.url_icono,
  color = EXCLUDED.color,
  indice_orden = EXCLUDED.indice_orden;

-- 11. Educación y Enseñanza
INSERT INTO categorias (id, nombre, slug, descripcion, url_icono, color, padre_id, indice_orden, esta_activo)
VALUES (
  gen_random_uuid(),
  'Educación y Enseñanza',
  'educacion-ensenanza',
  'Clases particulares, tutorías y capacitación',
  '📚',
  '#6366F1',
  NULL,
  11,
  true
) ON CONFLICT (slug) DO UPDATE SET 
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  url_icono = EXCLUDED.url_icono,
  color = EXCLUDED.color,
  indice_orden = EXCLUDED.indice_orden;

-- 12. Seguridad y Control de Plagas
INSERT INTO categorias (id, nombre, slug, descripcion, url_icono, color, padre_id, indice_orden, esta_activo)
VALUES (
  gen_random_uuid(),
  'Seguridad y Control de Plagas',
  'seguridad-control-plagas',
  'Servicios de fumigación y control de plagas',
  '🛡️',
  '#64748B',
  NULL,
  12,
  true
) ON CONFLICT (slug) DO UPDATE SET 
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  url_icono = EXCLUDED.url_icono,
  color = EXCLUDED.color,
  indice_orden = EXCLUDED.indice_orden;

-- =====================================================
-- INSERTAR SUBCATEGORÍAS
-- =====================================================

-- Subcategorías de Hogar y Mantenimiento
INSERT INTO categorias (id, nombre, slug, descripcion, url_icono, color, padre_id, indice_orden, esta_activo)
SELECT 
  gen_random_uuid(),
  'Plomería',
  'plomeria',
  'Reparación e instalación de tuberías y sanitarios',
  '🚿',
  '#3B82F6',
  id,
  1,
  true
FROM categorias WHERE slug = 'hogar-mantenimiento'
ON CONFLICT (slug) DO UPDATE SET 
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  url_icono = EXCLUDED.url_icono;

INSERT INTO categorias (id, nombre, slug, descripcion, url_icono, color, padre_id, indice_orden, esta_activo)
SELECT 
  gen_random_uuid(),
  'Electricidad',
  'electricidad',
  'Instalaciones y reparaciones eléctricas',
  '⚡',
  '#3B82F6',
  id,
  2,
  true
FROM categorias WHERE slug = 'hogar-mantenimiento'
ON CONFLICT (slug) DO UPDATE SET 
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  url_icono = EXCLUDED.url_icono;

INSERT INTO categorias (id, nombre, slug, descripcion, url_icono, color, padre_id, indice_orden, esta_activo)
SELECT 
  gen_random_uuid(),
  'Albañilería',
  'albanileria',
  'Trabajos de albañilería y construcción menor',
  '🧱',
  '#3B82F6',
  id,
  3,
  true
FROM categorias WHERE slug = 'hogar-mantenimiento'
ON CONFLICT (slug) DO UPDATE SET 
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  url_icono = EXCLUDED.url_icono;

INSERT INTO categorias (id, nombre, slug, descripcion, url_icono, color, padre_id, indice_orden, esta_activo)
SELECT 
  gen_random_uuid(),
  'Pintura',
  'pintura',
  'Servicios de pintura interior y exterior',
  '🎨',
  '#3B82F6',
  id,
  4,
  true
FROM categorias WHERE slug = 'hogar-mantenimiento'
ON CONFLICT (slug) DO UPDATE SET 
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  url_icono = EXCLUDED.url_icono;

INSERT INTO categorias (id, nombre, slug, descripcion, url_icono, color, padre_id, indice_orden, esta_activo)
SELECT 
  gen_random_uuid(),
  'Carpintería',
  'carpinteria',
  'Trabajos en madera y muebles',
  '🪚',
  '#3B82F6',
  id,
  5,
  true
FROM categorias WHERE slug = 'hogar-mantenimiento'
ON CONFLICT (slug) DO UPDATE SET 
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  url_icono = EXCLUDED.url_icono;

-- Subcategorías de Construcción y Remodelación
INSERT INTO categorias (id, nombre, slug, descripcion, url_icono, color, padre_id, indice_orden, esta_activo)
SELECT 
  gen_random_uuid(),
  'Remodelaciones',
  'remodelaciones',
  'Remodelación integral de espacios',
  '🏠',
  '#F59E0B',
  id,
  1,
  true
FROM categorias WHERE slug = 'construccion-remodelacion'
ON CONFLICT (slug) DO UPDATE SET 
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  url_icono = EXCLUDED.url_icono;

INSERT INTO categorias (id, nombre, slug, descripcion, url_icono, color, padre_id, indice_orden, esta_activo)
SELECT 
  gen_random_uuid(),
  'Reparaciones estructurales',
  'reparaciones-estructurales',
  'Reparaciones de estructura y cimientos',
  '🔨',
  '#F59E0B',
  id,
  2,
  true
FROM categorias WHERE slug = 'construccion-remodelacion'
ON CONFLICT (slug) DO UPDATE SET 
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  url_icono = EXCLUDED.url_icono;

-- Subcategorías de Limpieza y Aseo
INSERT INTO categorias (id, nombre, slug, descripcion, url_icono, color, padre_id, indice_orden, esta_activo)
SELECT 
  gen_random_uuid(),
  'Limpieza doméstica',
  'limpieza-domestica',
  'Limpieza general del hogar',
  '🏠',
  '#10B981',
  id,
  1,
  true
FROM categorias WHERE slug = 'limpieza-aseo'
ON CONFLICT (slug) DO UPDATE SET 
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  url_icono = EXCLUDED.url_icono;

INSERT INTO categorias (id, nombre, slug, descripcion, url_icono, color, padre_id, indice_orden, esta_activo)
SELECT 
  gen_random_uuid(),
  'Lavandería y planchado',
  'lavanderia-planchado',
  'Servicios de lavandería y planchado de ropa',
  '👕',
  '#10B981',
  id,
  2,
  true
FROM categorias WHERE slug = 'limpieza-aseo'
ON CONFLICT (slug) DO UPDATE SET 
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  url_icono = EXCLUDED.url_icono;

-- Subcategorías de Jardinería y Exteriores
INSERT INTO categorias (id, nombre, slug, descripcion, url_icono, color, padre_id, indice_orden, esta_activo)
SELECT 
  gen_random_uuid(),
  'Jardinería',
  'jardineria',
  'Diseño y cuidado de jardines',
  '🌱',
  '#22C55E',
  id,
  1,
  true
FROM categorias WHERE slug = 'jardineria-exteriores'
ON CONFLICT (slug) DO UPDATE SET 
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  url_icono = EXCLUDED.url_icono;

INSERT INTO categorias (id, nombre, slug, descripcion, url_icono, color, padre_id, indice_orden, esta_activo)
SELECT 
  gen_random_uuid(),
  'Mantenimiento de áreas verdes',
  'mantenimiento-areas-verdes',
  'Mantenimiento de césped y áreas verdes',
  '🌳',
  '#22C55E',
  id,
  2,
  true
FROM categorias WHERE slug = 'jardineria-exteriores'
ON CONFLICT (slug) DO UPDATE SET 
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  url_icono = EXCLUDED.url_icono;

-- Subcategorías de Servicios de Emergencia
INSERT INTO categorias (id, nombre, slug, descripcion, url_icono, color, padre_id, indice_orden, esta_activo)
SELECT 
  gen_random_uuid(),
  'Cerrajería',
  'cerrajeria',
  'Apertura de cerraduras y cambio de llaves',
  '🔑',
  '#EF4444',
  id,
  1,
  true
FROM categorias WHERE slug = 'servicios-emergencia'
ON CONFLICT (slug) DO UPDATE SET 
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  url_icono = EXCLUDED.url_icono;

INSERT INTO categorias (id, nombre, slug, descripcion, url_icono, color, padre_id, indice_orden, esta_activo)
SELECT 
  gen_random_uuid(),
  'Servicio de gas',
  'servicio-gas',
  'Reparación e instalación de gas',
  '🔥',
  '#EF4444',
  id,
  2,
  true
FROM categorias WHERE slug = 'servicios-emergencia'
ON CONFLICT (slug) DO UPDATE SET 
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  url_icono = EXCLUDED.url_icono;

-- Subcategorías de Tecnología y Soporte Técnico
INSERT INTO categorias (id, nombre, slug, descripcion, url_icono, color, padre_id, indice_orden, esta_activo)
SELECT 
  gen_random_uuid(),
  'Reparación de celulares',
  'reparacion-celulares',
  'Reparación de teléfonos móviles',
  '📱',
  '#8B5CF6',
  id,
  1,
  true
FROM categorias WHERE slug = 'tecnologia-soporte'
ON CONFLICT (slug) DO UPDATE SET 
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  url_icono = EXCLUDED.url_icono;

INSERT INTO categorias (id, nombre, slug, descripcion, url_icono, color, padre_id, indice_orden, esta_activo)
SELECT 
  gen_random_uuid(),
  'Soporte técnico básico',
  'soporte-tecnico-basico',
  'Soporte técnico para computadoras',
  '🖥️',
  '#8B5CF6',
  id,
  2,
  true
FROM categorias WHERE slug = 'tecnologia-soporte'
ON CONFLICT (slug) DO UPDATE SET 
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  url_icono = EXCLUDED.url_icono;

INSERT INTO categorias (id, nombre, slug, descripcion, url_icono, color, padre_id, indice_orden, esta_activo)
SELECT 
  gen_random_uuid(),
  'Reparación de electrodomésticos',
  'reparacion-electrodomesticos',
  'Reparación de electrodomésticos del hogar',
  '🔌',
  '#8B5CF6',
  id,
  3,
  true
FROM categorias WHERE slug = 'tecnologia-soporte'
ON CONFLICT (slug) DO UPDATE SET 
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  url_icono = EXCLUDED.url_icono;

-- Subcategorías de Transporte y Mensajería
INSERT INTO categorias (id, nombre, slug, descripcion, url_icono, color, padre_id, indice_orden, esta_activo)
SELECT 
  gen_random_uuid(),
  'Transporte privado',
  'transporte-privado',
  'Servicio de transporte privado de personas',
  '🚕',
  '#06B6D4',
  id,
  1,
  true
FROM categorias WHERE slug = 'transporte-mensajeria'
ON CONFLICT (slug) DO UPDATE SET 
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  url_icono = EXCLUDED.url_icono;

INSERT INTO categorias (id, nombre, slug, descripcion, url_icono, color, padre_id, indice_orden, esta_activo)
SELECT 
  gen_random_uuid(),
  'Mensajería y mandados',
  'mensajeria-mandados',
  'Servicio de mensajería y mandados',
  '📦',
  '#06B6D4',
  id,
  2,
  true
FROM categorias WHERE slug = 'transporte-mensajeria'
ON CONFLICT (slug) DO UPDATE SET 
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  url_icono = EXCLUDED.url_icono;

-- Subcategoría de Alimentación y Delivery
INSERT INTO categorias (id, nombre, slug, descripcion, url_icono, color, padre_id, indice_orden, esta_activo)
SELECT 
  gen_random_uuid(),
  'Servicio de comida a domicilio',
  'comida-domicilio',
  'Preparación y entrega de comida a domicilio',
  '🍽️',
  '#F97316',
  id,
  1,
  true
FROM categorias WHERE slug = 'alimentacion-delivery'
ON CONFLICT (slug) DO UPDATE SET 
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  url_icono = EXCLUDED.url_icono;

-- Subcategorías de Cuidado Personal y Estética
INSERT INTO categorias (id, nombre, slug, descripcion, url_icono, color, padre_id, indice_orden, esta_activo)
SELECT 
  gen_random_uuid(),
  'Estética',
  'estetica',
  'Servicios de estética y belleza',
  '💄',
  '#EC4899',
  id,
  1,
  true
FROM categorias WHERE slug = 'cuidado-personal-estetica'
ON CONFLICT (slug) DO UPDATE SET 
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  url_icono = EXCLUDED.url_icono;

INSERT INTO categorias (id, nombre, slug, descripcion, url_icono, color, padre_id, indice_orden, esta_activo)
SELECT 
  gen_random_uuid(),
  'Peluquería',
  'peluqueria',
  'Corte, peinado y tratamientos capilares',
  '💇',
  '#EC4899',
  id,
  2,
  true
FROM categorias WHERE slug = 'cuidado-personal-estetica'
ON CONFLICT (slug) DO UPDATE SET 
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  url_icono = EXCLUDED.url_icono;

-- Subcategorías de Salud y Cuidado Familiar
INSERT INTO categorias (id, nombre, slug, descripcion, url_icono, color, padre_id, indice_orden, esta_activo)
SELECT 
  gen_random_uuid(),
  'Cuidado de adultos mayores',
  'cuidado-adultos-mayores',
  'Cuidado y acompañamiento de personas mayores',
  '👴',
  '#F43F5E',
  id,
  1,
  true
FROM categorias WHERE slug = 'salud-cuidado-familiar'
ON CONFLICT (slug) DO UPDATE SET 
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  url_icono = EXCLUDED.url_icono;

INSERT INTO categorias (id, nombre, slug, descripcion, url_icono, color, padre_id, indice_orden, esta_activo)
SELECT 
  gen_random_uuid(),
  'Cuidado de niños (niñeras)',
  'cuidado-ninos',
  'Servicios de niñera y cuidado infantil',
  '👶',
  '#F43F5E',
  id,
  2,
  true
FROM categorias WHERE slug = 'salud-cuidado-familiar'
ON CONFLICT (slug) DO UPDATE SET 
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  url_icono = EXCLUDED.url_icono;

-- Subcategorías de Educación y Enseñanza
INSERT INTO categorias (id, nombre, slug, descripcion, url_icono, color, padre_id, indice_orden, esta_activo)
SELECT 
  gen_random_uuid(),
  'Clases particulares',
  'clases-particulares',
  'Clases particulares de diversas materias',
  '👨‍🏫',
  '#6366F1',
  id,
  1,
  true
FROM categorias WHERE slug = 'educacion-ensenanza'
ON CONFLICT (slug) DO UPDATE SET 
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  url_icono = EXCLUDED.url_icono;

INSERT INTO categorias (id, nombre, slug, descripcion, url_icono, color, padre_id, indice_orden, esta_activo)
SELECT 
  gen_random_uuid(),
  'Tutorías académicas',
  'tutorias-academicas',
  'Tutorías y asesorías académicas',
  '📖',
  '#6366F1',
  id,
  2,
  true
FROM categorias WHERE slug = 'educacion-ensenanza'
ON CONFLICT (slug) DO UPDATE SET 
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  url_icono = EXCLUDED.url_icono;

INSERT INTO categorias (id, nombre, slug, descripcion, url_icono, color, padre_id, indice_orden, esta_activo)
SELECT 
  gen_random_uuid(),
  'Enseñanza de idiomas',
  'ensenanza-idiomas',
  'Clases de idiomas extranjeros',
  '🌍',
  '#6366F1',
  id,
  3,
  true
FROM categorias WHERE slug = 'educacion-ensenanza'
ON CONFLICT (slug) DO UPDATE SET 
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  url_icono = EXCLUDED.url_icono;

INSERT INTO categorias (id, nombre, slug, descripcion, url_icono, color, padre_id, indice_orden, esta_activo)
SELECT 
  gen_random_uuid(),
  'Apoyo escolar',
  'apoyo-escolar',
  'Ayuda con tareas y estudios escolares',
  '✏️',
  '#6366F1',
  id,
  4,
  true
FROM categorias WHERE slug = 'educacion-ensenanza'
ON CONFLICT (slug) DO UPDATE SET 
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  url_icono = EXCLUDED.url_icono;

INSERT INTO categorias (id, nombre, slug, descripcion, url_icono, color, padre_id, indice_orden, esta_activo)
SELECT 
  gen_random_uuid(),
  'Capacitación técnica',
  'capacitacion-tecnica',
  'Capacitación en habilidades técnicas y oficios',
  '🎓',
  '#6366F1',
  id,
  5,
  true
FROM categorias WHERE slug = 'educacion-ensenanza'
ON CONFLICT (slug) DO UPDATE SET 
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  url_icono = EXCLUDED.url_icono;

-- Subcategoría de Seguridad y Control de Plagas
INSERT INTO categorias (id, nombre, slug, descripcion, url_icono, color, padre_id, indice_orden, esta_activo)
SELECT 
  gen_random_uuid(),
  'Fumigación',
  'fumigacion',
  'Servicios de fumigación y control de plagas',
  '🐜',
  '#64748B',
  id,
  1,
  true
FROM categorias WHERE slug = 'seguridad-control-plagas'
ON CONFLICT (slug) DO UPDATE SET 
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  url_icono = EXCLUDED.url_icono;

-- =====================================================
-- VERIFICAR INSERCIÓN
-- =====================================================
SELECT 
  c.nombre AS categoria,
  c.url_icono AS icono,
  COALESCE(p.nombre, 'Principal') AS padre,
  c.indice_orden
FROM categorias c
LEFT JOIN categorias p ON c.padre_id = p.id
WHERE c.esta_activo = true
ORDER BY 
  CASE WHEN c.padre_id IS NULL THEN c.indice_orden ELSE 999 END,
  p.indice_orden,
  c.indice_orden;
