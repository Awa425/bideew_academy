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
import { MatCheckboxModule } from '@angular/material/checkbox'; // ← AJOUT MANQUANT !
import { CourseService } from '../../../core/services/course.service';

@Component({
  selector: 'app-form-lesson',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatIconModule,
    MatCheckboxModule, // ← AJOUT MANQUANT !
  ],
  templateUrl: './form-lesson.component.html',
  styleUrls: ['./form-lesson.component.scss'],
})
export class FormLessonComponent implements OnInit {
  lessonForm: FormGroup;
  courseId!: number;
  contentTypes = ['video', 'pdf', 'text', 'quiz'];
  videoInputType: 'url' | 'upload' = 'url';
  quizInputType: 'text' | 'upload' = 'text';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private lessonService: CourseService
  ) {
    this.lessonForm = this.fb.group({
      title: ['', Validators.required],
      // order: ['', [Validators.required, Validators.min(1)]],
      duration_minutes: ['', [Validators.required, Validators.min(1)]],
      // is_published: [false],
      // is_locked: [false],
      contents: this.fb.array([this.createContentFormGroup()]),
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.courseId = +id;
    } else {
      console.error('Course ID is missing');
      this.router.navigate(['/courses']);
    }
  }

  // createContentFormGroup(): FormGroup {
  //   return this.fb.group({
  //     type: ['', Validators.required],
  //     data: [''],
  //     file: [null],
  //     external_url: [''],
  //   });
  // }

  get contents(): FormArray {
    return this.lessonForm.get('contents') as FormArray;
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

  goBack(): void {
    this.router.navigate(['/courses', this.courseId]);
  }

  // Remplace ta méthode onSubmit par cette version corrigée

  // onSubmit(): void {
  //   if (this.lessonForm.valid && this.courseId) {
  //     const lessonData = {
  //       title: this.lessonForm.get('title')?.value || '',
  //       // order: this.lessonForm.get('order')?.value || 0,
  //       duration_minutes: this.lessonForm.get('duration_minutes')?.value || 0,
  //       // is_published: this.lessonForm.get('is_published')?.value || false,
  //       // is_locked: this.lessonForm.get('is_locked')?.value || false,
  //       course_id: this.courseId,
  //       contents: this.lessonForm.get('contents')?.value || [],
  //     };

  //     console.log('Lesson data to send:', lessonData);

  //     // Si ton service accepte du JSON :
  //     // this.lessonService.createLessonJSON(lessonData).subscribe({...});

  //     // Ou convertir en FormData seulement si nécessaire :
  //     const formData = new FormData();
  //     Object.keys(lessonData).forEach((key) => {
  //       if (key === 'contents') {
  //         formData.append(key, JSON.stringify(lessonData.contents));
  //       } else {
  //         formData.append(
  //           key,
  //           String(lessonData[key as keyof typeof lessonData])
  //         );
  //       }
  //     });

  //     // console.log('FormData entries:');
  //     // for (let pair of formData.entries()) {
  //     //   console.log(pair[0] + ': ' + pair[1]);
  //     // }

  //     this.lessonService.createLesson(this.courseId ,formData).subscribe({
  //       next: () => this.goBack(),
  //       error: (err) => console.error('Erreur:', err),
  //     });
  //   }
  // }
  onSubmit(): void {
    console.log('=== SUBMIT FINAL ===');

    if (this.lessonForm.valid && this.courseId) {
      const formValue = this.lessonForm.value;
      const formData = new FormData();

      // ✅ CHAMPS DE BASE (exactement comme dans Postman)
      formData.append('title', formValue.title || '');
      formData.append('course_id', this.courseId.toString()); // ✅ Ajouté car présent dans Postman
      formData.append('order', (formValue.order || 3).toString()); // ✅ Valeur par défaut
      formData.append(
        'duration_minutes',
        (formValue.duration_minutes || 0).toString()
      );
      // formData.append('is_published', 'false'); // ✅ Comme dans Postman
      formData.append('is_locked', 'true'); // ✅ Comme dans Postman

      // ✅ CONTENU (format exact de Postman)
      const contents = formValue.contents || [];
      if (contents.length > 0) {
        const content = contents[0];

        if (content && content.type && content.type.trim() !== '') {
          // ✅ Format exact: content[type] et content[file]
          formData.append('content[type]', content.type);

          switch (content.type) {
            case 'pdf':
              if (content.file) {
                formData.append(
                  'content[file]',
                  content.file,
                  content.file.name
                );
                console.log('📎 PDF file:', content.file.name);
              } else {
                console.error('❌ Fichier PDF manquant');
                alert('Veuillez sélectionner un fichier PDF');
                return;
              }
              break;

            case 'video':
              if (content.external_url && content.external_url.trim() !== '') {
                formData.append(
                  'content[external_url]',
                  content.external_url.trim()
                );
                console.log('🎥 Video URL:', content.external_url);
              } else {
                console.error('❌ URL vidéo manquante');
                alert('Veuillez saisir une URL de vidéo');
                return;
              }
              break;

            case 'text':
            case 'quiz':
              if (content.data && content.data.trim() !== '') {
                formData.append('content[data]', content.data.trim());
                console.log('📄 Text/Quiz data added');
              } else {
                console.error('❌ Contenu texte/quiz manquant');
                alert('Veuillez saisir le contenu texte/quiz');
                return;
              }
              break;
          }
        } else {
          console.error('❌ Type de contenu manquant');
          alert('Veuillez sélectionner un type de contenu');
          return;
        }
      } else {
        console.error('❌ Aucun contenu');
        alert('Veuillez ajouter au moins un contenu');
        return;
      }

      // ✅ DEBUG: Afficher exactement ce qui est envoyé
      console.log('📤 FormData envoyée:');
      for (let pair of formData.entries()) {
        if (pair[1] instanceof File) {
          console.log(
            `  ${pair[0]}: File(${pair[1].name}, ${pair[1].size} bytes)`
          );
        } else {
          console.log(`  ${pair[0]}: "${pair[1]}"`);
        }
      }

      // ✅ ENVOI
      this.lessonService.createLesson(this.courseId, formData).subscribe({
        next: (response) => {
          console.log('✅ SUCCESS:', response);
          alert('Leçon créée avec succès !');
          this.goBack();
        },
        error: (err) => {
          console.error('❌ ERREUR:', err);

          if (err.status === 422) {
            console.error('🔍 Erreurs de validation:', err.error?.errors);
            let errorMsg = 'Erreurs de validation:\n';
            if (err.error?.errors) {
              Object.keys(err.error.errors).forEach((key) => {
                errorMsg += `- ${key}: ${err.error.errors[key].join(', ')}\n`;
              });
            }
            alert(errorMsg);
          } else {
            alert(
              `Erreur ${err.status}: ${err.error?.message || 'Erreur inconnue'}`
            );
          }
        },
      });
    } else {
      console.log('❌ FORM INVALID');
      this.debugFormValidation();
      alert('Veuillez corriger les erreurs du formulaire');
    }
  }

  // Ajoute ces méthodes à ton component existant (après les méthodes existantes)

  // Méthodes helper pour les icônes et labels
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

  // Ajoute ces méthodes dans ton component pour débugger le formulaire

  // Méthode pour déboguer la validation
  debugFormValidation(): void {
    console.log('=== DEBUG FORM VALIDATION ===');
    console.log('Form valid:', this.lessonForm.valid);
    console.log('Form errors:', this.lessonForm.errors);
    console.log('Form value:', this.lessonForm.value);

    // Debug chaque contrôle
    Object.keys(this.lessonForm.controls).forEach((key) => {
      const control = this.lessonForm.get(key);
      console.log(`${key}:`, {
        valid: control?.valid,
        errors: control?.errors,
        value: control?.value,
      });
    });

    // Debug spécifique pour le FormArray contents
    console.log('Contents FormArray:', {
      valid: this.contents.valid,
      errors: this.contents.errors,
      length: this.contents.length,
    });

    // Debug chaque contenu dans le FormArray
    this.contents.controls.forEach((control, index) => {
      console.log(`Content ${index}:`, {
        valid: control.valid,
        errors: control.errors,
        value: control.value,
      });
    });
  }

  // Méthode pour créer un FormGroup plus robuste
  createContentFormGroup(): FormGroup {
    return this.fb.group({
      type: ['', Validators.required],
      data: [''], // Pas de validation required par défaut
      file: [null],
      external_url: [''],
    });
  }

  // Méthode alternative pour vérifier si le formulaire peut être soumis
  canSubmitForm(): boolean {
    // Vérifications de base avec gestion des undefined
    const titleValid = this.lessonForm.get('title')?.valid ?? false;
    // const orderValid = this.lessonForm.get('order')?.valid ?? false;
    const durationValid =
      this.lessonForm.get('duration_minutes')?.valid ?? false;
    const basicFieldsValid = titleValid && durationValid;

    // Vérification que chaque contenu a au moins un type sélectionné
    const contentsValid = this.contents.controls.every((control) => {
      const typeControl = control.get('type');
      return typeControl?.valid ?? false;
    });

    return basicFieldsValid && contentsValid && this.contents.length > 0;
  }

  // Méthode pour forcer la validation
  forceValidation(): void {
    this.lessonForm.markAllAsTouched();
    this.contents.controls.forEach((control) => {
      control.markAllAsTouched();
    });
  }
}
