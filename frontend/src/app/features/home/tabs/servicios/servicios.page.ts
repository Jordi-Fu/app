import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent,
  IonSearchbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonChip,
  IonLabel,
  IonIcon,
  IonButton,
  IonGrid,
  IonRow,
  IonCol
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  locationOutline, 
  starOutline,
  heartOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-servicios',
  templateUrl: './servicios.page.html',
  styleUrls: ['./servicios.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSearchbar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonChip,
    IonLabel,
    IonIcon,
    IonButton,
    IonGrid,
    IonRow,
    IonCol
  ]
})
export class ServiciosPage implements OnInit {
  servicios: any[] = [];

  constructor() {
    addIcons({
      'location-outline': locationOutline,
      'star-outline': starOutline,
      'heart-outline': heartOutline
    });
  }

  ngOnInit() {
    // Mock data - aquí conectarás con el backend más tarde
    this.servicios = [
      {
        id: 1,
        titulo: 'Limpieza de hogar',
        proveedor: 'María García',
        precio: 50,
        rating: 4.8,
        ubicacion: 'Madrid Centro',
        imagen: 'https://via.placeholder.com/400x200',
        categoria: 'Limpieza'
      },
      {
        id: 2,
        titulo: 'Reparación de computadoras',
        proveedor: 'Juan Pérez',
        precio: 35,
        rating: 4.9,
        ubicacion: 'Barcelona',
        imagen: 'https://via.placeholder.com/400x200',
        categoria: 'Tecnología'
      }
    ];
  }

  onSearch(event: any) {
    const query = event.target.value.toLowerCase();
    // Implementar búsqueda
  }
}
