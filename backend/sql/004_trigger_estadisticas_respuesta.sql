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
