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
        path: 'mis-resenas',
        loadComponent: () => import('./tabs/perfil/mis-resenas/mis-resenas.page').then(m => m.MisResenasPage)
      },
      {
        path: 'usuario/:id',
        loadComponent: () => import('./tabs/perfil/perfil-publico/perfil-publico.page').then(m => m.PerfilPublicoPage)
      },
      {
        path: 'alta-servicio',
        loadComponent: () => import('./tabs/servicios/alta-servicio/alta-servicios.page').then(m => m.AltaServicioPage)
      },
      {
        path: 'buscar-servicio-persona',
        loadComponent: () => import('./tabs/servicios/buscar-servicio-persona/buscar-servicio-persona.page').then(m => m.BuscarServicioPersonaPage)
      },
      {
        path: '',
        redirectTo: 'servicios',
        pathMatch: 'full'
      }
    ]
  }
];
