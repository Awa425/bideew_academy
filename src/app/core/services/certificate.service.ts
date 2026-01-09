import { Injectable } from '@angular/core';
import { jsPDF } from 'jspdf';
import { Observable, of } from 'rxjs';
import { AuthService } from './auth.service';
import { CourseService } from './course.service';

@Injectable({
  providedIn: 'root'
})
export class CertificateService {
  constructor(
    private authService: AuthService,
    private courseService: CourseService
  ) {}

  generateCertificate(courseId: string): Observable<Blob> {
    return new Observable(observer => {
      const user = this.authService.currentUserValue;
      if (!user) {
        observer.error('User not authenticated');
        return;
      }

      this.courseService.getCourseById(courseId).subscribe(course => {
        if (!course) {
          observer.error('Course not found');
          return;
        }

        const doc = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4'
        });
        doc.setFontSize(32);
        doc.setFont('helvetica', 'bold');
        doc.text('CERTIFICAT DE RÉUSSITE', 148, 40, { align: 'center' });

        doc.setFontSize(16);
        doc.setFont('helvetica', 'normal');
        doc.text('Ceci certifie que', 148, 60, { align: 'center' });

        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text(user.name, 148, 80, { align: 'center' });

        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.text('a réussi le cours', 148, 95, { align: 'center' });

        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(`« ${course.title} »`, 148, 115, { align: 'center' });

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Délivré le: ${new Date().toLocaleDateString('fr-FR')}`, 148, 130, { align: 'center' });

        const certNumber = `CYB-${Date.now()}-${user.id.substring(0, 4).toUpperCase()}`;
        doc.text(`N° de certificat: ${certNumber}`, 148, 140, { align: 'center' });

        doc.setFontSize(10);
        doc.text('Directeur des études', 70, 180);
        doc.line(60, 182, 120, 182);

        doc.text('Cyber Academy', 227, 180, { align: 'right' });
        doc.line(180, 182, 240, 182);

        const pdfBlob = doc.output('blob');
        observer.next(pdfBlob);
        observer.complete();
      });
    });
  }

  downloadCertificate(courseId: string): void {
    this.generateCertificate(courseId).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificat-cybersecurite-${courseId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    });
  }

  getCertificateUrl(courseId: string): Observable<string> {
    return new Observable(observer => {
      this.generateCertificate(courseId).subscribe(blob => {
        const url = URL.createObjectURL(blob);
        observer.next(url);
        observer.complete();
      });
    });
  }
}
