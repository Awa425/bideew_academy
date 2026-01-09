import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AccessibilityToolbarComponent } from '../../shared/components/accessibility-toolbar/accessibility-toolbar.component';
import { NavigationComponent } from '../../shared/components/navigation/navigation.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-main-layout',
  imports: [
    RouterOutlet,
    AccessibilityToolbarComponent,
    NavigationComponent,
    FooterComponent,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {}
