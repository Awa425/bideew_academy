import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ParticlesModule } from '../../shared/components/particles/particles.module';
import { SharedModule } from '../../shared/shared.module';
import { CoursesComponent } from './courses.component';
import { CourseDetailComponent } from './course-detail/course-detail.component';

@NgModule({
  declarations: [
    CoursesComponent,
    CourseDetailComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', component: CoursesComponent },
      { path: ':id', component: CourseDetailComponent }
    ]),
    FormsModule,
    ParticlesModule,
    SharedModule
  ],
  exports: [
    CoursesComponent,
    CourseDetailComponent
  ]
})
export class CoursesModule { }
