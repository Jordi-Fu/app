import { Router } from 'express';
import { serviceController } from '../controllers/service.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Rutas protegidas de servicios (requieren autenticación)
router.get('/', authMiddleware, serviceController.getServices.bind(serviceController));
router.get('/featured', authMiddleware, serviceController.getFeaturedServices.bind(serviceController));
router.get('/provider/:providerId', authMiddleware, serviceController.getServicesByProvider.bind(serviceController));
router.get('/:id', authMiddleware, serviceController.getServiceById.bind(serviceController));

// Incrementar vistas (requiere autenticación)
router.post('/:id/view', authMiddleware, serviceController.incrementViews.bind(serviceController));

export default router;
