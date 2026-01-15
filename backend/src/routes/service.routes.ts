import { Router } from 'express';
import { serviceController } from '../controllers/service.controller';

const router = Router();

// Rutas públicas de servicios
router.get('/', serviceController.getServices.bind(serviceController));
router.get('/featured', serviceController.getFeaturedServices.bind(serviceController));
router.get('/provider/:providerId', serviceController.getServicesByProvider.bind(serviceController));
router.get('/:id', serviceController.getServiceById.bind(serviceController));

// Incrementar vistas (público)
router.post('/:id/view', serviceController.incrementViews.bind(serviceController));

export default router;
