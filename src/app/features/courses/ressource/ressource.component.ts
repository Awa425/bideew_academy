import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CourseService } from '../../../core/services/course.service';
import { envVars } from 'environments/environments';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

export interface Resource {
  id: number;
  title: string;
  type: 'pdf' | 'video' | 'tool';
  description: string;
  path: string;
  external_url?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

@Component({
  selector: 'app-ressource',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './ressource.component.html',
  styleUrl: './ressource.component.scss',
})
export class RessourceComponent implements OnInit {
  currentCategory: string = 'all';
  viewMode: 'grid' | 'list' = 'grid';
  searchTerm: string = '';
  isLoading: boolean = false;
  lessonId: any;
  resources: Resource[] = [];
  categories: Category[] = [];
  filteredResources: Resource[] = [];

  // Variables pour le formulaire d'ajout
  showAddModal: boolean = false;
  isSubmitting: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';

  // Données du formulaire
  newResource = {
    title: '',
    type: 'pdf' as 'pdf' | 'video' | 'tool',
    description: '',
    file: null as File | null,
    external_url: ''
  };

  // Variables pour le viewer de ressources
  showViewerModal: boolean = false;
  currentViewingResource: Resource | null = null;
  viewerContent: string = '';
  apiBaseUrl = envVars.apiBaseUrl;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.lessonId = this.route.snapshot.paramMap.get('idLesson');
    this.dataRessource(this.lessonId);
  }

  dataRessource(lesson_id: any): void {
    this.courseService.getRessourceByID(lesson_id).subscribe((data: any) => {
      this.resources = data;
      this.initializeCategories();
      this.filterResources();
    });
  }

  initializeCategories(): void {
    this.categories = [
      {
        id: 'all',
        name: 'Toutes les ressources',
        icon: 'grid',
        count: this.resources.length,
      },
      {
        id: 'pdf',
        name: 'Documents PDF',
        icon: 'file-text',
        count: this.resources.filter((r: Resource) => r.type === 'pdf').length,
      },
      {
        id: 'video',
        name: 'Vidéos',
        icon: 'video',
        count: this.resources.filter((r: Resource) => r.type === 'video')
          .length,
      },
      {
        id: 'tool',
        name: 'Outils',
        icon: 'wrench',
        count: this.resources.filter((r: Resource) => r.type === 'tool').length,
      },
    ];
  }

  selectCategory(category: string): void {
    this.currentCategory = category;
    this.filterResources();
  }

  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  onSearchChange(): void {
    this.filterResources();
  }

  filterResources(): void {
    if (!this.resources) return;

    this.filteredResources = this.resources.filter((resource: Resource) => {
      const matchesCategory =
        this.currentCategory === 'all' ||
        resource.type === this.currentCategory;
      const matchesSearch =
        resource.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        resource.description
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }

  handleDownload(resource: Resource): void {
    this.isLoading = true;

    if (resource.external_url) {
      window.open(resource.external_url, '_blank');
      this.isLoading = false;
    } else if (resource.path) {
      this.downloadLocalFile(resource.path, resource.title);
    } else {
      console.error('Aucune URL ou chemin de fichier disponible');
      this.isLoading = false;
    }
  }

  private downloadLocalFile(filePath: string, fileName: string): void {
    const baseUrl = `${envVars.apiBaseUrl}/storage/`;
    const fullUrl = `${baseUrl}${filePath}`;

    const link = document.createElement('a');
    link.href = fullUrl;

    const fileExtension = this.getFileExtension(filePath);
    link.download = `${fileName}${fileExtension}`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.isLoading = false;
  }

  private getFileExtension(filePath: string): string {
    const lastDotIndex = filePath.lastIndexOf('.');
    if (lastDotIndex === -1) return '';
    return filePath.substring(lastDotIndex);
  }

  openExternalLink(url: string): void {
    if (!url) return;

    const resourceType = this.getResourceType(url);

    switch (resourceType) {
      case 'external':
        window.open(url, '_blank');
        break;
      case 'pdf':
      case 'video':
        this.openLocalFile(url);
        break;
      default:
        console.warn('Type de ressource non supporté:', url);
    }
  }

  private getResourceType(url: string): string {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return 'external';
    } else if (url.endsWith('.pdf')) {
      return 'pdf';
    } else if (
      url.endsWith('.mp4') ||
      url.endsWith('.mov') ||
      url.endsWith('.avi') ||
      url.endsWith('.webm')
    ) {
      return 'video';
    } else if (
      url.endsWith('.py') ||
      url.endsWith('.js') ||
      url.endsWith('.txt')
    ) {
      return 'tool';
    }
    return 'unknown';
  }

  private openLocalFile(filePath: string): void {
    const baseUrl = `${envVars.apiBaseUrl}` + '/storage/';
    const fullUrl = `${baseUrl}${filePath}`;

    window.open(fullUrl, '_blank');
  }

  goBack(): void {
    this.router.navigate(['../../']);
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'pdf':
        return 'file-text';
      case 'video':
        return 'video';
      case 'tool':
        return 'wrench';
      default:
        return 'file-text';
    }
  }

