export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; 
  explanation?: string;
}

export interface Quiz {
  id: string;
  courseId: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  passingScore: number; 
}
