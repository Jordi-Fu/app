import { Router } from 'express';
import { userController } from '../controllers';

const router = Router();

/**
 * Rutas de usuarios
 * GET /api/users/:id          - Obtener perfil público de usuario
 * GET /api/users/:id/services - Obtener servicios de un usuario
 */

// Obtener perfil público de usuario
router.get('/:id', userController.getUserById.bind(userController));

// Obtener servicios de un usuario
router.get('/:id/services', userController.getUserServices.bind(userController));

export default router;
