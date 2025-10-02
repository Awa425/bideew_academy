import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseService } from '../../core/services/course.service';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Subscription } from 'rxjs';

interface LessonProgress {
  lesson_id: number;
  lesson_title: string;
  course_title: string;
  is_completed: number;
  is_locked: number;
  completed_at?: string;
  started_at?: string;
}

interface QuizAttempted {
  quiz_id: number;
  quiz_title?: string;
  score?: number;
  max_score?: number;
  attempted_at?: string;
}

interface UserProgress {
  user: {
    id: number;
    name: string;
    role: string;
    email: string;
  };
  lessons_progress: LessonProgress[];
  quizzes_attempted: QuizAttempted[];
}

interface TimelineItem {
  type: 'lesson_start' | 'lesson_complete' | 'quiz_attempt';
  title: string;
  description: string;
  date: string;
  item: any;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-learning-path',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './learning-path.component.html',
  styleUrls: ['./learning-path.component.scss'],
})
export class LearningPathComponent implements OnInit, OnDestroy {
  userId: string | null = '';
  userProgress: UserProgress | null = null;
  loading: boolean = true;
  error: string | null = null;
  timelineItems: TimelineItem[] = [];

  private subscription = new Subscription();

  constructor(
    private courseService: CourseService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userId = localStorage.getItem('user_id');
    if (this.userId) {
      this.loadUserProgress();
    } else {
      this.error = 'Utilisateur non connecté';
      this.loading = false;
      this.router.navigate(['/login']);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadUserProgress(): void {
    this.loading = true;
    this.error = null;

    const userSub = this.authService.getUserById(this.userId).subscribe({
      next: (data: any) => {
        this.userProgress = data;
        this.generateTimeline();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de la progression:', error);
        this.error =
          'Impossible de charger votre progression. Veuillez réessayer.';
        this.loading = false;
      },
    });

    this.subscription.add(userSub);
  }

  generateTimeline(): void {
    this.timelineItems = [];

    if (!this.userProgress) return;

    this.userProgress.lessons_progress?.forEach((lesson) => {
      this.timelineItems.push({
        type: 'lesson_start',
        title: `Début de la leçon: ${lesson.lesson_title}`,
        description: `Cours: ${lesson.course_title}`,
        date: this.estimateStartDate(lesson.completed_at),
        item: lesson,
        icon: 'play',
        color: '#3b82f6',
      });

      if (lesson.is_completed && lesson.completed_at) {
        this.timelineItems.push({
          type: 'lesson_complete',
          title: `Leçon terminée: ${lesson.lesson_title}`,
          description: `Cours: ${lesson.course_title}`,
          date: lesson.completed_at,
          item: lesson,
          icon: 'check',
          color: '#10b981',
        });
      }
    });

    this.userProgress.quizzes_attempted?.forEach((quiz) => {
      this.timelineItems.push({
        type: 'quiz_attempt',
        title: `Quiz tenté: ${quiz.quiz_title || 'Quiz'}`,
        description: `Score: ${quiz.score}${
          quiz.max_score ? '/' + quiz.max_score : ''
        }`,
        date: quiz.attempted_at || '',
        item: quiz,
        icon: 'help-circle',
        color: '#8b5cf6',
      });
    });

    this.timelineItems.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  estimateStartDate(completedAt: string | undefined): string {
    if (!completedAt) {
      return new Date().toISOString();
    }

    const completedDate = new Date(completedAt);
    const startDate = new Date(completedDate.getTime() - 60 * 60 * 1000);
    return startDate.toISOString();
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('Erreur de formatage de date:', error);
      return dateString;
    }
  }

  formatRelativeDate(dateString: string): string {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor(diffMs / (1000 * 60));

      if (diffMinutes < 1) return "À l'instant";
      if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
      if (diffHours < 24) return `Il y a ${diffHours} h`;
      if (diffDays === 1) return 'Hier';
      if (diffDays < 7) return `Il y a ${diffDays} jours`;

      return this.formatDate(dateString);
    } catch (error) {
      return dateString;
    }
  }

  getEventIcon(type: string): string {
    const icons: { [key: string]: string } = {
      lesson_start: '▶️',
      lesson_complete: '✅',
      quiz_attempt: '❓',
    };
    return icons[type] || '●';
  }

  continueLesson(lessonId: number): void {
    this.router.navigate(['/lesson', lessonId]);
  }

  reviewLesson(lessonId: any): void {}

  retakeQuiz(quizId: number): void {
    this.router.navigate(['/quiz', quizId]);
  }

  exploreCoursePage(): void {
    this.router.navigate(['/courses']);
  }

  getProgressPercentage(): number {
    const total = this.userProgress?.lessons_progress?.length || 0;
    if (total === 0) return 0;
    const completed =
      this.userProgress?.lessons_progress?.filter(
        (lesson) => lesson.is_completed === 1
      ).length || 0;
    return Math.round((completed / total) * 100);
  }

  getCompletedLessonsCount(): number {
    return (
      this.userProgress?.lessons_progress?.filter(
        (lesson) => lesson.is_completed === 1
      ).length || 0
    );
  }

  getTotalLessonsCount(): number {
    return this.userProgress?.lessons_progress?.length || 0;
  }

  filterTimelineByType(type: string): TimelineItem[] {
    if (type === 'all') return this.timelineItems;
    return this.timelineItems.filter((item) => item.type === type);
  }

  hasRecentActivity(): boolean {
    return this.timelineItems.length > 0;
  }

  getLastActivity(): TimelineItem | null {
    return this.timelineItems.length > 0 ? this.timelineItems[0] : null;
  }

  trackByTimelineItem(index: number, item: TimelineItem): string {
    return `${item.type}-${item.date}-${index}`;
  }

  trackByLesson(index: number, lesson: LessonProgress): number {
    return lesson.lesson_id;
  }

  trackByQuiz(index: number, quiz: QuizAttempted): number {
    return quiz.quiz_id;
  }
}
