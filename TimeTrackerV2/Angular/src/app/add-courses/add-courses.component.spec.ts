import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddCoursesComponent } from './add-courses.component';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { of } from 'rxjs';

class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

beforeEach(async () => {
  await TestBed.configureTestingModule({
    declarations: [AddCoursesComponent],
    providers: [
      {
        provide: HttpClient,
        useValue: {
          get: (url: string) => {
            if (url.includes('/api/Courses')) {
              return of([
                { courseName: 'Course 1', courseID: '1' },
                { courseName: 'Course 2', courseID: '2' },
              ]); // Mock courses
            }
            return of([]);
          },
        },
      },
      { provide: Router, useClass: MockRouter },
    ],
  }).compileComponents();
});

describe('AddCoursesComponent', () => {
  let component: AddCoursesComponent;
  let fixture: ComponentFixture<AddCoursesComponent>;
  let router: MockRouter;

  beforeEach(() => {
    // Mock localStorage for currentUser
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'currentUser') {
        return JSON.stringify({ userID: '123', type: 'student' }); // Mock currentUser
      }
      return null;
    });

    fixture = TestBed.createComponent(AddCoursesComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as unknown as MockRouter;

    fixture.detectChanges();
  });

  // Component Creation Test
  it('Should create the component', () => {
    expect(component).toBeTruthy();
  });

  // Initialization Test
  it('Should initialize the component', () => {
    expect(component.currentUser).toEqual({ userID: '123', type: 'student' }); // Mocked currentUser
    expect(component.courses).toEqual([]); // Should be empty initially
    expect(component.RegisteredCourses).toEqual([]); // Should be empty initially
  });

  // Navigation Test
  it('Should navigate to a course page', () => {
    component.navigateToCourse('1');
    expect(router.navigate).toHaveBeenCalledWith(['/course'], {
      state: { courseID: '1' },
    });
  });
});
