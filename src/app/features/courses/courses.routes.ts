import { Routes } from '@angular/router';
import { CoursesComponent } from './courses.component';
import { CourseDetailComponent } from './course-detail/course-detail.component';
import { CourseLessonsComponent } from './course-lessons/course-lessons.component';
import { TextLessonComponent } from './text-lesson/text-lesson.component';
import { VideoLessonComponent } from './video-lesson/video-lesson.component';
import { PdfLessonComponent } from './pdf-lesson/pdf-lesson.component';
import { QuizComponent } from './quiz/quiz.component';
import { CourseFormComponent } from './course-form/course-form.component';
import { FormLessonComponent } from './form-lesson/form-lesson.component';
import { CertificatComponent } from './certificat/certificat.component';
import { CourseEditComponent } from './course-edit/course-edit.component';
import { EditLessonComponent } from './edit-lesson/edit-lesson.component';

export const COURSES_ROUTES: Routes = [
  {
    path: '',
    component: CoursesComponent,
  },
  {
    path: ':id',
    component: CourseDetailComponent,
  },
  {
    path: ':id/lessons',
    component: CourseLessonsComponent,
  },
  {
    path: ':id/lessons/texte/:idLesson',
    component: TextLessonComponent,
  },
  {
    path: ':id/lessons/video/:idLesson',
    component: VideoLessonComponent,
  },
  {
    path: ':id/lessons/pdf/:idLesson',
    component: PdfLessonComponent,
  },
  {
    path: ':id/lessons/quizz/:idCourse',
    component: QuizComponent,
  },
  {
    path: ':id/certificat/:idcourse',
    component: CertificatComponent,
  },
  {
    path: ':id/addlessons', 
    component: FormLessonComponent,
  },
  {
    path: ':id/lessons/edit-lesson/:lessonId',
    component: EditLessonComponent, 
  },
  { path: ':id/edit', component: CourseEditComponent },
];

export default COURSES_ROUTES;
