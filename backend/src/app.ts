import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { ENV } from './config/env.config';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middlewares';

/**
 * Configuración de la aplicación Express
 */
const createApp = (): Application => {
  const app = express();

  // ============================================
  // MIDDLEWARES DE SEGURIDAD
  // ============================================
  
  // Helmet - Headers de seguridad
  app.use(helmet({
    contentSecurityPolicy: false, // Desactivar CSP para permitir carga de recursos
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Permitir carga de recursos cross-origin
  }));

  // CORS - Control de origen cruzado
  app.use(cors({
    origin: ENV.CORS_ORIGINS,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // Rate Limiting - Protección contra fuerza bruta
  const limiter = rateLimit({
    windowMs: ENV.RATE_LIMIT_WINDOW_MS, // 15 minutos
    max: ENV.RATE_LIMIT_MAX_REQUESTS, // 100 requests por ventana
    message: {
      success: false,
      message: 'Demasiadas solicitudes. Intenta más tarde.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);

  // Rate limiting específico para login (más restrictivo)
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10, // Solo 10 intentos de login por IP
    message: {
      success: false,
      message: 'Demasiados intentos de login. Intenta en 15 minutos.',
    },
  });
  app.use('/api/auth/login', loginLimiter);

  // ============================================
  // PARSERS
  // ============================================
  
  // Aumentar límite para imágenes base64 (5MB)
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));

  // ============================================
  // ARCHIVOS ESTÁTICOS
  // ============================================
  
  // Servir archivos de uploads (avatares, etc.) con headers CORS
  app.use('/uploads', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  }, express.static(path.join(process.cwd(), 'uploads')));

  // ============================================
  // RUTAS
  // ============================================
  
  app.use('/api', routes);

  // ============================================
  // MANEJO DE ERRORES
  // ============================================
  
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export default createApp;
