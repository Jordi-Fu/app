import { Router } from 'express';
import authRoutes from './auth.routes';

const router = Router();

// Montar rutas
router.use('/auth', authRoutes);

// Ruta de salud
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
  });
});

export default router;
