import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeSubject = new BehaviorSubject<Theme>('light');
  public theme$ = this.themeSubject.asObservable();

  constructor() {
    // Load theme from localStorage or default to light
    const savedTheme = localStorage.getItem('app-theme') as Theme;
    if (savedTheme) {
      this.setTheme(savedTheme);
    }
  }

  get currentTheme(): Theme {
    return this.themeSubject.value;
  }

  setTheme(theme: Theme): void {
    this.themeSubject.next(theme);
    localStorage.setItem('app-theme', theme);
    
    // Apply theme to document root
    document.documentElement.setAttribute('data-theme', theme);
  }

  toggleTheme(): void {
    const newTheme: Theme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  getThemeClass(): string {
    return this.currentTheme === 'light' ? 'surface-0' : 'surface-ground';
  }
}
