import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { CommonModule, NgClass, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';

// Définition de l'interface Question
interface Question {
  id: number;
  text: string;
  type: 'multiple_choice' | 'text';
  options?: string[];
  selected?: number;
  selectedText?: string;
  correctAnswer?: string;
  answers?: { id: number; text: string; is_correct: number }[]; // Ajout de cette ligne
}

interface QuizData {
  course_id: number;
  description: string;
  id: number;
  questions: Question[];
  created_at?: string;
}

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss'],
  imports: [
    CommonModule, // contient NgIf, NgFor, etc.
    NgIf,
    NgFor,
    NgClass,
    FormsModule, // nécessaire pour [(ngModel)]
  ],
})
export class QuizComponent implements OnInit {
  questions: Question[] = [];
  currentIndex = 0;
  showResults = false;
  isLoading = true;
  errorMessage: string = '';
  quizTitle: string = '';
  issa:any;

  constructor(
    public route: ActivatedRoute,
    private courseService: CourseService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadQuizData(+id);
    } else {
      this.errorMessage = 'Aucun ID de cours fourni.';
      this.isLoading = false;
    }
  }

  get currentQuestion(): Question {
    return this.questions[this.currentIndex];
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

  transformQuestion(q: any): Question {
    // Pour les questions à choix multiples, générer les options à partir des answers
    const options =
      q.type === 'multiple_choice' && q.answers
        ? q.answers.map((a: any) => a.text)
        : q.options || [];

    // Trouver la réponse correcte (où is_correct === 1)
    const correctAnswer =
      q.answers?.find((a: any) => a.is_correct === 1)?.text ||
      q.correctAnswer ||
      '';

    return {
      id: q.id,
      text: q.text || '',
      type: q.type || 'multiple_choice',
      options: options,
      selected: undefined,
      selectedText: '',
      correctAnswer: correctAnswer,
      answers: q.answers || [], // Conserver les réponses originales si besoin
    };
  }

  selectOption(index: number): void {
    if (this.currentQuestion.type === 'multiple_choice') {
      this.currentQuestion.selected = index;
    }
  }

  nextQuestion(): void {
    if (this.currentIndex < this.questions.length - 1) {
      this.currentIndex++;
    } else {
      this.showResults = true;
    }
  }

  getScore(): number {
    // this.submit();
    return this.questions.reduce((score, q) => {
      if (q.type === 'multiple_choice') {
        const selectedText = q.options?.[q.selected ?? -1] ?? '';
        return q.correctAnswer &&
          selectedText.toLowerCase() === q.correctAnswer.toLowerCase()
          ? score + 1
          : score;
      } else if (q.type === 'text') {
        return q.correctAnswer &&
          q.selectedText?.toLowerCase().trim() ===
            q.correctAnswer.toLowerCase().trim()
          ? score + 1
          : score;
      }
      return score;
    }, 0);
  }

  restart(): void {
    this.questions = this.questions.map((q) => this.transformQuestion(q));
    this.currentIndex = 0;
    this.showResults = false;
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

  submit() {
    this.courseService.calculateScore(1).subscribe((data) => {
      this.issa=data;
      console.log(data);
    });
  }
}
