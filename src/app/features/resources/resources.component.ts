import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

// Interface pour la réponse de l'API
interface ApiResponse {
  current_page: number;
  data: ApiUser[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: PaginationLink[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}

interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

// Modifiez l'interface CourseProgress existante pour inclure la propriété showLessons
interface CourseProgress {
  id: number;
  user_id: number;
  course_id: number;
  current_lesson_id: number | null;
  completed_lessons: number[];
  progress_percent: number;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  // Nouvelle propriété pour gérer l'affichage des leçons
  showLessons?: boolean;
}

// Interface pour les utilisateurs de l'API
interface ApiUser {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  role: 'admin' | 'formateur' | 'apprenant';
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  course_progress: CourseProgress[];
  phone?: string;
  department?: string;
  notes?: string;
}

// Interface pour l'affichage local
interface User extends ApiUser {
  status: 'active' | 'inactive' | 'blocked';
  department: string;
  avatar?: string;
  lastLogin: Date;
  selected?: boolean;
  showDropdown?: boolean;
}

// Interface pour le formulaire utilisateur
interface UserFormData {
  id?: number;
  name: string;
  email: string;
  role: 'admin' | 'formateur' | 'apprenant' | '';
  password?: string;
  confirmPassword?: string;
  phone?: string;
  department?: string;
  notes?: string;
  sendWelcomeEmail?: boolean;
}

@Component({
  selector: 'app-resources',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './resources.component.html',
  styleUrls: ['./resources.component.scss'],
})
export class ResourcesComponent implements OnInit {
  private apiUrl = 'http://localhost:8000/api/users';

  users: User[] = [];
  filteredUsers: User[] = [];
  paginatedUsers: User[] = [];

  apiResponse: any;

  searchTerm: string = '';
  selectedRole: string = '';
  selectedStatus: string = '';

  sortColumn: string = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;

  allSelected: boolean = false;

  isLoading: boolean = false;
  error: string | null = null;

  showUserModal: boolean = false;
  isEditMode: boolean = false;
  userFormData: UserFormData = this.initializeFormData();
  formError: string | null = null;
  isSubmitting: boolean = false;

  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  showUserDetailsModal: boolean = false;
  selectedUserDetails: User | null = null;

  constructor(private http: HttpClient, private userService: AuthService) {}

  showProgressModal: boolean = false;
  selectedUserForProgress: User | null = null;

  currentProgressPage: number = 1;
  progressItemsPerPage: number = 5;
  totalProgressPages: number = 1;
  filteredProgressData: CourseProgress[] = [];
  paginatedProgressData: CourseProgress[] = [];
  progressFilter: string = '';

  viewUserProgress(user: User): void {
    this.selectedUserForProgress = { ...user };
    this.showProgressModal = true;
    this.currentProgressPage = 1;
    this.progressFilter = '';
    this.filterProgressData();
    user.showDropdown = false;
    console.log('Progression détaillée pour:', user.name);
    console.log('Cours en cours:', user.course_progress);
  }

  closeProgressModal(): void {
    this.showProgressModal = false;
    this.selectedUserForProgress = null;
    this.filteredProgressData = [];
    this.paginatedProgressData = [];
    this.currentProgressPage = 1;
    this.progressFilter = '';
  }

  filterProgressData(): void {
    if (!this.selectedUserForProgress?.course_progress) {
      this.filteredProgressData = [];
      this.updateProgressPagination();
      return;
    }

    let filtered = [...this.selectedUserForProgress.course_progress];

    if (this.progressFilter) {
      filtered = filtered.filter((progress) => {
        switch (this.progressFilter) {
          case 'completed':
            return progress.completed_at !== null;
          case 'in-progress':
            return (
              progress.progress_percent > 0 && progress.completed_at === null
            );
          case 'not-started':
            return progress.progress_percent === 0;
          default:
            return true;
        }
      });
    }

    this.filteredProgressData = filtered;
    this.currentProgressPage = 1; 
    this.updateProgressPagination();
  }

  updateProgressPagination(): void {
    this.totalProgressPages = Math.ceil(
      this.filteredProgressData.length / this.progressItemsPerPage
    );
    if (this.totalProgressPages === 0) this.totalProgressPages = 1;

    const startIndex =
      (this.currentProgressPage - 1) * this.progressItemsPerPage;
    const endIndex = startIndex + this.progressItemsPerPage;
    this.paginatedProgressData = this.filteredProgressData.slice(
      startIndex,
      endIndex
    );
  }

  previousProgressPage(): void {
    if (this.currentProgressPage > 1) {
      this.currentProgressPage--;
      this.updateProgressPagination();
    }
  }

  nextProgressPage(): void {
    if (this.currentProgressPage < this.totalProgressPages) {
      this.currentProgressPage++;
      this.updateProgressPagination();
    }
  }

  getInProgressCoursesCount(user: User): number {
    if (!user.course_progress || user.course_progress.length === 0) {
      return 0;
    }
    return user.course_progress.filter(
      (progress) =>
        progress.progress_percent > 0 && progress.completed_at === null
    ).length;
  }

  getCompletedLessonsCount(progress: CourseProgress): number {
    return progress.completed_lessons ? progress.completed_lessons.length : 0;
  }

  toggleLessonsDetails(progressId: number): void {
    if (this.selectedUserForProgress?.course_progress) {
      const progress = this.selectedUserForProgress.course_progress.find(
        (p) => p.id === progressId
      );
      if (progress) {
        progress.showLessons = !progress.showLessons;
      }
    }
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  initializeFormData(): UserFormData {
    return {
      name: '',
      email: '',
      role: '',
      password: '',
      confirmPassword: '',
      phone: '',
      department: '',
      notes: '',
      sendWelcomeEmail: true,
    };
  }

  openAddUserModal(): void {
    this.isEditMode = false;
    this.userFormData = this.initializeFormData();
    this.showUserModal = true;
    this.formError = null;
  }

  editUser(user: User): void {
    this.isEditMode = true;
    this.userFormData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
    this.showUserModal = true;
    this.formError = null;
  }

  closeUserModal(): void {
    this.showUserModal = false;
    this.isEditMode = false;
    this.userFormData = this.initializeFormData();
    this.formError = null;
    this.showPassword = false;
    this.showConfirmPassword = false;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  get passwordMismatch(): boolean {
    if (
      !this.isEditMode &&
      this.userFormData.password &&
      this.userFormData.confirmPassword
    ) {
      return this.userFormData.password !== this.userFormData.confirmPassword;
    }
    return false;
  }

  async onSubmitUser(): Promise<void> {
    if (this.isSubmitting) return;

    this.isSubmitting = true;
    this.formError = null;

    try {
      if (this.isEditMode) {
        await this.updateUserData();
      } else {
        await this.createUserData();
      }

      this.closeUserModal();
      this.loadUsers(this.currentPage);
    } catch (error: any) {
      this.formError = this.getErrorMessage(error);
    } finally {
      this.isSubmitting = false;
    }
  }

  private async createUserData(): Promise<void> {
    const userData: any = {
      name: this.userFormData.name,
      email: this.userFormData.email,
      role: this.userFormData.role,
      password: this.userFormData.password,
      password_confirmation: this.userFormData.confirmPassword,
      phone: this.userFormData.phone || null,
      department: this.userFormData.department || null,
      notes: this.userFormData.notes || null,
      send_welcome_email: this.userFormData.sendWelcomeEmail || false,
    };

    this.userService.register(userData).subscribe((dataUser: any) => {
      console.log(dataUser);
    });
  }

  private async updateUserData(): Promise<void> {
    if (!this.userFormData.id) throw new Error('ID utilisateur manquant');

    const userData: any = {
      id: this.userFormData.id,
      name: this.userFormData.name,
      email: this.userFormData.email,
      role: this.userFormData.role,
    };

    this.userService
      .updateUser(userData, userData.id)
      .subscribe((data: any) => {
        console.log(data);
      });
  }

  private getErrorMessage(error: any): string {
    if (error.status === 422 && error.error?.errors) {
      const errors = error.error.errors;
      const firstError = Object.values(errors)[0] as string[];
      return firstError[0] || 'Erreur de validation';
    } else if (error.status === 409) {
      return 'Un utilisateur avec cette adresse email existe déjà';
    } else if (error.status === 400) {
      return 'Données invalides. Veuillez vérifier votre saisie';
    } else if (error.status === 500) {
      return 'Erreur serveur. Veuillez réessayer plus tard';
    } else {
      return error.error?.message || "Une erreur inattendue s'est produite";
    }
  }

  viewUser(user: User): void {
    this.selectedUserDetails = { ...user };
    this.showUserDetailsModal = true;
    console.log('Voir détails utilisateur:', user);
    console.log('Progression des cours:', user.course_progress);
  }

  closeUserDetailsModal(): void {
    this.showUserDetailsModal = false;
    this.selectedUserDetails = null;
  }

  editUserFromDetails(): void {
    if (this.selectedUserDetails) {
      this.closeUserDetailsModal();
      this.editUser(this.selectedUserDetails);
    }
  }

  resetPasswordFromDetails(): void {
    if (this.selectedUserDetails) {
      this.resetPassword(this.selectedUserDetails);
      this.closeUserDetailsModal();
    }
  }

  toggleUserStatusFromDetails(): void {
    if (this.selectedUserDetails) {
      this.toggleUserStatus(this.selectedUserDetails);
      this.selectedUserDetails.status =
        this.selectedUserDetails.status === 'active' ? 'inactive' : 'active';
    }
  }

  sendWelcomeEmailFromDetails(): void {
    if (this.selectedUserDetails) {
      this.sendWelcomeEmail(this.selectedUserDetails);
      this.closeUserDetailsModal();
    }
  }

  getCompletedCoursesCount(user: User): number {
    if (!user.course_progress || user.course_progress.length === 0) {
      return 0;
    }
    return user.course_progress.filter(
      (progress) => progress.completed_at !== null
    ).length;
  }

  getCourseStatusClass(progress: CourseProgress): string {
    if (progress.completed_at) {
      return 'completed';
    } else if (progress.progress_percent > 0) {
      return 'in-progress';
    } else {
      return 'not-started';
    }
  }

  getCourseStatusText(progress: CourseProgress): string {
    if (progress.completed_at) {
      return 'Terminé';
    } else if (progress.progress_percent > 0) {
      return 'En cours';
    } else {
      return 'Non débuté';
    }
  }

  loadUsers(page: number = 1): void {
    this.isLoading = true;
    this.error = null;

    let params: any = {
      page: page.toString(),
      per_page: this.itemsPerPage.toString(),
    };

    if (this.searchTerm) {
      params.search = this.searchTerm;
    }
    if (this.selectedRole) {
      params.role = this.selectedRole;
    }

    this.userService.getAllUser(params).subscribe({
      next: (response: any) => {
        this.apiResponse = response;
        this.users = this.transformApiUsers(
          response.data || response.users || []
        );
        this.currentPage = response.current_page || 1;
        this.totalPages =
          response.last_page ||
          Math.ceil(response.total / this.itemsPerPage) ||
          1;
        this.filterUsers();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        this.error = 'Erreur lors du chargement des utilisateurs';
        this.isLoading = false;
      },
    });
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
    if (this.totalPages === 0) this.totalPages = 1;

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedUsers = this.filteredUsers.slice(startIndex, endIndex);
  }

  transformApiUsers(apiUsers: ApiUser[]): User[] {
    return apiUsers.map((apiUser) => ({
      ...apiUser,
      status: this.getStatusFromUser(apiUser),
      department: this.getDepartmentFromRole(apiUser.role),
      avatar: this.generateAvatar(apiUser.name),
      lastLogin: this.getLastLoginFromUser(apiUser),
      selected: false,
      showDropdown: false,
    }));
  }

  getStatusFromUser(user: ApiUser): 'active' | 'inactive' | 'blocked' {
    if (user.deleted_at) return 'blocked';
    if (user.email_verified_at) return 'active';
    return 'inactive';
  }

  getDepartmentFromRole(role: string): string {
    const roleMapping: { [key: string]: string } = {
      admin: 'Administration',
      formateur: 'Formation',
      apprenant: 'Étudiants',
    };
    return roleMapping[role] || 'Non défini';
  }

  generateAvatar(name: string): string {
    const initials = name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&size=50&background=random&color=fff`;
  }

  getLastLoginFromUser(user: ApiUser): Date {
    return new Date(user.updated_at);
  }

  get totalUsers(): number {
    return this.apiResponse?.total || 0;
  }

  get activeUsers(): number {
    return this.users.filter((user) => user.status === 'active').length;
  }

  get inactiveUsers(): number {
    return this.users.filter((user) => user.status === 'inactive').length;
  }

  get blockedUsers(): number {
    return this.users.filter((user) => user.status === 'blocked').length;
  }

  get totalFilteredUsers(): number {
    return this.apiResponse?.total || this.filteredUsers.length || 0;
  }

  get selectedUsers(): User[] {
    return this.users.filter((user) => user.selected);
  }

  get startIndex(): number {
    if (this.apiResponse?.from) {
      return this.apiResponse.from - 1;
    }
    return (this.currentPage - 1) * this.itemsPerPage;
  }

  get endIndex(): number {
    if (this.apiResponse?.to) {
      return this.apiResponse.to;
    }
    return Math.min(
      this.currentPage * this.itemsPerPage,
      this.totalFilteredUsers
    );
  }

  get visiblePages(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let end = Math.min(this.totalPages, start + maxVisiblePages - 1);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  filterUsers(): void {
    if (this.apiResponse && this.apiResponse.data) {
      this.filteredUsers = [...this.users];
      this.paginatedUsers = [...this.users];
    } else {
      let filtered = [...this.users];

      if (this.searchTerm) {
        const searchLower = this.searchTerm.toLowerCase();
        filtered = filtered.filter(
          (user) =>
            user.name.toLowerCase().includes(searchLower) ||
            user.email.toLowerCase().includes(searchLower)
        );
      }

      if (this.selectedRole) {
        filtered = filtered.filter((user) => user.role === this.selectedRole);
      }

      if (this.selectedStatus) {
        filtered = filtered.filter(
          (user) => user.status === this.selectedStatus
        );
      }

      this.filteredUsers = filtered;
      this.updatePagination();
    }
  }

  onSearchChange(): void {
    setTimeout(() => {
      this.currentPage = 1;
      this.loadUsers(1);
    }, 300);
  }

  onRoleChange(): void {
    this.currentPage = 1;
    this.loadUsers(1);
  }

  onStatusChange(): void {
    this.filterUsers();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedRole = '';
    this.selectedStatus = '';
    this.currentPage = 1;
    this.loadUsers(1);
  }

  sortBy(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.applySorting(this.users);
    this.filterUsers();
  }

  applySorting(users: User[]): void {
    users.sort((a, b) => {
      let aValue: any = a[this.sortColumn as keyof User];
      let bValue: any = b[this.sortColumn as keyof User];

      if (aValue instanceof Date && bValue instanceof Date) {
        aValue = aValue.getTime();
        bValue = bValue.getTime();
      }

      if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      if (this.apiResponse && this.apiResponse.links) {
        this.loadUsers(this.currentPage);
      } else {
        this.updatePagination();
      }
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      if (this.apiResponse && this.apiResponse.links) {
        this.loadUsers(this.currentPage);
      } else {
        this.updatePagination();
      }
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      if (this.apiResponse && this.apiResponse.links) {
        this.loadUsers(page);
      } else {
        this.updatePagination();
      }
    }
  }
  selectAll(event: any): void {
    this.allSelected = event.target.checked;
    this.users.forEach((user) => (user.selected = this.allSelected));
  }

  deleteUser(user: User): void {
    if (
      confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.name} ?`)
    ) {
      this.http.delete(`${this.apiUrl}/${user.id}`).subscribe({
        next: () => {
          console.log('Utilisateur supprimé:', user.name);
          this.loadUsers(this.currentPage); 
        },
        error: (err) => {
          console.error('Erreur lors de la suppression:', err);
          alert("Erreur lors de la suppression de l'utilisateur");
        },
      });
    }
  }

  deleteSelectedUsers(): void {
    const selectedUsers = this.selectedUsers;
    const selectedCount = selectedUsers.length;

    if (selectedCount === 0) return;

    if (
      confirm(
        `Êtes-vous sûr de vouloir supprimer ${selectedCount} utilisateur(s) ?`
      )
    ) {
      const deleteRequests = selectedUsers.map((user) =>
        this.http.delete(`${this.apiUrl}/${user.id}`)
      );

      Promise.all(deleteRequests.map((req) => req.toPromise()))
        .then(() => {
          console.log(`${selectedCount} utilisateur(s) supprimé(s)`);
          this.allSelected = false;
          this.loadUsers(this.currentPage);
        })
        .catch((err) => {
          console.error('Erreur lors de la suppression:', err);
          alert('Erreur lors de la suppression des utilisateurs');
        });
    }
  }

  toggleDropdown(userId: number): void {
    this.users.forEach((user) => {
      if (user.id === userId) {
        user.showDropdown = !user.showDropdown;
      } else {
        user.showDropdown = false;
      }
    });
  }

  resetPassword(user: User): void {
    console.log('Réinitialiser mot de passe pour:', user.name);
    user.showDropdown = false;

    this.http.post(`${this.apiUrl}/${user.id}/reset-password`, {}).subscribe({
      next: () => {
        alert(`Email de réinitialisation envoyé à ${user.email}`);
      },
      error: (err) => {
        console.error('Erreur:', err);
        alert("Erreur lors de l'envoi de l'email");
      },
    });
  }

  toggleUserStatus(user: User): void {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    user.showDropdown = false;

    this.http
      .patch(`${this.apiUrl}/${user.id}`, { status: newStatus })
      .subscribe({
        next: () => {
          user.status = newStatus;
          console.log(`Statut de ${user.name} changé vers:`, newStatus);
        },
        error: (err) => {
          console.error('Erreur lors du changement de statut:', err);
          alert('Erreur lors du changement de statut');
        },
      });
  }

  sendWelcomeEmail(user: User): void {
    console.log('Envoyer email de bienvenue à :', user.name);
    user.showDropdown = false;

    this.http.post(`${this.apiUrl}/${user.id}/welcome-email`, {}).subscribe({
      next: () => {
        alert(`Email de bienvenue envoyé à ${user.email}`);
      },
      error: (err) => {
        console.error('Erreur:', err);
        alert("Erreur lors de l'envoi de l'email");
      },
    });
  }

  exportUsers(): void {
    console.log('Exporter la liste des utilisateurs');

    this.http.get(`${this.apiUrl}/export`, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'utilisateurs.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error("Erreur lors de l'export:", err);
        alert("Erreur lors de l'export");
      },
    });
  }

