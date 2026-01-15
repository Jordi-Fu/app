import { Router } from 'express';
import authRoutes from './auth.routes';
import serviceRoutes from './service.routes';
import categoryRoutes from './category.routes';

const router = Router();

// Montar rutas
router.use('/auth', authRoutes);
router.use('/services', serviceRoutes);
router.use('/categories', categoryRoutes);

// Ruta de salud
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
  });
});

export default router;
