import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { LearningPathComponent } from './features/learning-path/learning-path.component';
import { Users } from './features/users/users.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { AuthGuard } from './core/guards/auth.guard';
import { CourseFormComponent } from './features/courses/course-form/course-form.component';

export const routes: Routes = [
  { path: '', redirectTo: '/auth', pathMatch: 'full' },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'home',
        component: HomeComponent,
        canActivate: [AuthGuard]
      },
      {
        path: 'courses',
        loadChildren: () =>
          import('./features/courses/courses.routes').then(
            (m) => m.COURSES_ROUTES
          ),
      },
      {
        path: 'course-new',
        component: CourseFormComponent,
      },
      {
        path: 'learning-path',
        component: LearningPathComponent,
      },
      {
        path: 'users',
        component: Users,
      },
    ],
  },
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'auth',
        loadChildren: () =>
          import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
      },
    ]
  },
  { path: '**', redirectTo: '/auth' },
];
