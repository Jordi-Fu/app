import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para manejo centralizado de errores
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error(`[ERROR] ${new Date().toISOString()} - ${err.message}`);
  console.error(err.stack);
  
  // No revelar detalles del error en producción
  const isDev = process.env.NODE_ENV === 'development';
  
  res.status(500).json({
    success: false,
    message: isDev ? err.message : 'Error interno del servidor',
    ...(isDev && { stack: err.stack }),
  });
};

/**
 * Middleware para rutas no encontradas
 */
export const notFoundHandler = (
  req: Request,
  res: Response
): void => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
};
