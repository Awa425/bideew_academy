import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

interface Question {
  id: number;
  text: string;
  type: 'multiple_choice' | 'single_choice' | 'text';
  options?: string[];
  selected?: number | number[];
  selectedText?: string;
  correctAnswer?: string | number | number[];
  answers?: { id: number; text: string; is_correct: number }[];
}

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss'],
  imports: [CommonModule, NgIf, NgFor, NgClass, FormsModule, RouterLink],
})
export class QuizComponent implements OnInit {
  questions: any[] = [];
  currentIndex = 0;
  showResults = false;
  showSummary = false;
  isLoading = false;
  errorMessage = '';
  quizTitle = 'Quiz interactif';
  quizId: number | null = null;
  resultat?: any;
  course_id: any;

  constructor(
    public route: ActivatedRoute,
    private courseService: CourseService,
    private router: Router
  ) {}

  ngOnInit() {
    this.course_id = this.route.snapshot.paramMap.get('id');
    if (this.course_id) {
      this.loadQuizData(+this.course_id);
    } else {
      this.errorMessage = 'Aucun ID de cours fourni.';
      this.isLoading = false;
    }
  }

  get currentQuestion() {
    return this.questions[this.currentIndex] || null;
  }

  selectOption(index: number): void {
    if (!this.currentQuestion) return;

    if (this.currentQuestion.type === 'single_choice') {
      this.currentQuestion.selected = index;
    } else if (this.currentQuestion.type === 'multiple_choice') {
      if (!Array.isArray(this.currentQuestion.selected)) {
        this.currentQuestion.selected = [];
      }

      const selectedIndex = this.currentQuestion.selected.indexOf(index);
      if (selectedIndex === -1) {
        this.currentQuestion.selected.push(index);
      } else {
        this.currentQuestion.selected.splice(selectedIndex, 1);
      }
    }
  }

  nextQuestion(): void {
    if (this.currentIndex < this.questions.length - 1) {
      this.currentIndex++;
    } else {
      this.showResults = true;
      this.submitQuiz();
    }
  }

  getCorrectQuestionsCount(): number {
    return this.questions.filter((q) => this.isQuestionCorrect(q)).length;
  }

  getIncorrectQuestionsCount(): number {
    return this.questions.filter((q) => !this.isQuestionCorrect(q)).length;
  }

