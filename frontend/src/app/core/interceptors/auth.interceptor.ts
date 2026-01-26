import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, from, Observable, BehaviorSubject, filter, take, finalize } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Estado del refresh para evitar llamadas duplicadas
 */
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

/**
 * Interceptor para agregar token JWT a las peticiones.
 * 
 * Funcionalidades:
 * - Añade el access token a las peticiones autenticadas
 * - Renueva automáticamente el access token cuando expira (401)
 * - Evita múltiples llamadas de refresh simultáneas
 * - Cola las peticiones mientras se renueva el token
 */
export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);

  // Rutas públicas que no requieren autenticación
  const publicAuthRoutes = [
    '/auth/login',
    '/auth/register', 
    '/auth/refresh',
    '/auth/forgot-password',
    '/auth/reset-password'
  ];
  
  const isPublicRoute = publicAuthRoutes.some(route => req.url.includes(route));
  const isRefreshRoute = req.url.includes('/auth/refresh');

  // No añadir token a rutas públicas
  if (isPublicRoute) {
    return next(req);
  }

  // Obtener token y añadirlo al header
  return from(authService.getAccessToken()).pipe(
    switchMap(token => {
      console.log('[AUTH INTERCEPTOR] URL:', req.url);
      console.log('[AUTH INTERCEPTOR] Token exists:', !!token);
      if (token) {
        console.log('[AUTH INTERCEPTOR] Token preview:', token.substring(0, 20) + '...');
      }
      
      // Clonar petición con token si existe
      const authReq = token ? addTokenToRequest(req, token) : req;

      return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
          // Si es 401 y no es la ruta de refresh, intentar renovar token
          if (error.status === 401 && !isRefreshRoute) {
            return handleUnauthorizedError(authService, req, next);
          }
          
          return throwError(() => error);
        })
      );
    })
  );
};

/**
 * Añade el token de autorización a la petición
 */
function addTokenToRequest(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
}

/**
 * Maneja errores 401 (Unauthorized) renovando el token automáticamente.
 * Implementa un sistema de cola para evitar múltiples llamadas de refresh.
 */
function handleUnauthorizedError(
  authService: AuthService,
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<any> {
  
  if (isRefreshing) {
    // Ya hay un refresh en progreso, esperar a que termine
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => {
        return next(addTokenToRequest(req, token!));
      })
    );
  }

  // Iniciar proceso de refresh
  isRefreshing = true;
  refreshTokenSubject.next(null);

  return authService.refreshToken().pipe(
    switchMap(() => {
      // Obtener el nuevo token
      return from(authService.getAccessToken());
    }),
    switchMap(newToken => {
      if (!newToken) {
        // Si no hay token después del refresh, el usuario debe reautenticarse
        return from(authService.clearTokens()).pipe(
          switchMap(() => throwError(() => new Error('Session expired')))
        );
      }
      
      // Notificar a las peticiones en cola
      refreshTokenSubject.next(newToken);
      
      // Reintentar la petición original con el nuevo token
      return next(addTokenToRequest(req, newToken));
    }),
    catchError(refreshError => {
      // Si el refresh falla, limpiar sesión
      return from(authService.clearTokens()).pipe(
        switchMap(() => throwError(() => refreshError))
      );
    }),
    finalize(() => {
      isRefreshing = false;
    })
  );
}
