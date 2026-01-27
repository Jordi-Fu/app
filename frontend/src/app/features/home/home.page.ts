import { Component, ViewChild, OnInit, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonTabs, 
  IonTabBar, 
  IonTabButton, 
  IonIcon, 
  IonLabel
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  gridOutline, 
  chatbubblesOutline, 
  personOutline 
} from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { ChatService, SocketService, AuthService, ConversationUpdate } from '../../core/services';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel
  ]
})
export class HomePage implements OnInit, OnDestroy {
  @ViewChild(IonTabs) tabs!: IonTabs;
  
  tieneMensajesNoLeidos = false;
  private subscriptions: Subscription[] = [];
  private currentUserId: string | null = null;

  constructor(
    private chatService: ChatService,
    private socketService: SocketService,
    private authService: AuthService,
    private ngZone: NgZone
  ) {
    addIcons({
      'grid-outline': gridOutline,
      'chatbubbles-outline': chatbubblesOutline,
      'person-outline': personOutline
    });
  }

  async ngOnInit() {
    // Esperar autenticación
    await this.authService.waitForAuthInit();
    
    // Obtener usuario actual
    const authSub = this.authService.currentUser$.subscribe(user => {
      this.currentUserId = user?.id || null;
    });
    this.subscriptions.push(authSub);
    
    // Suscribirse al total de mensajes no leídos
    const noLeidosSub = this.chatService.totalNoLeidos$.subscribe(total => {
      this.ngZone.run(() => {
        this.tieneMensajesNoLeidos = total > 0;
      });
    });
    this.subscriptions.push(noLeidosSub);
    
    // Cargar conversaciones para tener el conteo inicial
    await this.chatService.obtenerConversaciones();
    
    // Conectar socket y escuchar actualizaciones
    await this.initializeSocket();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private async initializeSocket() {
    await this.socketService.connect();
    
    // Escuchar actualizaciones de conversación para actualizar el contador
    const convUpdateSub = this.socketService.conversationUpdate$.subscribe((update: ConversationUpdate) => {
      this.ngZone.run(() => {
        // Solo incrementar si no es un mensaje propio
        if (update.remitenteId !== this.currentUserId) {
          this.chatService.incrementarNoLeidos(update.conversacionId, update.ultimoMensaje, update.ultimoMensajeEn);
        }
      });
    });
    this.subscriptions.push(convUpdateSub);
  }

  /**
   * Navegar a la raíz del tab usando el método nativo de IonTabs
   */
  goToTab(tab: string) {
    // Usar select que es más rápido que navigateRoot
    this.tabs.select(tab);
  }
}
