import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
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
import { UserService } from '../../../../../core/services';
import { UserProfile, Review } from '../../../../../core/interfaces';

@Component({
  selector: 'app-perfil-publico',
  templateUrl: './perfil-publico.page.html',
  styleUrls: ['./perfil-publico.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
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
          this.showToast('Usuario no encontrado', 'danger');
          this.router.navigate(['/home/servicios']);
        }
        this.isLoading = false;
      },
      error: (error) => {
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
    return `${nombre}${apellido}_`;
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
