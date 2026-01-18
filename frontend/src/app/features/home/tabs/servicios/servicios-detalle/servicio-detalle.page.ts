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
  IonSpinner,
  ToastController
} from '@ionic/angular/standalone';
import { Share } from '@capacitor/share';
import { addIcons } from 'ionicons';
import { 
  starOutline, 
  star, 
  locationOutline, 
  timeOutline, 
  cashOutline,
  heartOutline,
  heart,
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
  private toastController = inject(ToastController);

  servicio: Service | null = null;
  isLoading = true;
  selectedImageIndex = 0;
  isFavorite = false;
  isSharingSupported = false;

  constructor() {
    addIcons({
      starOutline,
      star,
      locationOutline,
      timeOutline,
      cashOutline,
      heartOutline,
      heart,
      shareOutline,
      chatbubbleOutline,
      checkmarkCircleOutline,
      calendarOutline
    });
  }

  async ionViewWillEnter() {
    // Verificar si el dispositivo soporta compartir nativamente
    this.checkShareCapability();
  }

  async checkShareCapability() {
    try {
      const result = await Share.canShare();
      this.isSharingSupported = result.value;
    } catch (error) {
      console.log('Share API no disponible:', error);
      this.isSharingSupported = false;
    }
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
      } else {
        // Verificar si el servicio está en favoritos desde el backend
        this.checkIfFavorite(id);
      }
    } catch (error) {
      console.error('Error al cargar servicio:', error);
      this.router.navigate(['/home/servicios']);
    } finally {
      this.isLoading = false;
    }
  }

  async checkIfFavorite(serviceId: string) {
    try {
      // Verificar desde el backend si está en favoritos
      this.serviceService.checkIsFavorite(serviceId).subscribe({
        next: (response) => {
          this.isFavorite = response.isFavorite;
        },
        error: (error) => {
          console.log('No se pudo verificar favorito (usuario no autenticado o error):', error);
          this.isFavorite = false;
        }
      });
    } catch (error) {
      console.error('Error al verificar favorito:', error);
      this.isFavorite = false;
    }
  }

  selectImage(index: number) {
    this.selectedImageIndex = index;
  }

 

  getLocationText(): string {
    if (!this.servicio) return '';
    
    const locations: any = {
      'remote': '📱 Remoto',
      'at_client': '🏠 En domicilio del cliente',
      'at_provider': '🏢 En ubicación del proveedor',
      'flexible': '🔄 Ubicación flexible'
    };
    return locations[this.servicio.tipo_ubicacion] || this.servicio.tipo_ubicacion;
  }

  getDurationText(): string {
    if (!this.servicio?.duracion_minutos) return 'Duración no especificada';
    
    const hours = Math.floor(this.servicio.duracion_minutos / 60);
    const minutes = this.servicio.duracion_minutos % 60;
    
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
    if (this.servicio?.proveedor_id) {
      // TODO: Navegar al perfil del proveedor
      console.log('Navegar a proveedor:', this.servicio.proveedor_id);
    }
  }

  contactProvider() {
    if (this.servicio?.proveedor_id) {
      // TODO: Abrir chat con el proveedor
      console.log('Contactar proveedor:', this.servicio.proveedor_id);
    }
  }

  async toggleFavorite() {
    if (!this.servicio?.id) return;

    try {
      // Actualizar el estado local inmediatamente para mejor UX (optimistic update)
      const previousState = this.isFavorite;
      this.isFavorite = !this.isFavorite;

      // Llamar al servicio para actualizar en el backend
      this.serviceService.toggleFavorite(this.servicio.id).subscribe({
        next: async (response) => {
          console.log('Favorito actualizado:', response);
          
          // Actualizar con el estado real del backend
          this.isFavorite = response.isFavorite;
          
          // Mostrar notificación
          const toast = await this.toastController.create({
            message: this.isFavorite ? '❤️ Agregado a favoritos' : 'Eliminado de favoritos',
            duration: 2000,
            position: 'bottom',
            color: this.isFavorite ? 'success' : 'medium'
          });
          await toast.present();
        },
        error: async (error) => {
          console.error('Error al actualizar favorito:', error);
          // Revertir el cambio si hubo error
          this.isFavorite = previousState;
          
          const errorMsg = error?.error?.message || error?.message || 'Error al actualizar favoritos';
          
          const toast = await this.toastController.create({
            message: errorMsg.includes('autenticado') 
              ? 'Debes iniciar sesión para guardar favoritos' 
              : 'Error al actualizar favoritos. Intenta de nuevo.',
            duration: 3000,
            position: 'bottom',
            color: 'danger'
          });
          await toast.present();
        }
      });
    } catch (error) {
      console.error('Error en toggleFavorite:', error);
    }
  }

  async shareService() {
    if (!this.servicio) return;

    try {
      // Preparar el contenido para compartir
      const shareData: any = {
        title: this.servicio.titulo,
        text: `¡Mira este servicio! ${this.servicio.titulo}\n\n${this.servicio.descripcion}}`,
        url: window.location.href,
        dialogTitle: 'Compartir servicio'
      };

      // Intentar usar la API nativa de Share
      if (this.isSharingSupported) {
        await Share.share(shareData);
        console.log('Servicio compartido exitosamente');
      } else {
        // Fallback: usar Web Share API o copiar al portapapeles
        if (navigator.share) {
          await navigator.share(shareData);
          console.log('Servicio compartido exitosamente (Web Share API)');
        } else {
          // Copiar URL al portapapeles como último recurso
          await this.copyToClipboard(window.location.href);
          
          const toast = await this.toastController.create({
            message: '🔗 Enlace copiado al portapapeles',
            duration: 2500,
            position: 'bottom',
            color: 'success'
          });
          await toast.present();
        }
      }
    } catch (error: any) {
      // El usuario canceló o hubo un error
      if (error?.message !== 'Share canceled') {
        console.error('Error al compartir:', error);
        
        const toast = await this.toastController.create({
          message: 'No se pudo compartir el servicio',
          duration: 2500,
          position: 'bottom',
          color: 'warning'
        });
        await toast.present();
      }
    }
  }

  private async copyToClipboard(text: string): Promise<void> {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback para navegadores antiguos
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
    } catch (error) {
      console.error('Error al copiar al portapapeles:', error);
      throw error;
    }
  }

  getAvailabilityText(dayOfWeek: number): string {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[dayOfWeek];
  }
}
