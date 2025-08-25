import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-video-lesson',
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule],
  templateUrl: './video-lesson.component.html',
  styleUrl: './video-lesson.component.scss'
})
export class VideoLessonComponent implements OnInit {

  lessons: any = [];
  lessonId: string | null = null;
  courseId: string | null = null;
  video: string | null = null;
  video_teste: string | null = null;
  
  // Nouvelles propriétés pour les fonctionnalités améliorées
  progressPercent: number = 0;
  currentLessonIndex: number = 1;
  totalLessons: number = 10; // À récupérer dynamiquement
  hasPreviousLesson: boolean = false;
  hasNextLesson: boolean = true;
  previousLessonId: string | null = null;
  nextLessonId: string | null = null;
  isBookmarked: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private lessonService: CourseService
  ) {}

  ngOnInit() {
    this.courseId = this.route.snapshot.paramMap.get('id');
    this.lessonId = this.route.snapshot.paramMap.get('idLesson');
    
    this.loadLessonData(this.courseId, this.lessonId);
    this.loadNavigationData();
    this.initializeVideoProgress();
  }

  private loadLessonData(idCour: any, idLesson: any) {
    this.lessonService.getLessonsByIdLesson(idCour, idLesson).subscribe({
      next: (lesson: any) => {
        const fullContent = lesson.contents?.[0]?.file_path || '';
        const rawParagraphs: string = fullContent;
        
        this.video_teste = 'http://localhost:8000/api/' + rawParagraphs;
        console.log(lesson);
        this.lessons = lesson;
        
        // Simuler des données supplémentaires (à adapter selon votre API)
        this.lessons.views = this.lessons.views || Math.floor(Math.random() * 1000);
        this.lessons.rating = this.lessons.rating || (4 + Math.random()).toFixed(1);
        this.lessons.tags = this.lessons.tags || ['Cybersécurité', 'Formation', 'Vidéo'];
      },
      error: (error) => {
        console.error('Erreur lors du chargement de la leçon:', error);
      }
    });
  }

  private loadNavigationData() {
    // Charger les informations de navigation (leçons précédente/suivante)
    // À implémenter selon votre API
    this.lessonService.getCourseById(this.courseId).subscribe({
      next: (course: any) => {
        if (course && course.lessons) {
          this.totalLessons = course.lessons.length;
          const currentIndex = course.lessons.findIndex((l: any) => l.id.toString() === this.lessonId);
          
          if (currentIndex !== -1) {
            this.currentLessonIndex = currentIndex + 1;
            this.hasPreviousLesson = currentIndex > 0;
            this.hasNextLesson = currentIndex < course.lessons.length - 1;
            
            if (this.hasPreviousLesson) {
              this.previousLessonId = course.lessons[currentIndex - 1].id;
            }
            
            if (this.hasNextLesson) {
              this.nextLessonId = course.lessons[currentIndex + 1].id;
            }
          }
        }
      }
    });
  }

  private initializeVideoProgress() {
    // Récupérer la progression sauvegardée
    const savedProgress = localStorage.getItem(`video_progress_${this.lessonId}`);
    if (savedProgress) {
      this.progressPercent = parseInt(savedProgress);
    }
  }

  // Méthodes pour les actions
  markAsCompleted() {
    this.progressPercent = 100;
    localStorage.setItem(`video_progress_${this.lessonId}`, '100');
    
    // Appeler votre API pour marquer la leçon comme terminée
    this.lessonService.addProgress(parseInt(this.lessonId!)).subscribe({
      next: (response:any) => {
        console.log('Leçon marquée comme terminée');
        // Afficher une notification de succès
      },
      error: (error:any) => {
        console.error('Erreur lors de la sauvegarde:', error);
      }
    });
  }

  toggleBookmark() {
    this.isBookmarked = !this.isBookmarked;
    // Implémenter la logique de favoris
    console.log('Favori:', this.isBookmarked ? 'Ajouté' : 'Retiré');
  }

  downloadResource() {
    if (this.video_teste) {
      // Créer un lien de téléchargement
      const link = document.createElement('a');
      link.href = this.video_teste;
      link.download = `${this.lessons.title}.mp4`;
      link.click();
    }
  }

  // Navigation entre leçons
  previousLesson() {
    if (this.hasPreviousLesson && this.previousLessonId) {
      this.router.navigate(['../../../video', this.previousLessonId], { relativeTo: this.route });
    }
  }

  nextLesson() {
    if (this.hasNextLesson && this.nextLessonId) {
      this.router.navigate(['../../../video', this.nextLessonId], { relativeTo: this.route });
    }
  }

  // Méthode appelée quand la vidéo progresse (à connecter à l'événement video)
  onVideoTimeUpdate(event: any) {
    const video = event.target;
    const progress = (video.currentTime / video.duration) * 100;
    this.progressPercent = Math.floor(progress);
    
    // Sauvegarder la progression toutes les 10%
    if (this.progressPercent % 10 === 0) {
      localStorage.setItem(`video_progress_${this.lessonId}`, this.progressPercent.toString());
    }
  }
}