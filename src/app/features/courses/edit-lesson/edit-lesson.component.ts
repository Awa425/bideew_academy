import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CourseService } from '../../../core/services/course.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-edit-lesson',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatIconModule,
    MatCheckboxModule,
  ],
  templateUrl: './edit-lesson.component.html',
  styleUrls: ['./edit-lesson.component.scss'],
})
export class EditLessonComponent implements OnInit {
  lessonForm: FormGroup;
  courseId!: number;
  lessonId!: number;
  contentTypes = ['video', 'pdf', 'text', 'quiz'];
  isLoading = true;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private notificationService: NotificationService
  ) {
    this.lessonForm = this.fb.group({
      title: ['', Validators.required],
      duration_minutes: ['', [Validators.required, Validators.min(1)]],
      is_published: [false],
      is_locked: [false],
      contents: this.fb.array([this.createContentFormGroup()]),
    });
  }

  ngOnInit(): void {
    this.courseId = +this.route.snapshot.paramMap.get('id')!;
    this.lessonId = +this.route.snapshot.paramMap.get('lessonId')!;
    this.loadLessonData();
  }

  get contents(): FormArray {
    return this.lessonForm.get('contents') as FormArray;
  }

  loadLessonData(): void {
    this.courseService
      .getLessonsByIdLesson(this.courseId, this.lessonId)
      .subscribe({
        next: (lesson: any) => {
          this.lessonForm.patchValue({
            title: lesson.title,
            duration_minutes: lesson.duration_minutes,
            is_published: lesson.is_published,
            is_locked: lesson.is_locked,
          });

          while (this.contents.length) {
            this.contents.removeAt(0);
          }

          if (lesson.contents && lesson.contents.length > 0) {
            lesson.contents.forEach((content: any) => {
              const contentGroup = this.createContentFormGroup();
              contentGroup.patchValue({
                type: content.type,
                data: content.data,
                external_url: content.external_url,
                file_path: content.file_path,
              });
              this.contents.push(contentGroup);
            });
          } else {
            this.contents.push(this.createContentFormGroup());
          }

          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading lesson:', err);
          this.isLoading = false;
        },
      });
  }

  createContentFormGroup(): FormGroup {
    return this.fb.group({
      type: ['', Validators.required],
      data: [''],
      file: [null],
      file_path: [''],
      external_url: [''],
    });
  }

  addContent(): void {
    this.contents.push(this.createContentFormGroup());
  }

  removeContent(index: number): void {
    this.contents.removeAt(index);
  }

  onFileChange(event: any, index: number): void {
    const file = event.target.files[0];
    if (file) {
      this.contents.at(index).get('file')?.setValue(file);
      this.contents.at(index).get('file_path')?.setValue('');
    }
  }

  onSubmit(): void {
    if (this.lessonForm.valid && this.courseId && this.lessonId) {
      // Créer un FormData pour l'envoi
      const formData = new FormData();

      // Ajouter les champs de base
      formData.append('title', this.lessonForm.get('title')?.value);
      formData.append('duration_minutes', this.lessonForm.get('duration_minutes')?.value.toString());
      formData.append('is_published', this.lessonForm.get('is_published')?.value ? '1' : '0');
      formData.append('is_locked', this.lessonForm.get('is_locked')?.value ? '1' : '0');

      // Gérer les contenus
      const contents = this.contents.value;
      contents.forEach((content: any, index: number) => {
        formData.append(`content[${index}][type]`, content.type);

        if (content.type === 'text' && content.data) {
          formData.append(`content[${index}][data]`, content.data);
        } else if (content.type === 'video') {
          if (content.file) {
            // Nouveau fichier uploadé
            formData.append(`content[${index}][file]`, content.file);
          } else if (content.external_url) {
            formData.append(`content[${index}][external_url]`, content.external_url);
          }
        } else if (content.type === 'pdf' && content.file) {
          formData.append(`content[${index}][file]`, content.file);
        }
      });

      this.courseService
        .updateLesson(this.lessonId, formData)
        .subscribe({
          next: (response) => {
            this.notificationService.setSuccessMessage('Leçon modifiée avec succès !');
            this.goBack();
          },
          error: (err) => {
            console.error('Error updating lesson:', err);
            this.notificationService.setErrorMessage(
              `Erreur lors de la modification: ${
                err.error?.message || 'Erreur inconnue'
              }`
            );
          },
        });
    }
  }

  goBack(): void {
    this.router.navigate(['/courses', this.courseId, 'lessons']);
  }

  getContentIcon(type: string): string {
    const icons: { [key: string]: string } = {
      video: 'play_circle',
      pdf: 'picture_as_pdf',
      text: 'article',
      quiz: 'quiz',
    };
    return icons[type] || 'description';
  }

  getContentLabel(type: string): string {
    const labels: { [key: string]: string } = {
      video: 'Vidéo',
      pdf: 'Document PDF',
      text: 'Contenu textuel',
      quiz: 'Quiz interactif',
    };
    return labels[type] || type.toUpperCase();
  }

  canSubmitForm(): boolean {
    const titleValid = this.lessonForm.get('title')?.valid ?? false;
    const durationValid =
      this.lessonForm.get('duration_minutes')?.valid ?? false;
    const contentsValid = this.contents.controls.every((control) => {
      const typeControl = control.get('type');
      return typeControl?.valid ?? false;
    });

    return (
      titleValid && durationValid && contentsValid && this.contents.length > 0
    );
  }
}
