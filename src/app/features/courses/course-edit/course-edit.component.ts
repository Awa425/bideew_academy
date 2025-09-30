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
  
  // Nouveau flag pour indiquer si l'image doit être supprimée
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
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(1000),
        ],
      ],
      level: ['', Validators.required],
      duration_minutes: [
        '',
        [Validators.required, Validators.min(1), Validators.max(10000)],
      ],
      prerequis: [''],
      learning_objectives: [''],
      is_active: [true],
    });
  }

  loadCourse(): void {
    this.isLoading = true;
    this.error = null;
    this.shouldRemoveImage = false; // Réinitialiser le flag

    this.courseService.getCourseById(this.courseId).subscribe({
      next: (course: any) => {
        this.currentCourse = course;
        console.log('Cours chargé:', this.currentCourse);
        
        this.populateForm(course);
        this.isLoading = false;
        if (course.image_path) {
          this.imagePreview = `${envVars.apiBaseUrl}.'/'.${course.image_path}`;
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
      is_active: course.is_active,
    });
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.selectedFile = target.files[0];
      this.shouldRemoveImage = false; // Réinitialiser le flag de suppression
      
      console.log('Fichier sélectionné:', {
        name: this.selectedFile.name,
        size: this.selectedFile.size,
        type: this.selectedFile.type
      });
      
      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
      ];
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
      
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
        console.log('Aperçu de l\'image généré');
      };
      reader.readAsDataURL(this.selectedFile);

      this.error = null;
    }
  }

  removeImage(): void {
    console.log('Suppression de l\'image demandée');
    this.selectedFile = null;
    this.imagePreview = null;
    this.shouldRemoveImage = true; // Marquer l'image pour suppression
    
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

      // Si il y a une image à traiter (nouvelle ou suppression)
      if (this.selectedFile || this.shouldRemoveImage) {
        console.log('Mise à jour avec gestion d\'image');
        this.updateCourseWithImage();
      } else {
        console.log('Mise à jour sans changement d\'image');
        this.updateCourseWithoutImage();
      }
    } else {
      console.log('Formulaire invalide');
      this.markFormGroupTouched();
    }
  }

  private updateCourseWithImage(): void {
    const formData = new FormData();
    
    // Ajouter les champs du formulaire
    Object.keys(this.editCourseForm.value).forEach(key => {
      const value = this.editCourseForm.value[key];
      if (value !== null && value !== undefined) {
        formData.append(key, value.toString());
      }
    });

    // Ajouter le fichier image s'il existe
    if (this.selectedFile) {
      console.log('Ajout du fichier au FormData:', this.selectedFile.name);
      formData.append('image', this.selectedFile, this.selectedFile.name);
    }

    // Indiquer si l'image doit être supprimée
    if (this.shouldRemoveImage) {
      console.log('Ajout du flag de suppression d\'image');
      formData.append('remove_image', 'true');
    }

    // Debug: Afficher le contenu du FormData
    console.log('FormData contenu:');
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    this.courseService.updateCourse(this.courseId, formData)
      .subscribe({
        next: (response) => this.handleUpdateSuccess(response),
        error: (error) => this.handleUpdateError(error)
      });
  }

  private updateCourseWithoutImage(): void {
    const courseData = { ...this.editCourseForm.value };
    
    console.log('Données du cours à envoyer:', courseData);
    
    this.courseService.updateCourse(this.courseId, courseData)
      .subscribe({
        next: (response) => this.handleUpdateSuccess(response),
        error: (error) => this.handleUpdateError(error)
      });
  }

  private handleUpdateSuccess(response: any): void {
    console.log('Réponse du serveur:', response);
    this.isSaving = false;
    this.successMessage = 'Cours modifié avec succès !';
    
    // Réinitialiser les flags
    this.shouldRemoveImage = false;
    this.selectedFile = null;
    
    // Recharger pour voir les changements
    setTimeout(() => {
      this.loadCourse();
    }, 500);
    
    setTimeout(() => {
      this.router.navigate(['/courses', this.courseId]);
    }, 2000);
  }

  private handleUpdateError(error: any): void {
    console.error('Erreur complète:', error);
    console.error('Status:', error.status);
    console.error('Message:', error.message);
    console.error('Error body:', error.error);
    
    this.isSaving = false;
    
    let errorMessage = 'Erreur lors de la modification du cours';
    if (error.error?.message) {
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
    const hasTextChanges = (
      currentValues.title !== this.currentCourse.title ||
      currentValues.description !== this.currentCourse.description ||
      currentValues.level !== this.currentCourse.level ||
      currentValues.duration_minutes !== this.currentCourse.duration_minutes ||
      currentValues.prerequis !== (this.currentCourse.prerequis || '') ||
      currentValues.learning_objectives !== (this.currentCourse.objectif || '') ||
      currentValues.is_active !== this.currentCourse.is_active
    );

    const hasImageChanges = (
      this.selectedFile !== null ||
      this.shouldRemoveImage
    );

    return hasTextChanges || hasImageChanges;
  }

  // Méthode de test pour debug
  // testImageUpload(): void {
  //   if (this.selectedFile) {
  //     console.log('Test d\'upload d\'image');
  //     const formData = new FormData();
  //     formData.append('image', this.selectedFile);
      
  //     this.courseService.uploadCourseImage(this.courseId, formData).subscribe({
  //       next: (response) => {
  //         console.log('Image uploadée avec succès:', response);
  //         this.loadCourse(); // Recharger pour voir l'image
  //       },
  //       error: (error) => {
  //         console.error('Erreur upload image:', error);
  //       }
  //     });
  //   }
  // }
}