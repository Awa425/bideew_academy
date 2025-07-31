import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterModule,
} from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Course, Lessons } from '../../../core/models/course.model';
import { CourseService } from '../../../core/services/course.service';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';

interface LessonProgress {
  id: number;
  is_locked: boolean;
  progress: number;
}

@Component({
  selector: 'app-course-lessons',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatRadioModule,
    RouterLink,
  ],
  templateUrl: './course-lessons.component.html',
  styleUrls: ['./course-lessons.component.scss'],
})
export class CourseLessonsComponent implements OnInit {
  lessons: any = [];
  users: any = [];
  lessonsLocked: any = [];
  lessonsProgress: any[] = [];
  loading = true;
  courseId: any;
  lessonsId: any;
  progress = 0;
  progressCompleted: number[] = [];
  loadingLessonId: number | null = null;
  currentLessonId: any;
  unlockedLessons: number[] = [];
  token: string | null = '';
  userId: string | null = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.userId = localStorage.getItem('user_id'); // Récupération directe
    this.authService.getUserById(this.userId).subscribe((data) => {
      this.users = data;
    });

    this.courseId = this.route.snapshot.paramMap.get('id');
    this.courseService.CourseStart(this.courseId).subscribe();

    this.loadLessonsDataCourse(this.courseId);
    this.loadProgress();
    this.loadUserProgress();
  }

  private loadUserProgress() {
    this.courseService.getInfoUser(2).subscribe({
      next: (data) => {
        this.lessonsProgress = data.lessons_progress || [];
        this.updateUnlockedLessons();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.loading = false;
      },
    });
  }

  private loadProgress() {
    this.courseService.getProgress(this.courseId).subscribe((data) => {
      this.currentLessonId = data.current_lesson_id;
      this.progress = data.progress_percent;
      this.progressCompleted = Array.isArray(data.completed_lessons)
        ? data.completed_lessons
        : [data.completed_lessons];
      this.updateUnlockedLessons();
    });
  }

  private updateUnlockedLessons() {
    if (!this.lessons?.lessons?.length) return;

    // Première leçon toujours déverrouillée
    const firstLessonId = this.lessons.lessons[0].id;
    this.unlockedLessons = [firstLessonId];

    // Ajoute les leçons complétées
    if (this.progressCompleted?.length) {
      this.unlockedLessons = [
        ...new Set([...this.unlockedLessons, ...this.progressCompleted]),
      ];
    }

    // Ajoute la leçon actuelle
    if (this.currentLessonId) {
      this.unlockedLessons = [
        ...new Set([...this.unlockedLessons, this.currentLessonId]),
      ];
    }

    // Pour le quiz s'il existe
    if (
      this.lessons.quizzes &&
      this.progressCompleted.length === this.lessons.lessons.length
    ) {
      this.unlockedLessons.push(this.lessons.quizzes.id);
    }
  }

  isLessonUnlocked(lessonId: number): boolean {
    return this.unlockedLessons.includes(lessonId);
  }

  private loadLessonsDataCourse(courseId: any) {
    this.courseService.getCourseById(courseId).subscribe((data) => {
      this.lessons = data;
      this.updateUnlockedLessons();
    });
  }

  redirect(lessonId: any): void {
    if (!this.isLessonUnlocked(lessonId)) {
      alert(
        'Veuillez compléter les leçons précédentes pour déverrouiller cette leçon'
      );
      return;
    }

    this.courseService.getLessonsByIdLesson(this.courseId, lessonId).subscribe({
      next: (lesson: any) => {
        const full_Content_lessons = lesson.contents?.[0]?.type || '';
        const var_type_lessons: string = full_Content_lessons;
        if (var_type_lessons == 'text') {
          this.router.navigate(['texte', lessonId], { relativeTo: this.route });
        } else if (var_type_lessons == 'video') {
          this.router.navigate(['video', lessonId], { relativeTo: this.route });
        } else if (var_type_lessons == 'pdf') {
          this.router.navigate(['pdf', lessonId], { relativeTo: this.route });
        }
      },
    });
  }

  redirect_quizz(): void {
    if (!this.isLessonUnlocked(this.lessons.quizzes.id)) {
      alert('Veuillez compléter toutes les leçons pour accéder au quiz');
      return;
    }
    this.router.navigate(['quizz', this.courseId], { relativeTo: this.route });
  }

  getLessonIcon(type: string): string {
    switch (type) {
      case 'video':
        return 'play_circle';
      case 'quiz':
        return 'quiz';
      case 'text':
        return 'article';
      default:
        return 'school';
    }
  }

  updateProgress(lessonId: number): void {
    this.loadingLessonId = lessonId;
    const total = this.lessons?.lessons?.length || 0;
    if (total === 0) {
      this.progress = 0;
      return;
    }

    this.courseService.addProgress(lessonId).subscribe({
      next: (res: any) => {
        location.reload();
      },
      error: (err: any) => {
        console.error('Erreur :', err);
      },
    });
  }

  toggleProgress(lessonId: number): void {
    const lesson = this.lessons.lessons.find((l: any) => l.id === lessonId);
    if (!lesson) return;
    const index = this.progressCompleted.indexOf(lessonId);
    if (index > -1) {
      this.progressCompleted.splice(index, 1);
      lesson.completed = false;
    } else {
      this.progressCompleted.push(lessonId);
      lesson.completed = true;
    }
    this.updateProgress(lessonId);
  }

  isCurrentLesson(lessonId: string): boolean {
    return this.currentLessonId === lessonId;
  }

  getLessonTypeLabel(type: string): string {
    switch (type) {
      case 'video':
        return 'Vidéo';
      case 'quiz':
        return 'Quiz';
      case 'text':
        return 'Texte';
      case 'assignment':
        return 'Devoir';
      default:
        return type;
    }
  }

  startLesson(lesson: any) {
    if (lesson.questions) {
      this.redirect_quizz();
    } else {
      this.redirect(lesson.id);
    }
  }

  showConfirmation = false;

  confirmAction() {
    console.log('Action confirmée !');
    // Logique à exécuter après confirmation
    this.showConfirmation = false; // Ferme la popup
  }
}
