import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, IonRefresher, IonRefresherContent, IonSpinner } from '@ionic/angular/standalone';
import { ChatService, ConversacionUsuario } from '../../../../core/services';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonRefresher,
    IonRefresherContent,
    IonSpinner
  ]
})
export class ChatPage implements OnInit {
  conversaciones: ConversacionUsuario[] = [];
  cargando = false;
  error: string | null = null;

  constructor(
    private router: Router,
    private chatService: ChatService
  ) {}

  ngOnInit() {
    this.cargarConversaciones();
  }

  async cargarConversaciones(event?: any) {
    try {
      this.cargando = true;
      this.error = null;
      this.conversaciones = await this.chatService.obtenerConversaciones();
    } catch (error) {
      console.error('Error al cargar conversaciones:', error);
      this.error = 'Error al cargar las conversaciones';
    } finally {
      this.cargando = false;
      if (event) {
        event.target.complete();
      }
    }
  }

  abrirConversacion(chat: ConversacionUsuario) {
    this.router.navigate(['/home/conversacion', chat.id]);
  }

  formatearFecha(fecha?: string): string {
    if (!fecha) return '';
    
    const fechaMensaje = new Date(fecha);
    const ahora = new Date();
    const diff = ahora.getTime() - fechaMensaje.getTime();
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(diff / 3600000);
    const dias = Math.floor(diff / 86400000);

    if (minutos < 1) return 'Ahora';
    if (minutos < 60) return `Hace ${minutos} min`;
    if (horas < 24) return `${fechaMensaje.getHours()}:${fechaMensaje.getMinutes().toString().padStart(2, '0')}`;
    if (dias === 1) return 'Ayer';
    if (dias < 7) return `Hace ${dias} días`;
    
    return `${fechaMensaje.getDate()}/${fechaMensaje.getMonth() + 1}/${fechaMensaje.getFullYear()}`;
  }

  getNombreCompleto(usuario: any): string {
    return `${usuario.nombre} ${usuario.apellido}`;
  }
}
