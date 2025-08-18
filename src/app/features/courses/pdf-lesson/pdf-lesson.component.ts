import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  
  // Variables pour la gestion des slides
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
        this.pdf = 'http://localhost:8000/api/' + rawParagraphs;
        this.lessons = lesson;
        console.log(this.pdf);
      },
      error: (err) => {
        console.error('Erreur chargement PDF:', err);
      },
    });
  }

  // Événement déclenché après le chargement du PDF
  onPdfLoadComplete(pdf: any) {
    this.totalPages = pdf.numPages;
    console.log('PDF chargé avec', this.totalPages, 'pages');
  }

  // Navigation vers la page suivante
  nextSlide() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  // Navigation vers la page précédente
  prevSlide() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  // Aller à une page spécifique
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Aller à la première page
  goToFirst() {
    this.currentPage = 1;
  }

  // Aller à la dernière page
  goToLast() {
    this.currentPage = this.totalPages;
  }

  // Gérer le zoom
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

  // Réinitialiser le zoom
  resetZoom() {
    this.zoom = 1.0;
    this.fitToPage = true;
  }

  // Gérer la saisie dans l'input de page
  onPageInputChange(event: any) {
    const value = parseInt(event.target.value);
    if (!isNaN(value)) {
      this.goToPage(value);
    }
  }

  // Gérer l'appui sur Entrée dans l'input de page
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