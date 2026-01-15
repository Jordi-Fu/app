import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { 
  IonHeader, 
  IonToolbar, 
  IonButtons, 
  IonBackButton, 
  IonTitle, 
  IonContent,
  IonButton,
  IonIcon,
  IonChip,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonAvatar,
  IonBadge,
  IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  starOutline, 
  star, 
  locationOutline, 
  timeOutline, 
  cashOutline,
  heartOutline,
  shareOutline,
  chatbubbleOutline,
  checkmarkCircleOutline,
  calendarOutline
} from 'ionicons/icons';
import { ServiceService } from '../../../../../core/services';
import { Service } from '../../../../../core/interfaces';

@Component({
  selector: 'app-servicio-detalle',
  templateUrl: './servicio-detalle.page.html',
  styleUrls: ['./servicio-detalle.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonContent,
    IonButton,
    IonIcon,
    IonChip,
    IonLabel,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonAvatar,
    IonBadge,
    IonSpinner
  ]
})
export class ServicioDetallePage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private serviceService = inject(ServiceService);

  servicio: Service | null = null;
  isLoading = true;
  selectedImageIndex = 0;

  constructor() {
    addIcons({
      starOutline,
      star,
      locationOutline,
      timeOutline,
      cashOutline,
      heartOutline,
      shareOutline,
      chatbubbleOutline,
      checkmarkCircleOutline,
      calendarOutline
    });
  }

  ngOnInit() {
    const serviceId = this.route.snapshot.paramMap.get('id');
    if (serviceId) {
      this.loadServicio(serviceId);
    } else {
      this.router.navigate(['/home/servicios']);
    }
  }

  async loadServicio(id: string) {
    this.isLoading = true;
    try {
      const response = await this.serviceService.getServiceById(id).toPromise();
      this.servicio = response?.data || null;
      
      if (!this.servicio) {
        console.error('Servicio no encontrado');
        this.router.navigate(['/home/servicios']);
      }
    } catch (error) {
      console.error('Error al cargar servicio:', error);
      this.router.navigate(['/home/servicios']);
    } finally {
      this.isLoading = false;
    }
  }

  selectImage(index: number) {
    this.selectedImageIndex = index;
  }

  getPriceText(): string {
    if (!this.servicio || !this.servicio.price) {
      return 'Precio no disponible';
    }
    
    if (this.servicio.price_type === 'negotiable') {
      return 'Precio negociable';
    }
    
    const symbol = this.servicio.currency === 'MXN' ? '$' : this.servicio.currency;
    const suffix = this.servicio.price_type === 'hourly' ? '/hora' : '';
    return `${symbol}${this.servicio.price}${suffix}`;
  }

  getLocationText(): string {
    if (!this.servicio) return '';
    
    const locations: any = {
      'remote': '📱 Remoto',
      'at_client': '🏠 En domicilio del cliente',
      'at_provider': '🏢 En ubicación del proveedor',
      'flexible': '🔄 Ubicación flexible'
    };
    return locations[this.servicio.location_type] || this.servicio.location_type;
  }

  getDurationText(): string {
    if (!this.servicio?.duration_minutes) return 'Duración no especificada';
    
    const hours = Math.floor(this.servicio.duration_minutes / 60);
    const minutes = this.servicio.duration_minutes % 60;
    
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}min`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}min`;
    }
  }

  getStarsArray(): number[] {
    return [1, 2, 3, 4, 5];
  }

  goToProvider() {
    if (this.servicio?.provider_id) {
      // TODO: Navegar al perfil del proveedor
      console.log('Navegar a proveedor:', this.servicio.provider_id);
    }
  }

  contactProvider() {
    if (this.servicio?.provider_id) {
      // TODO: Abrir chat con el proveedor
      console.log('Contactar proveedor:', this.servicio.provider_id);
    }
  }

  bookService() {
    if (this.servicio?.id) {
      // TODO: Navegar a página de reserva
      console.log('Reservar servicio:', this.servicio.id);
    }
  }

  toggleFavorite() {
    if (this.servicio?.id) {
      this.serviceService.toggleFavorite(this.servicio.id).subscribe({
        next: (response) => {
          console.log('Favorito actualizado:', response);
          // TODO: Actualizar UI
        },
        error: (error) => {
          console.error('Error al actualizar favorito:', error);
        }
      });
    }
  }

  shareService() {
    if (this.servicio) {
      // TODO: Implementar compartir
      console.log('Compartir servicio:', this.servicio.id);
    }
  }

  getAvailabilityText(dayOfWeek: number): string {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[dayOfWeek];
  }
}
