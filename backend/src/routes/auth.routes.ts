import { Router } from 'express';
import { authController } from '../controllers';
import { authValidators } from '../validators';
import { handleValidationErrors, authMiddleware } from '../middlewares';

const router = Router();

/**
 * Rutas de autenticación
 * POST /api/auth/login    - Login de usuario
 * POST /api/auth/refresh  - Renovar tokens
 * POST /api/auth/logout   - Cerrar sesión
 * GET  /api/auth/me       - Obtener usuario actual
 * GET  /api/auth/verify   - Verificar token
 */

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

export default router;
