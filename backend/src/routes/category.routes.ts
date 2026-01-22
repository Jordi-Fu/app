import { Router } from 'express';
import { serviceController } from '../controllers/service.controller';

const router = Router();

// Obtener todas las categorías (pública)
router.get('/', serviceController.getCategories.bind(serviceController));

export default router;
