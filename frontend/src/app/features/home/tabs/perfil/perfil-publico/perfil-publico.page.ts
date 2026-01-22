import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { 
  IonHeader, 
  IonContent,
  IonAvatar,
  IonIcon,
  IonSpinner,
  IonFabButton,
  ToastController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  checkmarkCircle,
  star,
  starOutline,
  chatbubbleOutline,
  ellipse,
  optionsOutline
} from 'ionicons/icons';
import { UserService, getAvatarUrl as getAvatarUrlHelper, getAbsoluteImageUrl } from '../../../../../core/services';
import { UserProfile, Review } from '../../../../../core/interfaces';

@Component({
  selector: 'app-perfil-publico',
  templateUrl: './perfil-publico.page.html',
  styleUrls: ['./perfil-publico.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonAvatar,
    IonIcon,
    IonSpinner,
    IonFabButton
  ]
})
export class PerfilPublicoPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private userService = inject(UserService);
  private toastController = inject(ToastController);

  userProfile: UserProfile | null = null;
  userServices: any[] = [];
  userReviews: Review[] = [];
  isLoading = true;
  isDescripcionExpanded = false;

  constructor() {
    addIcons({
      checkmarkCircle,
      star,
      starOutline,
      chatbubbleOutline,
      ellipse,
      optionsOutline
    });
  }

  ngOnInit() {
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      this.loadUserProfile(userId);
      this.loadUserServices(userId);
      this.loadUserReviews(userId);
    } else {
      this.router.navigate(['/home/servicios']);
    }
  }

  async loadUserProfile(userId: string) {
    this.isLoading = true;
    this.userService.getUserById(userId).subscribe({
      next: (response) => {
        this.userProfile = response?.data || null;
        
        if (!this.userProfile) {
          console.error('Perfil de usuario no encontrado');
          this.showToast('Usuario no encontrado', 'danger');
          this.router.navigate(['/home/servicios']);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar perfil de usuario:', error);
        this.showToast('Error al cargar el perfil del usuario', 'danger');
        this.router.navigate(['/home/servicios']);
        this.isLoading = false;
      }
    });
  }

  async loadUserServices(userId: string) {
    this.userService.getUserServices(userId).subscribe({
      next: (response) => {
        this.userServices = response?.data || [];
      },
      error: (error) => {
        console.error('Error al cargar servicios del usuario:', error);
        this.userServices = [];
      }
    });
  }

  async loadUserReviews(userId: string) {
    // TODO: Implementar cuando exista el endpoint de reseñas
    // Por ahora mostramos datos de ejemplo
    this.userReviews = [
      {
        id: '1',
        reviewer_name: 'Fidel E.',
        reviewer_avatar: '',
        reviewer_time_in_app: '7 meses',
        rating: 5,
        time_ago: '1 mes',
        comment: 'Persona muy ordenada y buena cuidadora, la recomiendo para cuidados de personas de tercera edad.',
        service_id: '1',
        service_name: 'Limpieza del hogar'
      }
    ];
  }

  getStarsArray(): number[] {
    return [1, 2, 3, 4, 5];
  }

  getYear(dateString: string): string {
    const date = new Date(dateString);
    return date.getFullYear().toString();
  }

  getUsername(): string {
    if (!this.userProfile) return '';
    const nombre = this.userProfile.nombre.toLowerCase().replace(/\s/g, '');
    const apellido = this.userProfile.apellido.toLowerCase().replace(/\s/g, '');
    return `${nombre}${apellido}`;
  }

  toggleDescripcion() {
    this.isDescripcionExpanded = !this.isDescripcionExpanded;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long'
    };
    return date.toLocaleDateString('es-ES', options);
  }

  goToService(serviceId: any) {
    this.router.navigate(['/home/servicios', serviceId]);
  }

  seeAllServices() {
    // TODO: Implementar vista de todos los servicios del usuario
    this.showToast('Ver todos los servicios', 'medium');
  }

  toggleSort() {
    // TODO: Implementar ordenación de reseñas
    this.showToast('Ordenar reseñas', 'medium');
  }

  contactUser() {
    if (this.userProfile?.id) {
      // TODO: Implementar navegación al chat o crear conversación
      this.showToast('Funcionalidad de chat próximamente', 'warning');
    }
  }

  goBack() {
    // Usar Location.back() para volver a la página anterior
    // Esto funcionará desde conversacion, servicio-detalle, o cualquier otra ruta
    this.location.back();
  }

  getUserAvatar(): string {
    return getAvatarUrlHelper(this.userProfile?.url_avatar);
  }

  getReviewerAvatar(review: Review): string {
    return getAvatarUrlHelper(review.reviewer_avatar);
  }

  /**
   * Obtiene la URL absoluta de la imagen del servicio
   */
  getServiceImageUrl(service: any): string {
    if (service.images && service.images.length > 0) {
      return getAbsoluteImageUrl(service.images[0].url_imagen, 'https://via.placeholder.com/200x150?text=Sin+imagen');
    }
    return 'https://via.placeholder.com/200x150?text=Sin+imagen';
  }

  private async showToast(message: string, color: string = 'medium') {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      position: 'bottom',
      color
    });
    await toast.present();
  }
}
