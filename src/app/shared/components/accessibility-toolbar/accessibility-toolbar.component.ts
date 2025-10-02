import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ThemeService, ThemeMode, AccentColor } from '../../../core/services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-accessibility-toolbar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatSlideToggleModule
  ],
  templateUrl: './accessibility-toolbar.component.html',
  styleUrls: ['./accessibility-toolbar.component.scss']
})
export class AccessibilityToolbarComponent implements OnInit, OnDestroy {
  isExpanded = false;
  currentMode: ThemeMode = 'system';
  currentAccent: AccentColor = 'blue';
  fontSize = 16;
  highContrast = false;
  reducedMotion = false;
  
  private subscriptions = new Subscription();

  constructor(private themeService: ThemeService) {
    this.applyAccessibilityStyles();
  }

  private applyAccessibilityStyles(): void {
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => this.applyStylesImmediately());
    } else {
      setTimeout(() => this.applyStylesImmediately(), 0);
    }
  }

  private applyStylesImmediately(): void {
    this.applyFontSize();
    this.applyTheme();
    this.applyContrast();
    this.applyMotion();
    
    if (document.body) {
      document.body.offsetHeight;
    }
  }

  private applyFontSize(): void {
    if (document.body) {
      requestAnimationFrame(() => {
        document.body.style.setProperty('font-size', `${this.fontSize}px`, 'important');
      });
    }
  }

  private applyTheme(): void {
    try {
      const effectiveMode = this.currentMode === 'system' 
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : this.currentMode;
      
      const html = document.documentElement;
      if (html.getAttribute('data-theme') !== effectiveMode) {
        html.setAttribute('data-theme', effectiveMode);
      }
    } catch (e) {
      console.error('Error applying theme:', e);
    }
  }

  private applyContrast(): void {
    if (this.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }

  private applyMotion(): void {
    if (this.reducedMotion) {
      document.documentElement.classList.add('reduced-motion');
    } else {
      document.documentElement.classList.remove('reduced-motion');
    }
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.themeService.getSettings().subscribe(settings => {
        this.currentMode = settings.mode;
        this.currentAccent = settings.accentColor;
        this.fontSize = settings.fontSize;
        this.highContrast = settings.highContrast;
        this.reducedMotion = settings.reducedMotion;
        
        this.applyAccessibilityStyles();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  toggleTheme(): void {
    this.currentMode = this.currentMode === 'dark' ? 'light' : 'dark';
    this.themeService.toggleDarkMode();
    this.applyTheme();
  }

  setAccentColor(color: AccentColor): void {
    this.currentAccent = color;
    this.themeService.setAccentColor(color);
    document.documentElement.setAttribute('data-accent', color);
  }

  changeFontSize(delta: number): void {
    if (delta > 0) {
      this.themeService.increaseFontSize();
      this.fontSize = Math.min(24, this.fontSize + 2);
    } else {
      this.themeService.decreaseFontSize();
      this.fontSize = Math.max(12, this.fontSize - 2);
    }
    this.applyFontSize();
  }

  resetFontSize(): void {
    this.themeService.resetFontSize();
    this.fontSize = 16;
    this.applyFontSize();
  }

  toggleHighContrast(): void {
    this.highContrast = !this.highContrast;
    this.themeService.toggleHighContrast();
    this.applyContrast();
  }

  toggleReducedMotion(): void {
    this.reducedMotion = !this.reducedMotion;
    this.themeService.toggleReducedMotion();
    this.applyMotion();
  }

  toggleToolbar(): void {
    this.isExpanded = !this.isExpanded;
    window.dispatchEvent(new Event('resize'));
  }

  getThemeIcon(): string {
    const effectiveMode = this.currentMode === 'system' 
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : this.currentMode;
    return effectiveMode === 'dark' ? 'dark_mode' : 'light_mode';
  }

  getContrastIcon(): string {
    return this.highContrast ? 'contrast' : 'contrast_off';
  }

  getMotionIcon(): string {
    return this.reducedMotion ? 'motion_photos_paused' : 'motion_photos_auto';
  }
}
