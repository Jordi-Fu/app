
import { Router } from 'express';
import { userController } from '../controllers';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

/**
 * Rutas de usuarios
 * GET /api/users/search       - Buscar usuarios
 * GET /api/users/active       - Obtener usuarios activos
 * GET /api/users/:id          - Obtener perfil público de usuario
 * GET /api/users/:id/services - Obtener servicios de un usuario
 */


// Todas las rutas de usuario requieren autenticación
router.get('/search', authMiddleware, userController.searchUsers.bind(userController));
router.get('/active', authMiddleware, userController.getAllActiveUsers.bind(userController));
router.get('/:id', authMiddleware, userController.getUserById.bind(userController));
router.get('/:id/services', authMiddleware, userController.getUserServices.bind(userController));

export default router;
