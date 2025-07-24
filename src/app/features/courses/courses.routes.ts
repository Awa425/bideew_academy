import { Routes } from '@angular/router';
import { CoursesComponent } from './courses.component';
import { CourseDetailComponent } from './course-detail/course-detail.component';
import { CourseLessonsComponent } from './course-lessons/course-lessons.component';
import { TextLessonComponent } from './text-lesson/text-lesson.component';
import { VideoLessonComponent } from './video-lesson/video-lesson.component';
import { PdfLessonComponent } from './pdf-lesson/pdf-lesson.component';
import { QuizComponent } from './quiz/quiz.component';

export const COURSES_ROUTES: Routes = [
  {
    path: '',
    component: CoursesComponent
  },
  {
    path: ':id',
    component: CourseDetailComponent
  },
  {
    path: ':id/lessons',
    component: CourseLessonsComponent
  },
  {
    path: ':id/lessons/texte/:idLesson',
    component: TextLessonComponent
  },
  {
    path: ':id/lessons/video/:idLesson',
    component: VideoLessonComponent
  },
  {
    path: ':id/lessons/pdf/:idLesson',
    component: PdfLessonComponent
  },
  {
    path: ':id/lessons/quizz/:idCourse',
    component: QuizComponent
  }
];

export default COURSES_ROUTES;
