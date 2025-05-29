import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Course {
  id: number;
  title: string;
  description: string;
  image: string;
  duration: string;
  level: string;
  rating: number;
  students: number;
}

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.scss']
})
export class CoursesComponent {
  courses: Course[] = [
    {
      id: 1,
      title: 'Introduction à la Cybersécurité',
      description: 'Découvrez les bases de la cybersécurité et comment protéger vos systèmes.',
      image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&h=300&fit=crop',
      duration: '8h',
      level: 'Débutant',
      rating: 4.7,
      students: 1245
    },
    {
      id: 2,
      title: 'Sécurité des Réseaux',
      description: 'Apprenez à sécuriser les infrastructures réseau contre les cyberattaques.',
      image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&h=300&fit=crop',
      duration: '12h',
      level: 'Intermédiaire',
      rating: 4.5,
      students: 987
    },
    {
      id: 3,
      title: 'Tests d\'Intrusion',
      description: 'Maîtrisez les techniques de test d\'intrusion pour évaluer la sécurité des systèmes.',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=300&fit=crop',
      duration: '15h',
      level: 'Avancé',
      rating: 4.8,
      students: 756
    },
    {
      id: 4,
      title: 'Cryptographie Appliquée',
      description: 'Comprenez les principes de la cryptographie et son application en sécurité informatique.',
      image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&h=300&fit=crop',
      duration: '10h',
      level: 'Intermédiaire',
      rating: 4.6,
      students: 654
    },
    {
      id: 5,
      title: 'Sécurité des Applications Web',
      description: 'Apprenez à sécuriser les applications web contre les vulnérabilités courantes.',
      image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&h=300&fit=crop',
      duration: '14h',
      level: 'Intermédiaire',
      rating: 4.7,
      students: 1123
    },
    {
      id: 6,
      title: 'Forensique Numérique',
      description: 'Découvrez les techniques d\'investigation numérique pour résoudre les cybercrimes.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=300&fit=crop',
      duration: '16h',
      level: 'Avancé',
      rating: 4.9,
      students: 543
    }
  ];

  navigateToCourse(courseId: number): void {
    // La navigation sera gérée par le routerLink dans le template
  }

  getStars(rating: number): string {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '★'.repeat(fullStars);
    if (hasHalfStar) {
      stars += '½';
    }
    return stars.padEnd(5, '☆');
  }
}
