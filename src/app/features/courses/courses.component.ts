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
  itemsPerPage: number = 8; // Ajustez selon vos besoins
  totalItems: number = 0;
  userId: string | null = '';
  users: any = [];

  // Variables pour la modal de confirmation
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

  // goToPage(page: number): void {
  //   if (page >= 1 && page <= this.lastPage) {
  //     this.loadCourses(page);
  //   }
  // }
  goToPage(page: number): void {
    if (page >= 1 && page <= this.lastPage) {
      this.loadCourses(this.users, page); // Passez this.users comme premier paramètre
    }
  }

  // Méthodes pour la gestion de la suppression
  openDeleteConfirmation(course: Course): void {
    this.courseToDelete = course;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.courseToDelete = null;
    this.isDeleting = false;
  }

  confirmDelete(): void {
    if (!this.courseToDelete) return;

    this.isDeleting = true;

    // this.courseService.deleteCourse(this.courseToDelete.id).subscribe({
    //   next: (response:any) => {
    //     // Supprimer le cours de la liste locale
    //     this.courses = this.courses.filter(
    //       (c) => c.id !== this.courseToDelete!.id
    //     );
    //     this.filteredCourses = this.filteredCourses.filter(
    //       (c) => c.id !== this.courseToDelete!.id
    //     );

    //     // Fermer la modal
    //     this.closeDeleteModal();

    //     // Optionnel : afficher un message de succès
    //     console.log('Cours supprimé avec succès');
    //   },
    //   error: (err:any) => {
    //     this.error = 'Erreur lors de la suppression du cours';
    //     this.isDeleting = false;
    //     console.error('Erreur de suppression:', err);
    //   },
    // });
  }
}