  trackByUserId(index: number, user: User): number {
    return user.id;
  }

  getRoleClass(role: string): string {
    const roleClasses: { [key: string]: string } = {
      admin: 'role-admin',
      formateur: 'role-manager',
      apprenant: 'role-user',
    };
    return roleClasses[role] || 'role-user';
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      active: 'status-active',
      inactive: 'status-inactive',
      blocked: 'status-blocked',
    };
    return statusClasses[status] || 'status-inactive';
  }

  getStatusText(status: string): string {
    const statusTexts: { [key: string]: string } = {
      active: 'Actif',
      inactive: 'Inactif',
      blocked: 'Bloqué',
    };
    return statusTexts[status] || 'Inconnu';
  }

  getRoleText(role: string): string {
    const roleTexts: { [key: string]: string } = {
      admin: 'Administrateur',
      formateur: 'Formateur',
      apprenant: 'Apprenant',
    };
    return roleTexts[role] || role;
  }

  getUserProgress(user: User): number {
    if (!user.course_progress || user.course_progress.length === 0) {
      return 0;
    }

    const totalProgress = user.course_progress.reduce(
      (sum, progress) => sum + progress.progress_percent,
      0
    );

    return Math.round(totalProgress / user.course_progress.length);
  }

  getUserCourseCount(user: User): number {
    return user.course_progress ? user.course_progress.length : 0;
  }

  private handleError(error: any, action: string): void {
    console.error(`Erreur lors de ${action}:`, error);

    if (error.status === 401) {
      this.error = 'Session expirée. Veuillez vous reconnecter.';
    } else if (error.status === 403) {
      this.error = "Vous n'avez pas les permissions nécessaires.";
    } else if (error.status === 404) {
      this.error = 'Ressource non trouvée.';
    } else if (error.status === 500) {
      this.error = 'Erreur serveur. Veuillez réessayer plus tard.';
    } else {
      this.error = error.message || `Erreur lors de ${action}`;
    }
  }
}
