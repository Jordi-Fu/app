-- ============================================
-- Script: 03_add_service_optional_fields.sql
-- Descripción: Añade campos opcionales adicionales a la tabla servicios
-- Fecha: 2026-01-29
-- ============================================

-- Renombrar columnas existentes para usar nomenclatura consistente
-- (Solo ejecutar si las columnas existen con nombres antiguos)

-- Verificar y renombrar 'incluye' a 'que_incluye' si existe
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'servicios' AND column_name = 'incluye'
  ) THEN
    ALTER TABLE servicios RENAME COLUMN incluye TO que_incluye;
    RAISE NOTICE 'Columna incluye renombrada a que_incluye';
  END IF;
END $$;

-- Verificar y renombrar 'no_incluye' a 'que_no_incluye' si existe
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'servicios' AND column_name = 'no_incluye'
  ) THEN
    ALTER TABLE servicios RENAME COLUMN no_incluye TO que_no_incluye;
    RAISE NOTICE 'Columna no_incluye renombrada a que_no_incluye';
  END IF;
END $$;

-- Agregar columna que_incluye si no existe (en caso de instalación limpia)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'servicios' AND column_name = 'que_incluye'
  ) THEN
    ALTER TABLE servicios ADD COLUMN que_incluye TEXT;
    RAISE NOTICE 'Columna que_incluye creada';
  END IF;
END $$;

-- Agregar columna que_no_incluye si no existe (en caso de instalación limpia)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'servicios' AND column_name = 'que_no_incluye'
  ) THEN
    ALTER TABLE servicios ADD COLUMN que_no_incluye TEXT;
    RAISE NOTICE 'Columna que_no_incluye creada';
  END IF;
END $$;

-- Agregar columna requisitos si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'servicios' AND column_name = 'requisitos'
  ) THEN
    ALTER TABLE servicios ADD COLUMN requisitos TEXT;
    RAISE NOTICE 'Columna requisitos creada';
  END IF;
END $$;

-- Agregar columna politica_cancelacion si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'servicios' AND column_name = 'politica_cancelacion'
  ) THEN
    ALTER TABLE servicios ADD COLUMN politica_cancelacion TEXT;
    RAISE NOTICE 'Columna politica_cancelacion creada';
  END IF;
END $$;

-- Agregar comentarios a las columnas
COMMENT ON COLUMN servicios.que_incluye IS 'Descripción de lo que incluye el servicio';
COMMENT ON COLUMN servicios.que_no_incluye IS 'Descripción de lo que no incluye el servicio';
COMMENT ON COLUMN servicios.requisitos IS 'Requisitos necesarios para solicitar el servicio';
COMMENT ON COLUMN servicios.politica_cancelacion IS 'Política de cancelación del servicio';

-- ============================================
-- Verificación final
-- ============================================
SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'servicios' 
  AND column_name IN ('que_incluye', 'que_no_incluye', 'requisitos', 'politica_cancelacion')
ORDER BY column_name;
