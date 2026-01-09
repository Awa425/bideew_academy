import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CourseService } from '../../../core/services/course.service';
import { AuthService } from '../../../core/services/auth.service';
import { NgFor, NgIf } from '@angular/common';
import { envVars } from 'environments/environments';

@Component({
  selector: 'app-course-edit',
  templateUrl: './course-edit.component.html',
  styleUrls: ['./course-edit.component.scss'],
  imports: [NgIf, NgFor, RouterLink, ReactiveFormsModule],
})
export class CourseEditComponent implements OnInit {
  editCourseForm: FormGroup;
  courseId: number;
  isLoading = false;
  isSaving = false;
  error: string | null = null;
  successMessage: string | null = null;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  currentCourse: any = null;
  apiBaseUrlImage = envVars.apiBaseUrlImage;

  shouldRemoveImage = false;

  levels = [
    { value: 'Débutant', label: 'Débutant' },
    { value: 'Intermédiaire', label: 'Intermédiaire' },
    { value: 'Avancé', label: 'Avancé' },
    { value: 'Expert', label: 'Expert' },
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    public users: AuthService
  ) {
    this.editCourseForm = this.createForm();
    this.courseId = 0;
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.courseId = +params['id'];
      if (this.courseId) {
        this.loadCourse();
      }
    });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      title: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(255),
        ],
      ],
      description: [
        '',
        [
          Validators.required
        ],
      ],
      level: ['', Validators.required],
      duration_minutes: [
        '',
        [Validators.required, Validators.min(1), Validators.max(10000)],
      ],
      prerequis: [''],
      learning_objectives: [''],
      is_active: [true], // Valeur par défaut: true
    });
  }

  loadCourse(): void {
    this.isLoading = true;
    this.error = null;
    this.shouldRemoveImage = false;

    this.courseService.getCourseById(this.courseId).subscribe({
      next: (course: any) => {
        this.currentCourse = course;

        this.populateForm(course);
        this.isLoading = false;
        if (course.image_path) {
          this.imagePreview = `${course.image_path}`;
        } else {
          this.imagePreview = null;
        }
      },
      error: (error: any) => {
        console.error('Erreur chargement cours:', error);
        this.error = 'Erreur lors du chargement du cours';
        this.isLoading = false;
      },
    });
  }

  private populateForm(course: any): void {
    this.editCourseForm.patchValue({
      title: course.title,
      description: course.description,
      level: course.level,
      duration_minutes: course.duration_minutes,
      prerequis: course.prerequis || '',
      learning_objectives: course.objectif || '',
      is_active: course.is_published !== undefined ? course.is_published : true, // Backend utilise is_published
    });
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.selectedFile = target.files[0];
      this.shouldRemoveImage = false; 
      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
      ];
      const maxSize = 5 * 1024 * 1024;

      if (!allowedTypes.includes(this.selectedFile.type)) {
        this.error = 'Type de fichier non supporté. Utilisez JPG, PNG ou GIF.';
        this.selectedFile = null;
        return;
      }

      if (this.selectedFile.size > maxSize) {
        this.error = 'Le fichier est trop volumineux. Taille maximale : 5MB.';
        this.selectedFile = null;
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(this.selectedFile);

      this.error = null;
    }
  }

  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    this.shouldRemoveImage = true;

    const fileInput = document.getElementById('image') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  onSubmit(): void {
    if (this.editCourseForm.valid) {
      this.isSaving = true;
      this.error = null;
      this.successMessage = null;

      // Protection timeout: débloquer après 30 secondes si aucune réponse
      setTimeout(() => {
        if (this.isSaving) {
          this.isSaving = false;
          this.error = 'La requête a expiré. Veuillez réessayer.';
        }
      }, 30000); // 30 secondes

      if (this.selectedFile || this.shouldRemoveImage) {
        this.updateCourseWithImage();
      } else {
        this.updateCourseWithoutImage();
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private updateCourseWithImage(): void {
    const formData = new FormData();

    // Mapping des champs pour correspondre au backend Laravel
    const fieldMapping: { [key: string]: string } = {
      'learning_objectives': 'objectif',
      'is_active': 'is_published'
    };

    Object.keys(this.editCourseForm.value).forEach((key) => {
      const value = this.editCourseForm.value[key];
      if (value !== null && value !== undefined) {
        // Utiliser le nom mappé ou le nom original
        const backendKey = fieldMapping[key] || key;

        // Conversion spéciale pour les booleans
        let valueToSend: string;
        if (typeof value === 'boolean') {
          valueToSend = value ? '1' : '0'; // Laravel préfère 1/0 pour les booleans
        } else {
          valueToSend = value.toString();
        }

        formData.append(backendKey, valueToSend);
      }
    });

    if (this.selectedFile) {
      // Le backend attend 'image_path' pour le fichier image
      formData.append('image_path', this.selectedFile, this.selectedFile.name);
    }

    if (this.shouldRemoveImage) {
      formData.append('remove_image', 'true');
    }

    this.courseService.updateCourse(this.courseId, formData).subscribe({
      next: (response) => this.handleUpdateSuccess(response),
      error: (error) => this.handleUpdateError(error),
    });
  }

  private updateCourseWithoutImage(): void {
    // Convertir l'objet en FormData pour cohérence avec l'API
    const formData = new FormData();

    // Mapping des champs pour correspondre au backend Laravel
    const fieldMapping: { [key: string]: string } = {
      'learning_objectives': 'objectif',  // Frontend → Backend
      'is_active': 'is_published'         // Frontend → Backend
    };

    Object.keys(this.editCourseForm.value).forEach((key) => {
      const value = this.editCourseForm.value[key];
      if (value !== null && value !== undefined) {
        // Utiliser le nom mappé ou le nom original
        const backendKey = fieldMapping[key] || key;

        // Conversion spéciale pour les booleans
        let valueToSend: string;
        if (typeof value === 'boolean') {
          valueToSend = value ? '1' : '0'; // Laravel préfère 1/0 pour les booleans
        } else {
          valueToSend = value.toString();
        }

        formData.append(backendKey, valueToSend);
      }
    });

    this.courseService.updateCourse(this.courseId, formData).subscribe({
      next: (response) => this.handleUpdateSuccess(response),
      error: (error) => this.handleUpdateError(error),
    });
  }

  private handleUpdateSuccess(response: any): void {
    this.isSaving = false;
    this.successMessage = 'Cours modifié avec succès !';

    this.shouldRemoveImage = false;
    this.selectedFile = null;

    setTimeout(() => {
      this.loadCourse();
    }, 500);

    setTimeout(() => {
      this.router.navigate(['/courses']);
    }, 2000);
  }

  private handleUpdateError(error: any): void {
    console.error('Erreur lors de la modification du cours:', error);

    // IMPORTANT: Toujours débloquer le bouton en cas d'erreur
    this.isSaving = false;

    let errorMessage = 'Erreur lors de la modification du cours';

    if (error.status === 0) {
      errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion internet.';
    } else if (error.error?.message) {
      errorMessage += ': ' + error.error.message;
    } else if (error.error?.errors) {
      const firstError = Object.values(error.error.errors)[0];
      if (Array.isArray(firstError)) {
        errorMessage += ': ' + firstError[0];
      }
    } else if (error.message) {
      errorMessage += ': ' + error.message;
    }

    this.error = errorMessage;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.editCourseForm.controls).forEach((key) => {
      const control = this.editCourseForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.editCourseForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.editCourseForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} est requis.`;
      }
      if (field.errors['minlength']) {
        return `${this.getFieldLabel(fieldName)} doit contenir au moins ${
          field.errors['minlength'].requiredLength
        } caractères.`;
      }
      if (field.errors['maxlength']) {
        return `${this.getFieldLabel(fieldName)} ne peut pas dépasser ${
          field.errors['maxlength'].requiredLength
        } caractères.`;
      }
      if (field.errors['min']) {
        return `${this.getFieldLabel(fieldName)} doit être supérieur à ${
          field.errors['min'].min
        }.`;
      }
      if (field.errors['max']) {
        return `${this.getFieldLabel(fieldName)} ne peut pas dépasser ${
          field.errors['max'].max
        }.`;
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      title: 'Le titre',
      description: 'La description',
      level: 'Le niveau',
      duration_minutes: 'La durée',
    };
    return labels[fieldName] || fieldName;
  }

  onCancel(): void {
    if (this.hasUnsavedChanges()) {
      if (
        confirm(
          'Vous avez des modifications non sauvegardées. Voulez-vous vraiment quitter ?'
        )
      ) {
        this.router.navigate(['/courses', this.courseId]);
      }
    } else {
      this.router.navigate(['/courses', this.courseId]);
    }
  }

  private hasUnsavedChanges(): boolean {
    if (!this.currentCourse) return false;

    const currentValues = this.editCourseForm.value;
    const hasTextChanges =
      currentValues.title !== this.currentCourse.title ||
      currentValues.description !== this.currentCourse.description ||
      currentValues.level !== this.currentCourse.level ||
      currentValues.duration_minutes !== this.currentCourse.duration_minutes ||
      currentValues.prerequis !== (this.currentCourse.prerequis || '') ||
      currentValues.learning_objectives !==
        (this.currentCourse.objectif || '') ||
      currentValues.is_active !== this.currentCourse.is_active;

    const hasImageChanges =
      this.selectedFile !== null || this.shouldRemoveImage;

    return hasTextChanges || hasImageChanges;
  }
}
