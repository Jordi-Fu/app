import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonAvatar,
  IonBadge,
  IonNote,
  IonIcon
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
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
    IonBadge,
    IonNote,
    IonIcon
  ]
})
export class ChatPage implements OnInit {
  conversaciones: any[] = [];

  ngOnInit() {
    // Mock data
    this.conversaciones = [
      {
        id: 1,
        usuario: 'María García',
        avatar: 'https://i.pravatar.cc/150?img=1',
        ultimoMensaje: '¿A qué hora puedes venir?',
        fecha: '10:30 AM',
        noLeidos: 2
      },
      {
        id: 2,
        usuario: 'Juan Pérez',
        avatar: 'https://i.pravatar.cc/150?img=12',
        ultimoMensaje: 'Perfecto, nos vemos mañana',
        fecha: 'Ayer',
        noLeidos: 0
      },
      {
        id: 3,
        usuario: 'Ana Martínez',
        avatar: 'https://i.pravatar.cc/150?img=5',
        ultimoMensaje: 'Gracias por el servicio',
        fecha: '2 días',
        noLeidos: 0
      }
    ];
  }
}
