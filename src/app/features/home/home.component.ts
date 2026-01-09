import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CyberSliderComponent } from './components/cyber-slider/cyber-slider.component';
import { RouterLink } from '@angular/router';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, CyberSliderComponent, RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [
    trigger('pageAnimations', [
      transition(':enter', [
        query('.hero-section, .feature-card', [
          style({ opacity: 0, transform: 'translateY(40px)' }),
          stagger(100, [
            animate('600ms cubic-bezier(0.35, 0, 0.25, 1)', 
            style({ opacity: 1, transform: 'none' }))
          ])
        ])
      ])
    ]),
    trigger('heroAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.95) translateY(20px)' }),
        animate('800ms 200ms cubic-bezier(0.35, 0, 0.25, 1)',
          style({ opacity: 1, transform: 'scale(1) translateY(0)' }))
      ])
    ])
  ]
})
export class HomeComponent {
  isLoginPage: boolean = true;
  features = [
    {
      icon: '📚',
      title: 'Cours',
      description: 'Explorez notre large gamme de cours en cybersécurité',
      link: '/courses',
      buttonText: 'Voir les Cours'
    },
    {
      icon: '🎯',
      title: 'Parcours d\'Apprentissage',
      description: 'Suivez des parcours d\'apprentissage personnalisés',
      link: '/learning-path',
      buttonText: 'Commencer à Apprendre'
    },
    {
      icon: '📁',
      title: 'Ressources',
      description: 'Accédez à des ressources d\'apprentissage supplémentaires',
      link: '/resources',
      buttonText: 'Voir les Ressources'
    }
  ];
}
