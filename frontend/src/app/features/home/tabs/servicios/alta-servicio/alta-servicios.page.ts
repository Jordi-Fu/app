import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { 
  IonContent,
  ActionSheetController,
  ToastController
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

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
  serviceForm!: FormGroup;
  serviceImages: (string | null)[] = [null, null, null];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private actionSheetCtrl: ActionSheetController,
    private toastCtrl: ToastController
  ) {}

  ngOnInit() {
    this.serviceForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.maxLength(200)]],
      descripcion: ['', [Validators.required]],
      precio: ['', [Validators.required, Validators.min(0)]],
      ubicacion: ['', [Validators.required]],
      categoria: ['', [Validators.required]]
    });
  }

  async selectImageSource(index: number) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Seleccionar imagen',
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
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      await this.showToast('Error al seleccionar la imagen', 'danger');
    }
  }

  removeImage(index: number) {
    this.serviceImages[index] = null;
  }

  async onSubmit() {
    if (!this.serviceForm.valid) {
      await this.showToast('Por favor, completa todos los campos', 'warning');
      return;
    }

    // Validar que al menos una imagen esté seleccionada
    const hasImage = this.serviceImages.some(img => img !== null);
    if (!hasImage) {
      await this.showToast('Por favor, sube al menos una imagen', 'warning');
      return;
    }

    console.log('Datos del servicio:', this.serviceForm.value);
    console.log('Imágenes:', this.serviceImages.filter(img => img !== null));

    // TODO: Implementar lógica de guardado
    await this.showToast('Servicio publicado exitosamente', 'success');
  }

  async showToast(message: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'top',
      color
    });
    await toast.present();
  }

  get tituloLength(): number {
    return this.serviceForm.get('titulo')?.value?.length || 0;
  }
}
