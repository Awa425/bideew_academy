import { Routes } from '@angular/router';
import { CoursesComponent } from './courses.component';
import { CourseDetailComponent } from './course-detail/course-detail.component';
import { CourseLessonsComponent } from './course-lessons/course-lessons.component';
import { TextLessonComponent } from './text-lesson/text-lesson.component';

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
    path: ':id/lessons/:id',
    component: TextLessonComponent
  }
];

export default COURSES_ROUTES;
