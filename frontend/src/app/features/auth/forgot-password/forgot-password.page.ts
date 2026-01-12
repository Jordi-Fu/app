import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController, IonContent } from '@ionic/angular/standalone';
import { Subject, takeUntil } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

type Step = 'email' | 'code' | 'password' | 'success';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, IonContent]
})
export class ForgotPasswordPage implements OnInit, OnDestroy {
  currentStep: Step = 'email';
  emailForm!: FormGroup;
  codeForm!: FormGroup;
  passwordForm!: FormGroup;
  showNewPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  email = '';
  resetToken = '';
  codeDigits: string[] = ['', '', '', '', '', ''];
  
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.codeForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });

    this.passwordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(128)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // PASO 1: Enviar email
  async onSubmitEmail() {
    if (this.emailForm.invalid || this.isLoading) {
      return;
    }

    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: 'Enviando código...',
      spinner: 'circular'
    });
    await loading.present();

    const { email } = this.emailForm.value;
    this.email = email;
    
    this.authService.requestPasswordReset(email)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: async (response) => {
          await loading.dismiss();
          this.isLoading = false;
          
          if (response.success) {
            this.currentStep = 'code';
          } else {
            await this.mostrarError(response.message || 'Error al enviar el código');
          }
        },
        error: async (error) => {
          await loading.dismiss();
          this.isLoading = false;
          await this.mostrarError(error.message || 'Error de conexión');
        }
      });
  }

  // PASO 2: Verificar código
  onCodeInput(index: number, event: any) {
    const input = event.target;
    const value = input.value;

    if (value && value.length > 0) {
      this.codeDigits[index] = value[value.length - 1];
      
      // Auto-focus al siguiente input
      if (index < 5 && value) {
        const nextInput = input.parentElement?.nextElementSibling?.querySelector('input');
        if (nextInput) {
          nextInput.focus();
        }
      }

      // Si completó los 6 dígitos, verificar automáticamente
      if (index === 5 && this.codeDigits.every(d => d !== '')) {
        this.verifyCode();
      }
    }
  }

  onCodeKeydown(index: number, event: KeyboardEvent) {
    const input = event.target as HTMLInputElement;

    // Backspace
    if (event.key === 'Backspace') {
      if (!input.value && index > 0) {
        const prevInput = input.parentElement?.previousElementSibling?.querySelector('input');
        if (prevInput) {
          prevInput.focus();
        }
      }
      this.codeDigits[index] = '';
    }
  }

  async verifyCode() {
    const code = this.codeDigits.join('');
    
    if (code.length !== 6 || this.isLoading) {
      return;
    }

    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: 'Verificando código...',
      spinner: 'circular'
    });
    await loading.present();

    this.authService.verifyResetCode(this.email, code)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: async (response) => {
          await loading.dismiss();
          this.isLoading = false;
          
          if (response.success && response.resetToken) {
            this.resetToken = response.resetToken;
            this.currentStep = 'password';
          } else {
            this.codeDigits = ['', '', '', '', '', ''];
            await this.mostrarError(response.message || 'Código inválido');
          }
        },
        error: async (error) => {
          await loading.dismiss();
          this.isLoading = false;
          this.codeDigits = ['', '', '', '', '', ''];
          await this.mostrarError(error.message || 'Error al verificar el código');
        }
      });
  }

  // PASO 3: Restablecer contraseña
  async onSubmitPassword() {
    if (this.passwordForm.invalid || this.isLoading) {
      return;
    }

    const { newPassword, confirmPassword } = this.passwordForm.value;

    if (newPassword !== confirmPassword) {
      await this.mostrarError('Las contraseñas no coinciden');
      return;
    }

    this.isLoading = true;
    const loading = await this.loadingController.create({
      message: 'Actualizando contraseña...',
      spinner: 'circular'
    });
    await loading.present();

    this.authService.resetPassword(this.resetToken, newPassword)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: async (response) => {
          await loading.dismiss();
          this.isLoading = false;
          
          if (response.success) {
            this.currentStep = 'success';
          } else {
            await this.mostrarError(response.message || 'Error al restablecer la contraseña');
          }
        },
        error: async (error) => {
          await loading.dismiss();
          this.isLoading = false;
          await this.mostrarError(error.message || 'Error de conexión');
        }
      });
  }

  // Volver a paso anterior o login
  goBack() {
    if (this.currentStep === 'code') {
      this.currentStep = 'email';
      this.codeDigits = ['', '', '', '', '', ''];
    } else if (this.currentStep === 'password') {
      this.currentStep = 'code';
      this.codeDigits = ['', '', '', '', '', ''];
    } else {
      this.router.navigate(['/login']);
    }
  }

  // Ir al login después de éxito
  goToLogin() {
    this.router.navigate(['/login']);
  }

  togglePasswordVisibility(field: 'new' | 'confirm') {
    if (field === 'new') {
      this.showNewPassword = !this.showNewPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  private async mostrarError(mensaje: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: mensaje,
      buttons: ['OK']
    });
    await alert.present();
  }
}
