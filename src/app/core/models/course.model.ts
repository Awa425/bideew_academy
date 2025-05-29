export interface Course {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  longDescription?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in hours
  imageUrl: string;
  instructor: string;
  rating: number;
  studentsEnrolled: number;
  lessons: Lesson[];
  prerequisites: string[];
  learningObjectives: string[];
  resources?: Resource[];
  createdAt: Date;
  updatedAt: Date;
  category?: string;
  language?: string;
  tags?: string[];
}

export interface Lesson {
  id: string;
  title: string;
  description?: string; // Description détaillée de la leçon
  duration: number; // in minutes
  type: 'video' | 'text' | 'quiz' | 'assignment';
  content?: string; // URL or text content
  isPreview: boolean;
  resources: Resource[];
  quiz?: Quiz;
  thumbnail?: string; // URL de la miniature pour la vidéo
  videoUrl?: string; // URL de la vidéo pour les leçons de type vidéo
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
