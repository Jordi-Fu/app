import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup;
  showPassword = false;
  
  // Usuario hardcodeado
  private readonly VALID_USER = {
    username: 'admin',
    email: 'admin@ejemplo.com',
    phone: '1234567890',
    password: 'Admin123'
  };

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.loginForm = this.fb.group({
      credential: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      const { credential, password } = this.loginForm.value;
      
      // Validar contra usuario hardcodeado
      const isValid = (
        (credential === this.VALID_USER.username || 
         credential === this.VALID_USER.email || 
         credential === this.VALID_USER.phone) &&
        password === this.VALID_USER.password
      );
      
      if (isValid) {
        // Login exitoso
        this.router.navigate(['/home']);
      } else {
        // Mostrar popup de error
        await this.mostrarErrorCredenciales();
      }
    }
  }
  
  async mostrarErrorCredenciales() {
    const alert = await this.alertController.create({
      header: 'Error',
      message: 'Usuario o contraseña inválidos',
      backdropDismiss: false
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
  
  viajarRegistro(){
    this.router.navigate(['/register']);
  }

}
