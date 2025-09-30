import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navigation',
  imports: [CommonModule, RouterLink],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.scss']
})
export class NavigationComponent implements OnInit, OnDestroy {
  menuItems: any[] = [];
  private authSubscription?: Subscription;

  private menuConfig = [
    { 
      path: '/home', 
      label: 'Accueil',
      roles: ['admin', 'formateur', 'apprenant']
    },
    { 
      path: '/courses', 
      label: 'Cours',
      roles: ['admin', 'formateur', 'apprenant']
    },
    { 
      path: '/learning-path', 
      label: 'Parcours d\'Apprentissage',
      roles: ['admin', 'apprenant']
    },
    { 
      path: '/users', 
      label: 'Gestion des utilisateurs',
      roles: ['admin']
    }
  ];

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authSubscription = this.authService.currentUser$.subscribe(() => {
      this.updateMenuBasedOnRole();
    });

    this.updateMenuBasedOnRole();
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  private updateMenuBasedOnRole() {
    const userRole = this.authService.getUserRole();
    this.menuItems = this.menuConfig.filter(item => 
      item.roles.includes(userRole)
    );
  }

  logout() {
    this.authService.logout();
  }
}