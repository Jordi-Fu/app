import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { IonContent, IonCheckbox } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: true,
  imports: [IonContent, IonCheckbox, CommonModule, FormsModule, ReactiveFormsModule],
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
