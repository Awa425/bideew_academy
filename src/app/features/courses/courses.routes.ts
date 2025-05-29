import { Routes } from '@angular/router';
import { CoursesComponent } from './courses.component';
import { CourseDetailComponent } from './course-detail/course-detail.component';
import { CourseLessonsComponent } from './course-lessons/course-lessons.component';

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
  }
];

export default COURSES_ROUTES;
