import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';
import { Course, Lessons } from '../../../core/models/course.model';

@Component({
  selector: 'app-course-start',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatListModule
  ],
  templateUrl: './course-start.component.html',
  styleUrls: ['./course-start.component.scss']
})
export class CourseStartComponent {
  @Input() course: Lessons | null = null;
  @Output() startCourse = new EventEmitter<void>();

  getTitle(): string {
    return this.course?.title || 'Titre du cours';
  }

  getSubtitle(): string {
    return this.course?.title || 'Découvrez ce cours passionnant';
  }

  getAltText(): string {
    return this.course?.title || 'Cours sans titre';
  }

  get estimatedDuration(): string {
    if (!this.course?.title?.length) return 'N/A';
    
    const totalMinutes = this.course.id.length * 15; // Estimation de 15 minutes par leçon
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`;
    }
    return `${minutes} min`;
  }

  get lessonsCount(): number {
    return this.course?.id?.length || 0;
  }

  onStartCourse(): void {
    this.startCourse.emit();
  }
}
