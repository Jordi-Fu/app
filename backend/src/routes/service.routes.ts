import { Router } from 'express';
import { serviceController } from '../controllers/service.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Rutas públicas de servicios
router.get('/', serviceController.getServices.bind(serviceController));
router.get('/featured', serviceController.getFeaturedServices.bind(serviceController));
router.get('/provider/:providerId', serviceController.getServicesByProvider.bind(serviceController));
router.get('/:id', serviceController.getServiceById.bind(serviceController));

// Rutas para incrementar vistas (pública)
router.post('/:id/views', serviceController.incrementViews.bind(serviceController));

// Rutas protegidas - requieren autenticación
router.post('/:id/favorite', authMiddleware, serviceController.toggleFavorite.bind(serviceController));
router.get('/:id/is-favorite', authMiddleware, serviceController.checkIsFavorite.bind(serviceController));
router.get('/user/favorites', authMiddleware, serviceController.getFavoriteServices.bind(serviceController));

export default router;
