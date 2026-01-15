import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, from } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor para agregar token JWT a las peticiones
 */
export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);

  // No agregar token a las rutas de auth públicas (login, register, refresh, forgot-password)
  const publicAuthRoutes = [
    '/auth/login',
    '/auth/register', 
    '/auth/refresh',
    '/auth/forgot-password',
    '/auth/reset-password'
  ];
  
  const isPublicRoute = publicAuthRoutes.some(route => req.url.includes(route));

  if (isPublicRoute) {
    return next(req);
  }

  // Obtener token de forma asíncrona y agregarlo al header
  return from(authService.getAccessToken()).pipe(
    switchMap(token => {
      if (token) {
        req = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
      }

      return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
          // Si el token expiró (401), intentar refrescar automáticamente
          if (error.status === 401 && !isPublicRoute) {
            return authService.refreshToken().pipe(
              switchMap(() => from(authService.getAccessToken())),
              switchMap(newToken => {
                // Reintentar la petición con el nuevo token
                const newReq = req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${newToken}`
                  }
                });
                return next(newReq);
              }),
              catchError(refreshError => {
                // Si el refresh falla, hacer logout automático
                authService.logout().subscribe();
                return throwError(() => refreshError);
              })
            );
          }
          
          return throwError(() => error);
        })
      );
    })
  );
};
