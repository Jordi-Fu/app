import { body, ValidationChain } from 'express-validator';

/**
 * Validadores para servicios
 */
export const serviceValidators = {
  /**
   * Validación para crear un nuevo servicio
   */
  create: (): ValidationChain[] => [
    body('titulo')
      .trim()
      .notEmpty()
      .withMessage('El título es requerido')
      .isLength({ min: 5, max: 50 })
      .withMessage('El título debe tener entre 5 y 50 caracteres')
      .escape(),

    body('descripcion')
      .trim()
      .notEmpty()
      .withMessage('La descripción es requerida')
      .isLength({ min: 10, max: 200 })
      .withMessage('La descripción debe tener entre 10 y 200 caracteres'),

    body('categoria_id')
      .notEmpty()
      .withMessage('La categoría es requerida')
      .isUUID()
      .withMessage('ID de categoría inválido'),

    body('tipo_precio')
      .notEmpty()
      .withMessage('El tipo de precio es requerido')
      .isIn(['fijo', 'por_hora'])
      .withMessage('Tipo de precio inválido'),

    body('precio')
      .optional({ nullable: true })
      .isFloat({ min: 0 })
      .withMessage('El precio debe ser un número positivo'),

    body('moneda')
      .optional()
      .isLength({ max: 3 })
      .withMessage('Moneda inválida'),

    body('tipo_ubicacion')
      .notEmpty()
      .withMessage('El tipo de ubicación es requerido')
      .isIn(['remote', 'at_client', 'at_provider', 'flexible'])
      .withMessage('Tipo de ubicación inválido'),

    body('ciudad')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Ciudad demasiado larga')
      .escape(),

    body('estado')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Estado demasiado largo')
      .escape(),

    body('codigo_postal')
      .optional()
      .trim()
      .isLength({ max: 10 })
      .withMessage('Código postal demasiado largo'),

    body('duracion_minutos')
      .optional({ nullable: true })
      .isInt({ min: 1 })
      .withMessage('La duración debe ser un número entero positivo'),

    body('radio_servicio_km')
      .optional({ nullable: true })
      .isFloat({ min: 0 })
      .withMessage('El radio de servicio debe ser un número positivo'),

    body('que_incluye')
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('El campo "qué incluye" es demasiado largo'),

    body('que_no_incluye')
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('El campo "qué no incluye" es demasiado largo'),

    body('requisitos')
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('Los requisitos son demasiado largos'),

    body('politica_cancelacion')
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('La política de cancelación es demasiado larga'),

    body('disponibilidad_urgencias')
      .optional()
      .isBoolean()
      .withMessage('Disponibilidad de urgencias debe ser booleano'),

    body('precio_urgencias')
      .optional({ nullable: true })
      .isFloat({ min: 0 })
      .withMessage('El precio de urgencias debe ser un número positivo'),

    body('imagenes')
      .optional()
      .isArray({ max: 10 })
      .withMessage('Máximo 10 imágenes permitidas'),

    body('imagenes.*.base64')
      .optional()
      .isString()
      .withMessage('La imagen debe ser una cadena base64'),

    body('imagenes.*.formato')
      .optional()
      .isIn(['jpeg', 'jpg', 'png', 'webp'])
      .withMessage('Formato de imagen no soportado'),

    body('disponibilidad')
      .optional()
      .isArray()
      .withMessage('La disponibilidad debe ser un array'),

    body('disponibilidad.*.dia_semana')
      .optional()
      .isInt({ min: 0, max: 6 })
      .withMessage('Día de la semana inválido (0-6)'),

    body('disponibilidad.*.hora_inicio')
      .optional()
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Formato de hora inicio inválido (HH:MM)'),

    body('disponibilidad.*.hora_fin')
      .optional()
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Formato de hora fin inválido (HH:MM)'),
  ],

  /**
   * Validación para actualizar un servicio existente
   */
  update: (): ValidationChain[] => [
    body('titulo')
      .optional()
      .trim()
      .isLength({ min: 5, max: 200 })
      .withMessage('El título debe tener entre 5 y 200 caracteres')
      .escape(),

    body('descripcion')
      .optional()
      .trim()
      .isLength({ min: 20, max: 5000 })
      .withMessage('La descripción debe tener entre 20 y 5000 caracteres'),

    body('categoria_id')
      .optional()
      .isUUID()
      .withMessage('ID de categoría inválido'),

    body('tipo_precio')
      .optional()
      .isIn(['fixed', 'hourly', 'negotiable'])
      .withMessage('Tipo de precio inválido'),

    body('precio')
      .optional({ nullable: true })
      .isFloat({ min: 0 })
      .withMessage('El precio debe ser un número positivo'),

    body('tipo_ubicacion')
      .optional()
      .isIn(['remote', 'at_client', 'at_provider', 'flexible'])
      .withMessage('Tipo de ubicación inválido'),
  ],
};
