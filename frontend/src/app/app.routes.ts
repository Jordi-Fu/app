import { Routes } from '@angular/router';
import { noAuthGuard, authGuard } from './core/guards';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.page').then(m => m.LoginPage),
    canActivate: [noAuthGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.page').then(m => m.RegisterPage),
    canActivate: [noAuthGuard]
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/auth/forgot-password/forgot-password.page').then(m => m.ForgotPasswordPage),
    canActivate: [noAuthGuard]
  },
  {
    path: 'home',
    loadChildren: () => import('./features/home/home.routes').then(m => m.routes),
    canActivate: [authGuard]
  },
];
