import { Router } from 'express';
import { serviceController } from '../controllers/service.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Obtener todas las categorías (requiere autenticación)
router.get('/', authMiddleware, serviceController.getCategories.bind(serviceController));

export default router;
