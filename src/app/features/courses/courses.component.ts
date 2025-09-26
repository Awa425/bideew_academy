import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { CourseService } from '../../core/services/course.service';
import { Course } from '../../core/models/course.model';
import { AuthService } from '../../core/services/auth.service';
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
  itemsPerPage: number = 8;
  totalItems: number = 0;
  userId: string | null = '';
  users: any = [];

  showDeleteModal = false;
  courseToDelete: Course | null = null;
  isDeleting = false;

  constructor(
    private courseService: CourseService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userId = localStorage.getItem('user_id');
    this.authService.getUserById(this.userId).subscribe((data) => {
      this.users = data;
      this.loadCourses(this.users);
    });
  }

  loadCourses(users: any, page: number = 1): void {
    if (users?.user?.role === 'apprenant') {
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
    } else {
      this.isLoading = true;
      this.courseService
        .getAllCoursesByFormateur(users.user.id, page)
        .subscribe({
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
  }

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

  goToPage(page: number): void {
    if (page >= 1 && page <= this.lastPage) {
      this.loadCourses(this.users, page);
    }
  }

  confirmDelete(idCour: any): void {
  if (!this.courseToDelete) return;

  this.isDeleting = true;
  this.courseService.deleteCourse(idCour).subscribe({
    next: () => {
      this.isDeleting = false;
      this.courses = this.courses.filter(course => course.id !== idCour);
      this.filteredCourses = this.filteredCourses.filter(course => course.id !== idCour);
      this.closeDeleteModal();
    },
    error: (err) => {
      this.isDeleting = false;
    }
  });
}

openDeleteConfirmation(course: any): void {
  this.courseToDelete = course;
  this.showDeleteModal = true;
}

closeDeleteModal(): void {
  this.courseToDelete = null;
  this.showDeleteModal = false;
}

}
