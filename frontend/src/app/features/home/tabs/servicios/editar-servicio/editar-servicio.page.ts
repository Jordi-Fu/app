import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { 
  IonContent,
  ActionSheetController,
  ToastController,
  LoadingController,
  AlertController
} from '@ionic/angular/standalone';
import { Router, ActivatedRoute } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ServiceService, AuthService } from '../../../../../core/services';
import { 
  Category, 
  Service,
  PriceType, 
  LocationType,
  ServiceAvailabilitySlot,
  ServiceImage
} from '../../../../../core/interfaces/service.interface';
import { environment } from '../../../../../../environments/environment';

interface DiaDisponibilidad {
  nombre: string;
  dia: number;
  selected: boolean;
  horarios: { inicio: string; fin: string }[];
}

interface CategoriaConSubcategorias extends Category {
  subcategorias?: Category[];
}

interface ImagenServicio {
  id?: string;
  url?: string;
  base64?: string;
  formato?: string;
  esNueva: boolean;
  eliminada: boolean;
}

@Component({
  selector: 'app-editar-servicio',
  templateUrl: './editar-servicio.page.html',
  styleUrls: ['./editar-servicio.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class EditarServicioPage implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private actionSheetCtrl = inject(ActionSheetController);
  private toastCtrl = inject(ToastController);
  private loadingCtrl = inject(LoadingController);
  private alertCtrl = inject(AlertController);
  private serviceService = inject(ServiceService);
  private authService = inject(AuthService);

  serviceForm!: FormGroup;
  servicioId: string = '';
  servicio: Service | null = null;
  isLoading = true;
  
  // Imágenes con manejo de existentes y nuevas
  serviceImages: ImagenServicio[] = [];
  maxImages = 3;
  
  // Control de pasos
  currentStep = 1;
  
  // Categorías y subcategorías
  categorias: CategoriaConSubcategorias[] = [];
  todasLasCategorias: Category[] = [];
  categoriaSeleccionada: CategoriaConSubcategorias | null = null;
  showSubcategoryModal = false;
  categoriasDelServidor = false;
  
  // Precio
  precioFijo = true;
  monedaActual = '€';
  monedas = ['€'];
  showPricePopup = false;
  
  // Disponibilidad
  showNoSchedulePopup = false;
  diasSemana: DiaDisponibilidad[] = [
    { nombre: 'Lunes', dia: 1, selected: false, horarios: [] },
    { nombre: 'Martes', dia: 2, selected: false, horarios: [] },
    { nombre: 'Miércoles', dia: 3, selected: false, horarios: [] },
    { nombre: 'Jueves', dia: 4, selected: false, horarios: [] },
    { nombre: 'Viernes', dia: 5, selected: false, horarios: [] },
    { nombre: 'Sábado', dia: 6, selected: false, horarios: [] },
    { nombre: 'Domingo', dia: 0, selected: false, horarios: [] },
  ];
  
  // Urgencias
  disponibilidadUrgencias = false;
  precioUrgencias: number | null = null;
  
  // Estado de envío
  isSubmitting = false;
  
  // Visor de imágenes
  showImageViewer = false;
  currentImageIndex = 0;

  // Campos adicionales de la BBDD
  queIncluye: string = '';
  queNoIncluye: string = '';
  requisitos: string = '';
  politicaCancelacion: string = '';

  // Modales de acción
  showActionModal = false;
  showActivateModal = false;
  showDeactivateModal = false;
  showDeleteModal = false;
  ngOnInit() {
    this.initForm();
    this.loadCategories();
    
    // Obtener ID del servicio desde la ruta
    this.servicioId = this.route.snapshot.paramMap.get('id') || '';
    if (this.servicioId) {
      this.loadServicio();
    } else {
      this.router.navigate(['/home/perfil']);
    }
  }

  private initForm() {
    this.serviceForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(50)]],
      descripcion: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
      precio: [null],
      ubicacion: [''],
      categoria_id: ['', [Validators.required]],
      tipo_ubicacion: ['flexible'],
      duracion_minutos: [null],
      que_incluye: [''],
      que_no_incluye: [''],
      requisitos: [''],
      politica_cancelacion: ['']
    });
  }

  async loadServicio() {
    this.isLoading = true;
    try {
      const response = await this.serviceService.getServiceById(this.servicioId).toPromise();
      this.servicio = response?.data || null;
      
      if (this.servicio) {
        this.populateForm();
      } else {
        await this.showToast('Servicio no encontrado', 'danger');
        this.router.navigate(['/home/perfil']);
      }
    } catch (error) {
      console.error('Error al cargar servicio:', error);
      await this.showToast('Error al cargar el servicio', 'danger');
      this.router.navigate(['/home/perfil']);
    } finally {
      this.isLoading = false;
    }
  }

  private populateForm() {
    if (!this.servicio) return;

    // Cargar datos básicos
    this.serviceForm.patchValue({
      titulo: this.servicio.titulo,
      descripcion: this.servicio.descripcion,
      precio: this.servicio.precio,
      categoria_id: this.servicio.categoria_id,
      tipo_ubicacion: this.servicio.tipo_ubicacion || 'flexible',
      duracion_minutos: this.servicio.duracion_minutos,
      que_incluye: this.servicio.que_incluye || '',
      que_no_incluye: this.servicio.que_no_incluye || '',
      requisitos: this.servicio.requisitos || '',
      politica_cancelacion: this.servicio.politica_cancelacion || ''
    });

    // Construir ubicación
    if (this.servicio.ciudad || this.servicio.codigo_postal) {
      const ubicacion = [this.servicio.ciudad, this.servicio.codigo_postal].filter(Boolean).join(', ');
      this.serviceForm.patchValue({ ubicacion });
    }

    // Precio
    this.precioFijo = this.servicio.precio !== null && this.servicio.precio !== undefined;
    this.monedaActual = this.servicio.moneda || '€';

    // Cargar imágenes existentes
    this.serviceImages = [];
    if (this.servicio.images && this.servicio.images.length > 0) {
      this.servicio.images.forEach(img => {
        this.serviceImages.push({
          id: img.id,
          url: this.getImageUrl(img.url_imagen),
          esNueva: false,
          eliminada: false
        });
      });
    }

    // Cargar disponibilidad
    if (this.servicio.availability && this.servicio.availability.length > 0) {
      this.diasSemana.forEach(dia => {
        dia.selected = false;
        dia.horarios = [];
      });

      this.servicio.availability.forEach(avail => {
        const diaIndex = this.diasSemana.findIndex(d => d.dia === avail.dia_semana);
        if (diaIndex !== -1 && avail.esta_disponible) {
          this.diasSemana[diaIndex].selected = true;
          this.diasSemana[diaIndex].horarios.push({
            inicio: avail.hora_inicio,
            fin: avail.hora_fin
          });
        }
      });
    }

    // Urgencias
    this.disponibilidadUrgencias = this.servicio.disponibilidad_urgencias || false;
    this.precioUrgencias = this.servicio.precio_urgencias || null;

    // Campos adicionales
    this.queIncluye = this.servicio.que_incluye || '';
    this.queNoIncluye = this.servicio.que_no_incluye || '';
    this.requisitos = this.servicio.requisitos || '';
    this.politicaCancelacion = this.servicio.politica_cancelacion || '';
  }

  getImageUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    const baseUrl = environment.apiUrl.replace('/api', '');
    return `${baseUrl}${url}`;
  }

  private async loadCategories() {
    try {
      this.serviceService.getCategories().subscribe({
        next: (response) => {
          if (response.success && response.data && response.data.length > 0) {
            this.todasLasCategorias = response.data;
            this.categorias = this.organizarCategorias(response.data);
            this.categoriasDelServidor = true;
          } else {
            console.error('No se encontraron categorías en el servidor');
            this.categoriasDelServidor = false;
          }
        },
        error: (err) => {
          console.error('Error al cargar categorías:', err);
          this.categoriasDelServidor = false;
        }
      });
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  }

  private organizarCategorias(allCategories: Category[]): CategoriaConSubcategorias[] {
    const principales = allCategories.filter(cat => !cat.padre_id);
    const subcategorias = allCategories.filter(cat => cat.padre_id);

    return principales.map(principal => ({
      ...principal,
      subcategorias: subcategorias.filter(sub => sub.padre_id === principal.id)
    }));
  }

  // ===================== NAVEGACIÓN DE PASOS =====================
  
  nextStep() {
    if (this.currentStep === 1) {
      if (!this.isStep1Valid()) {
        return;
      }
      if (!this.validateStep1()) {
        return;
      }
      this.currentStep = 2;
    } else if (this.currentStep === 2) {
      this.currentStep = 3;
    } else if (this.currentStep === 3) {
      this.currentStep = 4;
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  previousStep() {
    this.prevStep();
  }

  private validateStep1(): boolean {
    const hasImage = this.serviceImages.some(img => !img.eliminada && (img.url || img.base64));
    if (!hasImage) {
      this.showToast('Por favor, sube al menos una imagen', 'warning');
      return false;
    }

    const titulo = this.serviceForm.get('titulo');
    if (titulo?.invalid) {
      titulo.markAsTouched();
      this.showToast('Por favor, completa el título correctamente', 'warning');
      return false;
    }

    const descripcion = this.serviceForm.get('descripcion');
    if (descripcion?.invalid) {
      descripcion.markAsTouched();
      this.showToast('Por favor, completa la descripción correctamente', 'warning');
      return false;
    }

    if (this.precioFijo) {
      const precio = this.serviceForm.get('precio')?.value;
      if (!precio || precio <= 0) {
        this.showToast('Por favor, indica un precio válido', 'warning');
        return false;
      }
    }

    return true;
  }

  isStep1Valid(): boolean {
    const hasImage = this.serviceImages.some(img => !img.eliminada && (img.url || img.base64));
    if (!hasImage) return false;

    const titulo = this.serviceForm.get('titulo')?.value;
    if (!titulo || titulo.length < 5) return false;

    const descripcion = this.serviceForm.get('descripcion')?.value;
    if (!descripcion || descripcion.length < 10) return false;

    if (this.precioFijo) {
      const precio = this.serviceForm.get('precio')?.value;
      if (!precio || precio <= 0) return false;
    }

    return true;
  }

  // ===================== IMÁGENES =====================

  async selectImageSource(index?: number) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Seleccionar imagen',
      cssClass: 'image-source-action-sheet',
      buttons: [
        {
          text: 'Cámara',
          icon: 'camera',
          handler: () => {
            this.takePicture(CameraSource.Camera, index);
          }
        },
        {
          text: 'Galería',
          icon: 'images',
          handler: () => {
            this.takePicture(CameraSource.Photos, index);
          }
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

  async takePicture(source: CameraSource, replaceIndex?: number) {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: source
      });

      if (image.base64String) {
        const newImage: ImagenServicio = {
          base64: `data:image/${image.format};base64,${image.base64String}`,
          formato: image.format || 'jpeg',
          esNueva: true,
          eliminada: false
        };

        if (replaceIndex !== undefined && replaceIndex < this.serviceImages.length) {
          // Marcar la imagen anterior como eliminada si existe
          if (this.serviceImages[replaceIndex].id) {
            this.serviceImages[replaceIndex].eliminada = true;
          }
          // Insertar la nueva imagen en su lugar
          this.serviceImages.splice(replaceIndex, 1, newImage);
        } else if (this.getActiveImagesCount() < this.maxImages) {
          this.serviceImages.push(newImage);
        }
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      await this.showToast('Error al seleccionar la imagen', 'danger');
    }
  }

  removeImage(index: number) {
    if (this.serviceImages[index].id) {
      // Marcar como eliminada (para imágenes existentes)
      this.serviceImages[index].eliminada = true;
    } else {
      // Eliminar directamente (para imágenes nuevas)
      this.serviceImages.splice(index, 1);
    }
  }

  getActiveImages(): ImagenServicio[] {
    return this.serviceImages.filter(img => !img.eliminada);
  }

  getActiveImagesCount(): number {
    return this.getActiveImages().length;
  }

  getImageSrc(img: ImagenServicio): string {
    return img.base64 || img.url || '';
  }

  canAddMoreImages(): boolean {
    return this.getActiveImagesCount() < this.maxImages;
  }

  // ===================== CATEGORÍAS =====================

  selectCategory(category: CategoriaConSubcategorias) {
    this.categoriaSeleccionada = category;
    
    if (category.subcategorias && category.subcategorias.length > 0) {
      this.showSubcategoryModal = true;
    } else {
      this.serviceForm.patchValue({ categoria_id: category.id });
      setTimeout(() => this.nextStep(), 200);
    }
  }

  selectSubcategory(subcategory: Category) {
    this.serviceForm.patchValue({ categoria_id: subcategory.id });
    this.showSubcategoryModal = false;
    setTimeout(() => this.nextStep(), 200);
  }

  closeSubcategoryModal() {
    this.showSubcategoryModal = false;
    this.categoriaSeleccionada = null;
  }

  isCategoryOrSubcategorySelected(category: CategoriaConSubcategorias): boolean {
    const selectedId = this.serviceForm.get('categoria_id')?.value;
    if (!selectedId) return false;
    
    if (category.id === selectedId) return true;
    
    if (category.subcategorias) {
      return category.subcategorias.some(sub => sub.id === selectedId);
    }
    
    return false;
  }

  // ===================== PRECIO =====================

  togglePrecioFijo() {
    if (this.precioFijo) {
      this.showPricePopup = true;
    } else {
      this.precioFijo = true;
    }
  }

  closePricePopup() {
    this.showPricePopup = false;
  }

  confirmPrecioVariable() {
    this.precioFijo = false;
    this.serviceForm.patchValue({ precio: null });
    this.showPricePopup = false;
  }

  toggleCurrency() {
    const currentIndex = this.monedas.indexOf(this.monedaActual);
    const nextIndex = (currentIndex + 1) % this.monedas.length;
    this.monedaActual = this.monedas[nextIndex];
  }

  setTipoUbicacion(tipo: string) {
    this.serviceForm.get('tipo_ubicacion')?.setValue(tipo);
  }

  // ===================== DISPONIBILIDAD =====================

  toggleDay(index: number) {
    const day = this.diasSemana[index];
    day.selected = !day.selected;
    
    if (day.selected && day.horarios.length === 0) {
      day.horarios.push({ inicio: '08:00', fin: '16:00' });
    }
    
    this.checkAndDisableUrgencias();
  }

  addTimeSlot(dayIndex: number) {
    this.diasSemana[dayIndex].horarios.push({ inicio: '08:00', fin: '16:00' });
  }

  removeTimeSlot(dayIndex: number, slotIndex: number) {
    this.diasSemana[dayIndex].horarios.splice(slotIndex, 1);
    this.checkAndDisableUrgencias();
  }

  private checkAndDisableUrgencias() {
    if (!this.hasScheduleSelected() && this.disponibilidadUrgencias) {
      this.disponibilidadUrgencias = false;
      this.precioUrgencias = null;
    }
  }

  onUrgenciasChange() {
    if (!this.disponibilidadUrgencias) {
      this.precioUrgencias = null;
    }
  }

  hasScheduleSelected(): boolean {
    return this.diasSemana.some(day => day.selected && day.horarios.length > 0);
  }

  handleStep3Next() {
    if (this.hasScheduleSelected()) {
      this.nextStep();
    } else {
      this.showNoSchedulePopup = true;
    }
  }

  closeNoSchedulePopup() {
    this.showNoSchedulePopup = false;
  }

  confirmNoSchedule() {
    this.diasSemana.forEach(day => {
      day.selected = false;
      day.horarios = [];
    });
    this.showNoSchedulePopup = false;
    this.currentStep = 4;
  }

  // ===================== MÉTODOS PARA RESUMEN =====================

  getImageCount(): number {
    return this.getActiveImagesCount();
  }

  openImageViewer(index: number) {
    this.currentImageIndex = index;
    this.showImageViewer = true;
  }

  closeImageViewer() {
    this.showImageViewer = false;
  }

  prevImage() {
    const activeImages = this.getActiveImages();
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
    }
  }

  nextImage() {
    const activeImages = this.getActiveImages();
    if (this.currentImageIndex < activeImages.length - 1) {
      this.currentImageIndex++;
    }
  }

  canNavigatePrev(): boolean {
    return this.currentImageIndex > 0;
  }

  canNavigateNext(): boolean {
    return this.currentImageIndex < this.getActiveImages().length - 1;
  }

  // ===================== HELPERS =====================

  getTipoUbicacionLabel(): string {
    const tipo = this.serviceForm.get('tipo_ubicacion')?.value;
    const labels: { [key: string]: string } = {
      'at_client': 'A domicilio',
      'at_provider': 'En tienda',
      'remote': 'Online',
      'flexible': 'Flexible'
    };
    return labels[tipo] || 'Flexible';
  }

  getCategoriaSeleccionadaNombre(): string {
    const categoriaId = this.serviceForm.get('categoria_id')?.value;
    if (!categoriaId) return 'Sin categoría';
    
    for (const cat of this.categorias) {
      if (cat.id === categoriaId) {
        return cat.nombre;
      }
      if (cat.subcategorias) {
        const subcat = cat.subcategorias.find(s => s.id === categoriaId);
        if (subcat) {
          return `${cat.nombre} > ${subcat.nombre}`;
        }
      }
    }
    return 'Sin categoría';
  }

  getDisponibilidadResumen(): string {
    const diasSeleccionados = this.diasSemana.filter(d => d.selected);
    if (diasSeleccionados.length === 0) {
      return '';
    }
    
    if (diasSeleccionados.length === 7) {
      return 'Todos los días';
    }
    
    const nombres = diasSeleccionados.map(d => d.nombre.substring(0, 3));
    return nombres.join(', ');
  }

  // ===================== ACTUALIZACIÓN DEL SERVICIO =====================

  async updateService() {
    if (this.isSubmitting) return;
    
    let token: string | null = null;
    try {
      token = await this.authService.getAccessToken();
    } catch (error) {
      console.warn('Error obteniendo token:', error);
    }
    
    if (!token) {
      await this.showAuthAlert();
      return;
    }
    
    if (!this.categoriasDelServidor) {
      await this.showToast('Error: Las categorías no se cargaron correctamente. Reinicia la app.', 'danger');
      return;
    }
    
    const categoriaId = this.serviceForm.get('categoria_id')?.value;
    if (!categoriaId) {
      await this.showToast('Por favor, selecciona una categoría', 'warning');
      this.currentStep = 2;
      return;
    }
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(categoriaId)) {
      await this.showToast('Error: Categoría inválida. Selecciona otra categoría.', 'danger');
      this.currentStep = 2;
      return;
    }

    this.isSubmitting = true;

    const loading = await this.loadingCtrl.create({
      message: 'Actualizando servicio...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      // Preparar imágenes nuevas
      const imagenesNuevas = this.serviceImages
        .filter(img => img.esNueva && !img.eliminada && img.base64)
        .map(img => ({
          base64: img.base64!.replace(/^data:image\/\w+;base64,/, ''),
          formato: img.formato || 'jpeg'
        }));

      // IDs de imágenes a eliminar
      const imagenesAEliminar = this.serviceImages
        .filter(img => img.eliminada && img.id)
        .map(img => img.id!);

      // Preparar disponibilidad
      const disponibilidad: ServiceAvailabilitySlot[] = [];
      this.diasSemana.forEach(day => {
        if (day.selected) {
          day.horarios.forEach(slot => {
            disponibilidad.push({
              dia_semana: day.dia,
              hora_inicio: slot.inicio,
              hora_fin: slot.fin,
              esta_disponible: true
            });
          });
        }
      });

      // Parsear ubicación
      const ubicacion = this.serviceForm.get('ubicacion')?.value || '';
      const [ciudad, codigoPostal] = ubicacion.split(',').map((s: string) => s.trim());

      // Preparar datos del servicio
      const serviceData = {
        titulo: this.serviceForm.get('titulo')?.value,
        descripcion: this.serviceForm.get('descripcion')?.value,
        categoria_id: this.serviceForm.get('categoria_id')?.value,
        tipo_precio: this.precioFijo ? PriceType.FIXED : PriceType.FIXED,
        precio: this.precioFijo ? this.serviceForm.get('precio')?.value : undefined,
        moneda: this.monedaActual === '€' ? '€' : this.monedaActual === '$' ? 'USD' : 'GBP',
        duracion_minutos: this.serviceForm.get('duracion_minutos')?.value || undefined,
        tipo_ubicacion: (this.serviceForm.get('tipo_ubicacion')?.value || 'flexible') as LocationType,
        ciudad: ciudad || undefined,
        codigo_postal: codigoPostal || undefined,
        disponibilidad_urgencias: this.disponibilidadUrgencias,
        precio_urgencias: this.disponibilidadUrgencias ? this.precioUrgencias || undefined : undefined,
        que_incluye: this.serviceForm.get('que_incluye')?.value || undefined,
        que_no_incluye: this.serviceForm.get('que_no_incluye')?.value || undefined,
        requisitos: this.serviceForm.get('requisitos')?.value || undefined,
        politica_cancelacion: this.serviceForm.get('politica_cancelacion')?.value || undefined,
        imagenes_nuevas: imagenesNuevas,
        imagenes_eliminar: imagenesAEliminar,
        disponibilidad
      };

      // Enviar al servidor
      this.serviceService.updateService(this.servicioId, serviceData).subscribe({
        next: async (response) => {
          await loading.dismiss();
          this.isSubmitting = false;

          if (response.success) {
            await this.showToast('¡Servicio actualizado correctamente!', 'success');
            // Resetear estado del componente antes de navegar
            this.resetComponentState();
            this.router.navigate(['/home/perfil'], { replaceUrl: true });
          } else {
            await this.showToast(response.message || 'Error al actualizar el servicio', 'danger');
          }
        },
        error: async (error) => {
          await loading.dismiss();
          this.isSubmitting = false;
          console.error('Error al actualizar servicio:', JSON.stringify(error, null, 2));
          
          let errorMessage = 'Error al actualizar el servicio';
          if (error.status === 401 || error.status === 403) {
            await this.showAuthAlert();
            return;
          } else if (error.error?.errors && Array.isArray(error.error.errors)) {
            errorMessage = error.error.errors.map((e: any) => e.msg).join(', ');
          } else if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          await this.showToast(errorMessage, 'danger');
        }
      });
    } catch (error) {
      await loading.dismiss();
      this.isSubmitting = false;
      console.error('Error:', error);
      await this.showToast('Error al procesar el servicio', 'danger');
    }
  }

  // ===================== CONFIGURACIÓN DEL SERVICIO =====================

  // Abre el modal de configuración del servicio
  openServiceSettings() {
    this.showActionModal = true;
  }

  closeActionModal() {
    this.showActionModal = false;
  }

  // ---- Activar servicio ----
  showActivateConfirm() {
    this.showActionModal = false;
    this.showActivateModal = true;
  }

  closeActivateModal() {
    this.showActivateModal = false;
  }

  async activateService() {
    this.showActivateModal = false;
    
    const loading = await this.loadingCtrl.create({
      message: 'Activando servicio...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      this.serviceService.updateService(this.servicioId, { esta_activo: true }).subscribe({
        next: async (response) => {
          await loading.dismiss();
          if (response.success) {
            await this.showToast('¡Servicio activado correctamente!', 'success');
            // Actualizar el estado local del servicio
            if (this.servicio) {
              this.servicio.esta_activo = true;
            }
          } else {
            await this.showToast(response.message || 'Error al activar el servicio', 'danger');
          }
        },
        error: async (error) => {
          await loading.dismiss();
          console.error('Error al activar servicio:', error);
          await this.showToast('Error al activar el servicio', 'danger');
        }
      });
    } catch (error) {
      await loading.dismiss();
      console.error('Error:', error);
      await this.showToast('Error al activar el servicio', 'danger');
    }
  }

  // ---- Desactivar servicio ----
  showDeactivateConfirm() {
    this.showActionModal = false;
    this.showDeactivateModal = true;
  }

  closeDeactivateModal() {
    this.showDeactivateModal = false;
  }

  async deactivateService() {
    this.showDeactivateModal = false;
    
    const loading = await this.loadingCtrl.create({
      message: 'Desactivando servicio...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      this.serviceService.updateService(this.servicioId, { esta_activo: false }).subscribe({
        next: async (response) => {
          await loading.dismiss();
          if (response.success) {
            await this.showToast('Servicio desactivado correctamente', 'success');
            // Actualizar el estado local del servicio
            if (this.servicio) {
              this.servicio.esta_activo = false;
            }
          } else {
            await this.showToast(response.message || 'Error al desactivar el servicio', 'danger');
          }
        },
        error: async (error) => {
          await loading.dismiss();
          console.error('Error al desactivar servicio:', error);
          await this.showToast('Error al desactivar el servicio', 'danger');
        }
      });
    } catch (error) {
      await loading.dismiss();
      console.error('Error:', error);
      await this.showToast('Error al desactivar el servicio', 'danger');
    }
  }

  // ---- Eliminar servicio ----
  showDeleteConfirm() {
    this.showActionModal = false;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
  }

  async deleteService() {
    this.showDeleteModal = false;
    
    const loading = await this.loadingCtrl.create({
      message: 'Eliminando servicio...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      this.serviceService.deleteService(this.servicioId).subscribe({
        next: async (response) => {
          await loading.dismiss();
          if (response.success) {
            await this.showToast('Servicio eliminado correctamente', 'success');
            this.resetComponentState();
            this.router.navigate(['/home/perfil'], { replaceUrl: true });
          } else {
            await this.showToast(response.message || 'Error al eliminar el servicio', 'danger');
          }
        },
        error: async (error) => {
          await loading.dismiss();
          console.error('Error al eliminar servicio:', error);
          await this.showToast('Error al eliminar el servicio', 'danger');
        }
      });
    } catch (error) {
      await loading.dismiss();
      console.error('Error:', error);
      await this.showToast('Error al eliminar el servicio', 'danger');
    }
  }

  // ===================== UTILIDADES =====================

  async showToast(message: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'top',
      color
    });
    await toast.present();
  }

  async showAuthAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Sesión requerida',
      message: 'Debes iniciar sesión para editar un servicio.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Iniciar sesión',
          handler: () => {
            this.router.navigate(['/auth/login']);
          }
        }
      ]
    });
    await alert.present();
  }

  get tituloLength(): number {
    return this.serviceForm.get('titulo')?.value?.length || 0;
  }

  get descripcionLength(): number {
    return this.serviceForm.get('descripcion')?.value?.length || 0;
  }

  goBack() {
    if (this.currentStep > 1) {
      this.previousStep();
    } else {
      this.router.navigate(['/home/perfil']);
    }
  }

  /**
   * Resetea el estado del componente para que la próxima vez
   * se inicie desde el comienzo
   */
  private resetComponentState() {
    // Resetear formulario
    this.serviceForm.reset();
    this.initForm();
    
    // Resetear variables de estado
    this.servicioId = '';
    this.servicio = null;
    this.isLoading = true;
    this.currentStep = 1;
    
    // Resetear imágenes
    this.serviceImages = [];
    
    // Resetear categorías
    this.categoriaSeleccionada = null;
    this.showSubcategoryModal = false;
    
    // Resetear precio
    this.precioFijo = true;
    this.monedaActual = '€';
    this.showPricePopup = false;
    
    // Resetear disponibilidad
    this.showNoSchedulePopup = false;
    this.diasSemana = [
      { nombre: 'Lunes', dia: 1, selected: false, horarios: [] },
      { nombre: 'Martes', dia: 2, selected: false, horarios: [] },
      { nombre: 'Miércoles', dia: 3, selected: false, horarios: [] },
      { nombre: 'Jueves', dia: 4, selected: false, horarios: [] },
      { nombre: 'Viernes', dia: 5, selected: false, horarios: [] },
      { nombre: 'Sábado', dia: 6, selected: false, horarios: [] },
      { nombre: 'Domingo', dia: 0, selected: false, horarios: [] },
    ];
    
    // Resetear urgencias
    this.disponibilidadUrgencias = false;
    this.precioUrgencias = null;
    
    // Resetear estado de envío
    this.isSubmitting = false;
    
    // Resetear visor de imágenes
    this.showImageViewer = false;
    this.currentImageIndex = 0;
    
    // Resetear campos adicionales
    this.queIncluye = '';
    this.queNoIncluye = '';
    this.requisitos = '';
    this.politicaCancelacion = '';
  }
}
