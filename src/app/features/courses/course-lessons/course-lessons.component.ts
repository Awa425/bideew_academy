import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Course, Lesson } from '../../../core/models/course.model';

@Component({
  selector: 'app-course-lessons',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatProgressBarModule,
    MatTooltipModule
  ],
  templateUrl: './course-lessons.component.html',
  styleUrls: ['./course-lessons.component.scss']
})
export class CourseLessonsComponent implements OnInit {
  course: Course | null = null;
  lessons: (Lesson & { completed?: boolean })[] = [];
  courseId: string | null = null;
  progress = 0;
  currentLessonId: string | null = null;
  private readonly STORAGE_KEY = 'course_progress';

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.courseId = this.route.snapshot.paramMap.get('id');
    this.loadCourseData();
    this.loadProgress();
  }

  private loadProgress(): string[] {
    if (!this.courseId) return [];
    
    const progressData = localStorage.getItem(this.STORAGE_KEY);
    if (progressData) {
      try {
        const progress = JSON.parse(progressData);
        if (progress[this.courseId!]) {
          this.progress = progress[this.courseId!].progress || 0;
          this.currentLessonId = progress[this.courseId!].currentLessonId || null;
          return progress[this.courseId!].completedLessons || [];
        }
      } catch (e) {
        console.error('Erreur lors du chargement de la progression', e);
      }
    }
    return [];
  }

  private saveProgress(): void {
    if (!this.courseId) return;
    
    const progressData = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '{}');
    const completedLessons = this.lessons
      .filter(lesson => lesson.completed)
      .map(lesson => lesson.id);
    
    progressData[this.courseId] = {
      progress: this.progress,
      currentLessonId: this.currentLessonId,
      completedLessons,
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(progressData));
  }

  private loadCourseData() {
    const completedLessons = this.loadProgress();
    // TODO: Remplacer par un appel API réel avec this.courseId
    // Pour l'instant, on simule des données
    this.course = {
      id: this.courseId || '1',
      title: 'Cybersécurité Avancée',
      description: 'Maîtrisez les techniques avancées de cybersécurité et protégez les systèmes contre les menaces modernes.',
      level: 'advanced',
      duration: 20,
      imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      instructor: 'Dr. Sarah Dupont',
      rating: 4.8,
      studentsEnrolled: 1245,
      prerequisites: ['Bases de la cybersécurité', 'Réseaux informatiques'],
      learningObjectives: [
        'Comprendre les menaces de cybersécurité avancées',
        'Mettre en place des mesures de protection efficaces',
        'Analyser et répondre aux incidents de sécurité'
      ],
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date('2023-05-20'),
      lessons: [
        {
          id: 'l1',
          title: 'Introduction à la cybersécurité avancée',
          duration: 45,
          type: 'video',
          isPreview: true,
          content: 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4',
          resources: []
        },
        {
          id: 'l2',
          title: 'Analyse des menaces avancées',
          duration: 60,
          type: 'video',
          isPreview: true,
          content: 'https://samplelib.com/lib/preview/mp4/sample-10s.mp4',
          resources: []
        },
        {
          id: 'l3',
          title: 'Sécurisation des réseaux',
          duration: 90,
          type: 'text',
          isPreview: false,
          content: 'Contenu de la leçon sur la sécurisation des réseaux...',
          resources: []
        },
        {
          id: 'l4',
          title: 'Quiz de mi-parcours',
          duration: 30,
          type: 'quiz',
          isPreview: false,
          content: '',
          resources: []
        }
      ]
    };
    
    if (this.course) {
      this.lessons = (this.course.lessons || []).map(lesson => ({
        ...lesson,
        completed: completedLessons.includes(lesson.id)
      }));
      
      // Mettre à jour la progression
      this.updateProgress();
      
      // Si pas de leçon en cours, définir la première comme en cours
      if (!this.currentLessonId && this.lessons.length > 0) {
        this.currentLessonId = this.lessons[0].id;
      }
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

  startLesson(lesson: Lesson) {
    this.currentLessonId = lesson.id;
    this.saveProgress();
    // Faire défiler jusqu'à la leçon sélectionnée
    this.scrollToLesson(lesson.id);
  }

  toggleLessonComplete(lesson: Lesson & { completed?: boolean }, event: Event) {
    event.stopPropagation();
    lesson.completed = !lesson.completed;
    this.updateProgress();
    this.saveProgress();
  }

  navigateToNextLesson() {
    if (!this.currentLessonId || !this.lessons.length) return;
    
    const currentIndex = this.lessons.findIndex(l => l.id === this.currentLessonId);
    if (currentIndex < this.lessons.length - 1) {
      const nextLesson = this.lessons[currentIndex + 1];
      this.startLesson(nextLesson);
    }
  }

  navigateToPreviousLesson() {
    if (!this.currentLessonId || !this.lessons.length) return;
    
    const currentIndex = this.lessons.findIndex(l => l.id === this.currentLessonId);
    if (currentIndex > 0) {
      const previousLesson = this.lessons[currentIndex - 1];
      this.startLesson(previousLesson);
    }
  }

  private updateProgress() {
    if (!this.lessons.length) {
      this.progress = 0;
      return;
    }
    
    const completedCount = this.lessons.filter(lesson => lesson.completed).length;
    this.progress = Math.round((completedCount / this.lessons.length) * 100);
  }

  private scrollToLesson(lessonId: string) {
    setTimeout(() => {
      const element = document.getElementById(`lesson-${lessonId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Ajouter une classe pour le surlignage
        element.classList.add('highlight');
        setTimeout(() => element.classList.remove('highlight'), 2000);
      }
    }, 100);
  }

  isCurrentLesson(lessonId: string): boolean {
    return this.currentLessonId === lessonId;
  }

  canNavigateToPrevious(): boolean {
    if (!this.currentLessonId || !this.lessons.length) return false;
    const currentIndex = this.lessons.findIndex(l => l.id === this.currentLessonId);
    return currentIndex > 0;
  }

  canNavigateToNext(): boolean {
    if (!this.currentLessonId || !this.lessons.length) return false;
    const currentIndex = this.lessons.findIndex(l => l.id === this.currentLessonId);
    return currentIndex < this.lessons.length - 1;
  }

  getLessonTypeLabel(type: string): string {
    switch (type) {
      case 'video': return 'Vidéo';
      case 'quiz': return 'Quiz';
      case 'text': return 'Texte';
      case 'assignment': return 'Devoir';
      default: return type;
    }
  }

  getProgressWidth(lessonIndex: number): number {
    if (!this.lessons.length) return 0;
    
    const completedCount = this.lessons
      .slice(0, lessonIndex + 1)
      .filter(lesson => lesson.completed).length;
      
    return (completedCount / this.lessons.length) * 100;
  }
}
