import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { IonContent, IonCheckbox } from '@ionic/angular/standalone';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonContent, IonCheckbox, CommonModule, FormsModule, ReactiveFormsModule]
})
export class RegisterPage implements OnInit {
  currentStep = 1;
  registerForm!: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  
  availableCategories = ['Electricista', 'Jardinero', 'Manitas'];
  availableServices = [
    { name: 'Fontanero', category: 'services' },
    { name: 'Electricista', category: 'services' },
    { name: 'Profesor', category: 'services' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) { }

  ngOnInit() {
    this.registerForm = this.fb.group({
      // Paso 1: Datos Personales
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      telefono: ['', [Validators.required, Validators.pattern(/^\+?\d{9,15}$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      
      // Paso 2: Servicios
      categorias: ['', Validators.required],
      servicios: this.fb.array([]),
      localizacion: ['', Validators.required],
      
      // Paso 3: Consentimientos
      consent1: [false, Validators.requiredTrue],
      consent2: [false, Validators.requiredTrue]
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
               this.registerForm.get('telefono')?.valid &&
               this.registerForm.get('email')?.valid &&
               this.registerForm.get('password')?.valid &&
               this.registerForm.get('confirmPassword')?.valid);
      case 2:
        return !!(this.registerForm.get('categorias')?.valid &&
               this.serviciosArray.length > 0 &&
               this.registerForm.get('localizacion')?.valid);
      case 3:
        return !!(this.registerForm.get('consent1')?.valid &&
               this.registerForm.get('consent2')?.valid);
      default:
        return false;
    }
  }

  onSubmit() {
    if (this.registerForm.valid) {
      console.log('Registro completo:', this.registerForm.value);
      // Lógica de registro
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

}
