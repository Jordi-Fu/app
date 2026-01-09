import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { IonContent, ActionSheetController, LoadingController, ToastController } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { AuthService } from '../../../../core/services/auth.service';
import { RegisterRequest } from '../../../../core/interfaces';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    CommonModule, 
    FormsModule, 
    ReactiveFormsModule
  ],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ 
          opacity: 0, 
          transform: 'translateX(30px)',
          position: 'absolute'
        }),
        animate('350ms 100ms cubic-bezier(0.4, 0.0, 0.2, 1)', style({ 
          opacity: 1, 
          transform: 'translateX(0)'
        }))
      ]),
      transition(':leave', [
        style({ position: 'absolute' }),
        animate('250ms cubic-bezier(0.4, 0.0, 0.2, 1)', style({ 
          opacity: 0, 
          transform: 'translateX(-30px)'
        }))
      ])
    ])
  ]
})
export class RegisterPage implements OnInit {
  currentStep = 1;
  registerForm!: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  profilePhoto: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private actionSheetCtrl: ActionSheetController,
    private authService: AuthService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    this.registerForm = this.fb.group({
      // Paso 1: Datos Personales
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      telefono: ['', [Validators.required]],
      
      // Paso 2: Cuenta
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      
      // Paso 3: Perfil
      bio: ['', [Validators.maxLength(500)]]
    });
  }

  get serviciosArray(): FormArray {
    return this.registerForm.get('servicios') as FormArray;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  formatPhoneNumber(event: any) {
    let input = event.target.value.replace(/\D/g, '');
    
    if (input.length > 9) {
      input = input.substring(0, 9);
    }
    
    let formatted = '';
    if (input.length > 0) {
      formatted = input.substring(0, 3);
      if (input.length >= 4) {
        formatted += ' ' + input.substring(3, 5);
      }
      if (input.length >= 6) {
        formatted += ' ' + input.substring(5, 7);
      }
      if (input.length >= 8) {
        formatted += ' ' + input.substring(7, 9);
      }
    }
    
    this.registerForm.patchValue({ telefono: formatted }, { emitEvent: false });
  }

  async triggerFileInput() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Selecciona una opción',
      buttons: [
        {
          text: 'Cámara',
          icon: 'camera',
          handler: () => {
            this.takePicture(CameraSource.Camera);
          }
        },
        {
          text: 'Galería',
          icon: 'images',
          handler: () => {
            this.takePicture(CameraSource.Photos);
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

  async takePicture(source: CameraSource) {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: source
      });

      this.profilePhoto = image.dataUrl || null;
    } catch (error) {
      console.error('Error al capturar imagen:', error);
    }
  }

  onPhotoSelected(event: any) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profilePhoto = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  toggleService(serviceName: string) {
    const index = this.serviciosArray.value.indexOf(serviceName);
    if (index > -1) {
      this.serviciosArray.removeAt(index);
    } else {
      this.serviciosArray.push(this.fb.control(serviceName));
    }
  }

  isServiceSelected(serviceName: string): boolean {
    return this.serviciosArray.value.includes(serviceName);
  }

  nextStep() {
    if (this.currentStep < 3) {
      if (this.isStepValid(this.currentStep)) {
        this.currentStep++;
      }
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  isStepValid(step: number): boolean {
    switch(step) {
      case 1:
        return !!(this.registerForm.get('nombre')?.valid &&
               this.registerForm.get('apellidos')?.valid &&
               this.registerForm.get('telefono')?.valid);
      case 2:
        return !!(this.registerForm.get('username')?.valid &&
               this.registerForm.get('email')?.valid &&
               this.registerForm.get('password')?.valid &&
               this.registerForm.get('confirmPassword')?.valid &&
               this.registerForm.get('password')?.value === this.registerForm.get('confirmPassword')?.value);
      case 3:
        return true; // Bio es opcional
      default:
        return false;
    }
  }

  async onSubmit() {
    if (!this.registerForm.valid) {
      await this.showToast('Por favor, completa todos los campos correctamente', 'warning');
      return;
    }

    const loading = await this.loadingCtrl.create({
      message: 'Creando cuenta...',
      spinner: 'crescent'
    });
    await loading.present();

    // Limpiar el teléfono de espacios antes de enviar
    const telefonoLimpio = this.registerForm.value.telefono.replace(/\s/g, '');

    const registerData: RegisterRequest = {
      nombre: this.registerForm.value.nombre.trim(),
      apellidos: this.registerForm.value.apellidos.trim(),
      telefono: telefonoLimpio,
      username: this.registerForm.value.username.trim(),
      email: this.registerForm.value.email.trim(),
      password: this.registerForm.value.password,
      bio: this.registerForm.value.bio?.trim() || undefined
    };

    console.log('Enviando datos de registro:', { ...registerData, password: '***' });

    this.authService.register(registerData).subscribe({
      next: async (response) => {
        await loading.dismiss();
        
        if (response.success) {
          await this.showToast('¡Cuenta creada exitosamente!', 'success');
          // Redirigir al home o dashboard
          this.router.navigate(['/tabs/home'], { replaceUrl: true });
        } else {
          await this.showToast(response.message || 'Error al crear la cuenta', 'danger');
          console.error('Error del servidor:', response);
        }
      },
      error: async (error) => {
        await loading.dismiss();
        
        // Mostrar mensaje de error más específico
        let message = 'Error al conectar con el servidor';
        
        if (error.message) {
          message = error.message;
        } else if (error.error?.message) {
          message = error.error.message;
        } else if (error.error?.errors) {
          // Si hay errores de validación específicos
          const validationErrors = error.error.errors.map((e: any) => e.message).join(', ');
          message = `Error de validación: ${validationErrors}`;
        }
        
        await this.showToast(message, 'danger');
        console.error('Error completo en registro:', error);
      }
    });
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'warning') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      position: 'top',
      color
    });
    await toast.present();
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

}
