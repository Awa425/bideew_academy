import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { Course, Lesson } from '../../../core/models/course.model';

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
    MatDividerModule
  ],
  templateUrl: './text-lesson.component.html',
  styleUrls: ['./text-lesson.component.scss']
})
export class TextLessonComponent {
  @Input() lesson!: Lesson;
  @Input() course!: Course;
  @Input() isPreview: boolean = false;

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
