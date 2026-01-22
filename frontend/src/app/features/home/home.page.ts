import { Component, inject } from '@angular/core';
import { 
  IonTabs, 
  IonTabBar, 
  IonTabButton, 
  IonIcon, 
  IonLabel,
  NavController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { 
  gridOutline, 
  chatbubblesOutline, 
  personOutline 
} from 'ionicons/icons';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel
  ]
})
export class HomePage {
  private navController = inject(NavController);

  constructor() {
    addIcons({
      'grid-outline': gridOutline,
      'chatbubbles-outline': chatbubblesOutline,
      'person-outline': personOutline
    });
  }

  /**
   * Navegar siempre a la raíz del tab
   */
  goToTab(tab: string) {
    this.navController.navigateRoot(`/home/${tab}`);
  }
}
