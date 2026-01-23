import { Component, inject, ViewChild } from '@angular/core';
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
  @ViewChild(IonTabs) tabs!: IonTabs;

  constructor() {
    addIcons({
      'grid-outline': gridOutline,
      'chatbubbles-outline': chatbubblesOutline,
      'person-outline': personOutline
    });
  }

  /**
   * Navegar a la raíz del tab usando el método nativo de IonTabs
   */
  goToTab(tab: string) {
    // Usar select que es más rápido que navigateRoot
    this.tabs.select(tab);
  }
}
