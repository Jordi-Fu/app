import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonAvatar,
  IonIcon,
  IonButton,
  IonCard,
  IonCardContent
} from '@ionic/angular/standalone';
import { AuthService } from '../../../../core/services/auth.service';
import { addIcons } from 'ionicons';
import { 
  logOutOutline,
  personCircleOutline,
  mailOutline,
  callOutline,
  settingsOutline,
  helpCircleOutline,
  shieldCheckmarkOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonAvatar,
    IonIcon,
    IonButton,
    IonCard,
    IonCardContent
  ]
})
export class PerfilPage implements OnInit {
  usuario: any = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    addIcons({
      'log-out-outline': logOutOutline,
      'person-circle-outline': personCircleOutline,
      'mail-outline': mailOutline,
      'call-outline': callOutline,
      'settings-outline': settingsOutline,
      'help-circle-outline': helpCircleOutline,
      'shield-checkmark-outline': shieldCheckmarkOutline
    });
  }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.usuario = user;
    });
  }

  cerrarSesion() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}
