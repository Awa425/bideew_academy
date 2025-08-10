import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-video-lesson',
  imports: [CommonModule, RouterLink],
  templateUrl: './video-lesson.component.html',
  styleUrl: './video-lesson.component.scss'
})
export class VideoLessonComponent {

  lessons: any = [];
  lessonId: string | null = null;
  video: string | null = null;
  video_teste: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private lessonService: CourseService
  ) {}
  ngOnInit() {
    this.lessonId = this.route.snapshot.paramMap.get('id');
    // console.log(this.lessonId);    
    this.loadLessonData(1, 3);
  }

  private loadLessonData(idCour: any, idLesson: any) {
    this.lessonService.getLessonsByIdLesson(idCour, idLesson).subscribe({
      next: (lesson: any) => {
        const fullContent = lesson.contents?.[0]?.file_path || '';
        const rawParagraphs: string = fullContent;
        
        this.video_teste= 'http://localhost:8000/api/' + rawParagraphs;
        // this.pdf = 'http://localhost:8000/api/' + rawParagraphs;
        // this.video_teste= "../../../../assets/video/Casa.de.Papel.S05E10 FINAL.Shar.Club.mp4";
        console.log(lesson);
        this.lessons=lesson;
      }});
    }
}
