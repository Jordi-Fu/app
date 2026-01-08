import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, from } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Interceptor para agregar token JWT a las peticiones
 */
export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);

  // No agregar token a las rutas de auth (excepto logout y me)
  const isAuthRoute = req.url.includes('/auth/login') || 
                      req.url.includes('/auth/refresh');

  if (isAuthRoute) {
    return next(req);
  }

  // Obtener token de forma asíncrona
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
          // Si el token expiró, intentar refrescar
          if (error.status === 401 && !req.url.includes('/auth/')) {
            return authService.refreshToken().pipe(
              switchMap(() => from(authService.getAccessToken())),
              switchMap(newToken => {
                const newReq = req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${newToken}`
                  }
                });
                return next(newReq);
              }),
              catchError(refreshError => {
                // Si el refresh falla, hacer logout
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
