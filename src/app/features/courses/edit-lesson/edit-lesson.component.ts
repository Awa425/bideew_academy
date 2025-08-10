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
    private courseService: CourseService
  ) {
    this.lessonForm = this.fb.group({
      title: ['', Validators.required],
      duration_minutes: ['', [Validators.required, Validators.min(1)]],
      contents: this.fb.array([this.createContentFormGroup()]),
    });
  }

  ngOnInit(): void {
    this.courseId = +this.route.snapshot.paramMap.get('courseId')!;
    this.lessonId = +this.route.snapshot.paramMap.get('lessonId')!;

    this.loadLessonData();
  }

  get contents(): FormArray {
    return this.lessonForm.get('contents') as FormArray;
  }

  loadLessonData(): void {
    this.courseService.getLessonsByIdLesson(this.courseId, this.lessonId).subscribe({
      next: (lesson: any) => {
        this.lessonForm.patchValue({
          title: lesson.title,
          duration_minutes: lesson.duration_minutes,
        });

        // Clear existing contents
        while (this.contents.length) {
          this.contents.removeAt(0);
        }

        // Add contents from the lesson
        if (lesson.contents && lesson.contents.length > 0) {
          lesson.contents.forEach((content: any) => {
            const contentGroup = this.createContentFormGroup();
            contentGroup.patchValue({
              type: content.type,
              data: content.data,
              external_url: content.external_url,
              // Note: File handling requires special treatment
            });
            this.contents.push(contentGroup);
          });
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
    this.contents.at(index).get('file')?.setValue(file);
  }

  onSubmit(): void {
    if (this.lessonForm.valid && this.courseId && this.lessonId) {
      const formValue = this.lessonForm.value;
      const formData = new FormData();

      formData.append('title', formValue.title || '');
      formData.append('course_id', this.courseId.toString());
      formData.append('duration_minutes', (formValue.duration_minutes || 0).toString());

      const contents = formValue.contents || [];
      if (contents.length > 0) {
        const content = contents[0];

        if (content && content.type && content.type.trim() !== '') {
          formData.append('content[type]', content.type);

          switch (content.type) {
            case 'pdf':
              if (content.file) {
                formData.append('content[file]', content.file, content.file.name);
              }
              break;
            case 'video':
              if (content.external_url && content.external_url.trim() !== '') {
                formData.append('content[external_url]', content.external_url.trim());
              }
              break;
            case 'text':
            case 'quiz':
              if (content.data && content.data.trim() !== '') {
                formData.append('content[data]', content.data.trim());
              }
              break;
          }
        }
      }

      this.courseService.updateLesson(this.lessonId, formData).subscribe({
        next: (response) => {
          console.log('Lesson updated successfully:', response);
          alert('Leçon modifiée avec succès !');
          this.goBack();
        },
        error: (err) => {
          console.error('Error updating lesson:', err);
          alert(`Erreur lors de la modification: ${err.error?.message || 'Erreur inconnue'}`);
        },
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/courses', this.courseId]);
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
    const durationValid = this.lessonForm.get('duration_minutes')?.valid ?? false;
    const contentsValid = this.contents.controls.every((control) => {
      const typeControl = control.get('type');
      return typeControl?.valid ?? false;
    });

    return titleValid && durationValid && contentsValid && this.contents.length > 0;
  }

  redirect_edit_lesson(lessonId: number): void {
  if (this.courseId) {
    this.router.navigate(['courses', this.courseId, 'edit-lesson', lessonId]);
  } else {
    console.error('ID du cours non disponible');
  }
}
}