import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfLessonComponent } from './pdf-lesson.component';

describe('PdfLessonComponent', () => {
  let component: PdfLessonComponent;
  let fixture: ComponentFixture<PdfLessonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdfLessonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PdfLessonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
