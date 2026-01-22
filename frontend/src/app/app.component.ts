import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { AuthService } from './core/services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.initializeAuth();
  }
  
  /**
   * Inicializar la autenticación esperando a que el storage se cargue
   */
  private async initializeAuth(): Promise<void> {
    // Esperar a que el AuthService haya terminado de cargar del storage
    await this.authService.waitForAuthInit();
    
    // Ahora podemos verificar el estado de autenticación
    this.checkAuthState();
  }
  
  private async checkAuthState(): Promise<void> {
    const token = await this.authService.getAccessToken();
    const user = await this.authService.getCurrentUserFromStorage();
    const currentUrl = this.router.url;
    
    console.log('[AppComponent] checkAuthState - token:', !!token, 'user:', !!user, 'url:', currentUrl);
    
    // Si hay token y usuario guardados, confiar en ellos
    if (token && user) {
      // El usuario está autenticado, redirigir al home si está en login
      if (currentUrl === '/login' || currentUrl === '/' || currentUrl === '') {
        this.router.navigate(['/home']);
      }
      
      // Verificar token en segundo plano (sin bloquear ni cerrar sesión por errores de red)
      this.verifyTokenInBackground();
    } else if (currentUrl !== '/login' && currentUrl !== '/register' && currentUrl !== '/forgot-password') {
      // Sin token/usuario y no está en páginas públicas
      this.router.navigate(['/login']);
    }
  }

  /**
   * Verificar el token en segundo plano
   * Solo cierra sesión si el servidor responde explícitamente con error de autenticación
   */
  private verifyTokenInBackground(): void {
    this.authService.verifyToken().subscribe({
      next: (isValid) => {
        if (!isValid) {
          // El servidor respondió que el token NO es válido
          // Intentar refresh token
          this.tryRefreshToken();
        }
        // Si isValid es true, todo está bien, no hacer nada
      },
      error: (error) => {
        // Error de red o timeout - NO cerrar sesión
        // El usuario puede seguir usando la app con los datos cacheados
        console.warn('No se pudo verificar el token (posible error de red):', error?.status || 'sin conexión');
        
        // Solo intentar refresh si es un error 401 explícito del servidor
        if (error?.status === 401) {
          this.tryRefreshToken();
        }
        // Para cualquier otro error (red, timeout, etc.), mantener la sesión
      }
    });
  }

  /**
   * Intentar renovar el token con el refresh token
   */
  private async tryRefreshToken(): Promise<void> {
    const refreshToken = await this.authService.getRefreshToken();
    
    if (refreshToken) {
      this.authService.refreshToken().subscribe({
        next: () => {
          // Token renovado exitosamente
          console.log('Token renovado exitosamente');
        },
        error: (error) => {
          // Solo cerrar sesión si el servidor responde con 401
          if (error?.status === 401 || error?.status === 403) {
            console.log('Refresh token inválido, cerrando sesión');
            this.authService.clearAuth();
            this.router.navigate(['/login']);
          }
          // Para errores de red, mantener la sesión
        }
      });
    } else {
      // Sin refresh token, cerrar sesión
      this.authService.clearAuth();
      this.router.navigate(['/login']);
    }
  }
}
