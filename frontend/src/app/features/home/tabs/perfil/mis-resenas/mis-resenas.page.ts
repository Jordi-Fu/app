import { Component, OnInit, inject, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  IonContent,
  IonAvatar,
  IonSpinner,
  ToastController,
  NavController
} from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../../../core/services/auth.service';
import { UserService, ReviewResponse, ReviewSortOption, getAvatarUrl as getAvatarUrlHelper } from '../../../../../core/services';

@Component({
  selector: 'app-mis-resenas',
  templateUrl: './mis-resenas.page.html',
  styleUrls: ['./mis-resenas.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonAvatar,
    IonSpinner
  ]
})
export class MisResenasPage implements OnInit, OnDestroy {
  private router = inject(Router);
  private navController = inject(NavController);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private toastController = inject(ToastController);

  private userSubscription?: Subscription;
  private currentUserId: string | null = null;

  reviews: ReviewResponse[] = [];
  totalReviews = 0;
  isLoading = true;
  showSortMenu = false;
  currentSort: ReviewSortOption = 'recent';

  sortOptions: { value: ReviewSortOption; label: string }[] = [
    { value: 'recent', label: 'Más recientes' },
    { value: 'oldest', label: 'Menos recientes' },
    { value: 'rating-desc', label: 'Puntuación descendente' },
    { value: 'rating-asc', label: 'Puntuación ascendente' }
  ];

  ngOnInit() {
    this.initializeUser();
  }

  ngOnDestroy() {
    this.userSubscription?.unsubscribe();
  }

  async initializeUser() {
    this.isLoading = true;
    
    // Esperar a que la autenticación esté inicializada
    await this.authService.waitForAuthInit();
    
    // Suscribirse al usuario actual
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      if (user?.id && user.id !== this.currentUserId) {
        this.currentUserId = user.id;
        this.loadReviews();
      } else if (!user) {
        this.isLoading = false;
        this.reviews = [];
      }
    });
  }

  loadReviews() {
    if (!this.currentUserId) {
      this.isLoading = false;
      return;
    }

    this.isLoading = true;

    this.userService.getUserReviews(this.currentUserId, this.currentSort).subscribe({
      next: (response) => {
        if (response.success) {
          this.reviews = response.data || [];
          this.totalReviews = response.total || 0;
        } else {
          this.reviews = [];
          this.totalReviews = 0;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar reseñas:', error);
        this.showToast('Error al cargar las reseñas', 'danger');
        this.reviews = [];
        this.totalReviews = 0;
        this.isLoading = false;
      }
    });
  }

  toggleSortMenu() {
    this.showSortMenu = !this.showSortMenu;
  }

  closeSortMenu() {
    this.showSortMenu = false;
  }

  selectSort(option: ReviewSortOption) {
    if (this.currentSort !== option) {
      this.currentSort = option;
      this.loadReviews(); // Recargar desde el backend con el nuevo orden
    }
    this.closeSortMenu();
  }

  getStarsArray(): number[] {
    return [1, 2, 3, 4, 5];
  }

  getReviewerAvatar(review: ReviewResponse): string {
    return getAvatarUrlHelper(review.reviewer_avatar);
  }

  goToService(serviceId: string) {
    if (serviceId) {
      this.router.navigate(['/home/servicios', serviceId]);
    }
  }

  goToReviewerProfile(reviewerId: string) {
    if (reviewerId) {
      this.router.navigate(['/home/usuario', reviewerId]);
    }
  }

  async reportReview(review: ReviewResponse) {
    // TODO: Implementar denuncia de reseña
    const toast = await this.toastController.create({
      message: 'Funcionalidad de denuncia próximamente',
      duration: 2500,
      position: 'bottom',
      color: 'warning'
    });
    await toast.present();
  }

  goBack() {
    this.navController.back();
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

  // Cerrar el menú si se hace clic fuera de él
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.sort-container') && this.showSortMenu) {
      this.closeSortMenu();
    }
  }
}
