import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navigation',
  imports: [CommonModule, RouterLink],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent {
  constructor(private authService: AuthService){}
  menuItems = [
    { path: '/home', label: 'Accueil' },
    { path: '/courses', label: 'Cours' },
    // { path: '/learning-path', label: 'Parcours d\'Apprentissage' },
    { path: '/resources', label: 'Gestion des utilisateurs' }
  ];

  logout() {
    this.authService.logout();
  }
}
