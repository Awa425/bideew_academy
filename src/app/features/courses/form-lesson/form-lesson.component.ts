import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
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
import { NotificationService } from '../../../core/services/notification.service';
import Quill from 'quill';

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
export class FormLessonComponent implements OnInit, AfterViewInit {
  lessonForm: FormGroup;
  courseId!: number;
  contentTypes = ['video', 'pdf', 'text', 'quizzes'];
  videoInputType: 'url' | 'upload' = 'url';
  questionTypes = ['multiple_choice', 'single_choice', 'text'];

  expandedQuestions: Set<string> = new Set();
  expandedAnswers: Set<string> = new Set();
  addingNewQuestion = false;
  addingNewAnswer = false;

  success: string = '';
  error: string = '';
  isSubmitting = false;

  @ViewChild('quillEditor') quillEditorRef!: ElementRef;
  quillEditor: Quill | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private notificationService: NotificationService
  ) {
    this.lessonForm = this.fb.group({
      title: ['', Validators.required],
      duration_minutes: ['', [Validators.required, Validators.min(1)]],
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

    // S'abonner aux notifications
    this.notificationService.currentSuccessMessage.subscribe((message) => {
      this.success = message;
      if (message) {
        setTimeout(() => {
          this.success = '';
          this.notificationService.clearSuccessMessage();
        }, 5000);
      }
    });

    this.notificationService.currentErrorMessage.subscribe((message) => {
      this.error = message;
      if (message) {
        setTimeout(() => {
          this.error = '';
          this.notificationService.clearErrorMessage();
        }, 5000);
      }
    });
  }

  ngAfterViewInit(): void {
    // L'initialisation de Quill se fera quand le type "text" est sélectionné
  }

  initializeQuillEditor(): void {
    if (this.quillEditorRef && !this.quillEditor) {
      // Configuration de la toolbar Quill avec options de formatage
      const toolbarOptions = [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'align': [] }],
        ['blockquote', 'code-block'],
        [{ 'color': [] }, { 'background': [] }],
        ['clean']
      ];

      this.quillEditor = new Quill(this.quillEditorRef.nativeElement, {
        theme: 'snow',
        modules: {
          toolbar: toolbarOptions
        },
        placeholder: 'Rédigez votre contenu ici...'
      });

      // Synchroniser le contenu de Quill avec le formulaire
      this.quillEditor.on('text-change', () => {
        if (this.quillEditor) {
          const htmlContent = this.quillEditor.root.innerHTML;
          const content = this.contents.at(0);
          content.get('data')?.setValue(htmlContent);
          content.get('data')?.markAsTouched();
        }
      });
    }
  }

  destroyQuillEditor(): void {
    if (this.quillEditor) {
      // Quill ne fournit pas de méthode destroy, on réinitialise juste la référence
      this.quillEditor = null;
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
      video_input_type: ['url'],
    });
  }

  createQuestionFormGroup(): FormGroup {
    return this.fb.group({
      type: ['multiple_choice', Validators.required],
      text: ['', Validators.required],
      answers: this.fb.array([this.createAnswerFormGroup()]),
    });
  }

  createAnswerFormGroup(): FormGroup {
    return this.fb.group({
      text: ['', Validators.required],
      is_correct: [false],
    });
  }

  get contents(): FormArray {
    return this.lessonForm.get('contents') as FormArray;
  }

  getQuestions(contentIndex: number): FormArray {
    return this.contents.at(contentIndex).get('questions') as FormArray;
  }

  getAnswers(contentIndex: number, questionIndex: number): FormArray {
    return this.getQuestions(contentIndex)
      .at(questionIndex)
      .get('answers') as FormArray;
  }

  // === Méthodes pour les questions ===

  getQuestionId(contentIndex: number, questionIndex: number): string {
    return `content-${contentIndex}-question-${questionIndex}`;
  }

  isQuestionExpanded(contentIndex: number, questionIndex: number): boolean {
    const id = this.getQuestionId(contentIndex, questionIndex);
    return this.expandedQuestions.has(id);
  }

  onQuestionExpansionChange(
    contentIndex: number,
    questionIndex: number,
    expanded: boolean
  ): void {
    const id = this.getQuestionId(contentIndex, questionIndex);
    if (expanded) {
      this.expandedQuestions.add(id);
      this.expandFirstAnswer(contentIndex, questionIndex);
    } else {
      this.expandedQuestions.delete(id);
      this.collapseAllAnswersInQuestion(contentIndex, questionIndex);
    }
  }

  expandLastQuestion(contentIndex: number): void {
    const questions = this.getQuestions(contentIndex);
    if (questions.length > 0) {
      const lastIndex = questions.length - 1;
      const id = this.getQuestionId(contentIndex, lastIndex);
      this.expandedQuestions.add(id);
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
    this.expandedAnswers.clear();
  }

  expandAllQuestions(contentIndex: number): void {
    const questions = this.getQuestions(contentIndex);
    for (let i = 0; i < questions.length; i++) {
      const id = this.getQuestionId(contentIndex, i);
      this.expandedQuestions.add(id);
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

  getQuestionPreview(contentIndex: number, questionIndex: number): string {
    const question = this.getQuestions(contentIndex).at(questionIndex);
    const text = question.get('text')?.value;
    if (!text || text.trim() === '') {
      return '';
    }
    return text.length > 50 ? text.substring(0, 50) + '...' : text;
  }

  addQuestion(contentIndex: number): void {
    this.addingNewQuestion = true;
    const questions = this.getQuestions(contentIndex);
    questions.push(this.createQuestionFormGroup());

    this.collapseAllQuestions(contentIndex);

    setTimeout(() => {
      this.expandLastQuestion(contentIndex);
      this.addingNewQuestion = false;
    }, 100);
  }

  removeQuestion(contentIndex: number, questionIndex: number): void {
    const questions = this.getQuestions(contentIndex);
    const questionId = this.getQuestionId(contentIndex, questionIndex);

    this.expandedQuestions.delete(questionId);
    this.collapseAllAnswersInQuestion(contentIndex, questionIndex);

    questions.removeAt(questionIndex);
  }

  // === Méthodes pour les réponses ===

  getAnswerId(
    contentIndex: number,
    questionIndex: number,
    answerIndex: number
  ): string {
    return `content-${contentIndex}-question-${questionIndex}-answer-${answerIndex}`;
  }

  isAnswerExpanded(
    contentIndex: number,
    questionIndex: number,
    answerIndex: number
  ): boolean {
    const id = this.getAnswerId(contentIndex, questionIndex, answerIndex);
    return this.expandedAnswers.has(id);
  }

  onAnswerExpansionChange(
    contentIndex: number,
    questionIndex: number,
    answerIndex: number,
    expanded: boolean
  ): void {
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

  collapseAllAnswersInQuestion(
    contentIndex: number,
    questionIndex: number
  ): void {
    const answers = this.getAnswers(contentIndex, questionIndex);
    for (let i = 0; i < answers.length; i++) {
      const id = this.getAnswerId(contentIndex, questionIndex, i);
      this.expandedAnswers.delete(id);
    }
  }

  getAnswerPreview(
    contentIndex: number,
    questionIndex: number,
    answerIndex: number
  ): string {
    const answer = this.getAnswers(contentIndex, questionIndex).at(answerIndex);
    const text = answer.get('text')?.value;
    if (!text || text.trim() === '') {
      return '';
    }
    return text.length > 30 ? text.substring(0, 30) + '...' : text;
  }

  addAnswer(contentIndex: number, questionIndex: number): void {
    this.addingNewAnswer = true;
    const answers = this.getAnswers(contentIndex, questionIndex);
    answers.push(this.createAnswerFormGroup());

    this.collapseAllAnswersInQuestion(contentIndex, questionIndex);

    setTimeout(() => {
      this.expandLastAnswer(contentIndex, questionIndex);
      this.addingNewAnswer = false;
    }, 100);
  }

  removeAnswer(
    contentIndex: number,
    questionIndex: number,
    answerIndex: number
  ): void {
    const answers = this.getAnswers(contentIndex, questionIndex);
    const answerId = this.getAnswerId(contentIndex, questionIndex, answerIndex);

    this.expandedAnswers.delete(answerId);

    answers.removeAt(answerIndex);
  }

  // === Méthodes pour le type de contenu ===

  isQuizContent(): boolean {
    if (this.contents.length === 0) return false;
    const currentContentType = this.contents.at(0).get('type')?.value;
    return currentContentType === 'quizzes';
  }

  getCurrentContentType(): string {
    if (this.contents.length === 0) return '';
    return this.contents.at(0).get('type')?.value || '';
  }

  onContentTypeChange(contentIndex: number, newType: string): void {
    const content = this.contents.at(contentIndex);

    this.expandedQuestions.clear();
    this.expandedAnswers.clear();

    // Gérer l'éditeur Quill
    if (newType === 'text') {
      setTimeout(() => this.initializeQuillEditor(), 100);
    } else {
      this.destroyQuillEditor();
    }

    // Réinitialiser les validateurs
    this.lessonForm.get('title')?.clearValidators();
    this.lessonForm.get('duration_minutes')?.clearValidators();
    content.get('quiz_title')?.clearValidators();
    content.get('quiz_description')?.clearValidators();
    content.get('data')?.clearValidators();
    content.get('external_url')?.clearValidators();
    content.get('file')?.clearValidators();

    if (newType === 'quizzes') {
      // Pour les quiz, les champs généraux ne sont pas obligatoires
      content.get('quiz_title')?.setValidators([Validators.required]);
      content.get('quiz_description')?.setValidators([Validators.required]);

      const questions = content.get('questions') as FormArray;
      if (questions.length === 0) {
        questions.push(this.createQuestionFormGroup());
        setTimeout(() => {
          this.expandLastQuestion(contentIndex);
        }, 100);
      }
    } else {
      // Pour les autres types, les champs généraux sont obligatoires
      this.lessonForm.get('title')?.setValidators([Validators.required]);
      this.lessonForm
        .get('duration_minutes')
        ?.setValidators([Validators.required, Validators.min(1)]);

      // Ajouter les validateurs spécifiques au type
      if (newType === 'text') {
        content.get('data')?.setValidators([Validators.required]);
      } else if (newType === 'pdf') {
        content.get('file')?.setValidators([this.fileRequiredValidator]);
      } else if (newType === 'video') {
        // Pour la vidéo, nous allons configurer les validateurs dynamiquement
        this.setupVideoValidators(content);
      }

      const questions = content.get('questions') as FormArray;
      questions.clear();
    }

    // Mettre à jour la validation
    this.lessonForm.get('title')?.updateValueAndValidity();
    this.lessonForm.get('duration_minutes')?.updateValueAndValidity();
    content.get('quiz_title')?.updateValueAndValidity();
    content.get('quiz_description')?.updateValueAndValidity();
    content.get('data')?.updateValueAndValidity();
    content.get('file')?.updateValueAndValidity();
    content.get('external_url')?.updateValueAndValidity();
  }

  // Validateur personnalisé pour les fichiers
  fileRequiredValidator(control: any) {
    return control.value ? null : { required: true };
  }

  setupVideoValidators(content: any): void {
    const videoInputType = content.get('video_input_type')?.value || 'url';

    if (videoInputType === 'url') {
      content.get('external_url')?.setValidators([Validators.required]);
      content.get('file')?.clearValidators();
    } else {
      content.get('file')?.setValidators([this.fileRequiredValidator]);
      content.get('external_url')?.clearValidators();
    }

    content.get('external_url')?.updateValueAndValidity();
    content.get('file')?.updateValueAndValidity();
  }

  onVideoInputTypeChange(
    contentIndex: number,
    inputType: 'url' | 'upload'
  ): void {
    const content = this.contents.at(contentIndex);
    content.get('video_input_type')?.setValue(inputType);

    if (inputType === 'url') {
      content.get('file')?.setValue(null);
      content.get('file')?.clearValidators();
      content.get('external_url')?.setValidators([Validators.required]);
    } else {
      content.get('external_url')?.setValue('');
      content.get('external_url')?.clearValidators();
      content.get('file')?.setValidators([this.fileRequiredValidator]);
    }

    content.get('external_url')?.updateValueAndValidity();
    content.get('file')?.updateValueAndValidity();

    // Mettre à jour l'état de validation du formulaire
    this.lessonForm.updateValueAndValidity();
  }

  onFileChange(event: any, index: number): void {
    const file = event.target.files[0];
    const content = this.contents.at(index);

    if (file) {
      const contentType = content.get('type')?.value;

      // Validation du type de fichier
      if (contentType === 'pdf' && !file.type.includes('pdf')) {
        this.notificationService.setErrorMessage('Veuillez sélectionner un fichier PDF');
        event.target.value = '';
        return;
      }

      if (contentType === 'video' && !file.type.includes('video')) {
        this.notificationService.setErrorMessage('Veuillez sélectionner un fichier vidéo');
        event.target.value = '';
        return;
      }

      content.get('file')?.setValue(file);
      content.get('file')?.markAsTouched();
    } else {
      content.get('file')?.setValue(null);
    }

    content.get('file')?.updateValueAndValidity();
    this.lessonForm.updateValueAndValidity();
  }

  goBack(): void {
    this.router.navigate(['/courses', this.courseId, 'lessons']);
  }

  onSubmit(): void {
    console.log('=== onSubmit appelé ===');
    console.log('Form valid:', this.lessonForm.valid);
    console.log('Form errors:', this.lessonForm.errors);
    console.log('Form value:', this.lessonForm.value);

    this.forceValidation();

    // Pour les quiz, on utilise canSubmitForm() au lieu de lessonForm.valid
    const isFormValid = this.isQuizContent() ? this.canSubmitForm() : this.lessonForm.valid;

    if (isFormValid && this.courseId && !this.isSubmitting) {
      // Activer l'indicateur de chargement
      this.isSubmitting = true;

      // Protection timeout : débloquer après 60 secondes si aucune réponse
      const timeoutId = setTimeout(() => {
        if (this.isSubmitting) {
          console.warn('Timeout: La requête a pris trop de temps');
          this.isSubmitting = false;
          this.notificationService.setErrorMessage(
            'La requête a expiré. Le fichier est peut-être trop volumineux ou la connexion est lente.'
          );
        }
      }, 60000); // 60 secondes pour les uploads de fichiers
      console.log('Formulaire valide, préparation des données...');

      const formValue = this.lessonForm.value;
      const formData = new FormData();

      const contents = formValue.contents || [];
      if (contents.length > 0) {
        const content = contents[0];

        if (content && content.type && content.type.trim() !== '') {
          console.log('Type de contenu:', content.type);

          formData.append('content[type]', content.type);

          if (content.type === 'quizzes') {
            formData.append('title', content.quiz_title || 'Quiz sans titre');
            formData.append(
              'duration_minutes',
              (content.quiz_duration || 15).toString()
            );
          } else {
            formData.append('title', formValue.title || '');
            formData.append(
              'duration_minutes',
              (formValue.duration_minutes || 0).toString()
            );
          }

          formData.append('course_id', this.courseId.toString());
          formData.append('order', '1');
          formData.append('is_locked', 'true');

          switch (content.type) {
            case 'pdf':
              console.log('Création leçon PDF...');
              if (content.file) {
                formData.append(
                  'content[file]',
                  content.file,
                  content.file.name
                );

                this.courseService
                  .createLesson(this.courseId, formData)
                  .subscribe({
                    next: (response) => {
                      clearTimeout(timeoutId);
                      this.isSubmitting = false;
                      console.log('Leçon PDF créée avec succès:', response);
                      this.notificationService.setSuccessMessage(
                        'Leçon PDF créée avec succès !'
                      );
                      setTimeout(() => {
                        this.goBack();
                      }, 1000);
                    },
                    error: (error) => {
                      clearTimeout(timeoutId);
                      this.isSubmitting = false;
                      console.error(
                        'Erreur lors de la création de la leçon PDF:',
                        error
                      );
                      this.notificationService.setErrorMessage(
                        'Erreur lors de la création de la leçon PDF. Veuillez réessayer.'
                      );
                    },
                  });
              } else {
                console.error('Fichier PDF manquant');
                this.isSubmitting = false;
                this.notificationService.setErrorMessage('Veuillez sélectionner un fichier PDF');
              }
              break;

            case 'video':
              console.log('Création leçon vidéo...');
              const videoInputType = content.video_input_type || 'url';
              console.log('Type entrée vidéo:', videoInputType);

              // Logs pour débugger le FormData
              console.log('=== FormData avant envoi vidéo ===');
              formData.forEach((value, key) => {
                console.log(`${key}:`, value);
              });

              if (videoInputType === 'url') {
                if (
                  content.external_url &&
                  content.external_url.trim() !== ''
                ) {
                  console.log('URL vidéo:', content.external_url);
                  formData.append(
                    'content[external_url]',
                    content.external_url.trim()
                  );

                  console.log('Envoi requête URL vidéo...');
                  this.courseService
                    .createLesson(this.courseId, formData)
                    .subscribe({
                      next: (response) => {
                        clearTimeout(timeoutId);
                        this.isSubmitting = false;
                        console.log('Leçon vidéo créée avec succès:', response);
                        this.notificationService.setSuccessMessage(
                          'Leçon vidéo créée avec succès !'
                        );
                        setTimeout(() => {
                          this.goBack();
                        }, 1000);
                      },
                      error: (error) => {
                        clearTimeout(timeoutId);
                        this.isSubmitting = false;
                        console.error(
                          'Erreur lors de la création de la leçon vidéo:',
                          error
                        );
                        console.error('Détails erreur:', {
                          status: error.status,
                          statusText: error.statusText,
                          message: error.error?.message,
                          errors: error.error?.errors
                        });
                        this.notificationService.setErrorMessage(
                          'Erreur lors de la création de la leçon vidéo. Veuillez réessayer.'
                        );
                      },
                    });
                } else {
                  console.error('URL vidéo manquante');
                  this.isSubmitting = false;
                  this.notificationService.setErrorMessage('Veuillez saisir une URL de vidéo');
                }
              } else {
                if (content.file) {
                  console.log('Fichier vidéo:', content.file.name);
                  console.log('Taille fichier:', content.file.size, 'bytes');
                  console.log('Type fichier:', content.file.type);
                  formData.append(
                    'content[file]',
                    content.file,
                    content.file.name
                  );

                  console.log('Envoi requête upload vidéo...');
                  this.courseService
                    .createLesson(this.courseId, formData)
                    .subscribe({
                      next: (response) => {
                        clearTimeout(timeoutId);
                        this.isSubmitting = false;
                        console.log('Leçon vidéo créée avec succès:', response);
                        this.notificationService.setSuccessMessage(
                          'Leçon vidéo créée avec succès !'
                        );
                        setTimeout(() => {
                          this.goBack();
                        }, 1000);
                      },
                      error: (error) => {
                        clearTimeout(timeoutId);
                        this.isSubmitting = false;
                        console.error(
                          'Erreur lors de la création de la leçon vidéo:',
                          error
                        );
                        console.error('Détails erreur:', {
                          status: error.status,
                          statusText: error.statusText,
                          message: error.error?.message,
                          errors: error.error?.errors
                        });

                        let errorMessage = 'Erreur lors de la création de la leçon vidéo.';
                        if (error.status === 413) {
                          errorMessage = 'Le fichier vidéo est trop volumineux.';
                        } else if (error.status === 0) {
                          errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
                        } else if (error.error?.message) {
                          errorMessage = error.error.message;
                        }

                        this.notificationService.setErrorMessage(errorMessage);
                      },
                    });
                } else {
                  console.error('Fichier vidéo manquant');
                  this.isSubmitting = false;
                  this.notificationService.setErrorMessage('Veuillez sélectionner un fichier vidéo');
                }
              }
              break;

            case 'text':
              console.log('Création leçon texte...');
              if (content.data && content.data.trim() !== '') {
                formData.append('content[data]', content.data.trim());

                this.courseService
                  .createLesson(this.courseId, formData)
                  .subscribe({
                    next: (response) => {
                      clearTimeout(timeoutId);
                      this.isSubmitting = false;
                      console.log('Leçon texte créée avec succès:', response);
                      this.notificationService.setSuccessMessage(
                        'Leçon texte créée avec succès !'
                      );
                      setTimeout(() => {
                        this.goBack();
                      }, 1000);
                    },
                    error: (error) => {
                      clearTimeout(timeoutId);
                      this.isSubmitting = false;
                      console.error(
                        'Erreur lors de la création de la leçon texte:',
                        error
                      );
                      this.notificationService.setErrorMessage(
                        'Erreur lors de la création de la leçon texte. Veuillez réessayer.'
                      );
                    },
                  });
              } else {
                console.error('Contenu texte manquant');
                this.isSubmitting = false;
                this.notificationService.setErrorMessage('Veuillez saisir le contenu texte');
              }
              break;

            case 'quizzes':
              console.log('Création quiz...');
              const quizPayload: any = {
                title: content.quiz_title || '',
                description: content.quiz_description || '',
                questions: (content.questions || []).map((question: any) => ({
                  type: question.type || 'multiple_choice',
                  text: question.text || '',
                  answers: (question.answers || []).map((answer: any) => ({
                    text: answer.text || '',
                    is_correct: answer.is_correct || false,
                  })),
                })),
              };

              console.log('Payload quiz:', quizPayload);

              this.courseService
                .createQuiz(this.courseId, quizPayload)
                .subscribe({
                  next: (response) => {
                    clearTimeout(timeoutId);
                    this.isSubmitting = false;
                    console.log('Quiz créé avec succès:', response);
                    this.notificationService.setSuccessMessage(
                      'Quiz créé avec succès !'
                    );
                    setTimeout(() => {
                      this.goBack();
                    }, 1000);
                  },
                  error: (err) => {
                    clearTimeout(timeoutId);
                    this.isSubmitting = false;
                    console.error('ERREUR création quiz:', err);
                    if (err.status === 422) {
                      console.error(
                        'Erreurs de validation:',
                        err.error?.errors
                      );
                      let errorMsg = 'Erreurs de validation:\n';
                      if (err.error?.errors) {
                        Object.keys(err.error.errors).forEach((key) => {
                          errorMsg += `- ${key}: ${err.error.errors[key].join(
                            ', '
                          )}\n`;
                        });
                      }
                      this.notificationService.setErrorMessage(errorMsg);
                    } else {
                      this.notificationService.setErrorMessage(
                        `Erreur ${err.status}: ${
                          err.error?.message || 'Erreur inconnue'
                        }`
                      );
                    }
                  },
                });
              break;
          }
        } else {
          console.error('Type de contenu manquant');
          this.isSubmitting = false;
          this.notificationService.setErrorMessage('Veuillez sélectionner un type de contenu');
        }
      } else {
        console.error('Aucun contenu');
        this.isSubmitting = false;
        this.notificationService.setErrorMessage('Veuillez ajouter au moins un contenu');
      }
    } else {
      console.log('Formulaire invalide ou courseId manquant');
      console.log('Errors détaillés:');
      this.debugFormValidation();
      this.notificationService.setErrorMessage(
        'Veuillez corriger les erreurs du formulaire avant de soumettre.'
      );
    }
  }

  getContentIcon(type: string): string {
    const icons: { [key: string]: string } = {
      video: 'play_circle',
      pdf: 'picture_as_pdf',
      text: 'article',
      quizzes: 'quiz',
    };
    return icons[type] || 'description';
  }

  getContentLabel(type: string): string {
    const labels: { [key: string]: string } = {
      video: 'Vidéo',
      pdf: 'Document PDF',
      text: 'Contenu textuel',
      quizzes: 'Quiz',
    };
    return labels[type] || type;
  }

  getQuestionTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      multiple_choice: 'Choix multiple',
      single_choice: 'Choix unique',
      text: 'Réponse texte',
    };
    return labels[type] || type;
  }

  canSubmitForm(): boolean {
    console.log('=== Vérification canSubmitForm ===');

    if (this.contents.length === 0) {
      console.log('❌ Aucun contenu');
      return false;
    }

    const contentType = this.getCurrentContentType();
    const content = this.contents.at(0);

    console.log('📝 Type de contenu:', contentType);
    console.log('📦 Contenu:', content.value);

    if (contentType === 'quizzes') {
      const quizTitleValid = content.get('quiz_title')?.valid ?? false;
      const quizDescValid = content.get('quiz_description')?.valid ?? false;
      const questions = content.get('questions') as FormArray;
      const hasQuestions = questions.length > 0;

      // Vérifier que chaque question a au moins une réponse correcte ET que tous les champs sont valides
      let questionsValid = true;
      if (hasQuestions) {
        for (let i = 0; i < questions.length; i++) {
          const question = questions.at(i);

          // Vérifier que la question elle-même est valide (texte rempli)
          const questionTextValid = !!question.get('text')?.value?.trim();
          if (!questionTextValid) {
            console.log(`❌ Question ${i} invalide: texte manquant`);
            console.log('   Texte actuel:', question.get('text')?.value);
            questionsValid = false;
            break;
          }

          const answers = question.get('answers') as FormArray;

          // Vérifier qu'il y a au moins 2 réponses
          if (answers.length < 2) {
            console.log(`❌ Question ${i} invalide: seulement ${answers.length} réponse(s), minimum 2 requis`);
            questionsValid = false;
            break;
          }

          // Vérifier que toutes les réponses ont du texte
          const allAnswersHaveText = answers.controls.every(
            (answer) => !!answer.get('text')?.value?.trim()
          );
          if (!allAnswersHaveText) {
            console.log(`❌ Question ${i} invalide: réponse(s) sans texte`);
            // Afficher quelles réponses sont vides
            answers.controls.forEach((answer, idx) => {
              const text = answer.get('text')?.value;
              if (!text || !text.trim()) {
                console.log(`   - Réponse ${idx}: vide ou invalide`);
              }
            });
            questionsValid = false;
            break;
          }

          // Vérifier qu'il y a au moins une réponse correcte
          const hasCorrectAnswer = answers.controls.some(
            (answer) => answer.get('is_correct')?.value === true
          );
          if (!hasCorrectAnswer) {
            console.log(`❌ Question ${i} invalide: aucune réponse marquée comme correcte`);
            questionsValid = false;
            break;
          }
        }
      }

      const finalResult = quizTitleValid && quizDescValid && hasQuestions && questionsValid;

      console.log('📊 Quiz validation:');
      console.log(`   ✓ Titre: ${quizTitleValid ? '✅' : '❌'}`);
      console.log(`   ✓ Description: ${quizDescValid ? '✅' : '❌'}`);
      console.log(`   ✓ A des questions: ${hasQuestions ? '✅' : '❌'} (${questions.length} question(s))`);
      console.log(`   ✓ Questions valides: ${questionsValid ? '✅' : '❌'}`);
      console.log(`   🎯 RÉSULTAT FINAL: ${finalResult ? '✅ VALIDE' : '❌ INVALIDE'}`);

      return finalResult;
    } else {
      const titleValid = this.lessonForm.get('title')?.valid ?? false;
      const durationValid =
        this.lessonForm.get('duration_minutes')?.valid ?? false;

      console.log(
        'Champs généraux - Titre:',
        titleValid,
        'Durée:',
        durationValid
      );

      if (!titleValid || !durationValid) {
        console.log('Champs généraux invalides');
        return false;
      }

      let contentValid = false;

      switch (contentType) {
        case 'video':
          const videoInputType =
            content.get('video_input_type')?.value || 'url';
          console.log('Type entrée vidéo:', videoInputType);

          if (videoInputType === 'url') {
            const externalUrlValid = !!content
              .get('external_url')
              ?.value?.trim();
            console.log('URL valide:', externalUrlValid);
            contentValid = externalUrlValid;
          } else {
            const fileValid = !!content.get('file')?.value;
            console.log('Fichier valide:', fileValid);
            contentValid = fileValid;
          }
          break;

        case 'pdf':
          contentValid = !!content.get('file')?.value;
          console.log('PDF valide:', contentValid);
          break;

        case 'text':
          contentValid = !!content.get('data')?.value?.trim();
          console.log('Texte valide:', contentValid);
          break;

        default:
          console.log('Type non reconnu');
          contentValid = false;
      }

      console.log(
        'Résultat final canSubmitForm:',
        titleValid && durationValid && contentValid
      );
      return titleValid && durationValid && contentValid;
    }
  }

  getQuizValidationError(): string | null {
    if (!this.isQuizContent()) return null;

    const content = this.contents.at(0);
    const quizTitleValid = content.get('quiz_title')?.valid ?? false;
    const quizDescValid = content.get('quiz_description')?.valid ?? false;
    const questions = content.get('questions') as FormArray;

    if (!quizTitleValid) {
      return 'Le titre du quiz est requis';
    }

    if (!quizDescValid) {
      return 'La description du quiz est requise';
    }

    if (questions.length === 0) {
      return 'Vous devez ajouter au moins une question';
    }

    // Vérifier chaque question
    for (let i = 0; i < questions.length; i++) {
      const question = questions.at(i);
      const questionTextValid = !!question.get('text')?.value?.trim();

      if (!questionTextValid) {
        return `Question ${i + 1}: Le texte de la question est requis`;
      }

      const answers = question.get('answers') as FormArray;

      if (answers.length < 2) {
        return `Question ${i + 1}: Vous devez ajouter au moins 2 réponses (actuellement: ${answers.length})`;
      }

      // Vérifier que toutes les réponses ont du texte
      for (let j = 0; j < answers.controls.length; j++) {
        const answer = answers.controls[j];
        const text = answer.get('text')?.value;
        if (!text || !text.trim()) {
          return `Question ${i + 1}, Réponse ${j + 1}: Le texte de la réponse est requis`;
        }
      }

      // Vérifier qu'il y a au moins une réponse correcte
      const hasCorrectAnswer = answers.controls.some(
        (answer) => answer.get('is_correct')?.value === true
      );
      if (!hasCorrectAnswer) {
        return `Question ${i + 1}: Vous devez marquer au moins une réponse comme correcte`;
      }
    }

    return null;
  }

  forceValidation(): void {
    console.log('=== Force Validation ===');
    this.lessonForm.markAllAsTouched();

    // Marquer tous les contrôles du FormArray comme touchés
    this.contents.controls.forEach((contentControl, index) => {
      contentControl.markAllAsTouched();
      console.log(`Contenu ${index} valid:`, contentControl.valid);

      // Si c'est un quiz, marquer aussi les questions et réponses
      if (contentControl.get('type')?.value === 'quizzes') {
        const questions = contentControl.get('questions') as FormArray;
        questions.controls.forEach((questionControl, qIndex) => {
          questionControl.markAllAsTouched();
          const answers = questionControl.get('answers') as FormArray;
          answers.controls.forEach((answerControl, aIndex) => {
            answerControl.markAllAsTouched();
            console.log(
              `Réponse ${qIndex}.${aIndex} valid:`,
              answerControl.valid
            );
          });
        });
      }
    });
  }

  debugFormValidation(): void {
    console.log('=== DEBUG FORM VALIDATION ===');
    console.log('Form valid:', this.lessonForm.valid);
    console.log('Form errors:', this.lessonForm.errors);

    // Afficher l'état de chaque contrôle
    Object.keys(this.lessonForm.controls).forEach((key) => {
      const control = this.lessonForm.get(key);
      console.log(`Control ${key}:`, {
        valid: control?.valid,
        errors: control?.errors,
        value: control?.value,
      });
    });

    // Afficher l'état des contenus
    this.contents.controls.forEach((content, index) => {
      console.log(`Content ${index}:`, {
        valid: content.valid,
        errors: content.errors,
        value: content.value,
      });
    });
  }

  // Méthodes pour fermer les alertes
  closeSuccessAlert(): void {
    this.success = '';
    this.notificationService.clearSuccessMessage();
  }

  closeErrorAlert(): void {
    this.error = '';
    this.notificationService.clearErrorMessage();
  }
}
