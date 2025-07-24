import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
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
import { Course, Lessons } from '../../../core/models/course.model';
import { CourseService } from '../../../core/services/course.service';

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
    MatTooltipModule,
    RouterLink
  ],
  templateUrl: './course-detail.component.html',
  styleUrls: ['./course-detail.component.scss'],
})
export class CourseDetailComponent implements OnInit {
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;

  course: any;
  id: string | null = null;
  selectedTabIndex = 0;
  currentVideo: VideoConfig | null = null;
  isVideoPlaying = false;
  showControls = true;
  currentTime = 0;
  duration = 0;
  volume = 1;
  isMuted = false;
  isFullscreen = false;
  playbackRate = 1;
  currentLesson: Lessons[] = [];
  showLessonContent = false;

  controlsTimeout: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private courseService: CourseService
  ) {}

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id');
    // TODO: Remplacer par un appel API réel
    this.loadCourseData(this.id);
  }

  private loadCourseData(id: any) {
    this.courseService.getCourseById(id).subscribe((data) => {
      this.course = data;

      //PREREQUIS
      if (this.course.prerequis) {
        this.course.prerequisList = this.course.prerequis
          .split(',')
          .map((p:any) => p.trim());
      } else {
        this.course.prerequisList = [];
      }
      //OBJECTIF
      if (this.course.objectif) {
        this.course.objectifList = this.course.objectif
          .split(',')
          .map((p:any) => p.trim());
      } else {
        this.course.objectifList = [];
      }
    });
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
  showLesson(lesson: Lessons[]): void {
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
  getNextLesson(): Lessons[] | null {
    if (!this.course || !this.currentLesson) return null;
    const currentIndex = this.course.lessons.findIndex();
    return currentIndex < this.course.lessons.length - 1
      ? this.course.lessons[currentIndex + 1]
      : null;
  }

  // Obtient la leçon précédente
  getPreviousLesson(): any {
    if (!this.course || !this.currentLesson) return null;
    const currentIndex = this.course.lessons.findIndex();
    return currentIndex > 0 ? this.course.lessons[currentIndex - 1] : null;
  }

  // Gestion du lecteur vidéo
  playPreviewVideo(lesson: any): void {
    this.currentVideo = {
      src: lesson.videoUrl,
      title: lesson.title,
      thumbnail: lesson.thumbnail,
      duration: lesson.duration || 0,
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
      document.documentElement.requestFullscreen().catch((err) => {
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
      seconds.toString().padStart(2, '0'),
    ].join(':');
  }

  // ngOnDestroy(): void {
  //   if (this.controlsTimeout) {
  //     clearTimeout(this.controlsTimeout);
  //   }
  //   if (this.isFullscreen && document.exitFullscreen) {
  //     document.exitFullscreen();
  //   }
  // }

  /**
   * Fonction de suivi pour l'optimisation du rendu de la liste des leçons
   * @param index Index de l'élément dans la liste
   * @param lesson La leçon courante
   * @returns Un identifiant unique pour la leçon
   */
  trackByLessonId(index: number, lesson: Lessons): string {
    return lesson.id;
  }

  /**
   * Démarre le cours en affichant la première leçon disponible
   */
  // startCourse(): void {
  //   if (!this.course?.lessons?.length) {
  //     console.error('Aucune leçon disponible pour ce cours');
  //     return;
  //   }
  //   // Faire défiler vers la section de la leçon
  //   setTimeout(() => {
  //     const lessonSection = document.getElementById('lesson-content');
  //     if (lessonSection) {
  //       lessonSection.scrollIntoView({ behavior: 'smooth' });
  //     }
  //   }, 100);
  // }

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
