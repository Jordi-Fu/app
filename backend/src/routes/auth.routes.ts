import { Router } from 'express';
import { authController } from '../controllers';
import { authValidators } from '../validators';
import { handleValidationErrors, authMiddleware } from '../middlewares';

const router = Router();

/**
 * Rutas de autenticación
 * POST /api/auth/register           - Registro de usuario
 * POST /api/auth/login              - Login de usuario
 * POST /api/auth/refresh            - Renovar tokens
 * POST /api/auth/logout             - Cerrar sesión
 * GET  /api/auth/me                 - Obtener usuario actual
 * GET  /api/auth/verify             - Verificar token
 * POST /api/auth/forgot-password    - Solicitar recuperación de contraseña
 * POST /api/auth/verify-reset-code  - Verificar código de recuperación
 * POST /api/auth/reset-password     - Restablecer contraseña
 */

// Registro
router.post(
  '/register',
  authValidators.register(),
  handleValidationErrors,
  authController.register.bind(authController)
);

// Login
router.post(
  '/login',
  authValidators.login(),
  handleValidationErrors,
  authController.login.bind(authController)
);

// Refresh token
router.post(
  '/refresh',
  authValidators.refresh(),
  handleValidationErrors,
  authController.refresh.bind(authController)
);

// Logout
router.post(
  '/logout',
  authMiddleware,
  authController.logout.bind(authController)
);

// Obtener usuario actual
router.get(
  '/me',
  authMiddleware,
  authController.me.bind(authController)
);

// Verificar token
router.get(
  '/verify',
  authMiddleware,
  authController.verify.bind(authController)
);

// Solicitar recuperación de contraseña
router.post(
  '/forgot-password',
  authValidators.forgotPassword(),
  handleValidationErrors,
  authController.forgotPassword.bind(authController)
);

// Verificar código de recuperación
router.post(
  '/verify-reset-code',
  authValidators.verifyResetCode(),
  handleValidationErrors,
  authController.verifyResetCode.bind(authController)
);

// Restablecer contraseña
router.post(
  '/reset-password',
  authValidators.resetPassword(),
  handleValidationErrors,
  authController.resetPassword.bind(authController)
);

export default router;
