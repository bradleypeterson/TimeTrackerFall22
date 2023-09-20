import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstructorReportsComponent } from './instructor-reports.component';

describe('InstructorReportsComponent', () => {
  let component: InstructorReportsComponent;
  let fixture: ComponentFixture<InstructorReportsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InstructorReportsComponent]
    });
    fixture = TestBed.createComponent(InstructorReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
