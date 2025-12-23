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
};
