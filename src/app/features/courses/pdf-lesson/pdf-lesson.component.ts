import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { envVars } from 'environments/environments';

@Component({
  selector: 'app-pdf-lesson',
  imports: [CommonModule, PdfViewerModule, RouterLink, FormsModule],
  templateUrl: './pdf-lesson.component.html',
  styleUrl: './pdf-lesson.component.scss',
})
export class PdfLessonComponent {
  lessons: any = [];
  lessonId: string | null = null;
  pdf: string | '' = '';

  currentPage: number = 1;
  totalPages: number = 0;
  zoom: number = 1.0;
  fitToPage: boolean = true;

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
        this.pdf = `${envVars.apiBaseUrl}` + '/' + rawParagraphs;
        this.lessons = lesson;
      },
      error: (err) => {},
    });
  }

  onPdfLoadComplete(pdf: any) {
    this.totalPages = pdf.numPages;
  }

  nextSlide() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevSlide() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  goToFirst() {
    this.currentPage = 1;
  }

  goToLast() {
    this.currentPage = this.totalPages;
  }

  zoomIn() {
    this.zoom += 0.25;
    this.fitToPage = false;
  }

  zoomOut() {
    if (this.zoom > 0.25) {
      this.zoom -= 0.25;
      this.fitToPage = false;
    }
  }

  resetZoom() {
    this.zoom = 1.0;
    this.fitToPage = true;
  }

  onPageInputChange(event: any) {
    const value = parseInt(event.target.value);
    if (!isNaN(value)) {
      this.goToPage(value);
    }
  }

  onPageInputEnter(event: any) {
    const value = parseInt(event.target.value);
    if (!isNaN(value)) {
      this.goToPage(value);
    }
  }

  downloadPDF() {
    const link = document.createElement('a');
    link.href = this.pdf;
    link.download = 'document.pdf';
    link.click();
  }
}
