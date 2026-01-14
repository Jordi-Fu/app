import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-conversacion',
  templateUrl: './conversacion.page.html',
  styleUrls: ['./conversacion.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonBackButton
  ]
})
export class ConversacionPage implements OnInit {
  @ViewChild('messagesContainer', { read: ElementRef }) messagesContainer!: ElementRef;
  
  chatId: string = '';
  contacto: any = null;
  mensajes: any[] = [];
  nuevoMensaje: string = '';
  usuarioActual = {
    id: 'yo',
    nombre: 'Tú'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.chatId = this.route.snapshot.paramMap.get('id') || '';
    this.cargarConversacion();
  }

  cargarConversacion() {
    // Mock data - aquí cargarías los datos del backend
    const contactos: any = {
      '1': {
        id: 1,
        usuario: 'María García',
        avatar: 'https://i.pravatar.cc/150?img=1'
      },
      '2': {
        id: 2,
        usuario: 'Juan Pérez',
        avatar: 'https://i.pravatar.cc/150?img=12'
      },
      '3': {
        id: 3,
        usuario: 'Ana Martínez',
        avatar: 'https://i.pravatar.cc/150?img=5'
      }
    };

    this.contacto = contactos[this.chatId];

    // Mock mensajes
    this.mensajes = [
      {
        id: 1,
        texto: 'Hola! ¿Cómo estás?',
        fecha: new Date(2026, 0, 13, 10, 15),
        autor: this.contacto.usuario,
        esPropio: false
      },
      {
        id: 2,
        texto: '¡Hola! Todo bien, gracias. ¿Y tú?',
        fecha: new Date(2026, 0, 13, 10, 16),
        autor: 'Tú',
        esPropio: true
      },
      {
        id: 3,
        texto: 'Muy bien también. ¿A qué hora puedes venir?',
        fecha: new Date(2026, 0, 14, 10, 30),
        autor: this.contacto.usuario,
        esPropio: false
      }
    ];

    setTimeout(() => this.scrollToBottom(), 100);
  }

  enviarMensaje() {
    if (!this.nuevoMensaje.trim()) return;

    const mensaje = {
      id: this.mensajes.length + 1,
      texto: this.nuevoMensaje,
      fecha: new Date(),
      autor: 'Tú',
      esPropio: true
    };

    this.mensajes.push(mensaje);
    this.nuevoMensaje = '';
    
    setTimeout(() => this.scrollToBottom(), 100);
  }

  scrollToBottom() {
    if (this.messagesContainer) {
      const element = this.messagesContainer.nativeElement;
      element.scrollTop = element.scrollHeight;
    }
  }

  formatearFecha(fecha: Date): string {
    const ahora = new Date();
    const diff = ahora.getTime() - fecha.getTime();
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(diff / 3600000);
    const dias = Math.floor(diff / 86400000);

    if (minutos < 1) return 'Ahora';
    if (minutos < 60) return `Hace ${minutos} min`;
    if (horas < 24) return `${fecha.getHours()}:${fecha.getMinutes().toString().padStart(2, '0')}`;
    if (dias === 1) return 'Ayer';
    if (dias < 7) return `Hace ${dias} días`;
    
    return `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()}`;
  }

  volver() {
    this.router.navigate(['/home/chat']);
  }
}
