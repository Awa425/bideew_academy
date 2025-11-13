import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { Course, Lessons } from '../../../core/models/course.model';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-text-lesson',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatExpansionModule,
    MatListModule,
    MatDividerModule,
    RouterLink
  ],
  templateUrl: './text-lesson.component.html',
  styleUrls: ['./text-lesson.component.scss'],
  animations: [
    trigger('slideAnimation', [
      transition(':increment', [
        style({ opacity: 0, transform: 'translateX(100px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ]),
      transition(':decrement', [
        style({ opacity: 0, transform: 'translateX(-100px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ])
  ]
})
export class TextLessonComponent {
  @Input() lesson!: Lessons;
  @Input() course!: Course;
  @Input() isPreview: boolean = false;
  lessons: any = [];
  lessonId: number | null = null;
  coursId: number | null = null;
  slides: { title: string; content: SafeHtml }[] = [];

  constructor(
    private route: ActivatedRoute,
    private lessonService: CourseService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {    
    this.loadLessonData();
  }

  private loadLessonData() {
    const coursId = Number(this.route.snapshot.paramMap.get('id'));
    const lessonId = Number(this.route.snapshot.paramMap.get('idLesson'));
    this.lessonService.getLessonsByIdLesson(coursId, lessonId).subscribe({
      next: (lesson: any) => {
        const fullContent = lesson.contents?.[0]?.data || '';

        // Créer des diapositives basées sur les sections du contenu
        this.slides = this.createSlides(fullContent, lesson.title);
      },
      error: (err) => {
        console.error('Erreur lors du chargement de la leçon :', err);
      },
    });
  }

  /**
   * Crée des diapositives à partir du contenu HTML
   * Découpe le contenu de manière intelligente par sections ou par nombre d'éléments
   */
  private createSlides(htmlContent: string, lessonTitle: string): { title: string; content: SafeHtml }[] {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    const slides: { title: string; content: SafeHtml }[] = [];
    const elements = Array.from(tempDiv.children);

    if (elements.length === 0) {
      return [{
        title: lessonTitle,
        content: this.sanitizer.sanitize(1, htmlContent) || ''
      }];
    }

    // Stratégie 1: Découper par titres H1 et H2 (sections principales)
    let currentSlideElements: Element[] = [];
    let currentSlideTitle = lessonTitle;
    let slideIndex = 1;

    elements.forEach((element, index) => {
      const tagName = element.tagName.toLowerCase();

      // Si on rencontre un H1 ou H2, on commence une nouvelle diapo
      if ((tagName === 'h1' || tagName === 'h2') && currentSlideElements.length > 0) {
        // Sauvegarder la diapo précédente
        const slideContent = currentSlideElements.map(el => el.outerHTML).join('');
        slides.push({
          title: `${currentSlideTitle}`,
          content: this.sanitizer.sanitize(1, slideContent) || ''
        });

        // Commencer une nouvelle diapo
        currentSlideElements = [element];
        currentSlideTitle = `${lessonTitle} - ${element.textContent?.trim() || `Partie ${slideIndex + 1}`}`;
        slideIndex++;
      } else {
        currentSlideElements.push(element);

        // Si c'est le premier élément et que c'est un titre, l'utiliser pour la diapo
        if (currentSlideElements.length === 1 && (tagName === 'h1' || tagName === 'h2')) {
          currentSlideTitle = `${lessonTitle} - ${element.textContent?.trim() || `Partie ${slideIndex}`}`;
        }
      }

      // Si on a accumulé trop d'éléments (max 10 par diapo), créer une nouvelle diapo
      if (currentSlideElements.length >= 10 && index < elements.length - 1) {
        const slideContent = currentSlideElements.map(el => el.outerHTML).join('');
        slides.push({
          title: currentSlideTitle,
          content: this.sanitizer.sanitize(1, slideContent) || ''
        });

        currentSlideElements = [];
        slideIndex++;
        currentSlideTitle = `${lessonTitle} (Partie ${slideIndex})`;
      }
    });

    // Ajouter la dernière diapo
    if (currentSlideElements.length > 0) {
      const slideContent = currentSlideElements.map(el => el.outerHTML).join('');
      slides.push({
        title: currentSlideTitle,
        content: this.sanitizer.sanitize(1, slideContent) || ''
      });
    }

    return slides.length > 0 ? slides : [{
      title: lessonTitle,
      content: this.sanitizer.sanitize(1, htmlContent) || ''
    }];
  }

  getLessonIcon(type: string): string {
    switch (type) {
      case 'video':
        return 'play_circle';
      case 'text':
        return 'description';
      case 'quiz':
        return 'quiz';
      case 'assignment':
        return 'assignment';
      default:
        return 'help';
    }
  }
  
  currentSlideIndex = 0;

  nextSlide() {
    if (this.currentSlideIndex < this.slides.length - 1) {
      this.currentSlideIndex++;
    }
  }

  prevSlide() {
    if (this.currentSlideIndex > 0) {
      this.currentSlideIndex--;
    }
  }

  goToSlide(index: number): void {
    if (index >= 0 && index < this.slides.length) {
      this.currentSlideIndex = index;
    }
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}min`;
  }

  getResourceIcon(type: string): string {
    switch (type) {
      case 'pdf':
        return 'picture_as_pdf';
      case 'link':
        return 'link';
      case 'code':
        return 'code';
      default:
        return 'insert_drive_file';
    }
  }
}
