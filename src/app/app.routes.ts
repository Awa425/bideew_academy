import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home.component';
import { LearningPathComponent } from './features/learning-path/learning-path.component';
import { ResourcesComponent } from './features/resources/resources.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';

export const routes: Routes = [
  { path: '', redirectTo: '/auth', pathMatch: 'full' },
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: 'home',
        component: HomeComponent,
      },
      {
        path: 'courses',
        loadChildren: () =>
          import('./features/courses/courses.routes').then(
            (m) => m.COURSES_ROUTES
          ),
      },
      {
        path: 'learning-path',
        component: LearningPathComponent,
      },
      {
        path: 'resources',
        component: ResourcesComponent,
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
