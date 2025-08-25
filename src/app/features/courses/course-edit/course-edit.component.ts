import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CourseService } from '../../../core/services/course.service';
import { AuthService } from '../../../core/services/auth.service';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-course-edit',
  templateUrl: './course-edit.component.html',
  styleUrls: ['./course-edit.component.scss'],
  imports: [
    NgIf,
    NgFor,
    RouterLink,
    ReactiveFormsModule
  ]
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

  levels = [
    { value: 'Débutant', label: 'Débutant' },
    { value: 'Intermédiaire', label: 'Intermédiaire' },
    { value: 'Avancé', label: 'Avancé' },
    { value: 'Expert', label: 'Expert' }
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
    // Vérifier les permissions
    // if (this.users?.user?.role === 'apprenant') {
    //   this.router.navigate(['/courses']);
    //   return;
    // }

    this.route.params.subscribe(params => {
      this.courseId = +params['id'];
      if (this.courseId) {
        this.loadCourse();
      }
    });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
      level: ['', Validators.required],
      duration_minutes: ['', [Validators.required, Validators.min(1), Validators.max(10000)]],
      prerequis: [''],
      learning_objectives: [''],
      // content: ['', Validators.required],
      is_active: [true]
    });
  }

  loadCourse(): void {
    this.isLoading = true;
    this.error = null;

    this.courseService.getCourseById(this.courseId).subscribe({
      next: (course: any) => {
        this.currentCourse = course;
        this.populateForm(course);
        this.isLoading = false;
        
        // Charger l'image actuelle pour l'aperçu
        if (course.image_path) {
          this.imagePreview = `http://localhost:8000/${course.image_path}`;
        }
      },
      error: (error: any) => {
        this.error = 'Erreur lors du chargement du cours';
        this.isLoading = false;
        console.error('Erreur:', error);
      }
    });
  }

  private populateForm(course: any): void {
    this.editCourseForm.patchValue({
      title: course.title,
      description: course.description,
      level: course.level,
      duration_minutes: course.duration_minutes,
      prerequis: course.prerequis || '',
      learning_objectives: course.learning_objectives || '',
      // content: course.content,
      is_active: course.is_active
    });
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.selectedFile = target.files[0];
      
      // Validation du fichier
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      const maxSize = 5 * 1024 * 1024; // 5MB

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

      // Créer un aperçu de l'image
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
    this.imagePreview = this.currentCourse?.image_path ? 
      `http://localhost:8000/${this.currentCourse.image_path}` : null;
    
    // Reset l'input file
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

      // const formData = new FormData();
      
      // Ajouter les données du formulaire
      // Object.keys(this.editCourseForm.controls).forEach(key => {
      //   const value = this.editCourseForm.get(key)?.value;
      //   if (value !== null && value !== undefined) {
      //     formData.append(key, value.toString());
      //   }
      // });

      // Ajouter l'image si elle a été sélectionnée
      // if (this.selectedFile) {
      //   formData.append('image', this.selectedFile);
      // }

      // console.log(this.editCourseForm.value);
      
      this.courseService.updateCourse(this.courseId, this.editCourseForm.value).subscribe({
        next: (response:any) => {
          this.isSaving = false;
          this.successMessage = 'Cours modifié avec succès !';
          
          // Rediriger après un délai
          setTimeout(() => {
            this.router.navigate(['/courses', this.courseId]);
          }, 2000);
        },
        error: (error:any) => {
          this.isSaving = false;
          this.error = 'Erreur lors de la modification du cours';
          console.error('Erreur:', error);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.editCourseForm.controls).forEach(key => {
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
        return `${this.getFieldLabel(fieldName)} doit contenir au moins ${field.errors['minlength'].requiredLength} caractères.`;
      }
      if (field.errors['maxlength']) {
        return `${this.getFieldLabel(fieldName)} ne peut pas dépasser ${field.errors['maxlength'].requiredLength} caractères.`;
      }
      if (field.errors['min']) {
        return `${this.getFieldLabel(fieldName)} doit être supérieur à ${field.errors['min'].min}.`;
      }
      if (field.errors['max']) {
        return `${this.getFieldLabel(fieldName)} ne peut pas dépasser ${field.errors['max'].max}.`;
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
      // content: 'Le contenu'
    };
    return labels[fieldName] || fieldName;
  }

  onCancel(): void {
    if (this.hasUnsavedChanges()) {
      if (confirm('Vous avez des modifications non sauvegardées. Voulez-vous vraiment quitter ?')) {
        this.router.navigate(['/courses', this.courseId]);
      }
    } else {
      this.router.navigate(['/courses', this.courseId]);
    }
  }

  private hasUnsavedChanges(): boolean {
    if (!this.currentCourse) return false;
    
    const currentValues = this.editCourseForm.value;
    return (
      currentValues.title !== this.currentCourse.title ||
      currentValues.description !== this.currentCourse.description ||
      currentValues.level !== this.currentCourse.level ||
      currentValues.duration_minutes !== this.currentCourse.duration_minutes ||
      currentValues.prerequis !== (this.currentCourse.prerequis || '') ||
      currentValues.learning_objectives !== (this.currentCourse.learning_objectives || '') ||
      // currentValues.content !== this.currentCourse.content ||
      currentValues.is_active !== this.currentCourse.is_active ||
      this.selectedFile !== null
    );
  }
}