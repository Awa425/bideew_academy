import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, fromEvent, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

export type ThemeMode = 'light' | 'dark' | 'system';
export type AccentColor = 'blue' | 'green' | 'purple' | 'orange' | 'red';

export interface ThemeSettings {
  mode: ThemeMode;
  accentColor: AccentColor;
  fontSize: number;
  highContrast: boolean;
  reducedMotion: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService implements OnDestroy {
  private readonly THEME_KEY = 'cyber_academy_theme_settings';
  private mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  private mediaQueryListener: () => void = () => {};
  private resizeSubscription: Subscription = new Subscription();
  private mediaQueryDebounce: number | null = null;

  private settings: ThemeSettings = {
    mode: 'system',
    accentColor: 'blue',
    fontSize: 16,
    highContrast: false,
    reducedMotion: false
  };

  private settingsSubject = new BehaviorSubject<ThemeSettings>(this.settings);

  constructor() {
    this.loadSettings();
    this.setupMediaQueryListener();
    this.setupResizeListener();
  }

  ngOnDestroy(): void {
    if (this.mediaQueryDebounce) {
      cancelAnimationFrame(this.mediaQueryDebounce);
    }
    this.mediaQuery.removeEventListener('change', this.mediaQueryListener);
    this.resizeSubscription?.unsubscribe();
  }

  getSettings(): Observable<ThemeSettings> {
    return this.settingsSubject.asObservable();
  }

  updateSettings(updates: Partial<ThemeSettings>): void {
    this.settings = { ...this.settings, ...updates };
    this.applySettings();
    this.saveSettings();
  }

  toggleDarkMode(): void {
    const newMode = this.settings.mode === 'dark' ? 'light' : 'dark';
    this.settings.mode = newMode; 
    this.updateSettings({ mode: newMode });
  }

  setAccentColor(color: AccentColor): void {
    this.updateSettings({ accentColor: color });
  }

  private loadSettings(): void {
    try {
      const savedSettings = localStorage.getItem(this.THEME_KEY);
      if (savedSettings) {
        this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
      }
    } catch (error) {
      console.error('Failed to load theme settings', error);
    }
    this.applySettings();
  }

  private saveSettings(): void {
    try {
      localStorage.setItem(this.THEME_KEY, JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save theme settings', error);
    }
  }

  private applySettings(): void {
    const apply = () => {
      try {
        const html = document.documentElement;
        if (!html) return;
        
        const effectiveMode = this.getEffectiveMode();
        if (html.getAttribute('data-theme') !== effectiveMode) {
          html.setAttribute('data-theme', effectiveMode);
        }

        if (html.getAttribute('data-accent') !== this.settings.accentColor) {
          html.setAttribute('data-accent', this.settings.accentColor);
        }

        this.toggleClass(html, 'high-contrast', this.settings.highContrast);
        
        this.toggleClass(html, 'reduced-motion', this.settings.reducedMotion);
        
        if (document.body) {
          document.body.style.setProperty('font-size', `${this.settings.fontSize}px`, 'important');
        }
        
        this.settingsSubject.next({...this.settings});
      } catch (e) {
        console.error('Error applying theme settings:', e);
      }
    };

    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(apply);
    } else {
      setTimeout(apply, 0);
    }
  }
  
  private getEffectiveMode(): string {
    return this.settings.mode === 'system' 
      ? (this.mediaQuery.matches ? 'dark' : 'light')
      : this.settings.mode;
  }
  
  private toggleClass(element: HTMLElement, className: string, isActive: boolean): void {
    try {
      if (isActive && !element.classList.contains(className)) {
        element.classList.add(className);
      } else if (!isActive && element.classList.contains(className)) {
        element.classList.remove(className);
      }
    } catch (e) {
      console.error('Error toggling class:', e);
    }
  }

  private setupMediaQueryListener(): void {
    try {
      this.mediaQueryListener = () => {
        if (this.settings.mode === 'system') {
          if (this.mediaQueryDebounce) {
            cancelAnimationFrame(this.mediaQueryDebounce);
          }
          this.mediaQueryDebounce = requestAnimationFrame(() => this.applySettings());
        }
      };

      if (this.mediaQuery && typeof this.mediaQuery.addEventListener === 'function') {
        this.mediaQuery.addEventListener('change', this.mediaQueryListener);
      }
    } catch (e) {
      console.error('Error setting up media query listener:', e);
    }
  }

  private setupResizeListener(): void {
    this.resizeSubscription = fromEvent(window, 'resize')
      .pipe(
        debounceTime(200),
        distinctUntilChanged()
      )
      .subscribe(() => {
      });
  }

  isDarkMode(): boolean {
    return this.settings.mode === 'dark' || 
           (this.settings.mode === 'system' && this.mediaQuery.matches);
  }

  getAccentColor(): string {
    return this.settings.accentColor;
  }

  increaseFontSize(): void {
    if (this.settings.fontSize < 24) {
      const newSize = this.settings.fontSize + 2;
      this.settings.fontSize = newSize; 
      this.updateSettings({ fontSize: newSize });
    }
  }

  decreaseFontSize(): void {
    if (this.settings.fontSize > 12) {
      const newSize = this.settings.fontSize - 2;
      this.settings.fontSize = newSize; 
      this.updateSettings({ fontSize: newSize });
    }
  }

  resetFontSize(): void {
    this.settings.fontSize = 16; 
    this.updateSettings({ fontSize: 16 });
  }

  toggleHighContrast(): void {
    const newValue = !this.settings.highContrast;
    this.settings.highContrast = newValue; 
    this.updateSettings({ highContrast: newValue });
  }

  toggleReducedMotion(): void {
    const newValue = !this.settings.reducedMotion;
    this.settings.reducedMotion = newValue; 
    this.updateSettings({ reducedMotion: newValue });
  }
}
