import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseStartComponent } from './course-start.component';

describe('CourseStartComponent', () => {
  let component: CourseStartComponent;
  let fixture: ComponentFixture<CourseStartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseStartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseStartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
