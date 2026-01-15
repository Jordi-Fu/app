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
    this.checkAuthState();
  }
  
  private async checkAuthState(): Promise<void> {
    const token = await this.authService.getAccessToken();
    const refreshToken = await this.authService.getRefreshToken();
    const currentUrl = this.router.url;
    
    if (token) {
      this.authService.verifyToken().subscribe({
        next: (isValid) => {
          if (isValid) {
            // Token válido - redirigir a home si está en login
            if (currentUrl === '/login' || currentUrl === '/' || currentUrl === '') {
              this.router.navigate(['/home']);
            }
          } else if (refreshToken) {
            // Token inválido pero hay refresh token - intentar renovar
            this.authService.refreshToken().subscribe({
              next: () => {
                if (currentUrl === '/login' || currentUrl === '/' || currentUrl === '') {
                  this.router.navigate(['/home']);
                }
              },
              error: () => {
                this.authService.clearAuth();
                this.router.navigate(['/login']);
              }
            });
          } else {
            // Token inválido y sin refresh token
            this.authService.clearAuth();
            this.router.navigate(['/login']);
          }
        },
        error: () => {
          if (refreshToken) {
            this.authService.refreshToken().subscribe({
              next: () => {
                if (currentUrl === '/login' || currentUrl === '/' || currentUrl === '') {
                  this.router.navigate(['/home']);
                }
              },
              error: () => {
                this.authService.clearAuth();
                this.router.navigate(['/login']);
              }
            });
          } else {
            this.authService.clearAuth();
            this.router.navigate(['/login']);
          }
        }
      });
    } else if (currentUrl !== '/login' && currentUrl !== '/register') {
      // Sin token y no está en páginas públicas
      this.router.navigate(['/login']);
    }
  }
}
