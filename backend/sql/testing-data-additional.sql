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
