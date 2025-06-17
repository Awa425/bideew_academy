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
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';

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
  ],
  templateUrl: './text-lesson.component.html',
  styleUrls: ['./text-lesson.component.scss'],
})
export class TextLessonComponent {
  @Input() lesson!: Lessons;
  @Input() course!: Course;
  @Input() isPreview: boolean = false;
  lessons: any = [];
  lessonId: string | null = null;
  slides: { title: string; content: string }[] = [];

  constructor(
    private route: ActivatedRoute,
    private lessonService: CourseService
  ) {}
  ngOnInit() {
    this.lessonId = this.route.snapshot.paramMap.get('id');
    console.log(this.lessonId);
    this.loadLessonData(1, 1);
  }

  private loadLessonData(idCour: any, idLesson: any) {
    this.lessonService.getLessonsByIdLesson(idCour, idLesson).subscribe({
      next: (lesson: any) => {
        const fullContent = lesson.contents?.[0]?.data || '';
        const rawParagraphs: string[] = fullContent
          .split(/<\/p>\s*<p>|<br\s*\/?>|\n{2,}/i)
          .map((p: string) => p.trim())
          .filter((p: string) => p.length > 0);

        this.slides = rawParagraphs.map((part: string, index: number) => ({
          title: `${lesson.title} (Partie ${index + 1})`,
          content: `<p>${part}</p>`,
        }));
      },
      error: (err) => {
        console.error('Erreur lors du chargement de la leçon :', err);
      },
    });
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
    if (this.currentSlideIndex < this.slides.length - 1)
      this.currentSlideIndex++;
  }

  prevSlide() {
    if (this.currentSlideIndex > 0) this.currentSlideIndex--;
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
