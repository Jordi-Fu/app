import { Component, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef, TrackByFunction, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, IonRefresher, IonRefresherContent, ScrollDetail } from '@ionic/angular/standalone';
import { ServiceService, getAvatarUrl, getAbsoluteImageUrl, AuthService } from '../../../../core/services';
import { Service, Category } from '../../../../core/interfaces';

@Component({
  selector: 'app-servicios',
  templateUrl: './servicios.page.html',
  styleUrls: ['./servicios.page.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    IonContent,
    IonRefresher,
    IonRefresherContent
  ]
})
export class ServiciosPage implements OnInit {
  @ViewChild(IonContent) content?: IonContent;

  private serviceService = inject(ServiceService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  servicios: Service[] = [];
  serviciosFiltrados: Service[] = [];
  categorias: Category[] = [];
  categoriaSeleccionada: string | null = null;
  isLoading = true;
  searchQuery = '';
  
  // Control de paginación para infinite scroll
  private currentPage = 1;
  private readonly pageSize = 20;
  private hasMoreData = true;
  private isLoadingMore = false;
  private allServiciosFromServer: Service[] = [];

  // Cache de URLs para evitar recálculos
  private imageUrlCache = new Map<string, string>();
  private avatarUrlCache = new Map<string, string>();

  // TrackBy functions para optimizar ngFor
  trackByServicio: TrackByFunction<Service> = (index, servicio) => servicio.id;
  trackByCategoria: TrackByFunction<Category> = (index, categoria) => categoria.id;

  async ngOnInit() {
    // Esperar a que la autenticación esté inicializada
    await this.authService.waitForAuthInit();
    this.loadData();
  }

  /**
   * Manejador del evento de scroll de ion-content
   * Detecta cuándo el usuario está cerca del final para cargar más servicios
   */
  async onScroll(event: CustomEvent<ScrollDetail>) {
    if (this.isLoadingMore || !this.hasMoreData || this.isLoading) {
      return;
    }

    const scrollElement = await this.content?.getScrollElement();
    if (!scrollElement) return;

    const scrollTop = scrollElement.scrollTop;
    const scrollHeight = scrollElement.scrollHeight;
    const clientHeight = scrollElement.clientHeight;
    
    // Cargar más cuando esté a 200px del final
    const threshold = 200;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    if (distanceFromBottom < threshold) {
      this.loadMoreServices();
    }
  }

  async loadData() {
    this.isLoading = true;
    this.currentPage = 1;
    this.hasMoreData = true;
    this.allServiciosFromServer = [];
    this.servicios = [];
    this.serviciosFiltrados = [];
    this.cdr.markForCheck();
    
    try {
      // Cargar categorías y primera página de servicios en paralelo
      const [serviciosResp, categoriasResp] = await Promise.all([
        this.serviceService.getServices({
          page: this.currentPage,
          limit: this.pageSize,
        }).toPromise(),
        this.serviceService.getCategories().toPromise()
      ]);

      this.allServiciosFromServer = serviciosResp?.services || [];
      this.servicios = [...this.allServiciosFromServer];
      this.categorias = categoriasResp?.data || [];
      
      // Verificar si hay más datos
      this.hasMoreData = serviciosResp?.services?.length === this.pageSize;

      // Aplicar filtros si los hay
      this.aplicarFiltros();

      // Pre-cachear URLs de imágenes
      this.precacheImageUrls();
    
    } catch (error) {
      console.error('Error al cargar datos:', error);
      this.servicios = [];
      this.serviciosFiltrados = [];
      this.categorias = [];
      this.hasMoreData = false;
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
  }

  private async loadMoreServices() {
    if (this.isLoadingMore || !this.hasMoreData || this.isLoading) {
      return;
    }

    this.isLoadingMore = true;

    try {
      this.currentPage++;
      
      const serviciosResp = await this.serviceService.getServices({
        page: this.currentPage,
        limit: this.pageSize,
      }).toPromise();

      const newServices = serviciosResp?.services || [];
      
      if (newServices.length > 0) {
        // Agregar nuevos servicios a la lista completa
        this.allServiciosFromServer = [...this.allServiciosFromServer, ...newServices];
        this.servicios = [...this.allServiciosFromServer];
        
        // Verificar si hay más datos
        this.hasMoreData = newServices.length === this.pageSize;
        
        // Aplicar filtros
        this.aplicarFiltros();
        
        // Pre-cachear URLs de las nuevas imágenes
        this.precacheNewImageUrls(newServices);
      } else {
        this.hasMoreData = false;
      }
    } catch (error) {
      console.error('Error al cargar más servicios:', error);
      this.hasMoreData = false;
    } finally {
      this.isLoadingMore = false;
      this.cdr.markForCheck();
    }
  }

  /**
   * Pre-cachear URLs de imágenes para evitar recálculos en el template
   */
  private precacheImageUrls(): void {
    this.imageUrlCache.clear();
    this.avatarUrlCache.clear();
    
    for (const servicio of this.servicios) {
      // Cachear imagen del servicio
      if (servicio.images && servicio.images.length > 0) {
        this.imageUrlCache.set(servicio.id, getAbsoluteImageUrl(servicio.images[0].url_imagen, 'https://via.placeholder.com/400x200?text=Sin+imagen'));
      } else {
        this.imageUrlCache.set(servicio.id, '');
      }
      
      // Cachear avatar del proveedor
      this.avatarUrlCache.set(servicio.id, getAvatarUrl(servicio.provider?.url_avatar));
    }
  }

  /**
   * Pre-cachear URLs solo de los nuevos servicios cargados
   */
  private precacheNewImageUrls(newServices: Service[]): void {
    for (const servicio of newServices) {
      // Cachear imagen del servicio
      if (servicio.images && servicio.images.length > 0) {
        this.imageUrlCache.set(servicio.id, getAbsoluteImageUrl(servicio.images[0].url_imagen, 'https://via.placeholder.com/400x200?text=Sin+imagen'));
      } else {
        this.imageUrlCache.set(servicio.id, '');
      }
      
      // Cachear avatar del proveedor
      this.avatarUrlCache.set(servicio.id, getAvatarUrl(servicio.provider?.url_avatar));
    }
  }

  useMockData() {
    // Eliminado - no se usa mock data
    this.servicios = [];
    this.serviciosFiltrados = [];
    this.categorias = [];
  }

  onSearch(event: any) {
    this.searchQuery = event.target.value.toLowerCase();
    this.aplicarFiltros();
  }

  filtrarPorCategoria(categoriaId: string | null) {
    this.categoriaSeleccionada = categoriaId;
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    this.serviciosFiltrados = this.servicios.filter(servicio => {
      // Filtro de búsqueda
      const matchSearch = !this.searchQuery ||
        servicio.titulo.toLowerCase().includes(this.searchQuery) ||
        servicio.descripcion.toLowerCase().includes(this.searchQuery) ||
        servicio.provider?.nombre.toLowerCase().includes(this.searchQuery) ||
        servicio.provider?.apellido.toLowerCase().includes(this.searchQuery);

      // Filtro de categoría
      const matchCategoria = !this.categoriaSeleccionada ||
        servicio.categoria_id === this.categoriaSeleccionada;

      return matchSearch && matchCategoria;
    });
    this.cdr.markForCheck();
  }

  verDetalle(servicio: Service) {
    // Incrementar vistas (sin esperar la respuesta)
    this.serviceService.incrementViews(servicio.id).subscribe({
      next: () => {
      },
      error: (error) => {
        console.error('Error al incrementar vistas:', {
          message: error?.message || 'Error desconocido',
          status: error?.status,
          error: error?.error,
          fullError: error
        });
      }
    });

    // Navegar a detalle inmediatamente
    this.router.navigate(['/home/servicios', servicio.id]);
  }

  async handleRefresh(event: any) {
    await this.loadData();
    event.target.complete();
  }

  getPriceText(servicio: Service): string {
    if (!servicio.precio) {
      return 'Precio no disponible';
    }

    if (servicio.tipo_precio === 'negotiable') {
      return 'Negociable';
    }

    const symbol = servicio.moneda === 'MXN' ? '$' : servicio.moneda;
    const suffix = servicio.tipo_precio === 'hourly' ? '/hora' : '';
    return `${symbol}${servicio.precio}${suffix}`;
  }

  getLocationText(servicio: Service): string {
    const locations: any = {
      'remote': 'Remoto',
      'at_client': 'En domicilio',
      'at_provider': 'En ubicación del proveedor',
      'flexible': 'Flexible'
    };
    return locations[servicio.tipo_ubicacion] || servicio.tipo_ubicacion;
  }
  abrirCrearServicio(){
    this.router.navigate(['/home/alta-servicio']);
  }

  abrirBusqueda() {
    this.router.navigate(['/home/buscar-servicio-persona']);
  }

  getProviderAvatar(servicio: Service): string {
    return this.avatarUrlCache.get(servicio.id) || getAvatarUrl(servicio.provider?.url_avatar);
  }

  /**
   * Obtiene la URL absoluta de la imagen del servicio (desde cache)
   */
  getServiceImageUrl(servicio: Service): string {
    return this.imageUrlCache.get(servicio.id) || 'https://via.placeholder.com/400x200?text=Sin+imagen';
  }
}
