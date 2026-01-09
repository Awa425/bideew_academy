import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CourseService } from '../../../core/services/course.service';
import { NotificationService } from '../../../core/services/notification.service';
import { SecureStorageService } from '../../../core/services/secure-storage.service';

@Component({
  selector: 'app-course-form',
  templateUrl: './course-form.component.html',
  styleUrls: ['./course-form.component.scss'],
  imports: [FormsModule, RouterLink],
})
export class CourseFormComponent implements OnInit {
  course = {
    title: '',
    description: '',
    prerequis: '',
    objectif: '',
    progression: 0,
    category: '',
    level: 'Beginner',
    image_path: null as File | null,
    duration_minutes: 0,
    is_published: true,
    user_id: 0,
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private courseService: CourseService,
    private notificationService: NotificationService,
    private secureStorage: SecureStorageService
  ) {}

  ngOnInit() {
    // Utilisation de SecureStorageService au lieu de localStorage
    const userId = this.secureStorage.getUserId();
    if (userId) {
      // Convertir la chaîne en nombre
      this.course.user_id = parseInt(userId, 10);
    } else {
      console.error('Aucun utilisateur connecté');
      this.notificationService.setErrorMessage('Vous devez être connecté pour créer un cours');
    }
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        this.notificationService.setErrorMessage('Le fichier est trop volumineux. Taille maximum : 5MB');
        event.target.value = '';
        return;
      }

      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
      ];
      if (!allowedTypes.includes(file.type)) {
        this.notificationService.setErrorMessage('Type de fichier non autorisé. Utilisez JPEG, PNG ou GIF.');
        event.target.value = '';
        return;
      }

      this.course.image_path = file;
      console.log(
        'Fichier sélectionné:',
        file.name,
        'Taille:',
        file.size,
        'Type:',
        file.type
      );
    }
  }

  validateForm(): boolean {
    if (!this.course.title || this.course.title.trim() === '') {
      this.notificationService.setErrorMessage('Le titre du cours est obligatoire');
      return false;
    }

    if (!this.course.description || this.course.description.trim() === '') {
      this.notificationService.setErrorMessage('La description du cours est obligatoire');
      return false;
    }

    if (!this.course.category || this.course.category.trim() === '') {
      this.notificationService.setErrorMessage('La catégorie du cours est obligatoire');
      return false;
    }

    if (this.course.duration_minutes <= 0) {
      this.notificationService.setErrorMessage('La durée du cours doit être supérieure à 0');
      return false;
    }

    if (this.course.user_id === 0) {
      this.notificationService.setErrorMessage('Erreur: utilisateur non identifié. Veuillez vous reconnecter.');
      return false;
    }

    return true;
  }

  submitForm() {
    if (!this.validateForm()) {
      return;
    }

    const formData = new FormData();

    formData.append('title', this.course.title.trim());
    formData.append('description', this.course.description.trim());
    formData.append('prerequis', this.course.prerequis.trim());
    formData.append('objectif', this.course.objectif.trim());
    formData.append('progression', this.course.progression.toString());
    formData.append('category', this.course.category.trim());
    formData.append('level', this.course.level);
    formData.append(
      'duration_minutes',
      this.course.duration_minutes.toString()
    );
    formData.append('is_published', this.course.is_published ? '1' : '0');
    formData.append('user_id', this.course.user_id.toString());

    if (this.course.image_path) {
      formData.append('image_path', this.course.image_path);
    }

    this.courseService.createCourse(formData).subscribe({
      next: (response) => {
        this.notificationService.setSuccessMessage('Cours créé avec succès!');
        this.router.navigate(['/courses']);
      },
      error: (error) => {
        console.error('Erreur lors de la création du cours:', error);
        this.notificationService.setErrorMessage('Erreur lors de la création du cours. Veuillez réessayer.');
      },
    });
  }
}