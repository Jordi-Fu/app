import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, IonRefresher, IonRefresherContent } from '@ionic/angular/standalone';
import { ServiceService } from '../../../../core/services';
import { Service, Category } from '../../../../core/interfaces';

@Component({
  selector: 'app-servicios',
  templateUrl: './servicios.page.html',
  styleUrls: ['./servicios.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonRefresher,
    IonRefresherContent
  ]
})
export class ServiciosPage implements OnInit {
  private serviceService = inject(ServiceService);
  private router = inject(Router);

  servicios: Service[] = [];
  serviciosFiltrados: Service[] = [];
  categorias: Category[] = [];
  categoriaSeleccionada: string | null = null;
  isLoading = true;
  searchQuery = '';

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    this.isLoading = true;
    try {
      // Cargar servicios y categorías en paralelo
      const [serviciosResp, categoriasResp] = await Promise.all([
        this.serviceService.getServices({ 
          page: 1, 
          limit: 100,
        }).toPromise(),
        this.serviceService.getCategories().toPromise()
      ]);

      this.servicios = serviciosResp?.services || [];
      this.serviciosFiltrados = this.servicios;
      this.categorias = categoriasResp?.data || [];
      
      console.log('Servicios cargados:', this.servicios.length);
      console.log('Categorías cargadas:', this.categorias.length);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      this.servicios = [];
      this.serviciosFiltrados = [];
      this.categorias = [];
    } finally {
      this.isLoading = false;
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
        servicio.title.toLowerCase().includes(this.searchQuery) ||
        servicio.description.toLowerCase().includes(this.searchQuery) ||
        servicio.provider?.first_name.toLowerCase().includes(this.searchQuery) ||
        servicio.provider?.last_name.toLowerCase().includes(this.searchQuery);

      // Filtro de categoría
      const matchCategoria = !this.categoriaSeleccionada || 
        servicio.category_id === this.categoriaSeleccionada;

      return matchSearch && matchCategoria;
    });
  }

  verDetalle(servicio: Service) {
    // Incrementar vistas
    this.serviceService.incrementViews(servicio.id).subscribe({
      error: (err) => console.error('Error al incrementar vistas:', err)
    });
    
    // Navegar a detalle
    this.router.navigate(['/home/servicios', servicio.id]);
  }

  async handleRefresh(event: any) {
    await this.loadData();
    event.target.complete();
  }

  getPriceText(servicio: Service): string {
    if (!servicio.price) {
      return 'Precio no disponible';
    }
    
    if (servicio.price_type === 'negotiable') {
      return 'Negociable';
    }
    
    const symbol = servicio.currency === 'MXN' ? '$' : servicio.currency;
    const suffix = servicio.price_type === 'hourly' ? '/hora' : '';
    return `${symbol}${servicio.price}${suffix}`;
  }

  getLocationText(servicio: Service): string {
    const locations: any = {
      'remote': 'Remoto',
      'at_client': 'En domicilio',
      'at_provider': 'En ubicación del proveedor',
      'flexible': 'Flexible'
    };
    return locations[servicio.location_type] || servicio.location_type;
  }
}
