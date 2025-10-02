import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CourseService } from '../../../core/services/course.service';
import { envVars } from 'environments/environments';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService
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
      console.log(this.resources);
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
    const baseUrl = `${envVars.apiBaseUrl}` + '/storage/';

    const link = document.createElement('a');
    link.href = `${baseUrl}${filePath}`;

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
}
