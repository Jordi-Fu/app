import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { AuthService } from '../../../../core/services/auth.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent
  ]
})
export class PerfilPage implements OnInit {
  usuario: any = null;
  imageError = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.usuario = user;
      console.log('Usuario en perfil:', this.usuario);
      if (this.usuario?.avatarUrl) {
        console.log('Avatar URL:', this.usuario.avatarUrl);
        console.log('Avatar URL completa:', this.getAvatarUrl(this.usuario.avatarUrl));
      }
    });
  }

  getAvatarUrl(avatarUrl: string | null): string {
    if (!avatarUrl) {
      return '';
    }
    // Si ya es una URL completa, devolverla tal cual
    if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
      return avatarUrl;
    }
    // Construir URL completa desde el servidor
    const baseUrl = environment.apiUrl.replace('/api', '');
    return `${baseUrl}${avatarUrl}`;
  }

  onImageError() {
    console.error('Error al cargar la imagen del avatar');
    this.imageError = true;
  }

  cerrarSesion() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}
