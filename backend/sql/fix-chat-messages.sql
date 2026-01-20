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
