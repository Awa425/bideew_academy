import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ParticlesModule } from '../../shared/components/particles/particles.module';
import { SharedModule } from '../../shared/shared.module';
import { CoursesComponent } from './courses.component';
import { CourseDetailComponent } from './course-detail/course-detail.component';
import { CourseEditComponent } from './course-edit/course-edit.component';
import { EditLessonComponent } from './edit-lesson/edit-lesson.component';

@NgModule({
  declarations: [
    CoursesComponent,
    CourseDetailComponent,
    CourseEditComponent,
    EditLessonComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', component: CoursesComponent },
      { path: ':id/edit', component: CourseEditComponent },
      { path: ':id', component: CourseDetailComponent }
    ]),
    FormsModule,
    ReactiveFormsModule,
    ParticlesModule,
    SharedModule,
  ],
  exports: [
    CoursesComponent,
    CourseDetailComponent,
    CourseEditComponent
  ]
})
export class CoursesModule { }
