import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from './storage.service';

const THEME_KEY = 'kurro_theme';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private darkModeSubject = new BehaviorSubject<boolean>(false);
  public darkMode$: Observable<boolean> = this.darkModeSubject.asObservable();

  constructor(private storage: StorageService) {
    this.loadTheme();
  }

  /**
   * Cargar tema guardado
   */
  private async loadTheme(): Promise<void> {
    try {
      const savedTheme = await this.storage.get(THEME_KEY);
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      // Si hay tema guardado, usarlo; si no, usar preferencia del sistema
      const isDark = savedTheme !== null ? savedTheme === 'dark' : prefersDark;
      
      this.setTheme(isDark, false);
    } catch (error) {
      console.error('Error cargando tema:', error);
    }
  }

  /**
   * Establecer tema
   */
  async setTheme(isDark: boolean, save: boolean = true): Promise<void> {
    document.body.classList.toggle('dark', isDark);
    this.darkModeSubject.next(isDark);
    
    if (save) {
      await this.storage.set(THEME_KEY, isDark ? 'dark' : 'light');
    }
  }

  /**
   * Alternar modo oscuro
   */
  async toggleDarkMode(): Promise<void> {
    const isDark = !this.darkModeSubject.value;
    await this.setTheme(isDark);
  }

  /**
   * Obtener estado actual del modo oscuro
   */
  isDarkMode(): boolean {
    return this.darkModeSubject.value;
  }
}
