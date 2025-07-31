export interface Course {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  longDescription?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration_minutes: number; // in hours
  image_path: string;
  instructor: string;
  rating: number;
  studentsEnrolled: number;
  prerequisites: string[];
  learningObjectives: string[];
  resources?: Resource[];
  createdAt: Date;
  updatedAt: Date;
  category?: string;
  language?: string;
  tags?: string[];
}

export interface Lessons {
  id: string;
  title: string;
  description?: string; // Description détaillée de la leçon
  duration_minutes: number; // in minutes
  order: number; // in minutes
  type: 'video' | 'text' | 'quiz' | 'assignment';
  content?: string; // URL or text content
  isPreview: boolean;
  course_id : Course[];
  resources: Resource[];
  quiz?: Quiz;
  is_published?: string; // URL de la miniature pour la vidéo
  created_at?: string; // URL de la vidéo pour les leçons de type vidéo
  updated_at?: string; // URL de la vidéo pour les leçons de type vidéo
  is_locked?: string; // URL de la vidéo pour les leçons de type vidéo
}

export interface Resource {
  type: 'pdf' | 'link' | 'code';
  title: string;
  url: string;
}

export interface Quiz {
  id?: string;
  courseId?: string;
  title?: string;
  description?: string;
  questions: Question[];
  passingScore: number;
  timeLimit?: number; // in minutes
}

export interface Question {
  id: string;
  type: 'single' | 'multiple' | 'true_false' | 'text';
  question: string;
  options?: string[];
  correctAnswers: string[] | string;
  explanation?: string;
  points: number;
}

// Créez un fichier api-response.model.ts
// api-response.model.ts// api-response.model.ts
export interface PaginationLinks {
  url: string | null;
  label: string;
  active: boolean;
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: PaginationLinks[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
}