import { Request, Response, NextFunction } from 'express';
import { authService } from '../services';
import { JwtPayload } from '../interfaces';

// Extender Request para incluir usuario
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Middleware de autenticación
 * Verifica el token JWT en el header Authorization
 */
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  
  console.log('[AUTH MIDDLEWARE] URL:', req.url);
  console.log('[AUTH MIDDLEWARE] Method:', req.method);
  console.log('[AUTH MIDDLEWARE] Auth header:', authHeader ? 'EXISTS' : 'MISSING');
  console.log('[AUTH MIDDLEWARE] All headers:', JSON.stringify(req.headers, null, 2));
  
  if (!authHeader) {
    res.status(401).json({
      success: false,
      message: 'Token de autorización no proporcionado',
    });
    return;
  }
  
  // Formato esperado: "Bearer <token>"
  const parts = authHeader.split(' ');
  
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    res.status(401).json({
      success: false,
      message: 'Formato de token inválido',
    });
    return;
  }
  
  const token = parts[1];
  const decoded = authService.verifyAccessToken(token);
  
  if (!decoded) {
    res.status(401).json({
      success: false,
      message: 'Token inválido o expirado',
    });
    return;
  }
  
  // Agregar usuario al request
  req.user = decoded;
  next();
};

/**
 * Middleware opcional de autenticación
 * No falla si no hay token, pero si hay uno válido lo agrega al request
 */
export const optionalAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    const parts = authHeader.split(' ');
    
    if (parts.length === 2 && parts[0] === 'Bearer') {
      const decoded = authService.verifyAccessToken(parts[1]);
      if (decoded) {
        req.user = decoded;
      }
    }
  }
  
  next();
};
