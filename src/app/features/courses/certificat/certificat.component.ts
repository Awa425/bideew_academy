import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { NgIf } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-certificat',
  imports: [NgIf, RouterLink],
  templateUrl: './certificat.component.html',
  styleUrl: './certificat.component.scss',
})
export class CertificatComponent implements OnInit {
  certificat: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.courseService.generedCertificat(1).subscribe((data: any) => {
      this.courseService
        .getCertificat(data.certificate_id)
        .subscribe((pdfBlob: Blob) => {
          const unsafeUrl = URL.createObjectURL(pdfBlob);
          this.certificat =
            this.sanitizer.bypassSecurityTrustResourceUrl(unsafeUrl);
        });
    });
  }
}
