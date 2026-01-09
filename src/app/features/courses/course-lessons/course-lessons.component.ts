import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CourseService } from '../../../core/services/course.service';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SecureStorageService } from '../../../core/services/secure-storage.service';
import { Subscription } from 'rxjs';

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
    MatCheckboxModule,
    MatProgressSpinnerModule,
    RouterLink,
  ],
  templateUrl: './course-lessons.component.html',
  styleUrls: ['./course-lessons.component.scss'],
})
export class CourseLessonsComponent implements OnInit, OnDestroy {
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
  userRole: string | null = '';
  isDeleting: boolean = false;
  lessonToDelete: any = null;

  success: string = '';
  error: string = '';
  private successSubscription!: Subscription;
  private errorSubscription!: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private secureStorage: SecureStorageService
  ) {}

  ngOnInit() {
    // Utilisation de SecureStorageService au lieu de localStorage
    this.userId = this.secureStorage.getUserId();
    this.userRole = this.authService.getUserRole();

    this.authService.getUserById(this.userId).subscribe((data) => {
      this.users = data;
    });

    this.courseId = this.route.snapshot.paramMap.get('id');
    this.courseService.CourseStart(this.courseId).subscribe();

    this.loadLessonsDataCourse(this.courseId);
    this.loadProgress();
    this.loadUserProgress(this.userId);

    // S'abonner aux notifications
    this.successSubscription = this.notificationService.currentSuccessMessage.subscribe(
      message => {
        this.success = message;
        if (message) {
          setTimeout(() => {
            this.success = '';
            this.notificationService.clearSuccessMessage();
          }, 5000);
        }
      }
    );

    this.errorSubscription = this.notificationService.currentErrorMessage.subscribe(
      message => {
        this.error = message;
        if (message) {
          setTimeout(() => {
            this.error = '';
            this.notificationService.clearErrorMessage();
          }, 5000);
        }
      }
    );
  }

  ngOnDestroy(): void {
    if (this.successSubscription) {
      this.successSubscription.unsubscribe();
    }
    if (this.errorSubscription) {
      this.errorSubscription.unsubscribe();
    }
  }

  private loadUserProgress(userID: any) {
    this.courseService.getInfoUser(userID).subscribe({
      next: (data) => {
        this.lessonsProgress = data.lessons_progress || [];
        this.updateUnlockedLessons();
        this.loading = false;
      },
      error: (error) => {
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
    const firstLessonId = this.lessons.lessons[0].id;
    this.unlockedLessons = [firstLessonId];
    if (this.progressCompleted?.length) {
      this.unlockedLessons = [
        ...new Set([...this.unlockedLessons, ...this.progressCompleted]),
      ];
    }
    if (this.currentLessonId) {
      this.unlockedLessons = [
        ...new Set([...this.unlockedLessons, this.currentLessonId]),
      ];
    }
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
    if (this.users.user.role == 'apprenant') {
      if (!this.isLessonUnlocked(lessonId)) {
        this.notificationService.setErrorMessage(
          'Veuillez compléter les leçons précédentes pour déverrouiller cette leçon'
        );
        return;
      }
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
      this.notificationService.setErrorMessage('Veuillez compléter toutes les leçons pour accéder au quiz');
      return;
    }
    this.router.navigate(['quizz', this.courseId], { relativeTo: this.route });
  }

  redirect_formateur(): void {
    if (this.courseId) {
      this.router.navigate(['courses', this.courseId, 'addlessons']);
    }
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

  /**
   * Vérifie si l'utilisateur peut modifier/supprimer (admin ou formateur)
   */
  canManageLessons(): boolean {
    return this.userRole === 'admin' || this.userRole === 'formateur';
  }

  /**
   * Ouvre la modal de confirmation de suppression
   */
  openDeleteModal(lesson: any): void {
    this.lessonToDelete = lesson;
  }

  /**
   * Ferme la modal de suppression
   */
  closeDeleteModal(): void {
    this.lessonToDelete = null;
  }

  /**
   * Confirme et effectue la suppression de la leçon
   */
  confirmDeleteLesson(): void {
    if (!this.lessonToDelete || this.isDeleting) {
      return;
    }

    this.isDeleting = true;
    const lessonId = this.lessonToDelete.id;

    this.courseService.deleteLesson(lessonId).subscribe({
      next: () => {
        this.notificationService.setSuccessMessage('Leçon supprimée avec succès');
        // Retirer la leçon de la liste locale
        this.lessons.lessons = this.lessons.lessons.filter((l: any) => l.id !== lessonId);
        this.closeDeleteModal();
        this.isDeleting = false;
      },
      error: (err) => {
        console.error('Erreur lors de la suppression:', err);
        this.notificationService.setErrorMessage(
          err.error?.message || 'Erreur lors de la suppression de la leçon'
        );
        this.isDeleting = false;
        this.closeDeleteModal();
      },
    });
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
      error: (err: any) => {},
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

  startRessource(lesson: any) {
    if (lesson.questions) {
      this.redirect_quizz();
    }
    this.redirect(lesson.id);
  }

  showConfirmation = false;

  confirmAction() {
    this.showConfirmation = false;
  }
  
  redirect_edit_lesson(lessonId: number): void {
    if (this.courseId) {
      this.router.navigate(
        ['courses', this.courseId, 'lessons', 'edit-lesson', lessonId],
        { relativeTo: this.route.parent?.parent }
      );
    }
  }

  // Méthodes pour fermer les alertes
  closeSuccessAlert(): void {
    this.success = '';
    this.notificationService.clearSuccessMessage();
  }

  closeErrorAlert(): void {
    this.error = '';
    this.notificationService.clearErrorMessage();
  }
}