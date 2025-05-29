export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // Index de la bonne réponse dans le tableau options
  explanation?: string;
}

export interface Quiz {
  id: string;
  courseId: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  passingScore: number; // Score minimum pour réussir le quiz (en %)
}
