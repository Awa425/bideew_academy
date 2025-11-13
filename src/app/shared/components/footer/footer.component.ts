import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { SecureStorageService } from '../../../core/services/secure-storage.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent implements OnInit {
  userId: any;
  users: any = { user: { role: '' } }; // Initialisation pour éviter les erreurs
  currentYear = new Date().getFullYear();

  constructor(
    private router: Router,
    private authService: AuthService,
    private secureStorage: SecureStorageService
  ) {}

  ngOnInit(): void {
    // Utilisation de SecureStorageService au lieu de localStorage
    this.userId = this.secureStorage.getUserId();

    if (this.userId) {
      this.authService.getUserById(this.userId).subscribe({
        next: (data: any) => {
          this.users = data;
        },
        error: (err) => {
          console.error('Erreur lors de la récupération des données utilisateur:', err);
        }
      });
    }
  }
}
