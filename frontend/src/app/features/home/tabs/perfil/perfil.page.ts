import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, NavController } from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { UserService } from '../../../../core/services/user.service';
import { ChatService } from '../../../../core/services/chat.service';
import { environment } from '../../../../../environments/environment';
import { Service } from '../../../../core/interfaces';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    IonContent
  ]
})
export class PerfilPage implements OnInit, OnDestroy {
  usuario: any = null;
  imageError = false;
  isDescripcionExpanded = false;
  serviciosActivos: Service[] = [];

  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private chatService: ChatService,
    private router: Router,
    private navController: NavController,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  async ngOnInit() {
    // Esperar a que la autenticación esté inicializada
    await this.authService.waitForAuthInit();
    
    const sub = this.authService.currentUser$.subscribe(user => {
      this.usuario = user;
      if (user?.id) {
        this.cargarServicios(user.id);
      }
      this.cdr.markForCheck();
    });
    this.subscriptions.push(sub);
  }

  cargarServicios(userId: string) {
    this.userService.getUserServices(userId).subscribe({
      next: (response: any) => {
        this.serviciosActivos = response.data || response || [];
        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('Error al cargar servicios:', err);
        this.serviciosActivos = [];
        this.cdr.markForCheck();
      }
    });
  }

  getAvatarUrl(avatarUrl: string | null): string {
    if (!avatarUrl) {
      return '';
    }
    if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
      return avatarUrl;
    }
    const baseUrl = environment.apiUrl.replace('/api', '');
    return `${baseUrl}${avatarUrl}`;
  }

  getServiceImageUrl(imageUrl: string | null): string {
    if (!imageUrl) {
      return '';
    }
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    const baseUrl = environment.apiUrl.replace('/api', '');
    return `${baseUrl}${imageUrl}`;
  }

  onImageError() {
    console.error('Error al cargar la imagen del avatar');
    this.imageError = true;
  }

  getMemberYear(): string {
    if (this.usuario?.creado_en) {
      return new Date(this.usuario.creado_en).getFullYear().toString();
    }
    return new Date().getFullYear().toString();
  }

  toggleDescripcion() {
    this.isDescripcionExpanded = !this.isDescripcionExpanded;
  }

  irAltaServicio() {
    this.router.navigate(['/home/alta-servicio']);
  }

  irResenasRecibidas() {
    this.router.navigate(['/home/mis-resenas']);
  }

  irServiciosFavoritos() {
    // TODO: Implementar navegación a favoritos
    console.log('Ir a servicios favoritos');
  }

  irConfiguracion() {
    // TODO: Implementar navegación a configuración
    console.log('Ir a configuración');
  }

  irAyuda() {
    // TODO: Implementar navegación a ayuda
    console.log('Ir a ayuda');
  }

  cerrarSesion() {
    // Limpiar caché de chat antes de cerrar sesión
    this.chatService.limpiarCache();
    
    this.authService.logout().subscribe(() => {
      // Usar navigateRoot para limpiar el historial de navegación
      // Esto evita que el botón atrás del dispositivo vuelva a la app
      this.navController.navigateRoot('/login', { animated: true, animationDirection: 'back' });
    });
  }
}
