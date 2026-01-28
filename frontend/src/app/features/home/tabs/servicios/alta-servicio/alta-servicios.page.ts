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
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ServiceService, AuthService } from '../../../../../core/services';
import { 
  Category, 
  CreateServiceRequest, 
  PriceType, 
  LocationType,
  ServiceAvailabilitySlot 
} from '../../../../../core/interfaces/service.interface';

interface DiaDisponibilidad {
  nombre: string;
  dia: number;
  selected: boolean;
  horarios: { inicio: string; fin: string }[];
}

interface CategoriaConSubcategorias extends Category {
  subcategorias?: Category[];
}

@Component({
  selector: 'app-alta-servicio',
  templateUrl: './alta-servicios.page.html',
  styleUrls: ['./alta-servicios.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class AltaServicioPage implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private actionSheetCtrl = inject(ActionSheetController);
  private toastCtrl = inject(ToastController);
  private loadingCtrl = inject(LoadingController);
  private alertCtrl = inject(AlertController);
  private serviceService = inject(ServiceService);
  private authService = inject(AuthService);

  serviceForm!: FormGroup;
  serviceImages: (string | null)[] = [null, null, null];
  imageFormats: (string | null)[] = [null, null, null];
  
  // Control de pasos
  currentStep = 1;
  
  // Categorías y subcategorías
  categorias: CategoriaConSubcategorias[] = [];
  todasLasCategorias: Category[] = [];
  categoriaSeleccionada: CategoriaConSubcategorias | null = null;
  showSubcategoryModal = false;
  categoriasDelServidor = false; // Indica si las categorías se cargaron del servidor
  
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
  
  // Datos para el resumen
  createdService: any = null;

  // Visor de imágenes
  showImageViewer = false;
  currentImageIndex = 0;

  ngOnInit() {
    this.initForm();
    this.loadCategories();
  }

  private initForm() {
    this.serviceForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(50)]],
      descripcion: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(200)]],
      precio: [null],
      ubicacion: [''],
      categoria_id: ['', [Validators.required]],
      tipo_ubicacion: ['flexible'],
      duracion_minutos: [null]
    });
  }

  private resetForm() {
    // Resetear formulario
    this.serviceForm.reset({
      titulo: '',
      descripcion: '',
      precio: null,
      ubicacion: '',
      categoria_id: '',
      tipo_ubicacion: 'flexible',
      duracion_minutos: null
    });
    
    // Volver al paso 1
    this.currentStep = 1;
    
    // Resetear imágenes
    this.serviceImages = [null, null, null];
    this.imageFormats = [null, null, null];
    
    // Resetear categoría seleccionada
    this.categoriaSeleccionada = null;
    this.showSubcategoryModal = false;
    
    // Resetear precio
    this.precioFijo = true;
    this.monedaActual = '€';
    this.showPricePopup = false;
    
    // Resetear disponibilidad
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
    
    // Resetear estado
    this.createdService = null;
    this.isSubmitting = false;
  }

  private async loadCategories() {
    try {
      // Cargar categorías del servidor
      this.serviceService.getCategories().subscribe({
        next: (response) => {
          if (response.success && response.data && response.data.length > 0) {
            this.todasLasCategorias = response.data;
            this.categorias = this.organizarCategorias(response.data);
            this.categoriasDelServidor = true;
            console.log('Categorías cargadas del servidor:', response.data.length);
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
    // Separar categorías principales (sin padre_id) de subcategorías
    const principales = allCategories.filter(cat => !cat.padre_id);
    const subcategorias = allCategories.filter(cat => cat.padre_id);

    // Asignar subcategorías a sus padres
    return principales.map(principal => ({
      ...principal,
      subcategorias: subcategorias.filter(sub => sub.padre_id === principal.id)
    }));
  }

  // ===================== NAVEGACIÓN DE PASOS =====================
  
  nextStep() {
    if (this.currentStep === 1) {
      // No avanzar si el formulario no es válido
      if (!this.isStep1Valid()) {
        return;
      }
      // Validar campos del paso 1 (muestra toasts si hay error)
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
    // Validar imágenes
    const hasImage = this.serviceImages.some(img => img !== null);
    if (!hasImage) {
      this.showToast('Por favor, sube al menos una imagen', 'warning');
      return false;
    }

    // Validar título
    const titulo = this.serviceForm.get('titulo');
    if (titulo?.invalid) {
      titulo.markAsTouched();
      this.showToast('Por favor, completa el título correctamente', 'warning');
      return false;
    }

    // Validar descripción
    const descripcion = this.serviceForm.get('descripcion');
    if (descripcion?.invalid) {
      descripcion.markAsTouched();
      this.showToast('Por favor, completa la descripción correctamente', 'warning');
      return false;
    }

    // Validar precio si es fijo
    if (this.precioFijo) {
      const precio = this.serviceForm.get('precio')?.value;
      if (!precio || precio <= 0) {
        this.showToast('Por favor, indica un precio válido', 'warning');
        return false;
      }
    }

    return true;
  }

  /**
   * Verifica si el paso 1 es válido para mostrar el botón siguiente
   * No muestra toasts, solo retorna boolean
   */
  isStep1Valid(): boolean {
    // Verificar al menos una imagen
    const hasImage = this.serviceImages.some(img => img !== null);
    if (!hasImage) return false;

    // Verificar título válido (min 5 caracteres)
    const titulo = this.serviceForm.get('titulo')?.value;
    if (!titulo || titulo.length < 5) return false;

    // Verificar descripción válida (min 10 caracteres)
    const descripcion = this.serviceForm.get('descripcion')?.value;
    if (!descripcion || descripcion.length < 10) return false;

    // Si precio fijo, verificar que haya precio
    if (this.precioFijo) {
      const precio = this.serviceForm.get('precio')?.value;
      if (!precio || precio <= 0) return false;
    }

    return true;
  }

  // ===================== IMÁGENES =====================

  async selectImageSource(index: number) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Seleccionar imagen',
      cssClass: 'image-source-action-sheet',
      buttons: [
        {
          text: 'Cámara',
          icon: 'camera',
          handler: () => {
            this.takePicture(index, CameraSource.Camera);
          }
        },
        {
          text: 'Galería',
          icon: 'images',
          handler: () => {
            this.takePicture(index, CameraSource.Photos);
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

  async takePicture(index: number, source: CameraSource) {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: source
      });

      if (image.base64String) {
        this.serviceImages[index] = `data:image/${image.format};base64,${image.base64String}`;
        this.imageFormats[index] = image.format || 'jpeg';
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      await this.showToast('Error al seleccionar la imagen', 'danger');
    }
  }

  removeImage(index: number) {
    this.serviceImages[index] = null;
    this.imageFormats[index] = null;
  }

  // ===================== CATEGORÍAS =====================

  selectCategory(category: CategoriaConSubcategorias) {
    this.categoriaSeleccionada = category;
    
    // Verificar si tiene subcategorías
    if (category.subcategorias && category.subcategorias.length > 0) {
      // Mostrar menú de subcategorías desde abajo (estilo mis-reseñas)
      this.showSubcategoryModal = true;
    } else {
      // Si no tiene subcategorías, seleccionar directamente
      this.serviceForm.patchValue({ categoria_id: category.id });
      setTimeout(() => this.nextStep(), 200);
    }
  }

  selectSubcategory(subcategory: Category) {
    this.serviceForm.patchValue({ categoria_id: subcategory.id });
    this.showSubcategoryModal = false;
    // Avanzar automáticamente al siguiente paso
    setTimeout(() => this.nextStep(), 200);
  }

  closeSubcategoryModal() {
    this.showSubcategoryModal = false;
    this.categoriaSeleccionada = null;
  }

  /**
   * Verifica si la categoría o alguna de sus subcategorías está seleccionada
   */
  isCategoryOrSubcategorySelected(category: CategoriaConSubcategorias): boolean {
    const selectedId = this.serviceForm.get('categoria_id')?.value;
    if (!selectedId) return false;
    
    // Verificar si es la categoría principal
    if (category.id === selectedId) return true;
    
    // Verificar si alguna subcategoría está seleccionada
    if (category.subcategorias) {
      return category.subcategorias.some(sub => sub.id === selectedId);
    }
    
    return false;
  }

  // ===================== PRECIO =====================

  togglePrecioFijo() {
    if (this.precioFijo) {
      // Mostrar popup de confirmación
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
      // Agregar horario por defecto
      day.horarios.push({ inicio: '08:00', fin: '16:00' });
    }
    
    // Si ya no hay horarios, desactivar urgencias
    this.checkAndDisableUrgencias();
  }

  addTimeSlot(dayIndex: number) {
    this.diasSemana[dayIndex].horarios.push({ inicio: '08:00', fin: '16:00' });
  }

  removeTimeSlot(dayIndex: number, slotIndex: number) {
    this.diasSemana[dayIndex].horarios.splice(slotIndex, 1);
    
    // Si ya no hay horarios, desactivar urgencias
    this.checkAndDisableUrgencias();
  }

  /**
   * Verifica si hay horarios y desactiva urgencias si no los hay
   */
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

  /**
   * Verifica si hay al menos un día con horarios seleccionados
   */
  hasScheduleSelected(): boolean {
    return this.diasSemana.some(day => day.selected && day.horarios.length > 0);
  }

  /**
   * Maneja el click en siguiente del paso 3
   */
  handleStep3Next() {
    if (this.hasScheduleSelected()) {
      // Si tiene horarios, avanzar directamente
      this.nextStep();
    } else {
      // Si no tiene horarios, mostrar modal de confirmación
      this.showNoSchedulePopup = true;
    }
  }

  closeNoSchedulePopup() {
    this.showNoSchedulePopup = false;
  }

  confirmNoSchedule() {
    // Limpiar disponibilidad y pasar al resumen
    this.diasSemana.forEach(day => {
      day.selected = false;
      day.horarios = [];
    });
    this.showNoSchedulePopup = false;
    this.currentStep = 4;
  }

  // ===================== MÉTODOS PARA RESUMEN =====================

  getImageCount(): number {
    return this.serviceImages.filter(img => img !== null).length;
  }

  // ===================== VISOR DE IMÁGENES =====================

  openImageViewer(index: number) {
    this.currentImageIndex = index;
    this.showImageViewer = true;
  }

  closeImageViewer() {
    this.showImageViewer = false;
  }

  prevImage() {
    const imagesWithContent = this.serviceImages
      .map((img, idx) => ({ img, idx }))
      .filter(item => item.img !== null);
    
    const currentPos = imagesWithContent.findIndex(item => item.idx === this.currentImageIndex);
    if (currentPos > 0) {
      this.currentImageIndex = imagesWithContent[currentPos - 1].idx;
    }
  }

  nextImage() {
    const imagesWithContent = this.serviceImages
      .map((img, idx) => ({ img, idx }))
      .filter(item => item.img !== null);
    
    const currentPos = imagesWithContent.findIndex(item => item.idx === this.currentImageIndex);
    if (currentPos < imagesWithContent.length - 1) {
      this.currentImageIndex = imagesWithContent[currentPos + 1].idx;
    }
  }

  canNavigatePrev(): boolean {
    const imagesWithContent = this.serviceImages
      .map((img, idx) => ({ img, idx }))
      .filter(item => item.img !== null);
    
    const currentPos = imagesWithContent.findIndex(item => item.idx === this.currentImageIndex);
    return currentPos > 0;
  }

  canNavigateNext(): boolean {
    const imagesWithContent = this.serviceImages
      .map((img, idx) => ({ img, idx }))
      .filter(item => item.img !== null);
    
    const currentPos = imagesWithContent.findIndex(item => item.idx === this.currentImageIndex);
    return currentPos < imagesWithContent.length - 1;
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
    
    // Buscar en categorías principales
    for (const cat of this.categorias) {
      if (cat.id === categoriaId) {
        return cat.nombre;
      }
      // Buscar en subcategorías
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

  // ===================== ENVÍO DEL FORMULARIO =====================

  async submitService() {
    if (this.isSubmitting) return;
    
    // Verificar si el usuario está autenticado
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
    
    // Validar que las categorías se cargaron del servidor
    if (!this.categoriasDelServidor) {
      await this.showToast('Error: Las categorías no se cargaron correctamente. Reinicia la app.', 'danger');
      return;
    }
    
    // Validar categoría
    const categoriaId = this.serviceForm.get('categoria_id')?.value;
    if (!categoriaId) {
      await this.showToast('Por favor, selecciona una categoría', 'warning');
      this.currentStep = 2;
      return;
    }
    
    // Validar que el ID de categoría es un UUID válido
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(categoriaId)) {
      await this.showToast('Error: Categoría inválida. Selecciona otra categoría.', 'danger');
      this.currentStep = 2;
      return;
    }

    this.isSubmitting = true;

    const loading = await this.loadingCtrl.create({
      message: 'Publicando servicio...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      // Preparar imágenes
      const imagenes = this.serviceImages
        .map((img, index) => ({ img, index }))
        .filter(item => item.img !== null)
        .map(item => {
          const base64 = item.img!.replace(/^data:image\/\w+;base64,/, '');
          return {
            base64,
            formato: this.imageFormats[item.index] || 'jpeg'
          };
        });

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
      const serviceData: CreateServiceRequest = {
        titulo: this.serviceForm.get('titulo')?.value,
        descripcion: this.serviceForm.get('descripcion')?.value,
        categoria_id: this.serviceForm.get('categoria_id')?.value,
        tipo_precio: this.precioFijo ? PriceType.FIXED : PriceType.FIXED, // Siempre 'fijo', el precio null indica variable
        precio: this.precioFijo ? this.serviceForm.get('precio')?.value : undefined,
        moneda: this.monedaActual === '€' ? '€' : this.monedaActual === '$' ? 'USD' : 'GBP',
        duracion_minutos: this.serviceForm.get('duracion_minutos')?.value || undefined,
        tipo_ubicacion: (this.serviceForm.get('tipo_ubicacion')?.value || 'flexible') as LocationType,
        ciudad: ciudad || undefined,
        codigo_postal: codigoPostal || undefined,
        disponibilidad_urgencias: this.disponibilidadUrgencias,
        precio_urgencias: this.disponibilidadUrgencias ? this.precioUrgencias || undefined : undefined,
        imagenes,
        disponibilidad
      };

      // Enviar al servidor
      this.serviceService.createService(serviceData).subscribe({
        next: async (response) => {
          await loading.dismiss();
          this.isSubmitting = false;

          if (response.success) {
            this.createdService = response.data;
            await this.showToast('¡Servicio publicado correctamente!', 'success');
            
            // Resetear el formulario y volver al paso 1
            this.resetForm();
            
            // Navegar a la página de servicios
            this.router.navigate(['/home/servicios']);
          } else {
            await this.showToast(response.message || 'Error al publicar el servicio', 'danger');
          }
        },
        error: async (error) => {
          await loading.dismiss();
          this.isSubmitting = false;
          console.error('Error al crear servicio:', JSON.stringify(error, null, 2));
          
          let errorMessage = 'Error al publicar el servicio';
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

  /**
   * Muestra alerta de autenticación requerida
   */
  async showAuthAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Sesión requerida',
      message: 'Debes iniciar sesión para publicar un servicio.',
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

  /**
   * Volver a la página anterior
   */
  goBack() {
    this.router.navigate(['/home/servicios']);
  }
}