  getTypeColor(type: string): string {
    switch (type) {
      case 'pdf':
        return '#e3f2fd';
      case 'video':
        return '#f3e5f5';
      case 'tool':
        return '#e8f5e8';
      default:
        return '#f5f5f5';
    }
  }

  // ========== Méthodes pour l'ajout de ressources ==========

  openAddModal(): void {
    this.showAddModal = true;
    this.resetForm();
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.resetForm();
  }

  resetForm(): void {
    this.newResource = {
      title: '',
      type: 'pdf',
      description: '',
      file: null,
      external_url: ''
    };
    this.errorMessage = '';
    this.successMessage = '';
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      this.newResource.file = file;

      // Validation du type de fichier
      const allowedTypes: { [key: string]: string[] } = {
        pdf: ['application/pdf'],
        video: ['video/mp4', 'video/webm', 'video/ogg', 'video/avi'],
        tool: ['text/plain', 'application/javascript', 'text/x-python']
      };

      const validTypes = allowedTypes[this.newResource.type] || [];
      if (!validTypes.includes(file.type)) {
        this.errorMessage = `Type de fichier non valide pour ${this.newResource.type}`;
        this.newResource.file = null;
        target.value = '';
        return;
      }

      // Validation de la taille (max 50MB)
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        this.errorMessage = 'Le fichier est trop volumineux (max 50MB)';
        this.newResource.file = null;
        target.value = '';
        return;
      }

      this.errorMessage = '';
    }
  }

  onTypeChange(): void {
    // Réinitialiser le fichier quand on change de type
    this.newResource.file = null;
    this.newResource.external_url = '';
    const fileInput = document.getElementById('resource-file') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  isFormValid(): boolean {
    if (!this.newResource.title.trim() || !this.newResource.description.trim()) {
      return false;
    }

    // Si c'est une vidéo, on peut avoir soit un fichier soit une URL
    if (this.newResource.type === 'video') {
      return !!(this.newResource.file || this.newResource.external_url.trim());
    }

    // Pour PDF et tool, un fichier est obligatoire
    return !!this.newResource.file;
  }

  onSubmitResource(): void {
    if (!this.isFormValid()) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Protection timeout
    const timeoutId = setTimeout(() => {
      if (this.isSubmitting) {
        this.isSubmitting = false;
        this.errorMessage = 'La requête a expiré. Veuillez réessayer.';
      }
    }, 60000); // 60 secondes

    const formData = new FormData();
    formData.append('title', this.newResource.title.trim());
    formData.append('type', this.newResource.type);
    formData.append('description', this.newResource.description.trim());

    // Ajouter le fichier ou l'URL
    if (this.newResource.file) {
      formData.append('file', this.newResource.file, this.newResource.file.name);
    } else if (this.newResource.external_url.trim()) {
      formData.append('external_url', this.newResource.external_url.trim());
    }

    this.courseService.createResource(this.lessonId, formData).subscribe({
      next: (response) => {
        clearTimeout(timeoutId);
        this.isSubmitting = false;
        this.successMessage = 'Ressource ajoutée avec succès !';

        // Recharger la liste des ressources
        setTimeout(() => {
          this.dataRessource(this.lessonId);
          this.closeAddModal();
        }, 1500);
      },
      error: (error) => {
        clearTimeout(timeoutId);
        this.isSubmitting = false;
        console.error('Erreur lors de l\'ajout de la ressource:', error);

        let errorMessage = 'Erreur lors de l\'ajout de la ressource.';
        if (error.status === 413) {
          errorMessage = 'Le fichier est trop volumineux.';
        } else if (error.status === 0) {
          errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }

        this.errorMessage = errorMessage;
      }
    });
  }

  // ========== Méthodes pour le viewer de ressources ==========

  openViewer(resource: Resource): void {
    this.currentViewingResource = resource;
    this.showViewerModal = true;

    // Pour les outils (fichiers texte), charger le contenu
    if (resource.type === 'tool' && resource.path) {
      this.loadFileContent(resource.path);
    }
  }

  closeViewer(): void {
    this.showViewerModal = false;
    this.currentViewingResource = null;
    this.viewerContent = '';
  }

  getResourceUrl(resource: Resource): SafeResourceUrl {
    let url = '';
    if (resource.external_url) {
      url = resource.external_url;
    } else if (resource.path) {
      url = `${this.apiBaseUrl}/storage/${resource.path}`;
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  getEmbedUrl(url: string): SafeResourceUrl {
    let embedUrl = url;

    // Convertir les URLs YouTube en format embed
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  getVideoUrl(resource: Resource): string {
    if (resource.external_url) {
      return resource.external_url;
    } else if (resource.path) {
      return `${this.apiBaseUrl}/storage/${resource.path}`;
    }
    return '';
  }

  private loadFileContent(filePath: string): void {
    const fullUrl = `${this.apiBaseUrl}/storage/${filePath}`;

    fetch(fullUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then(content => {
        this.viewerContent = content;
      })
      .catch(error => {
        console.error('Erreur lors du chargement du fichier:', error);
        this.viewerContent = 'Erreur lors du chargement du contenu du fichier: ' + error.message;
      });
  }
}
