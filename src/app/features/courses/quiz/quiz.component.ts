import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { Quiz, QuizQuestion } from '../../../core/models/quiz.model';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatRadioModule,
    MatProgressBarModule,
    MatIconModule
  ],
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss']
})
export class QuizComponent {
  @Input() quiz!: Quiz;
  @Output() quizCompleted = new EventEmitter<{score: number, passed: boolean}>();

  currentQuestionIndex = 0;
  selectedAnswer: number | null = null;
  showResult = false;
  isCorrect = false;
  score = 0;
  quizFinished = false;

  get currentQuestion(): QuizQuestion {
    return this.quiz.questions[this.currentQuestionIndex];
  }

  get progress(): number {
    return ((this.currentQuestionIndex + 1) / this.quiz.questions.length) * 100;
  }

  selectAnswer(index: number): void {
    this.selectedAnswer = index;
  }

  checkAnswer(): void {
    if (this.selectedAnswer === null) return;
    
    this.showResult = true;
    this.isCorrect = this.selectedAnswer === this.currentQuestion.correctAnswer;
    
    if (this.isCorrect) {
      this.score++;
    }
    
    // Passe à la question suivante après un court délai
    setTimeout(() => {
      this.nextQuestion();
    }, 1500);
  }

  nextQuestion(): void {
    this.showResult = false;
    this.selectedAnswer = null;
    
    if (this.currentQuestionIndex < this.quiz.questions.length - 1) {
      this.currentQuestionIndex++;
    } else {
      this.finishQuiz();
    }
  }

  finishQuiz(): void {
    const finalScore = (this.score / this.quiz.questions.length) * 100;
    const passed = finalScore >= this.quiz.passingScore;
    this.quizFinished = true;
    this.quizCompleted.emit({ score: finalScore, passed });
  }

  getScoreColor(score: number): string {
    if (score < 50) return 'warn';
    if (score < 80) return 'accent';
    return 'primary';
  }
}
