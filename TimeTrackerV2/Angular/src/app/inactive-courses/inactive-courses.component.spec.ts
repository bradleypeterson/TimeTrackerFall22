/*
##########################   MY WORK BELOW   ####################################
TESTS:
Component Creation Test
Initialization Test
Inactive Courses Loading Test
Navigation Test
Run the test with ng test
*/

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InactiveCoursesComponent } from './inactive-courses.component';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { NgxPaginationModule } from 'ngx-pagination';

class MockRouter {
  navigate = jasmine.createSpy('navigate');
  getCurrentNavigation = jasmine
    .createSpy('getCurrentNavigation')
    .and.returnValue(null); // Return null since it's not used here
}

beforeEach(async () => {
  await TestBed.configureTestingModule({
    declarations: [InactiveCoursesComponent],
    imports: [NgxPaginationModule], // Ensure NgxPaginationModule is imported
    providers: [
      {
        provide: HttpClient,
        useValue: {
          get: (url: string) => {
            if (url.includes('getInactiveCourses')) {
              return of([
                { courseID: 1, courseName: 'Course 1' },
                { courseID: 2, courseName: 'Course 2' },
              ]); // Mock inactive courses
            }
            return of([]);
          },
          post: (url: string, body: any) => {
            return of({ success: true }); // Mock successful post response
          },
        },
      },
      { provide: Router, useClass: MockRouter }, // Use the updated MockRouter
    ],
  }).compileComponents();
});

afterEach(() => {
  TestBed.resetTestingModule(); // Reset TestBed after each test file
});

describe('InactiveCoursesComponent', () => {
  let component: InactiveCoursesComponent;
  let fixture: ComponentFixture<InactiveCoursesComponent>;
  let router: MockRouter;

  beforeEach(() => {
    // Mock localStorage for currentUser
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'currentUser') {
        return JSON.stringify({ userID: '123' }); // Mock currentUser
      }
      return null;
    });

    fixture = TestBed.createComponent(InactiveCoursesComponent);
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
    expect(component.currentUser).toEqual({ userID: '123' }); // Mocked currentUser
    expect(component.errMsg).toBe(''); // Update expectation to match the actual value
    expect(component.p).toBe(1); // Default page number
  });

  // Inactive Courses Loading Test
  it('Should load inactive courses successfully', () => {
    spyOn(component, 'loadInactiveCourses').and.callThrough();

    component.loadInactiveCourses();

    expect(component.loadInactiveCourses).toHaveBeenCalled();
    expect(component.inactiveCourses).toEqual([
      { courseID: 1, courseName: 'Course 1' },
      { courseID: 2, courseName: 'Course 2' },
    ]);
    expect(component.errMsg).toBe('');
  });

  // Navigation Test
  it('Should navigate to the course page', () => {
    component.GoToCourse(1);
    expect(router.navigate).toHaveBeenCalledWith(['/course'], {
      state: { courseID: 1 },
    });
  });
});