  goBackToCourses(): void {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  showQuizSummary(): void {
    this.showSummary = true;
    this.showResults = false;
  }

  backToResults(): void {
    this.showSummary = false;
    this.showResults = true;
  }

  isQuestionCorrect(question: any): boolean {
    if (question.type === 'text') {
      return true; // On considère toutes les réponses texte comme correctes
    }

    if (question.type === 'single_choice') {
      return question.selected === question.correctAnswer;
    }

    if (question.type === 'multiple_choice') {
      if (
        !Array.isArray(question.selected) ||
        !Array.isArray(question.correctAnswer)
      ) {
        return false;
      }
      return (
        JSON.stringify(question.selected.sort()) ===
        JSON.stringify(question.correctAnswer.sort())
      );
    }

    return false;
  }

  getCorrectAnswersText(question: any): string {
    if (question.type === 'text') {
      return 'Réponse libre acceptée';
    }

    if (question.type === 'single_choice') {
      return question.options[question.correctAnswer] || 'N/A';
    }

    if (
      question.type === 'multiple_choice' &&
      Array.isArray(question.correctAnswer)
    ) {
      return question.correctAnswer
        .map((index: number) => question.options[index])
        .join(', ');
    }

    return 'N/A';
  }

  getUserAnswersText(question: any): string {
    if (question.type === 'text') {
      return question.selectedText || 'Aucune réponse';
    }

    if (question.type === 'single_choice') {
      return question.selected !== undefined
        ? question.options[question.selected]
        : 'Aucune réponse';
    }

    if (question.type === 'multiple_choice') {
      if (!Array.isArray(question.selected) || question.selected.length === 0) {
        return 'Aucune réponse';
      }
      return question.selected
        .map((index: number) => question.options[index])
        .join(', ');
    }

    return 'Aucune réponse';
  }

  getScore(): number {
    return this.questions.filter((q) => {
      if (q.type === 'text') return true;
      return JSON.stringify(q.selected) === JSON.stringify(q.correctAnswer);
    }).length;
  }

  // Version corrigée pour vérifier si une question a une réponse
  private hasAnswer(question: any): boolean {
    if (question.type === 'text') {
      return question.selectedText && question.selectedText.trim() !== '';
    }
    return question.selected !== undefined;
  }

  private getSelectedAnswerIds(question: any): number[] {
    if (question.type === 'text') {
      if (question.answers && question.answers.length > 0) {
        return [question.answers[0].id]; 
      }
      return []; 
    }

    if (question.selected === undefined) return [];

    if (Array.isArray(question.selected)) {
      return question.selected.map(
        (index: number) => question.answers[index].id
      );
    }

    return [question.answers[question.selected].id];
  }

  submitQuiz() {
    const answeredQuestions = this.questions.filter((q) => this.hasAnswer(q));

    const submissionData: any = {
      quiz_id: 1,
      answers: answeredQuestions.map((q) => {
        const answerIds = this.getSelectedAnswerIds(q);

        const answer: any = {
          question_id: q.id,
          answer_ids: answerIds,
        };

        if (q.type === 'text') {
          answer.text_answer = q.selectedText;
        }

        return answer;
      }),
    };

    this.courseService
      .calculateScore(this.course_id, submissionData)
      .subscribe({
        next: (res) => {
          this.resultat = res;
        },
        error: (err) => {
          this.resultat = err.error;
        },
      });
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private getRandomQuestions(questions: any[], count: number): any[] {
    const shuffled = this.shuffleArray(questions);
    return shuffled.slice(0, Math.min(count, questions.length));
  }

  loadQuizData(courseId: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    (
      this.courseService.getQuizzByLesson(courseId) as Observable<any[]>
    ).subscribe({
      next: (apiData: any[]) => {
        const quiz = apiData.find((q) => q.course_id === courseId);

        if (!quiz?.questions?.length) {
          console.warn(
            'Ce quiz ne contient aucune question. Utilisation des données par défaut.'
          );
          this.loadDefaultData();
          return;
        }

        this.quizTitle = quiz.description;
        const allTransformedQuestions = quiz.questions.map((q: any) => {
          q.answers = q.answers || [];
          return this.transformQuestion(q);
        });
        const questionTypes = allTransformedQuestions.map(
          (q: { id: any; type: any }) => ({ id: q.id, type: q.type })
        );
        this.questions = this.getRandomQuestions(allTransformedQuestions, 15);

        this.currentIndex = 0;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du quiz :', error);
        this.errorMessage = error.message || 'Erreur de chargement du quiz';
        this.isLoading = false;
        this.loadDefaultData();
      },
    });
  }

  loadDefaultData(): void {
    this.questions = [
      {
        id: 1,
        text: 'Quelle est la capitale du Sénégal ?',
        type: 'multiple_choice',
        options: ['Dakar', 'Bamako', 'Accra'],
        selected: undefined,
        selectedText: '',
        correctAnswer: 'Dakar',
      },
      {
        id: 2,
        text: 'Quel est le langage utilisé pour créer Angular ?',
        type: 'text',
        selectedText: '',
        correctAnswer: 'TypeScript',
      },
    ];
    this.quizTitle = 'Quiz de secours';
    this.isLoading = false;
    this.errorMessage = '';
  }

  transformQuestion(q: any): Question {
    const options =
      (q.type === 'multiple_choice' || q.type === 'single_choice') && q.answers
        ? q.answers.map((a: any) => a.text)
        : q.options || [];

    let correctAnswer;
    if (q.type === 'single_choice') {
      correctAnswer = q.answers?.findIndex((a: any) => a.is_correct === 1);
    } else if (q.type === 'multiple_choice') {
      correctAnswer = q.answers
        ?.map((a: any, index: number) => (a.is_correct === 1 ? index : -1))
        .filter((i: number) => i !== -1);
    } else if (q.type === 'text') {
      correctAnswer = q.correctAnswer || '';
    } else {
      correctAnswer = q.correctAnswer || '';
    }

    const transformedQuestion = {
      id: q.id,
      text: q.text || '',
      type: q.type || 'multiple_choice',
      options: options,
      selected: undefined,
      selectedText: '',
      correctAnswer: correctAnswer,
      answers: q.answers || [],
    };

    return transformedQuestion;
  }
}
