import { body, ValidationChain } from 'express-validator';

/**
 * Validadores para autenticación
 */
export const authValidators = {
  /**
   * Validación de login
   */
  login: (): ValidationChain[] => [
    body('credential')
      .trim()
      .notEmpty()
      .withMessage('El usuario es requerido')
      .isLength({ min: 3, max: 100 })
      .withMessage('El usuario debe tener entre 3 y 100 caracteres')
      .escape(), // Sanitizar para prevenir XSS
    
    body('password')
      .notEmpty()
      .withMessage('La contraseña es requerida')
      .isLength({ min: 6, max: 128 })
      .withMessage('La contraseña debe tener entre 6 y 128 caracteres'),
  ],
  
  /**
   * Validación de refresh token
   */
  refresh: (): ValidationChain[] => [
    body('refreshToken')
      .notEmpty()
      .withMessage('El refresh token es requerido')
      .isJWT()
      .withMessage('Token inválido'),
  ],

  /**
   * Validación de registro
   */
  register: (): ValidationChain[] => [
    body('nombre')
      .trim()
      .notEmpty()
      .withMessage('El nombre es requerido')
      .isLength({ min: 2, max: 50 })
      .withMessage('El nombre debe tener entre 2 y 50 caracteres')
      .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      .withMessage('El nombre solo puede contener letras')
      .escape(),
    
    body('apellidos')
      .trim()
      .notEmpty()
      .withMessage('Los apellidos son requeridos')
      .isLength({ min: 2, max: 100 })
      .withMessage('Los apellidos deben tener entre 2 y 100 caracteres')
      .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      .withMessage('Los apellidos solo pueden contener letras')
      .escape(),
    
    body('telefono')
      .trim()
      .notEmpty()
      .withMessage('El teléfono es requerido')
      .matches(/^[0-9\s]+$/)
      .withMessage('El teléfono solo puede contener números')
      .custom((value) => {
        const digits = value.replace(/\s/g, '');
        return digits.length === 9;
      })
      .withMessage('El teléfono debe tener 9 dígitos'),
    
    body('username')
      .trim()
      .notEmpty()
      .withMessage('El nombre de usuario es requerido')
      .isLength({ min: 3, max: 30 })
      .withMessage('El nombre de usuario debe tener entre 3 y 30 caracteres')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('El nombre de usuario solo puede contener letras, números y guiones bajos')
      .escape(),
    
    body('email')
      .trim()
      .notEmpty()
      .withMessage('El email es requerido')
      .isEmail()
      .withMessage('El email no es válido')
      .normalizeEmail()
      .isLength({ max: 100 })
      .withMessage('El email es demasiado largo'),
    
    body('password')
      .notEmpty()
      .withMessage('La contraseña es requerida')
      .isLength({ min: 6, max: 128 })
      .withMessage('La contraseña debe tener al menos 6 caracteres')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('La contraseña debe contener al menos una mayúscula, una minúscula y un número'),
    
    body('bio')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('La biografía no puede exceder 500 caracteres')
      .escape(),
  ],
};
