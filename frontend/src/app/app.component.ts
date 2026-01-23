import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet, Platform } from '@ionic/angular/standalone';
import { AuthService } from './core/services';
import { Router, NavigationEnd } from '@angular/router';
import { NavController } from '@ionic/angular/standalone';
import { App } from '@capacitor/app';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  private navigationHistory: string[] = [];
  private isAuthenticated = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private platform: Platform,
    private navController: NavController
  ) {
    this.initializeBackButton();
    this.trackNavigation();
    this.trackAuthState();
  }
  
  ngOnInit(): void {
    this.initializeAuth();
  }

  /**
   * Rastrear el estado de autenticación
   */
  private trackAuthState(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
    });
  }

  /**
   * Rastrear el historial de navegación
   */
  private trackNavigation(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // No agregar rutas públicas al historial si está autenticado
      const publicRoutes = ['/login', '/register', '/forgot-password'];
      
      if (this.isAuthenticated && publicRoutes.some(route => event.urlAfterRedirects.startsWith(route))) {
        return;
      }
      
      // Evitar duplicados consecutivos
      if (this.navigationHistory[this.navigationHistory.length - 1] !== event.urlAfterRedirects) {
        this.navigationHistory.push(event.urlAfterRedirects);
        // Mantener un historial limitado
        if (this.navigationHistory.length > 20) {
          this.navigationHistory.shift();
        }
      }
    });
  }

  /**
   * Inicializar el manejo global del botón de retroceso
   */
  private initializeBackButton(): void {
    this.platform.backButton.subscribeWithPriority(10, async () => {
      const currentUrl = this.router.url;
      
      // Rutas públicas (no autenticadas)
      const publicRoutes = ['/login', '/register', '/forgot-password'];
      
      // Rutas raíz de la app (donde minimizar)
      const rootRoutes = ['/home', '/home/servicios', '/home/chat', '/home/perfil'];
      
      // Si está autenticado, nunca volver a rutas públicas
      if (this.isAuthenticated) {
        // Si estamos en una ruta raíz del home, minimizar
        if (rootRoutes.some(route => currentUrl === route || currentUrl.startsWith(route + '?'))) {
          App.minimizeApp();
          return;
        }
        
        // Buscar la última ruta válida en el historial (que no sea pública)
        const historyWithoutCurrent = this.navigationHistory.slice(0, -1);
        const lastValidRoute = [...historyWithoutCurrent].reverse().find(
          route => !publicRoutes.some(pr => route.startsWith(pr))
        );
        
        if (lastValidRoute && lastValidRoute !== currentUrl) {
          // Navegar a la última ruta válida
          this.navigationHistory.pop();
          this.navController.back();
        } else {
          // No hay más historial válido, minimizar
          App.minimizeApp();
        }
      } else {
        // No autenticado
        if (publicRoutes.some(route => currentUrl.startsWith(route))) {
          // En rutas públicas, minimizar
          App.minimizeApp();
        } else {
          this.navController.back();
        }
      }
    });
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
