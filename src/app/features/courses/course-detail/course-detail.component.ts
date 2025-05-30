import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { Course, Lesson } from '../../../core/models/course.model'; 

// Interface pour la configuration du lecteur vidéo
interface VideoConfig {
  src: string;
  title: string;
  duration: number;
  thumbnail?: string;
}

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatProgressBarModule,
    MatDividerModule,
    MatListModule,
    MatChipsModule,
    MatMenuModule,
    MatSliderModule,
    MatTooltipModule
  ],
  templateUrl: './course-detail.component.html',
  styleUrls: ['./course-detail.component.scss']
})
export class CourseDetailComponent implements OnInit {
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
  
  course: Course | null = null;
  selectedTabIndex = 0;
  progress = 45; // Pourcentage de progression
  
  // État du lecteur vidéo
  currentVideo: VideoConfig | null = null;
  isVideoPlaying = false;
  showControls = true;
  currentTime = 0;
  duration = 0;
  volume = 1;
  isMuted = false;
  isFullscreen = false;
  playbackRate = 1;
  currentLesson: Lesson | null = null;
  showLessonContent = false;
  
  controlsTimeout: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    // TODO: Remplacer par un appel API réel
    this.loadCourseData();
  }

  private loadCourseData() {
    // Données de démonstration
    this.course = {
      id: '1',
      title: 'Cybersécurité Avancée',
      description: 'Maîtrisez les techniques avancées de cybersécurité et protégez les systèmes contre les menaces modernes.',
      level: 'advanced',
      duration: 20,
      imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
      instructor: 'Dr. Sarah Dupont',
      rating: 4.8,
      studentsEnrolled: 1245,
      createdAt: new Date('2023-01-15'),
      updatedAt: new Date('2023-05-20'),
      lessons: [
        {
          id: 'l1',
          title: 'Introduction à la cybersécurité avancée',
          description: 'Découvrez les concepts fondamentaux de la cybersécurité avancée et préparez-vous à approfondir vos connaissances.',
          duration: 45,
          type: 'video',
          isPreview: true,
          content: 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4',
          videoUrl: 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4',
          thumbnail: 'https://via.placeholder.com/800x450?text=Introduction+à+la+cybersécurité',
          resources: []
        },
        {
          id: 'l2',
          title: 'Analyse des menaces avancées',
          description: 'Apprenez à identifier et analyser les menaces de sécurité avancées dans les environnements informatiques modernes.',
          duration: 60,
          type: 'video',
          isPreview: true,
          content: 'https://samplelib.com/lib/preview/mp4/sample-10s.mp4',
          videoUrl: 'https://samplelib.com/lib/preview/mp4/sample-10s.mp4',
          thumbnail: 'https://via.placeholder.com/800x450?text=Analyse+des+menaces',
          resources: []
        },
        {
          id: 'l3',
          title: 'Sécurisation des réseaux',
          description: 'Maîtrisez les techniques avancées pour sécuriser les infrastructures réseau contre les attaques sophistiquées.',
          duration: 90,
          type: 'video',
          isPreview: false,
          content: 'https://samplelib.com/lib/preview/mp4/sample-15s.mp4',
          videoUrl: 'https://samplelib.com/lib/preview/mp4/sample-15s.mp4',
          thumbnail: 'https://via.placeholder.com/800x450?text=Sécurisation+des+réseaux',
          resources: []
        }
      ],
      prerequisites: [
        'Bases de la cybersécurité',
        'Connaissance des réseaux informatiques',
        'Notions de programmation'
      ],
      learningObjectives: [
        'Comprendre les menaces de cybersécurité actuelles',
        'Mettre en place des mesures de protection avancées',
        'Analyser et répondre aux incidents de sécurité',
        'Sécuriser les applications et les réseaux'
      ]
    };
  }

  getLevelColor(level: string): string {
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'primary';
      case 'intermediate':
        return 'accent';
      case 'advanced':
        return 'warn';
      default:
        return '';
    }
  }

  // Méthode pour obtenir l'icône en fonction du type de leçon
  getLessonIcon(type: string): string {
    switch (type) {
      case 'video':
        return 'play_circle';
      case 'quiz':
        return 'quiz';
      case 'text':
        return 'article';
      default:
        return 'description';
    }
  }

  // Vérifie si une leçon est terminée
  isLessonCompleted(lessonId: string): boolean {
    // Implémentez la logique pour vérifier si la leçon est terminée
    return false;
  }

  // Vérifie si une leçon est déverrouillée
  isLessonUnlocked(lesson: any): boolean {
    // Implémentez la logique pour vérifier si la leçon est déverrouillée
    return true;
  }

  // Obtient la progression d'une leçon
  getLessonProgress(lessonId: string): number {
    // Implémentez la logique pour obtenir la progression de la leçon
    return 0;
  }

  // Affiche le contenu d'une leçon
  showLesson(lesson: Lesson): void {
    if (!this.isLessonUnlocked(lesson)) {
      return;
    }
    this.currentLesson = lesson;
    this.showLessonContent = true;
    // Faites défiler jusqu'au contenu de la leçon
    setTimeout(() => {
      const element = document.getElementById('lesson-content');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  // Obtient la leçon suivante
  getNextLesson(): Lesson | null {
    if (!this.course || !this.currentLesson) return null;
    const currentIndex = this.course.lessons.findIndex(l => l.id === this.currentLesson?.id);
    return currentIndex < this.course.lessons.length - 1 ? this.course.lessons[currentIndex + 1] : null;
  }

  // Obtient la leçon précédente
  getPreviousLesson(): Lesson | null {
    if (!this.course || !this.currentLesson) return null;
    const currentIndex = this.course.lessons.findIndex(l => l.id === this.currentLesson?.id);
    return currentIndex > 0 ? this.course.lessons[currentIndex - 1] : null;
  }

  // Gestion du lecteur vidéo
  playPreviewVideo(lesson: any): void {
    this.currentVideo = {
      src: lesson.videoUrl,
      title: lesson.title,
      thumbnail: lesson.thumbnail,
      duration: lesson.duration || 0
    };
    this.showControls = true;
    setTimeout(() => {
      this.videoPlayer.nativeElement.play();
      this.isVideoPlaying = true;
    }, 300);
  }

  closeVideo(): void {
    this.currentVideo = null;
    this.isVideoPlaying = false;
    this.currentTime = 0;
    if (this.videoPlayer) {
      this.videoPlayer.nativeElement.pause();
      this.videoPlayer.nativeElement.currentTime = 0;
    }
  }

  togglePlayPause(): void {
    if (this.isVideoPlaying) {
      this.videoPlayer.nativeElement.pause();
    } else {
      this.videoPlayer.nativeElement.play();
    }
    this.isVideoPlaying = !this.isVideoPlaying;
  }

  onTimeUpdate(): void {
    this.currentTime = this.videoPlayer.nativeElement.currentTime;
    this.duration = this.videoPlayer.nativeElement.duration || 0;
  }

  onVideoEnded(): void {
    this.isVideoPlaying = false;
    this.currentTime = this.duration;
  }

  toggleMute(): void {
    this.isMuted = !this.isMuted;
    this.videoPlayer.nativeElement.muted = this.isMuted;
  }

  onVolumeChange(volume: number): void {
    this.volume = volume;
    this.videoPlayer.nativeElement.volume = volume;
    this.isMuted = volume === 0;
  }

  formatVolume(value: number): string {
    return Math.round(value * 100) + '%';
  }

  setPlaybackRate(rate: number): void {
    this.playbackRate = rate;
    this.videoPlayer.nativeElement.playbackRate = rate;
  }

  toggleFullscreen(): void {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Erreur lors du passage en plein écran: ${err.message}`);
      });
      this.isFullscreen = true;
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        this.isFullscreen = false;
      }
    }
  }

  onProgressBarClick(event: MouseEvent): void {
    const progressBar = event.currentTarget as HTMLElement;
    const rect = progressBar.getBoundingClientRect();
    const pos = (event.clientX - rect.left) / rect.width;
    const newTime = pos * this.duration;
    this.videoPlayer.nativeElement.currentTime = newTime;
    this.currentTime = newTime;
  }

  showVideoControls(): void {
    this.showControls = true;
    clearTimeout(this.controlsTimeout);
    this.controlsTimeout = setTimeout(() => {
      if (this.isVideoPlaying) {
        this.showControls = false;
      }
    }, 3000);
  }

  onMouseLeaveVideo(): void {
    if (this.isVideoPlaying) {
      this.controlsTimeout = setTimeout(() => {
        this.showControls = false;
      }, 1000);
    }
  }

  /**
   * Formate un nombre de secondes au format MM:SS
   * @param timeInSeconds Le temps en secondes
   * @returns Le temps formaté (ex: 02:30)
   */
  formatTime(timeInSeconds: number): string {
    if (isNaN(timeInSeconds) || !isFinite(timeInSeconds)) {
      return '00:00';
    }
    
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    
    return [
      minutes.toString().padStart(2, '0'),
      seconds.toString().padStart(2, '0')
    ].join(':');
  }

  ngOnDestroy(): void {
    if (this.controlsTimeout) {
      clearTimeout(this.controlsTimeout);
    }
    if (this.isFullscreen && document.exitFullscreen) {
      document.exitFullscreen();
    }
  }

  /**
   * Fonction de suivi pour l'optimisation du rendu de la liste des leçons
   * @param index Index de l'élément dans la liste
   * @param lesson La leçon courante
   * @returns Un identifiant unique pour la leçon
   */
  trackByLessonId(index: number, lesson: Lesson): string {
    return lesson.id;
  }

  /**
   * Démarre le cours en affichant la première leçon disponible
   */
  startCourse(): void {
    if (!this.course?.lessons?.length) {
      console.error('Aucune leçon disponible pour ce cours');
      return;
    }

    // Trouver la première leçon non terminée ou la première leçon
    const firstUncompletedLesson = this.course.lessons.find(lesson => !this.isLessonCompleted(lesson.id)) || this.course.lessons[0];
    
    // Si c'est une leçon en prévisualisation, on la lit directement
    if (firstUncompletedLesson.isPreview) {
      this.playPreviewVideo(firstUncompletedLesson);
    } else {
      // Sinon, on affiche le contenu de la leçon
      this.showLesson(firstUncompletedLesson);
    }
    
    // Faire défiler vers la section de la leçon
    setTimeout(() => {
      const lessonSection = document.getElementById('lesson-content');
      if (lessonSection) {
        lessonSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }

  /**
   * Redirige vers la page des leçons du cours
   */
  enrollInCourse(): void {
    if (this.course) {
      // Le chemin est relatif au chemin actuel, donc on utilise juste 'lessons'
      this.router.navigate(['lessons'], { relativeTo: this.route });
    }
  }
}
