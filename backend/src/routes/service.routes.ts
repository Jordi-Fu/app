import { Router } from 'express';
import { serviceController } from '../controllers/service.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { serviceValidators } from '../validators';
import { validationResult } from 'express-validator';

const router = Router();


// Rutas públicas de servicios (pueden consultarse sin autenticación)
router.get('/', serviceController.getServices.bind(serviceController));
router.get('/featured', serviceController.getFeaturedServices.bind(serviceController));
router.get('/provider/:providerId', serviceController.getServicesByProvider.bind(serviceController));
router.get('/:id', serviceController.getServiceById.bind(serviceController));

// Todas las demás rutas requieren autenticación
router.post(
  '/', 
  authMiddleware, 
  serviceValidators.create(),
  serviceController.createService.bind(serviceController)
);
router.put(
  '/:id',
  authMiddleware,
  serviceController.updateService.bind(serviceController)
);
router.delete(
  '/:id',
  authMiddleware,
  serviceController.deleteService.bind(serviceController)
);
router.post('/:id/views', authMiddleware, serviceController.incrementViews.bind(serviceController));
router.post('/:id/favorite', authMiddleware, serviceController.toggleFavorite.bind(serviceController));
router.get('/:id/is-favorite', authMiddleware, serviceController.checkIsFavorite.bind(serviceController));
router.get('/user/favorites', authMiddleware, serviceController.getFavoriteServices.bind(serviceController));

export default router;
