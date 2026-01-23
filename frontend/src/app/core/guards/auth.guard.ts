import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard para rutas que requieren autenticación
 * Espera a que la autenticación esté inicializada antes de decidir
 */
export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // CRÍTICO: Esperar a que se cargue la sesión del storage
  await authService.waitForAuthInit();

  if (authService.isLoggedIn()) {
    return true;
  }

  // Redirigir al login guardando la URL intentada
  router.navigate(['/login'], { 
    queryParams: { returnUrl: state.url } 
  });
  return false;
};

/**
 * Guard para rutas que NO requieren autenticación (login, register)
 * Redirige al home si el usuario ya está autenticado
 */
export const noAuthGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // CRÍTICO: Esperar a que se cargue la sesión del storage
  await authService.waitForAuthInit();

  if (!authService.isLoggedIn()) {
    return true;
  }

  // Si ya está logueado, redirigir al home y reemplazar la URL en el historial
  router.navigate(['/home'], { replaceUrl: true });
  return false;
};
