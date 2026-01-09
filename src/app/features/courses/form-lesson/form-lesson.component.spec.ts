import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormLessonComponent } from './form-lesson.component';

describe('FormLessonComponent', () => {
  let component: FormLessonComponent;
  let fixture: ComponentFixture<FormLessonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormLessonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormLessonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
