import { Routes } from '@angular/router';
import { HomePage } from './home.page';

export const routes: Routes = [
  {
    path: '',
    component: HomePage,
    children: [
      {
        path: 'servicios',
        loadComponent: () => import('./tabs/servicios/servicios.page').then(m => m.ServiciosPage)
      },
      {
        path: 'servicios/:id',
        loadComponent: () => import('./tabs/servicios/servicios-detalle/servicio-detalle.page').then(m => m.ServicioDetallePage)
      },
      {
        path: 'chat',
        loadComponent: () => import('./tabs/chat/chat.page').then(m => m.ChatPage)
      },
      {
        path: 'conversacion/:id',
        loadComponent: () => import('./tabs/chat/conversacion/conversacion.page').then(m => m.ConversacionPage)
      },
      {
        path: 'perfil',
        loadComponent: () => import('./tabs/perfil/perfil.page').then(m => m.PerfilPage)
      },
      {
        path: '',
        redirectTo: 'servicios',
        pathMatch: 'full'
      }
    ]
  }
];
