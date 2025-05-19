import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  isLoginPage: boolean = false;
  title = 'cyber-academy';

  constructor(private themeService: ThemeService, private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        // Vérifie si on est sur la page login
        this.isLoginPage = event.urlAfterRedirects.includes('/login');
      });
  }

  ngOnInit(): void {
    // Initialisation du thème
    this.themeService.getSettings().subscribe();
  }
}
