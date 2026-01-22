import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonSearchbar } from '@ionic/angular/standalone';
import { ServiceService, UserService, getAvatarUrl } from '../../../../../core/services';
import { Service } from '../../../../../core/interfaces';

interface ServiceResult {
  id: string;
  titulo: string;
  descripcion: string;
  imagen: string;
  precio?: number;
  rating?: number;
}

interface PersonResult {
  id: string;
  nombre: string;
  avatar: string;
  rating?: number;
}

@Component({
  selector: 'app-buscar-servicio-persona',
  templateUrl: './buscar-servicio-persona.page.html',
  styleUrls: ['./buscar-servicio-persona.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonSearchbar
  ]
})
export class BuscarServicioPersonaPage implements OnInit {
  private router = inject(Router);
  private serviceService = inject(ServiceService);
  private userService = inject(UserService);

  searchQuery = '';
  isSearching = false;
  hasSearched = false;
  
  // Pestaña activa: 'servicios' o 'personas'
  activeTab: 'servicios' | 'personas' = 'servicios';
  
  // Resultados de búsqueda
  serviciosResultados: ServiceResult[] = [];
  personasResultados: PersonResult[] = [];
  
  // Servicios recientes (para mostrar antes de buscar)
  serviciosRecientes: ServiceResult[] = [];
  
  // Datos para búsqueda
  private allServices: Service[] = [];
  private allUsers: any[] = [];

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    // Cargar servicios
    this.serviceService.getServices({ pagina: 1, limite: 50 }).subscribe({
      next: (response) => {
        this.allServices = response?.services || [];
        
        // Guardar servicios recientes (los primeros 6)
        this.serviciosRecientes = this.allServices.slice(0, 6).map((s: Service) => ({
          id: s.id,
          titulo: s.titulo,
          descripcion: s.descripcion_corta || s.descripcion?.substring(0, 60) + '...' || '',
          imagen: s.images?.[0]?.url_imagen || 'assets/placeholder-service.png',
          precio: s.precio,
          rating: s.promedio_calificacion
        }));
      },
      error: (err) => {
        console.error('Error al cargar servicios:', err);
      }
    });

    // Cargar todos los usuarios activos
    this.userService.getAllActiveUsers(100).subscribe({
      next: (response) => {
        this.allUsers = response?.data || [];
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
      }
    });
  }

  cambiarTab(tab: 'servicios' | 'personas') {
    this.activeTab = tab;
  }

  onSearchChange(event: any) {
    const query = event.detail.value?.toLowerCase().trim() || '';
    this.searchQuery = query;
    
    if (query.length < 2) {
      this.limpiarResultados();
      this.hasSearched = false;
      return;
    }

    this.buscar(query);
  }

  limpiarResultados() {
    this.serviciosResultados = [];
    this.personasResultados = [];
  }

  buscar(query: string) {
    this.isSearching = true;
    this.hasSearched = true;

    // Buscar servicios por título/descripción
    const serviciosFiltrados = this.allServices.filter((s: Service) => 
      s.titulo.toLowerCase().includes(query) ||
      s.descripcion?.toLowerCase().includes(query)
    );

    this.serviciosResultados = serviciosFiltrados.map((s: Service) => ({
      id: s.id,
      titulo: s.titulo,
      descripcion: s.descripcion_corta || s.descripcion?.substring(0, 60) + '...' || '',
      imagen: s.images?.[0]?.url_imagen || 'assets/placeholder-service.png',
      precio: s.precio,
      rating: s.promedio_calificacion
    }));

    // Buscar personas en todos los usuarios activos
    this.personasResultados = this.allUsers
      .filter((p: any) => {
        const nombreCompleto = `${p.nombre || ''} ${p.apellido || ''}`.toLowerCase();
        const username = (p.usuario || '').toLowerCase();
        return nombreCompleto.includes(query) || username.includes(query);
      })
      .map((p: any) => ({
        id: p.id,
        nombre: `${p.nombre || ''} ${p.apellido || ''}`.trim(),
        avatar: getAvatarUrl(p.url_avatar, p.nombre, p.apellido),
        rating: p.promedio_calificacion
      }));

    this.isSearching = false;
  }

  get tieneResultados(): boolean {
    if (this.activeTab === 'servicios') {
      return this.serviciosResultados.length > 0;
    }
    return this.personasResultados.length > 0;
  }

  get cantidadServicios(): number {
    return this.serviciosResultados.length;
  }

  get cantidadPersonas(): number {
    return this.personasResultados.length;
  }

  verServicio(servicio: ServiceResult) {
    this.router.navigate(['/home/servicios', servicio.id]);
  }

  verPersona(persona: PersonResult) {
    this.router.navigate(['/home/perfil-publico', persona.id]);
  }

  goBack() {
    this.router.navigate(['/home/servicios']);
  }
}
