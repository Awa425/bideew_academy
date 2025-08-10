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
      // Pour un choix unique, on remplace simplement la sélection
      this.currentQuestion.selected = index;
    } else if (this.currentQuestion.type === 'multiple_choice') {
      // Pour un choix multiple, on gère un tableau de sélections
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

  // restart(): void {
  //   this.currentIndex = 0;
  //   this.showResults = false;
  //   this.questions.forEach((q) => {
  //     q.selected = undefined;
  //     q.selectedText = '';
  //   });
  // }
  // redirect(): void {
  //   this.router.navigate(['../../lessons'], { relativeTo: this.route });
  // }

  getScore(): number {
    return this.questions.filter((q) => {
      if (q.type === 'text') return true; // accepter toutes les réponses libres
      return JSON.stringify(q.selected) === JSON.stringify(q.correctAnswer);
    }).length;
  }

  private getSelectedAnswerIds(question: any): number[] {
    if (question.selected === undefined) return [];

    // Cas question à choix multiple
    if (Array.isArray(question.selected)) {
      return question.selected.map(
        (index: number) => question.answers[index].id
      );
    }

    // Cas question à choix unique
    return [question.answers[question.selected].id];
  }

  submitQuiz() {
    const submissionData: any = {
      quiz_id: 1,
      answers: this.questions
        .filter((q) => q.selected !== undefined)
        .map((q) => ({
          question_id: q.id,
          answer_ids: this.getSelectedAnswerIds(q),
        })),
    };

    this.courseService.calculateScore(1, submissionData).subscribe({
      next: (res) => {
        console.log('Success', res);
        this.resultat = res;
      },
      error: (err) => console.error('API Error:', err.error.errors),
    });
  }

  loadQuizData(courseId: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    (
      this.courseService.getQuizzByLesson(courseId) as Observable<any[]>
    ).subscribe({
      next: (apiData: any[]) => {
        const quiz = apiData.find((q) => q.course_id === courseId);

        // console.log('Quiz sélectionné:', quiz);

        if (!quiz?.questions?.length) {
          console.warn(
            'Ce quiz ne contient aucune question. Utilisation des données par défaut.'
          );
          this.loadDefaultData();
          return;
        }

        this.quizTitle = quiz.description;
        this.questions = quiz.questions.map((q: any) => {
          // S'assurer que chaque question a ses answers
          q.answers = q.answers || [];
          return this.transformQuestion(q);
        });
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

    // Pour les questions à choix unique, correctAnswer est l'index de la bonne réponse
    // Pour les questions à choix multiples, c'est un tableau d'index
    let correctAnswer;
    if (q.type === 'single_choice') {
      correctAnswer = q.answers?.findIndex((a: any) => a.is_correct === 1);
    } else if (q.type === 'multiple_choice') {
      correctAnswer = q.answers
        ?.map((a: any, index: number) => (a.is_correct === 1 ? index : -1))
        .filter((i: number) => i !== -1);
    } else {
      correctAnswer = q.correctAnswer || '';
    }

    return {
      id: q.id,
      text: q.text || '',
      type: q.type || 'multiple_choice',
      options: options,
      selected: undefined,
      selectedText: '',
      correctAnswer: correctAnswer,
      answers: q.answers || [],
    };
  }
}
