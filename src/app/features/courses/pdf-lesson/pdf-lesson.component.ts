import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pdf-lesson',
  imports: [CommonModule, PdfViewerModule, RouterLink],
  templateUrl: './pdf-lesson.component.html',
  styleUrl: './pdf-lesson.component.scss',
})
export class PdfLessonComponent {
  lessons: any = [];
  lessonId: string | null = null;
  pdf: string | '' = '';

  constructor(
    private route: ActivatedRoute,
    private lessonService: CourseService
  ) {}
  ngOnInit() {
    this.loadLessonData_pdf();
  }

  private loadLessonData_pdf() {
    const coursId = Number(this.route.snapshot.paramMap.get('id'));
    const lessonId = Number(this.route.snapshot.paramMap.get('idLesson'));
    this.lessonService.getLessonsByIdLesson(coursId, lessonId).subscribe({
      next: (lesson: any) => {
        const fullContent = lesson.contents?.[0]?.file_path || '';
        const rawParagraphs: string = fullContent;
        // this.pdf = '../../../../assets/pdf/tdr_recrutement_devs.pdf';
        this.pdf = 'http://localhost:8000/api/' + rawParagraphs;
        this.lessons = lesson;
        console.log(this.pdf);
      },
      error: (err) => {
        console.error('Erreur chargement PDF:', err);
      },
    });
  }
  downloadPDF() {
    const link = document.createElement('a');
    link.href = this.pdf;
    link.download = 'document.pdf';
    link.click();
  }
}
