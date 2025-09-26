import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { CourseService } from '../../../core/services/course.service';

@Component({
  selector: 'app-form-lesson',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatIconModule,
    MatCheckboxModule,
    MatButtonToggleModule,
    MatTooltipModule,
    MatExpansionModule,
    MatChipsModule,
  ],
  templateUrl: './form-lesson.component.html',
  styleUrls: ['./form-lesson.component.scss'],
})
export class FormLessonComponent implements OnInit {
  lessonForm: FormGroup;
  courseId!: number;
  contentTypes = ['video', 'pdf', 'text', 'quiz'];
  videoInputType: 'url' | 'upload' = 'url';
  questionTypes = ['multiple_choice', 'true_false', 'short_answer'];
  
  // Propriétés pour la gestion des accordéons
  expandedQuestions: Set<string> = new Set();
  expandedAnswers: Set<string> = new Set();
  addingNewQuestion = false;
  addingNewAnswer = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private lessonService: CourseService
  ) {
    this.lessonForm = this.fb.group({
      title: ['', Validators.required],
      duration_minutes: [''],
      contents: this.fb.array([this.createContentFormGroup()]),
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.courseId = +id;
    } else {
      console.error('Course ID is missing');
      this.router.navigate(['/courses']);
    }
  }

  createContentFormGroup(): FormGroup {
    return this.fb.group({
      type: ['', Validators.required],
      data: [''],
      file: [null],
      external_url: [''],
      quiz_title: [''],
      quiz_description: [''],
      quiz_duration: [''],
      questions: this.fb.array([]),
      video_input_type: ['url'] 
    });
  }

  createQuestionFormGroup(): FormGroup {
    return this.fb.group({
      type: ['multiple_choice', Validators.required],
      text: ['', Validators.required],
      answers: this.fb.array([this.createAnswerFormGroup()])
    });
  }

  createAnswerFormGroup(): FormGroup {
    return this.fb.group({
      text: ['', Validators.required],
      is_correct: [false]
    });
  }

  get contents(): FormArray {
    return this.lessonForm.get('contents') as FormArray;
  }

  getQuestions(contentIndex: number): FormArray {
    return this.contents.at(contentIndex).get('questions') as FormArray;
  }

  getAnswers(contentIndex: number, questionIndex: number): FormArray {
    return this.getQuestions(contentIndex).at(questionIndex).get('answers') as FormArray;
  }

  // === Méthodes pour la gestion des accordéons QUESTIONS ===

  getQuestionId(contentIndex: number, questionIndex: number): string {
    return `content-${contentIndex}-question-${questionIndex}`;
  }

  isQuestionExpanded(contentIndex: number, questionIndex: number): boolean {
    const id = this.getQuestionId(contentIndex, questionIndex);
    return this.expandedQuestions.has(id);
  }

  onQuestionExpansionChange(contentIndex: number, questionIndex: number, expanded: boolean): void {
    const id = this.getQuestionId(contentIndex, questionIndex);
    if (expanded) {
      this.expandedQuestions.add(id);
      // Développer automatiquement la première réponse
      this.expandFirstAnswer(contentIndex, questionIndex);
    } else {
      this.expandedQuestions.delete(id);
      // Réduire toutes les réponses de cette question
      this.collapseAllAnswersInQuestion(contentIndex, questionIndex);
    }
  }

  expandLastQuestion(contentIndex: number): void {
    const questions = this.getQuestions(contentIndex);
    if (questions.length > 0) {
      const lastIndex = questions.length - 1;
      const id = this.getQuestionId(contentIndex, lastIndex);
      this.expandedQuestions.add(id);
      // Développer automatiquement la première réponse
      setTimeout(() => {
        this.expandFirstAnswer(contentIndex, lastIndex);
      }, 100);
    }
  }

  collapseAllQuestions(contentIndex: number): void {
    const questions = this.getQuestions(contentIndex);
    for (let i = 0; i < questions.length; i++) {
      const id = this.getQuestionId(contentIndex, i);
      this.expandedQuestions.delete(id);
    }
    // Réduire aussi toutes les réponses
    this.expandedAnswers.clear();
  }

  expandAllQuestions(contentIndex: number): void {
    const questions = this.getQuestions(contentIndex);
    for (let i = 0; i < questions.length; i++) {
      const id = this.getQuestionId(contentIndex, i);
      this.expandedQuestions.add(id);
      // Développer la première réponse de chaque question
      this.expandFirstAnswer(contentIndex, i);
    }
  }

  hasCollapsedQuestions(contentIndex: number): boolean {
    const questions = this.getQuestions(contentIndex);
    for (let i = 0; i < questions.length; i++) {
      if (!this.isQuestionExpanded(contentIndex, i)) {
        return true;
      }
    }
    return false;
  }

  // === Méthodes pour la gestion des accordéons RÉPONSES ===

  getAnswerId(contentIndex: number, questionIndex: number, answerIndex: number): string {
    return `content-${contentIndex}-question-${questionIndex}-answer-${answerIndex}`;
  }

  isAnswerExpanded(contentIndex: number, questionIndex: number, answerIndex: number): boolean {
    const id = this.getAnswerId(contentIndex, questionIndex, answerIndex);
    return this.expandedAnswers.has(id);
  }

  onAnswerExpansionChange(contentIndex: number, questionIndex: number, answerIndex: number, expanded: boolean): void {
    const id = this.getAnswerId(contentIndex, questionIndex, answerIndex);
    if (expanded) {
      this.expandedAnswers.add(id);
    } else {
      this.expandedAnswers.delete(id);
    }
  }

  expandFirstAnswer(contentIndex: number, questionIndex: number): void {
    const answers = this.getAnswers(contentIndex, questionIndex);
    if (answers.length > 0) {
      const id = this.getAnswerId(contentIndex, questionIndex, 0);
      this.expandedAnswers.add(id);
    }
  }

  expandLastAnswer(contentIndex: number, questionIndex: number): void {
    const answers = this.getAnswers(contentIndex, questionIndex);
    if (answers.length > 0) {
      const lastIndex = answers.length - 1;
      const id = this.getAnswerId(contentIndex, questionIndex, lastIndex);
      this.expandedAnswers.add(id);
    }
  }

  collapseAllAnswersInQuestion(contentIndex: number, questionIndex: number): void {
    const answers = this.getAnswers(contentIndex, questionIndex);
    for (let i = 0; i < answers.length; i++) {
      const id = this.getAnswerId(contentIndex, questionIndex, i);
      this.expandedAnswers.delete(id);
    }
  }

  // === Méthodes pour obtenir les aperçus ===

  getQuestionPreview(contentIndex: number, questionIndex: number): string {
    const question = this.getQuestions(contentIndex).at(questionIndex);
    const text = question.get('text')?.value;
    if (!text || text.trim() === '') {
      return '';
    }
    return text.length > 50 ? text.substring(0, 50) + '...' : text;
  }

  getAnswerPreview(contentIndex: number, questionIndex: number, answerIndex: number): string {
    const answer = this.getAnswers(contentIndex, questionIndex).at(answerIndex);
    const text = answer.get('text')?.value;
    if (!text || text.trim() === '') {
      return '';
    }
    return text.length > 30 ? text.substring(0, 30) + '...' : text;
  }

  // === Méthodes CRUD ===

  addContent(): void {
    this.contents.push(this.createContentFormGroup());
  }

  removeContent(index: number): void {
    this.contents.removeAt(index);
  }

  addQuestion(contentIndex: number): void {
    this.addingNewQuestion = true;
    const questions = this.getQuestions(contentIndex);
    questions.push(this.createQuestionFormGroup());
    
    // Réduire toutes les autres questions
    this.collapseAllQuestions(contentIndex);
    
    // Étendre automatiquement la nouvelle question
    setTimeout(() => {
      this.expandLastQuestion(contentIndex);
      this.addingNewQuestion = false;
    }, 100);
  }

  removeQuestion(contentIndex: number, questionIndex: number): void {
    const questions = this.getQuestions(contentIndex);
    const questionId = this.getQuestionId(contentIndex, questionIndex);
    
    // Supprimer les références dans les sets d'expansion
    this.expandedQuestions.delete(questionId);
    this.collapseAllAnswersInQuestion(contentIndex, questionIndex);
    
    questions.removeAt(questionIndex);
  }

  addAnswer(contentIndex: number, questionIndex: number): void {
    this.addingNewAnswer = true;
    const answers = this.getAnswers(contentIndex, questionIndex);
    answers.push(this.createAnswerFormGroup());
    
    // Réduire toutes les autres réponses de cette question
    this.collapseAllAnswersInQuestion(contentIndex, questionIndex);
    
    // Étendre automatiquement la nouvelle réponse
    setTimeout(() => {
      this.expandLastAnswer(contentIndex, questionIndex);
      this.addingNewAnswer = false;
    }, 100);
  }

  removeAnswer(contentIndex: number, questionIndex: number, answerIndex: number): void {
    const answers = this.getAnswers(contentIndex, questionIndex);
    const answerId = this.getAnswerId(contentIndex, questionIndex, answerIndex);
    
    // Supprimer la référence dans le set d'expansion
    this.expandedAnswers.delete(answerId);
    
    answers.removeAt(answerIndex);
  }

  // === Méthodes utilitaires ===

  isQuizContent(): boolean {
    if (this.contents.length === 0) return false;
    const currentContentType = this.contents.at(0).get('type')?.value;
    return currentContentType === 'quiz';
  }

  getCurrentContentType(): string {
    if (this.contents.length === 0) return '';
    return this.contents.at(0).get('type')?.value || '';
  }

  onContentTypeChange(contentIndex: number, newType: string): void {
    const content = this.contents.at(contentIndex);
    
    // Nettoyer les expansions
    this.expandedQuestions.clear();
    this.expandedAnswers.clear();
    
    if (newType === 'quiz') {
      this.lessonForm.get('title')?.clearValidators();
      this.lessonForm.get('duration_minutes')?.clearValidators();
      
      content.get('quiz_title')?.setValidators([Validators.required]);
      content.get('quiz_description')?.setValidators([Validators.required]);
      
      const questions = content.get('questions') as FormArray;
      if (questions.length === 0) {
        questions.push(this.createQuestionFormGroup());
        // Étendre automatiquement la première question
        setTimeout(() => {
          this.expandLastQuestion(contentIndex);
        }, 100);
      }
    } else {
      this.lessonForm.get('title')?.setValidators([Validators.required]);
      this.lessonForm.get('duration_minutes')?.setValidators([]);
      
      content.get('quiz_title')?.clearValidators();
      content.get('quiz_description')?.clearValidators();
      
      const questions = content.get('questions') as FormArray;
      questions.clear();
    }
    
    this.lessonForm.get('title')?.updateValueAndValidity();
    this.lessonForm.get('duration_minutes')?.updateValueAndValidity();
    content.get('quiz_title')?.updateValueAndValidity();
    content.get('quiz_description')?.updateValueAndValidity();
  }

  onVideoInputTypeChange(contentIndex: number, inputType: 'url' | 'upload'): void {
    const content = this.contents.at(contentIndex);
    content.get('video_input_type')?.setValue(inputType);
    
    if (inputType === 'url') {
      content.get('file')?.setValue(null);
    } else {
      content.get('external_url')?.setValue('');
    }
  }

  onFileChange(event: any, index: number): void {
    const file = event.target.files[0];
    if (file) {
      const content = this.contents.at(index);
      const contentType = content.get('type')?.value;
      
      if (contentType === 'pdf' && !file.type.includes('pdf')) {
        alert('Veuillez sélectionner un fichier PDF');
        return;
      }
      
      if (contentType === 'video' && !file.type.includes('video')) {
        alert('Veuillez sélectionner un fichier vidéo');
        return;
      }
      
      content.get('file')?.setValue(file);
      console.log(`Fichier ${contentType} sélectionné:`, file.name);
    }
  }

  goBack(): void {
    this.router.navigate(['/courses', this.courseId]);
  }

  onSubmit(): void {
    console.log('=== SUBMIT FINAL ===');

    if (this.lessonForm.valid && this.courseId) {
      const formValue = this.lessonForm.value;
      const formData = new FormData();

      const contents = formValue.contents || [];
      if (contents.length > 0) {
        const content = contents[0];

        if (content && content.type && content.type.trim() !== '') {
          formData.append('content[type]', content.type);

          if (content.type === 'quiz') {
            formData.append('title', content.quiz_title || 'Quiz sans titre');
            formData.append('duration_minutes', (content.quiz_duration || 15).toString());
          } else {
            formData.append('title', formValue.title || '');
            formData.append('duration_minutes', (formValue.duration_minutes || 0).toString());
          }

          formData.append('course_id', this.courseId.toString());
          formData.append('order', (formValue.order || 3).toString());
          formData.append('is_locked', 'true');

          switch (content.type) {
            case 'pdf':
              if (content.file) {
                formData.append('content[file]', content.file, content.file.name);
                console.log('PDF file:', content.file.name);
              } else {
                console.error('Fichier PDF manquant');
                alert('Veuillez sélectionner un fichier PDF');
                return;
              }
              break;

            case 'video':
              const videoInputType = content.video_input_type || 'url';
              
              if (videoInputType === 'url') {
                if (content.external_url && content.external_url.trim() !== '') {
                  formData.append('content[external_url]', content.external_url.trim());
                  console.log('Video URL:', content.external_url);
                } else {
                  console.error('URL vidéo manquante');
                  alert('Veuillez saisir une URL de vidéo');
                  return;
                }
              } else { 
                if (content.file) {
                  formData.append('content[file]', content.file, content.file.name);
                  console.log('Video file:', content.file.name);
                } else {
                  console.error('Fichier vidéo manquant');
                  alert('Veuillez sélectionner un fichier vidéo');
                  return;
                }
              }
              break;

            case 'text':
              if (content.data && content.data.trim() !== '') {
                formData.append('content[data]', content.data.trim());
                console.log('Text data added');
              } else {
                console.error('Contenu texte manquant');
                alert('Veuillez saisir le contenu texte');
                return;
              }
              break;

            case 'quiz':
              const quizPayload = {
                title: content.quiz_title || '',
                description: content.quiz_description || '',
                questions: (content.questions || []).map((question: any) => ({
                  type: question.type || 'multiple_choice',
                  text: question.text || '',
                  question: (question.answers || []).map((answer: any) => ({
                    text: answer.text || '',
                    is_correct: answer.is_correct || false
                  }))
                }))
              };

              formData.append('content[data]', JSON.stringify(quizPayload));
              console.log('Quiz data:', quizPayload);
              break;
          }
        } else {
          console.error('Type de contenu manquant');
          alert('Veuillez sélectionner un type de contenu');
          return;
        }
      } else {
        console.error('Aucun contenu');
        alert('Veuillez ajouter au moins un contenu');
        return;
      }

      console.log('FormData envoyée:');
      for (let pair of formData.entries()) {
        if (pair[1] instanceof File) {
          console.log(`  ${pair[0]}: File(${pair[1].name}, ${pair[1].size} bytes)`);
        } else {
          console.log(`  ${pair[0]}: "${pair[1]}"`);
        }
      }

      this.lessonService.createLesson(this.courseId, formData).subscribe({
        next: (response) => {
          console.log('SUCCESS:', response);
          const message = this.isQuizContent() ? 'Quiz créé avec succès !' : 'Leçon créée avec succès !';
          alert(message);
          this.goBack();
        },
        error: (err) => {
          console.error('ERREUR:', err);

          if (err.status === 422) {
            console.error('Erreurs de validation:', err.error?.errors);
            let errorMsg = 'Erreurs de validation:\n';
            if (err.error?.errors) {
              Object.keys(err.error.errors).forEach((key) => {
                errorMsg += `- ${key}: ${err.error.errors[key].join(', ')}\n`;
              });
            }
            alert(errorMsg);
          } else {
            alert(`Erreur ${err.status}: ${err.error?.message || 'Erreur inconnue'}`);
          }
        },
      });
    } else {
      console.log('FORM INVALID');
      this.debugFormValidation();
      alert('Veuillez corriger les erreurs du formulaire');
    }
  }

  getContentIcon(type: string): string {
    const icons: { [key: string]: string } = {
      video: 'play_circle',
      pdf: 'picture_as_pdf',
      text: 'article',
      quiz: 'quiz',
    };
    return icons[type] || 'description';
  }

  getContentLabel(type: string): string {
    const labels: { [key: string]: string } = {
      video: 'Vidéo',
      pdf: 'Document PDF',
      text: 'Contenu textuel',
      quiz: 'Quiz interactif',
    };
    return labels[type] || type.toUpperCase();
  }

  getQuestionTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      multiple_choice: 'Choix multiple',
      true_false: 'Vrai/Faux',
      short_answer: 'Réponse courte',
    };
    return labels[type] || type;
  }

  debugFormValidation(): void {
    console.log('=== DEBUG FORM VALIDATION ===');
    console.log('Form valid:', this.lessonForm.valid);
    console.log('Form errors:', this.lessonForm.errors);
    console.log('Form value:', this.lessonForm.value);

    Object.keys(this.lessonForm.controls).forEach((key) => {
      const control = this.lessonForm.get(key);
      console.log(`${key}:`, {
        valid: control?.valid,
        errors: control?.errors,
        value: control?.value,
      });
    });

    console.log('Contents FormArray:', {
      valid: this.contents.valid,
      errors: this.contents.errors,
      length: this.contents.length,
    });

    this.contents.controls.forEach((control, index) => {
      console.log(`Content ${index}:`, {
        valid: control.valid,
        errors: control.errors,
        value: control.value,
      });
    });
  }

  canSubmitForm(): boolean {
    const contentType = this.getCurrentContentType();
    
    if (contentType === 'quiz') {
      const content = this.contents.at(0);
      const quizTitleValid = content.get('quiz_title')?.valid ?? false;
      const quizDescValid = content.get('quiz_description')?.valid ?? false;
      const questions = content.get('questions') as FormArray;
      const questionsValid = questions.length > 0 && questions.valid;
      
      return quizTitleValid && quizDescValid && questionsValid;
    } else {
      const titleValid = this.lessonForm.get('title')?.valid ?? false;
      const durationValid = this.lessonForm.get('duration_minutes')?.valid ?? false;
      const basicFieldsValid = titleValid && durationValid;

      const contentsValid = this.contents.controls.every((control) => {
        const typeControl = control.get('type');
        const typeValid = typeControl?.valid ?? false;
        
        if (!typeValid) return false;
        
        switch (contentType) {
          case 'video':
            const videoInputType = control.get('video_input_type')?.value || 'url';
            if (videoInputType === 'url') {
              return !!(control.get('external_url')?.value?.trim());
            } else {
              return !!(control.get('file')?.value);
            }
            
          case 'pdf':
            return !!(control.get('file')?.value);
            
          case 'text':
            return !!(control.get('data')?.value?.trim());
            
          default:
            return true;
        }
      });

      return basicFieldsValid && contentsValid && this.contents.length > 0;
    }
  }

  forceValidation(): void {
    this.lessonForm.markAllAsTouched();
    this.contents.controls.forEach((control) => {
      control.markAllAsTouched();
    });
  }
}