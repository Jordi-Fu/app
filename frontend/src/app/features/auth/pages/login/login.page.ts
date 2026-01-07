import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController, IonContent } from '@ionic/angular/standalone';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, IonContent]
})
export class LoginPage implements OnInit, OnDestroy {
  loginForm!: FormGroup;
  showPassword = false;
  isLoading = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.loginForm = this.fb.group({
      credential: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(128)
      ]]
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async onSubmit() {
    if (this.loginForm.invalid || this.isLoading) {
      return;
    }

    this.isLoading = true;
    
    // Mostrar loading
    const loading = await this.loadingController.create({
      message: 'Iniciando sesión...',
      spinner: 'circular'
    });
    await loading.present();

    const { credential, password } = this.loginForm.value;
    
    this.authService.login({ credential, password })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: async (response) => {
          await loading.dismiss();
          this.isLoading = false;
          
          if (response.success) {
            this.router.navigate(['/home']);
          } else {
            await this.mostrarError(response.message);
          }
        },
        error: async (error) => {
          await loading.dismiss();
          this.isLoading = false;
          
          let mensaje = 'Error de conexión con el servidor';
          
          if (error.status === 0) {
            mensaje = 'No se puede conectar al servidor. Verifica tu conexión.';
          } else if (error.error?.message) {
            mensaje = error.error.message;
          } else if (error.message) {
            mensaje = error.message;
          }
          
          // Mostrar mensaje de error
          await this.mostrarError(mensaje);
        }
      });
  }
  
  async mostrarError(mensaje: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: mensaje,
      backdropDismiss: false,
      cssClass: 'error-alert'
    });
    
    await alert.present();
    
    // Cerrar automáticamente después de 3 segundos
    setTimeout(() => {
      alert.dismiss();
    }, 3000);
  }
  
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
    viajarRegistro() {
    this.router.navigate(['/register']);
  }

}
