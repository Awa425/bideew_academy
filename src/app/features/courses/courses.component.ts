import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { CourseService } from '../../core/services/course.service';
import { Course } from '../../core/models/course.model';
@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, RouterLink, NgIf],
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.scss'],
})
export class CoursesComponent implements OnInit {
  courses: Course[] = [];
  isLoading = false;
  error: string | null = null;
  filteredCourses: Course[] = [];
  searchQuery: string = '';

  currentPage = 1;
  lastPage = 1;
  itemsPerPage: number = 8; // Ajustez selon vos besoins
  totalItems: number = 0;

  constructor(private courseService: CourseService, private router: Router) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(page: number = 1): void {
    this.isLoading = true;
    this.courseService.getAllCourses(page).subscribe({
      next: (response) => {
        this.courses = response.data;
        this.filteredCourses = [...this.courses]; 
        this.currentPage = response.current_page;
        this.lastPage = response.last_page;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des cours';
        this.isLoading = false;
      },
    });
  }

  // Filtrage dynamique
  ngOnChanges() {
    this.filterCourses();
  }

  filterCourses(): void {
    const query = this.searchQuery.toLowerCase();
    this.filteredCourses = this.courses.filter(
      (course) =>
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query)
    );
  }

  getLevelLabel(level: string | undefined): string {
    if (!level) return 'Niveau inconnu';

    switch (level.toLowerCase()) {
      case 'beginner':
        return 'Débutant';
      case 'intermediate':
        return 'Intermédiaire';
      case 'advanced':
        return 'Avancé';
      default:
        return level;
    }
  }
  redirect(): void {
    this.router.navigate(['home']);
  }

  // redirectToCourseForm(): void {
  //   this.router.navigate(['/courses/new']);
  //   // Ou si vous utilisez l'alternative :
  //   // this.router.navigate(['/course-form']);
  // }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.lastPage) {
      this.loadCourses(page);
    }
  }
}
