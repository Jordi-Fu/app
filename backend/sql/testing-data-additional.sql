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
  v_moderador_id UUID;
  
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
  
  -- Variables para badges
  v_badge_verified UUID;
  v_badge_toprated UUID;
  v_badge_quickresponse UUID;
  
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
  SELECT id INTO v_admin_id FROM users WHERE username = 'admin';
  SELECT id INTO v_juan_id FROM users WHERE username = 'juan_electricista';
  SELECT id INTO v_maria_id FROM users WHERE username = 'maria_limpieza';
  SELECT id INTO v_carlos_id FROM users WHERE username = 'carlos_plomero';
  SELECT id INTO v_ana_id FROM users WHERE username = 'ana_cliente';
  SELECT id INTO v_pedro_id FROM users WHERE username = 'pedro_cliente';
  SELECT id INTO v_sofia_id FROM users WHERE username = 'sofia_profesional';
  SELECT id INTO v_moderador_id FROM users WHERE username = 'moderador_sistema';
  
  -- ============================================
  -- OBTENER IDs DE CATEGORÍAS EXISTENTES
  -- ============================================
  SELECT id INTO v_cat_limpieza FROM categories WHERE slug = 'limpieza-hogar';
  SELECT id INTO v_cat_reparaciones FROM categories WHERE slug = 'reparaciones';
  SELECT id INTO v_cat_clases FROM categories WHERE slug = 'clases-particulares';
  SELECT id INTO v_cat_belleza FROM categories WHERE slug = 'belleza-estetica';
  SELECT id INTO v_cat_transporte FROM categories WHERE slug = 'transporte-mudanzas';
  SELECT id INTO v_cat_tecnologia FROM categories WHERE slug = 'tecnologia';
  SELECT id INTO v_cat_fotografia FROM categories WHERE slug = 'fotografia-video';
  SELECT id INTO v_cat_eventos FROM categories WHERE slug = 'eventos-catering';
  SELECT id INTO v_cat_salud FROM categories WHERE slug = 'salud-bienestar';
  SELECT id INTO v_cat_jardineria FROM categories WHERE slug = 'jardineria';
  
  -- ============================================
  -- OBTENER IDs DE BADGES EXISTENTES
  -- ============================================
  SELECT id INTO v_badge_verified FROM user_badges WHERE slug = 'verified-provider';
  SELECT id INTO v_badge_toprated FROM user_badges WHERE slug = 'top-rated';
  SELECT id INTO v_badge_quickresponse FROM user_badges WHERE slug = 'quick-response';
  
  -- ============================================
  -- INSERTAR DIRECCIONES DE USUARIO
  -- ============================================
  RAISE NOTICE 'Insertando direcciones de usuarios...';
  
  INSERT INTO user_addresses (user_id, label, address_line1, address_line2, city, state, postal_code, country, latitude, longitude, is_default)
  VALUES
    (v_juan_id, 'home', 'Av. Insurgentes Sur 1234', 'Col. Del Valle', 'Ciudad de México', 'CDMX', '03100', 'Mexico', 19.3707, -99.1678, true),
    (v_maria_id, 'home', 'Calle Reforma 456', 'Col. Centro', 'Monterrey', 'Nuevo León', '64000', 'Mexico', 25.6866, -100.3161, true),
    (v_carlos_id, 'work', 'Av. Constitución 789', 'Col. Industrial', 'Guadalajara', 'Jalisco', '44100', 'Mexico', 20.6597, -103.3496, true),
    (v_ana_id, 'home', 'Calle Juárez 321', 'Col. Centro', 'Ciudad de México', 'CDMX', '06000', 'Mexico', 19.4326, -99.1332, true),
    (v_ana_id, 'work', 'Paseo de la Reforma 555', 'Piso 10', 'Ciudad de México', 'CDMX', '06600', 'Mexico', 19.4270, -99.1677, false),
    (v_sofia_id, 'home', 'Av. Universidad 234', 'Col. Del Carmen', 'Puebla', 'Puebla', '72000', 'Mexico', 19.0414, -98.2063, true);
  
  -- ============================================
  -- INSERTAR SERVICIOS
  -- ============================================
  RAISE NOTICE 'Insertando servicios...';
  
  -- Servicio 1: Instalación eléctrica por Juan
  INSERT INTO services (
    provider_id, category_id, title, description, short_description,
    price_type, price, currency, duration_minutes,
    location_type, city, state, country, latitude, longitude,
    is_active, is_featured, views_count, rating_average, total_reviews
  ) VALUES (
    v_juan_id, v_cat_reparaciones,
    'Instalación y Reparación Eléctrica Residencial',
    'Servicio profesional de electricidad para tu hogar. Incluye: instalación de contactos, apagadores, lámparas, ventiladores de techo, reparación de cortocircuitos, actualización de tableros eléctricos, instalación de timbres y porteros eléctricos. Trabajo garantizado y materiales de primera calidad. Atención 24/7 para emergencias.',
    'Electricista profesional con 10 años de experiencia',
    'hourly', 350.00, 'MXN', 60,
    'at_client', 'Ciudad de México', 'CDMX', 'Mexico', 19.3707, -99.1678,
    true, true, 245, 4.8, 45
  ) RETURNING id INTO v_service1_id;
  
  -- Servicio 2: Limpieza profunda por María
  INSERT INTO services (
    provider_id, category_id, title, description, short_description,
    price_type, price, currency, duration_minutes,
    location_type, city, state, country, latitude, longitude,
    is_active, is_featured, views_count, rating_average, total_reviews
  ) VALUES (
    v_maria_id, v_cat_limpieza,
    'Limpieza Profunda de Hogar y Oficina',
    'Servicio completo de limpieza profesional. Incluye: barrido y trapeado de pisos, limpieza de baños y cocina, desempolvado de muebles, limpieza de ventanas, aspirado de alfombras y tapetes. Llevamos nuestros propios productos de limpieza ecológicos. Personal capacitado y confiable. Disponible fines de semana.',
    'Limpieza profesional con productos ecológicos',
    'fixed', 800.00, 'MXN', 180,
    'at_client', 'Monterrey', 'Nuevo León', 'Mexico', 25.6866, -100.3161,
    true, true, 387, 4.9, 78
  ) RETURNING id INTO v_service2_id;
  
  -- Servicio 3: Plomería por Carlos
  INSERT INTO services (
    provider_id, category_id, title, description, short_description,
    price_type, price, price_max, currency, duration_minutes,
    location_type, city, state, country, latitude, longitude,
    is_active, views_count, rating_average, total_reviews
  ) VALUES (
    v_carlos_id, v_cat_reparaciones,
    'Plomería Residencial y Comercial',
    'Servicios completos de plomería: reparación de fugas, destapado de cañerías, instalación de llaves y muebles de baño, reparación de calentadores, instalación de tinacos y cisternas, mantenimiento preventivo. Servicio de emergencia disponible. Presupuesto sin compromiso.',
    'Plomero profesional - Reparaciones e instalaciones',
    'negotiable', 300.00, 1500.00, 'MXN', 90,
    'at_client', 'Guadalajara', 'Jalisco', 'Mexico', 20.6597, -103.3496,
    true, 198, 4.7, 92
  ) RETURNING id INTO v_service3_id;
  
  -- Servicio 4: Clases de inglés por Sofía
  INSERT INTO services (
    provider_id, category_id, title, description, short_description,
    price_type, price, currency, duration_minutes,
    location_type, city, state, country, latitude, longitude,
    is_active, is_featured, views_count, rating_average, total_reviews
  ) VALUES (
    v_sofia_id, v_cat_clases,
    'Clases Particulares de Inglés Online',
    'Clases personalizadas de inglés para todos los niveles (A1-C2). Preparación para exámenes TOEFL, IELTS, Cambridge. Conversación, gramática, escritura. Material didáctico incluido. Horarios flexibles. Primera clase de prueba gratis. Metodología comunicativa y dinámica.',
    'Profesora certificada - Todos los niveles',
    'hourly', 250.00, 'MXN', 60,
    'remote', 'Puebla', 'Puebla', 'Mexico', 19.0414, -98.2063,
    true, true, 156, 4.85, 34
  ) RETURNING id INTO v_service4_id;
  
  -- Servicio 5: Clases de matemáticas por Sofía
  INSERT INTO services (
    provider_id, category_id, title, description, short_description,
    price_type, price, currency, duration_minutes,
    location_type, city, state, country,
    is_active, views_count
  ) VALUES (
    v_sofia_id, v_cat_clases,
    'Asesorías de Matemáticas - Todos los Niveles',
    'Asesorías personalizadas de matemáticas: primaria, secundaria, preparatoria y universidad. Álgebra, cálculo, geometría, trigonometría, estadística. Explicaciones claras y pacientes. Resolución de ejercicios paso a paso. Material de apoyo incluido.',
    'Asesorías de matemáticas personalizadas',
    'hourly', 280.00, 'MXN', 60,
    'flexible', 'Puebla', 'Puebla', 'Mexico',
    true, 89
  ) RETURNING id INTO v_service5_id;
  
  -- Servicio 6: Mantenimiento por Juan
  INSERT INTO services (
    provider_id, category_id, title, description, short_description,
    price_type, price, currency, duration_minutes,
    location_type, city, state, country,
    is_active, views_count
  ) VALUES (
    v_juan_id, v_cat_reparaciones,
    'Mantenimiento Preventivo Eléctrico',
    'Servicio de mantenimiento preventivo para tu instalación eléctrica. Incluye: revisión de tablero eléctrico, verificación de conexiones, prueba de circuitos, reporte de condiciones. Previene accidentes y ahorra energía.',
    'Mantenimiento preventivo eléctrico profesional',
    'fixed', 1200.00, 'MXN', 120,
    'at_client', 'Ciudad de México', 'CDMX', 'Mexico',
    true, 67
  ) RETURNING id INTO v_service6_id;
  
  -- ============================================
  -- INSERTAR IMÁGENES DE SERVICIOS
  -- ============================================
  RAISE NOTICE 'Insertando imágenes de servicios...';
  
  -- Imágenes para servicio de electricidad
  INSERT INTO service_images (service_id, image_url, thumbnail_url, caption, is_primary, order_index)
  VALUES
    (v_service1_id, 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4', 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=200', 'Instalación eléctrica profesional', true, 1),
    (v_service1_id, 'https://images.unsplash.com/photo-1613665813446-82a78c468a1d', 'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?w=200', 'Tablero eléctrico moderno', false, 2),
    (v_service1_id, 'https://images.unsplash.com/photo-1590852498113-c1cf6b21aaa8', 'https://images.unsplash.com/photo-1590852498113-c1cf6b21aaa8?w=200', 'Herramientas profesionales', false, 3);
  
  -- Imágenes para servicio de limpieza
  INSERT INTO service_images (service_id, image_url, thumbnail_url, caption, is_primary, order_index)
  VALUES
    (v_service2_id, 'https://images.unsplash.com/photo-1581578731548-c64695cc6952', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200', 'Limpieza profesional de hogar', true, 1),
    (v_service2_id, 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50', 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=200', 'Productos de limpieza ecológicos', false, 2);
  
  -- Imágenes para servicio de plomería
  INSERT INTO service_images (service_id, image_url, thumbnail_url, caption, is_primary, order_index)
  VALUES
    (v_service3_id, 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39', 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=200', 'Reparación profesional de plomería', true, 1),
    (v_service3_id, 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d', 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=200', 'Instalación de grifería', false, 2);
  
  -- Imágenes para clases de inglés
  INSERT INTO service_images (service_id, image_url, thumbnail_url, caption, is_primary, order_index)
  VALUES
    (v_service4_id, 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d', 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=200', 'Clases online personalizadas', true, 1);
  
  -- ============================================
  -- INSERTAR DISPONIBILIDAD DE SERVICIOS
  -- ============================================
  RAISE NOTICE 'Insertando disponibilidad de servicios...';
  
  -- Disponibilidad Juan (Lunes a Viernes 8am-6pm)
  INSERT INTO service_availability (service_id, day_of_week, start_time, end_time, is_available)
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
  INSERT INTO service_availability (service_id, day_of_week, start_time, end_time, is_available)
  VALUES
    (v_service2_id, 1, '07:00', '19:00', true),
    (v_service2_id, 2, '07:00', '19:00', true),
    (v_service2_id, 3, '07:00', '19:00', true),
    (v_service2_id, 4, '07:00', '19:00', true),
    (v_service2_id, 5, '07:00', '19:00', true),
    (v_service2_id, 6, '08:00', '17:00', true),
    (v_service2_id, 0, '09:00', '15:00', true);
  
  -- Disponibilidad Carlos (Todos los días)
  INSERT INTO service_availability (service_id, day_of_week, start_time, end_time, is_available)
  VALUES
    (v_service3_id, 0, '08:00', '20:00', true),
    (v_service3_id, 1, '07:00', '21:00', true),
    (v_service3_id, 2, '07:00', '21:00', true),
    (v_service3_id, 3, '07:00', '21:00', true),
    (v_service3_id, 4, '07:00', '21:00', true),
    (v_service3_id, 5, '07:00', '21:00', true),
    (v_service3_id, 6, '08:00', '20:00', true);
  
  -- Disponibilidad Sofía (Lunes a Viernes 3pm-9pm, Sábados 9am-2pm)
  INSERT INTO service_availability (service_id, day_of_week, start_time, end_time, is_available)
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
  INSERT INTO service_exceptions (service_id, exception_date, is_available, reason)
  VALUES
    (v_service1_id, '2026-01-01', false, 'Día festivo - Año Nuevo'),
    (v_service6_id, '2026-01-01', false, 'Día festivo - Año Nuevo');
  
  -- María no disponible el 25 de diciembre
  INSERT INTO service_exceptions (service_id, exception_date, is_available, reason)
  VALUES
    (v_service2_id, '2025-12-25', false, 'Navidad');
  
  -- ============================================
  -- INSERTAR REVIEWS/RESEÑAS
  -- ============================================
  RAISE NOTICE 'Insertando reseñas...';
  
  -- Reviews para el servicio de electricidad de Juan
  INSERT INTO reviews (service_id, reviewer_id, reviewed_user_id, rating, title, comment, is_verified)
  VALUES
    (v_service1_id, v_ana_id, v_juan_id, 5, 'Excelente servicio', 
     'Juan es muy profesional y puntual. Resolvió el problema eléctrico de mi casa rápidamente. Lo recomiendo ampliamente.', true),
    (v_service1_id, v_pedro_id, v_juan_id, 5, 'Muy recomendable',
     'Trabajo impecable, precios justos y garantía en su trabajo. Definitivamente lo volveré a contratar.', true),
    (v_service1_id, v_sofia_id, v_juan_id, 4, 'Buen trabajo',
     'Hizo un buen trabajo instalando varios contactos en mi casa. Tardó un poco más de lo esperado pero quedó bien.', true);
  
  -- Reviews para el servicio de limpieza de María
  INSERT INTO reviews (service_id, reviewer_id, reviewed_user_id, rating, title, comment, pros, cons, is_verified, response, response_date)
  VALUES
    (v_service2_id, v_ana_id, v_maria_id, 5, 'Dejó mi casa impecable',
     'María y su equipo dejaron mi casa súper limpia. Muy detallistas y cuidadosos con los muebles.',
     'Puntualidad, calidad, productos ecológicos', null, true, '¡Muchas gracias Ana! Es un placer trabajar para ti.', CURRENT_TIMESTAMP - INTERVAL '2 days'),
    (v_service2_id, v_pedro_id, v_maria_id, 5, 'Súper profesional',
     'El mejor servicio de limpieza que he contratado. María es muy profesional y confiable.', 
     'Excelente atención, muy profesional', null, true, null, null),
    (v_service2_id, v_juan_id, v_maria_id, 5, 'Recomendadísimo',
     'Contraté a María para limpiar mi oficina y quedó perfecta. Muy eficiente.', null, null, true, null, null);
  
  -- Reviews para el servicio de plomería de Carlos
  INSERT INTO reviews (service_id, reviewer_id, reviewed_user_id, rating, title, comment, is_verified)
  VALUES
    (v_service3_id, v_ana_id, v_carlos_id, 5, 'Solucionó la fuga rápidamente',
     'Carlos llegó rápido y arregló la fuga de agua en mi baño. Muy profesional y limpio en su trabajo.', true),
    (v_service3_id, v_pedro_id, v_carlos_id, 4, 'Buen servicio',
     'Hizo un buen trabajo, aunque el precio fue un poco alto. Pero la calidad lo vale.', true);
  
  -- Reviews para las clases de inglés de Sofía
  INSERT INTO reviews (service_id, reviewer_id, reviewed_user_id, rating, title, comment, is_verified)
  VALUES
    (v_service4_id, v_ana_id, v_sofia_id, 5, 'Excelente profesora',
     'Sofía es una profesora muy paciente y preparada. He mejorado mucho mi inglés con sus clases.', true),
    (v_service4_id, v_pedro_id, v_sofia_id, 5, 'Muy recomendable',
     'Las clases son muy dinámicas y personalizadas. Aprendí más en 2 meses que en años de escuela.', true);
  
  -- ============================================
  -- INSERTAR IMÁGENES EN REVIEWS
  -- ============================================
  RAISE NOTICE 'Insertando imágenes en reseñas...';
  
  -- Imágenes de la review de limpieza
  INSERT INTO review_images (review_id, image_url, thumbnail_url, order_index)
  SELECT id, 'https://images.unsplash.com/photo-1581578731548-c64695cc6952', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200', 1
  FROM reviews WHERE service_id = v_service2_id AND reviewer_id = v_ana_id;
  
  -- ============================================
  -- INSERTAR TAGS
  -- ============================================
  RAISE NOTICE 'Insertando tags...';
  
  INSERT INTO tags (name, slug, usage_count) VALUES
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
  SELECT id INTO v_tag_rapido FROM tags WHERE slug = 'servicio-rapido';
  SELECT id INTO v_tag_economico FROM tags WHERE slug = 'economico';
  SELECT id INTO v_tag_profesional FROM tags WHERE slug = 'profesional';
  SELECT id INTO v_tag_domicilio FROM tags WHERE slug = 'a-domicilio';
  SELECT id INTO v_tag_emergencia FROM tags WHERE slug = 'emergencias';
  
  -- ============================================
  -- INSERTAR RELACIÓN SERVICIOS-TAGS
  -- ============================================
  RAISE NOTICE 'Insertando relación servicios-tags...';
  
  INSERT INTO service_tags (service_id, tag_id) VALUES
    (v_service1_id, v_tag_profesional),
    (v_service1_id, v_tag_domicilio),
    (v_service1_id, v_tag_emergencia),
    (v_service2_id, v_tag_profesional),
    (v_service2_id, v_tag_domicilio),
    (v_service2_id, (SELECT id FROM tags WHERE slug = 'productos-ecologicos')),
    (v_service3_id, v_tag_profesional),
    (v_service3_id, v_tag_domicilio),
    (v_service3_id, v_tag_emergencia),
    (v_service4_id, (SELECT id FROM tags WHERE slug = 'online')),
    (v_service4_id, v_tag_profesional),
    (v_service4_id, (SELECT id FROM tags WHERE slug = 'certificado')),
    (v_service5_id, (SELECT id FROM tags WHERE slug = 'online')),
    (v_service5_id, (SELECT id FROM tags WHERE slug = 'flexible'));
  
  -- ============================================
  -- INSERTAR CONVERSACIONES
  -- ============================================
  RAISE NOTICE 'Insertando conversaciones...';
  
  -- Conversación entre Ana y Juan sobre servicio eléctrico
  INSERT INTO conversations (
    participant_1_id, participant_2_id, service_id,
    last_message_text, last_message_at, last_message_sender_id,
    unread_count_p1, unread_count_p2
  ) VALUES (
    v_ana_id, v_juan_id, v_service1_id,
    '¡Perfecto! Nos vemos mañana entonces. Gracias.',
    CURRENT_TIMESTAMP - INTERVAL '1 day',
    v_ana_id, 0, 0
  );
  
  -- Conversación entre Pedro y María sobre limpieza
  INSERT INTO conversations (
    participant_1_id, participant_2_id, service_id,
    last_message_text, last_message_at, last_message_sender_id,
    unread_count_p1, unread_count_p2
  ) VALUES (
    v_pedro_id, v_maria_id, v_service2_id,
    'Claro que sí, el sábado a las 9am está perfecto.',
    CURRENT_TIMESTAMP - INTERVAL '3 hours',
    v_maria_id, 1, 0
  );
  
  -- Conversación entre Sofía y Ana sobre clases
  INSERT INTO conversations (
    participant_1_id, participant_2_id, service_id,
    last_message_text, last_message_at, last_message_sender_id,
    unread_count_p1, unread_count_p2
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
  INSERT INTO messages (conversation_id, sender_id, message_type, content, is_read, read_at, created_at)
  SELECT id, v_ana_id, 'text', 'Hola Juan, ¿tienes disponibilidad esta semana para revisar mi instalación eléctrica?', true,
    CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '2 days'
  FROM conversations WHERE participant_1_id = v_ana_id AND participant_2_id = v_juan_id;
  
  INSERT INTO messages (conversation_id, sender_id, message_type, content, is_read, read_at, created_at)
  SELECT id, v_juan_id, 'text', 'Hola Ana, sí claro. ¿Te parece bien mañana a las 10am?', true,
    CURRENT_TIMESTAMP - INTERVAL '2 days' + INTERVAL '15 minutes', CURRENT_TIMESTAMP - INTERVAL '2 days' + INTERVAL '15 minutes'
  FROM conversations WHERE participant_1_id = v_ana_id AND participant_2_id = v_juan_id;
  
  INSERT INTO messages (conversation_id, sender_id, message_type, content, is_read, read_at, created_at)
  SELECT id, v_ana_id, 'text', '¡Perfecto! Nos vemos mañana entonces. Gracias.', true,
    CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '1 day'
  FROM conversations WHERE participant_1_id = v_ana_id AND participant_2_id = v_juan_id;
  
  -- Mensajes de la conversación Pedro-María
  INSERT INTO messages (conversation_id, sender_id, message_type, content, is_read, read_at, created_at)
  SELECT id, v_pedro_id, 'text', 'Hola María, necesito limpieza profunda de mi departamento. ¿Cuándo puedes?', true,
    CURRENT_TIMESTAMP - INTERVAL '4 hours', CURRENT_TIMESTAMP - INTERVAL '4 hours'
  FROM conversations WHERE participant_1_id = v_pedro_id AND participant_2_id = v_maria_id;
  
  INSERT INTO messages (conversation_id, sender_id, message_type, content, is_read, read_at, created_at)
  SELECT id, v_maria_id, 'text', 'Hola Pedro, ¿qué tal el sábado a las 9am?', true,
    CURRENT_TIMESTAMP - INTERVAL '3 hours' + INTERVAL '30 minutes', CURRENT_TIMESTAMP - INTERVAL '3 hours' + INTERVAL '30 minutes'
  FROM conversations WHERE participant_1_id = v_pedro_id AND participant_2_id = v_maria_id;
  
  INSERT INTO messages (conversation_id, sender_id, message_type, content, is_read, read_at, created_at)
  SELECT id, v_pedro_id, 'text', 'Claro que sí, el sábado a las 9am está perfecto.', false, null,
    CURRENT_TIMESTAMP - INTERVAL '3 hours'
  FROM conversations WHERE participant_1_id = v_pedro_id AND participant_2_id = v_maria_id;
  
  -- ============================================
  -- INSERTAR FAVORITOS
  -- ============================================
  RAISE NOTICE 'Insertando favoritos...';
  
  INSERT INTO favorites (user_id, service_id, created_at) VALUES
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
  
  INSERT INTO notifications (user_id, type, title, content, related_id, related_type, is_read, created_at)
  VALUES
    (v_juan_id, 'message', 'Nuevo mensaje de Ana', 'Ana te ha enviado un mensaje sobre "Instalación y Reparación Eléctrica"', 
     v_ana_id, 'message', true, CURRENT_TIMESTAMP - INTERVAL '2 days'),
    (v_juan_id, 'review', 'Nueva reseña', 'Ana dejó una reseña de 5 estrellas en tu servicio', 
     v_ana_id, 'review', true, CURRENT_TIMESTAMP - INTERVAL '1 day'),
    (v_maria_id, 'message', 'Nuevo mensaje de Pedro', 'Pedro te ha enviado un mensaje', 
     v_pedro_id, 'message', false, CURRENT_TIMESTAMP - INTERVAL '4 hours'),
    (v_ana_id, 'system', 'Bienvenida', '¡Bienvenida a nuestra plataforma de servicios!', 
     null, 'system', true, CURRENT_TIMESTAMP - INTERVAL '30 days'),
    (v_sofia_id, 'review', 'Nueva reseña', 'Ana dejó una reseña de 5 estrellas en tu servicio de inglés', 
     v_ana_id, 'review', false, CURRENT_TIMESTAMP - INTERVAL '12 hours');
  
  -- ============================================
  -- INSERTAR SEGUIDORES
  -- ============================================
  RAISE NOTICE 'Insertando seguidores...';
  
  INSERT INTO user_followers (follower_id, following_id, created_at) VALUES
    (v_ana_id, v_juan_id, CURRENT_TIMESTAMP - INTERVAL '10 days'),
    (v_ana_id, v_maria_id, CURRENT_TIMESTAMP - INTERVAL '8 days'),
    (v_ana_id, v_sofia_id, CURRENT_TIMESTAMP - INTERVAL '5 days'),
    (v_pedro_id, v_maria_id, CURRENT_TIMESTAMP - INTERVAL '15 days'),
    (v_pedro_id, v_carlos_id, CURRENT_TIMESTAMP - INTERVAL '7 days'),
    (v_sofia_id, v_juan_id, CURRENT_TIMESTAMP - INTERVAL '20 days');
  
  -- ============================================
  -- INSERTAR BADGES GANADOS
  -- ============================================
  RAISE NOTICE 'Insertando badges ganados...';
  
  INSERT INTO user_earned_badges (user_id, badge_id, earned_at) VALUES
    (v_juan_id, v_badge_verified, CURRENT_TIMESTAMP - INTERVAL '60 days'),
    (v_juan_id, v_badge_toprated, CURRENT_TIMESTAMP - INTERVAL '30 days'),
    (v_maria_id, v_badge_verified, CURRENT_TIMESTAMP - INTERVAL '90 days'),
    (v_maria_id, v_badge_toprated, CURRENT_TIMESTAMP - INTERVAL '45 days'),
    (v_maria_id, v_badge_quickresponse, CURRENT_TIMESTAMP - INTERVAL '20 days'),
    (v_carlos_id, v_badge_verified, CURRENT_TIMESTAMP - INTERVAL '70 days'),
    (v_sofia_id, v_badge_verified, CURRENT_TIMESTAMP - INTERVAL '40 days'),
    (v_sofia_id, v_badge_toprated, CURRENT_TIMESTAMP - INTERVAL '15 days');
  
  -- ============================================
  -- INSERTAR PORTAFOLIO
  -- ============================================
  RAISE NOTICE 'Insertando items de portafolio...';
  
  -- Portafolio de Juan
  INSERT INTO portfolios (provider_id, title, description, image_url, thumbnail_url, category_id, order_index, is_featured)
  VALUES
    (v_juan_id, 'Instalación eléctrica residencia Polanco', 'Instalación completa de sistema eléctrico en casa de 3 pisos', 
     'https://images.unsplash.com/photo-1621905252507-b35492cc74b4', 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=300', 
     v_cat_reparaciones, 1, true),
    (v_juan_id, 'Actualización de tablero eléctrico', 'Modernización de tablero eléctrico con breakers de última generación', 
     'https://images.unsplash.com/photo-1613665813446-82a78c468a1d', 'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?w=300', 
     v_cat_reparaciones, 2, false);
  
  -- Portafolio de María
  INSERT INTO portfolios (provider_id, title, description, image_url, thumbnail_url, category_id, order_index, is_featured)
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
  INSERT INTO service_faqs (service_id, question, answer, order_index) VALUES
    (v_service1_id, '¿Incluye materiales?', 'Los materiales básicos están incluidos. Para materiales especiales se cotiza por separado.', 1),
    (v_service1_id, '¿Dan garantía?', 'Sí, todos los trabajos tienen garantía de 6 meses.', 2),
    (v_service1_id, '¿Atienden emergencias?', 'Sí, tenemos servicio de emergencias 24/7 con cargo adicional.', 3);
  
  -- FAQs del servicio de limpieza
  INSERT INTO service_faqs (service_id, question, answer, order_index) VALUES
    (v_service2_id, '¿Traen sus productos de limpieza?', 'Sí, llevamos todos los productos y equipo necesario.', 1),
    (v_service2_id, '¿Cuánto tiempo tardan?', 'Depende del tamaño del espacio, generalmente 3-4 horas para una casa estándar.', 2),
    (v_service2_id, '¿Trabajan fines de semana?', 'Sí, trabajamos de lunes a domingo.', 3);
  
  -- FAQs del servicio de plomería
  INSERT INTO service_faqs (service_id, question, answer, order_index) VALUES
    (v_service3_id, '¿El presupuesto tiene costo?', 'No, el presupuesto es gratuito.', 1),
    (v_service3_id, '¿Cómo cobran?', 'Depende del trabajo, puede ser por hora o por proyecto completo.', 2);
  
  -- FAQs del servicio de inglés
  INSERT INTO service_faqs (service_id, question, answer, order_index) VALUES
    (v_service4_id, '¿La primera clase es gratis?', 'Sí, la primera clase de 30 minutos es de prueba sin costo.', 1),
    (v_service4_id, '¿Qué plataforma usas?', 'Usamos Zoom o Google Meet, la que prefieras.', 2),
    (v_service4_id, '¿Tienes certificaciones?', 'Sí, cuento con certificación TEFL y Cambridge.', 3);
  
  -- ============================================
  -- INSERTAR CÓDIGOS PROMOCIONALES
  -- ============================================
  RAISE NOTICE 'Insertando códigos promocionales...';
  
  INSERT INTO promocodes (
    code, description, discount_type, discount_value, max_discount_amount,
    max_uses, max_uses_per_user, min_purchase_amount,
    valid_from, valid_until, is_active, created_by
  ) VALUES
    ('BIENVENIDA20', 'Descuento de bienvenida del 20% para nuevos usuarios', 'percentage', 20.00, 200.00,
     100, 1, 300.00,
     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '90 days', true, v_admin_id),
    ('LIMPIEZA50', 'Descuento de $50 en servicios de limpieza', 'fixed', 50.00, null,
     50, 1, 500.00,
     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days', true, v_admin_id),
    ('VERANO2026', 'Promoción de verano - 15% de descuento', 'percentage', 15.00, 300.00,
     200, 2, 200.00,
     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '120 days', true, v_admin_id);
  
  -- ============================================
  -- INSERTAR HISTORIAL DE BÚSQUEDAS
  -- ============================================
  RAISE NOTICE 'Insertando historial de búsquedas...';
  
  INSERT INTO search_history (user_id, search_term, category_id, location, results_count, clicked_service_id, created_at)
  VALUES
    (v_ana_id, 'electricista', v_cat_reparaciones, 'Ciudad de México', 5, v_service1_id, CURRENT_TIMESTAMP - INTERVAL '7 days'),
    (v_ana_id, 'limpieza', v_cat_limpieza, 'Ciudad de México', 8, v_service2_id, CURRENT_TIMESTAMP - INTERVAL '5 days'),
    (v_ana_id, 'clases inglés', v_cat_clases, 'Online', 12, v_service4_id, CURRENT_TIMESTAMP - INTERVAL '2 days'),
    (v_pedro_id, 'plomero urgente', v_cat_reparaciones, 'Guadalajara', 6, v_service3_id, CURRENT_TIMESTAMP - INTERVAL '10 days'),
    (v_pedro_id, 'limpieza profunda', v_cat_limpieza, 'Monterrey', 9, v_service2_id, CURRENT_TIMESTAMP - INTERVAL '4 days');
  
  -- ============================================
  -- INSERTAR REPORTES (EJEMPLO)
  -- ============================================
  RAISE NOTICE 'Insertando reporte de ejemplo...';
  
  INSERT INTO reports (
    reporter_id, reported_user_id, report_type, description,
    status, created_at
  ) VALUES (
    v_pedro_id, v_juan_id, 'other', 'El proveedor canceló el servicio en el último momento sin previo aviso.',
    'resolved', CURRENT_TIMESTAMP - INTERVAL '20 days'
  );
  
  -- ============================================
  -- ACTUALIZAR CONTADORES
  -- ============================================
  RAISE NOTICE 'Actualizando contadores...';
  
  -- Actualizar contador de servicios en categorías
  UPDATE categories SET services_count = (
    SELECT COUNT(*) FROM services WHERE category_id = categories.id AND is_active = true
  );
  
  -- Actualizar contador de servicios totales en usuarios proveedores
  UPDATE users SET total_services = (
    SELECT COUNT(*) FROM services WHERE provider_id = users.id AND is_active = true
  ) WHERE user_type IN ('provider', 'both');
  
  RAISE NOTICE 'Datos de prueba insertados correctamente!';
  
END $$;

-- ============================================
-- VERIFICACIÓN DE DATOS
-- ============================================

-- Contar registros insertados
SELECT 'Users' as tabla, COUNT(*) as registros FROM users
UNION ALL
SELECT 'Direcciones', COUNT(*) FROM user_addresses
UNION ALL
SELECT 'Categorías', COUNT(*) FROM categories
UNION ALL
SELECT 'Servicios', COUNT(*) FROM services
UNION ALL
SELECT 'Imágenes de servicios', COUNT(*) FROM service_images
UNION ALL
SELECT 'Disponibilidad', COUNT(*) FROM service_availability
UNION ALL
SELECT 'Reviews', COUNT(*) FROM reviews
UNION ALL
SELECT 'Conversaciones', COUNT(*) FROM conversations
UNION ALL
SELECT 'Mensajes', COUNT(*) FROM messages
UNION ALL
SELECT 'Favoritos', COUNT(*) FROM favorites
UNION ALL
SELECT 'Notificaciones', COUNT(*) FROM notifications
UNION ALL
SELECT 'Tags', COUNT(*) FROM tags
UNION ALL
SELECT 'Seguidores', COUNT(*) FROM user_followers
UNION ALL
SELECT 'Badges ganados', COUNT(*) FROM user_earned_badges
UNION ALL
SELECT 'Portafolio', COUNT(*) FROM portfolios
UNION ALL
SELECT 'FAQs', COUNT(*) FROM service_faqs
UNION ALL
SELECT 'Promocodes', COUNT(*) FROM promocodes
UNION ALL
SELECT 'Historial búsquedas', COUNT(*) FROM search_history
UNION ALL
SELECT 'Reportes', COUNT(*) FROM reports;

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
