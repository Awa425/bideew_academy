import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CourseService } from '../../../core/services/course.service';

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
    private courseService: CourseService
  ) {}

  ngOnInit() {
    const userData = localStorage.getItem('user_id');
    if (userData) {
      const user = JSON.parse(userData);
      this.course.user_id = user.id || user.user_id || 1;
    } else {
      console.error('Aucun utilisateur connecté');
    }
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('Le fichier est trop volumineux. Taille maximum : 5MB');
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
        alert('Type de fichier non autorisé. Utilisez JPEG, PNG ou GIF.');
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
      alert('Le titre du cours est obligatoire');
      return false;
    }

    if (!this.course.description || this.course.description.trim() === '') {
      alert('La description du cours est obligatoire');
      return false;
    }

    if (!this.course.category || this.course.category.trim() === '') {
      alert('La catégorie du cours est obligatoire');
      return false;
    }

    if (this.course.duration_minutes <= 0) {
      alert('La durée du cours doit être supérieure à 0');
      return false;
    }

    if (this.course.user_id === 0) {
      alert('Erreur: utilisateur non identifié. Veuillez vous reconnecter.');
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
    console.log(formData);

    this.courseService.createCourse(formData).subscribe({
      next: (response) => {
        console.log('Cours créé avec succès:', response);
        alert('Cours créé avec succès!');
        this.router.navigate(['/courses']);
      },
      error: (error) => {
        console.error('Erreur lors de la création du cours:', error);
        alert('Erreur lors de la création du cours. Veuillez réessayer.');
      },
    });
  }
}
