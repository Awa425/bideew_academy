import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CourseService } from '../../../core/services/course.service';

@Component({
  selector: 'app-course-form',
  templateUrl: './course-form.component.html',
  styleUrls: ['./course-form.component.scss'],
  imports: [FormsModule],
})
export class CourseFormComponent {
  course = {
    title: '',
    description: '',
    prerequis: '',
    objectif: '',
    progression: 0,
    category: '',
    level: 'Beginner',
    image_path: null as File | null, // Modifié pour accepter un File
    duration_minutes: 0,
    is_published: true,
    user_id: 0,
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private courseService: CourseService
  ) {}

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.course.image_path = file;
    }
  }

  submitForm() {
  const formData = new FormData();
  
  // Conversion robuste de is_published en chaîne acceptable par le backend
  const isPublished = Boolean(this.course.is_published);
  
  // Ajout de tous les champs au FormData
  Object.keys(this.course).forEach(key => {
    if (key === 'is_published') {
      // Solution 1: Envoyer comme '1'/'0' (recommandé pour la plupart des backends)
      formData.append(key, isPublished ? '1' : '0');
      
      // OU Solution 2: Envoyer comme 'true'/'false'
      // formData.append(key, isPublished.toString());
    } else {
      const value = this.course[key as keyof typeof this.course];
      if (value !== null && value !== undefined) {
        formData.append(key, value instanceof File ? value : String(value));
      }
    }
  });

  this.courseService.createCourse(formData).subscribe({
    next: (response) => {
      alert('Cours ajouté avec succès !');
      this.router.navigate(['/courses']);
    },
    error: (error) => {
      console.error("Erreur lors de l'ajout du cours:", error);
      alert('Une erreur est survenue.');
    }
  });
}
}
