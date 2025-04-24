/*
##########################   MY WORK BELOW   ####################################
TESTS:
Component Creation Test
Initialization Test
Course Loading Test
Project Filtering Test
Navigation Test
Run the test with ng test
*/

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CourseComponent } from './course.component';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { of } from 'rxjs';

class MockRouter {
  navigate = jasmine.createSpy('navigate');
  getCurrentNavigation = jasmine
    .createSpy('getCurrentNavigation')
    .and.returnValue({
      extras: {
        state: { courseID: '1' }, // Mock navigation state
      },
    });
}

class MockActivatedRoute {
  snapshot = { paramMap: { get: () => '1' } }; // Mock courseID as '1'
}

beforeEach(async () => {
  await TestBed.configureTestingModule({
    declarations: [CourseComponent],
    imports: [FormsModule], // Add FormsModule here
    providers: [
      {
        provide: HttpClient,
        useValue: {
          get: (url: string) => {
            if (url.includes('CourseInfo')) {
              return of({ courseName: 'Test Course', isActive: true }); // Mock course info
            }
            if (url.includes('Projects')) {
              return of({
                allUserProjects: [
                  { projectName: 'Project 1', description: 'Description 1' },
                  { projectName: 'Project 2', description: 'Description 2' },
                ],
                nonUserProjects: [
                  { projectName: 'Project 3', description: 'Description 3' },
                ],
              }); // Mock array response
            }
            if (url.includes('userGroups')) {
              return of([{ projectName: 'User Project 1' }]); // Mock user groups
            }
            if (url.includes('nonUserGroups')) {
              return of([{ projectName: 'Non-User Project 1' }]); // Mock non-user groups
            }
            return of([]);
          },
          post: () => of({}),
        },
      },
      { provide: Router, useClass: MockRouter },
      { provide: ActivatedRoute, useClass: MockActivatedRoute },
    ],
  }).compileComponents();
});

describe('CourseComponent', () => {
  let component: CourseComponent;
  let fixture: ComponentFixture<CourseComponent>;
  let router: MockRouter;

  beforeEach(() => {
    // Mock localStorage for currentUser
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'currentUser') {
        return JSON.stringify({ userID: '123', type: 'instructor' }); // Mock currentUser
      }
      return null;
    });

    fixture = TestBed.createComponent(CourseComponent);
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
    expect(router.getCurrentNavigation).toHaveBeenCalled();
    expect(component.currentUser).toEqual({
      userID: '123',
      type: 'instructor',
    }); // Mocked currentUser
    expect(component.instructor).toBeTrue(); // Based on user type
    expect(component.projects).toEqual([]); // Should be empty
    expect(component.errMsg).toBe('');
    expect(component.allUserGroups).toEqual([]); // Should be empty
    expect(component.nonUserGroups).toEqual([]); // Should be empty
    expect(component.projectSearchQuery).toBe('');
  });

  // Course Loading Test
  it('Should load course information successfully', () => {
    spyOn(component, 'loadProjects').and.callThrough();
    spyOn(component, 'loadAllUserGroups').and.callThrough();
    spyOn(component, 'loadNonUserGroups').and.callThrough();

    component.loadPage();

    expect(component.loadProjects).toHaveBeenCalled();
    expect(component.loadAllUserGroups).toHaveBeenCalled();
    expect(component.loadNonUserGroups).toHaveBeenCalled();
    expect(component.allUserFilteredProjects).toEqual([
      { projectName: 'Project 1', description: 'Description 1' },
      { projectName: 'Project 2', description: 'Description 2' },
    ]);
    expect(component.nonUserFilteredProjects).toEqual([
      { projectName: 'Project 3', description: 'Description 3' },
    ]);
  });

  // Project Filtering Test
  it('Should filter projects based on search query', () => {
    component.allUserGroups = [
      { projectName: 'Math Project' },
      { projectName: 'History Project' },
    ];
    component.nonUserGroups = [
      { projectName: 'Science Project' },
      { projectName: 'Math Project' },
    ];

    component.projectSearchQuery = 'Math';
    component.searchProjects();

    expect(component.allUserFilteredProjects).toEqual([
      { projectName: 'Math Project' },
    ]);
    expect(component.nonUserFilteredProjects).toEqual([
      { projectName: 'Math Project' },
    ]);
  });

  it('Should not filter projects if search query is empty', () => {
    component.allUserGroups = [
      { projectName: 'Math Project' },
      { projectName: 'History Project' },
    ];
    component.nonUserGroups = [
      { projectName: 'Science Project' },
      { projectName: 'Math Project' },
    ];

    component.projectSearchQuery = '';
    component.searchProjects();

    expect(component.allUserFilteredProjects).toEqual(component.allUserGroups);
    expect(component.nonUserFilteredProjects).toEqual(component.nonUserGroups);
  });

  // Navigation Test
  it('Should navigate to edit course page', () => {
    component.NavigateToEditCourse();
    expect(router.navigate).toHaveBeenCalledWith(['/edit-course'], {
      state: { courseID: '1' },
    });
  });

  it('Should navigate to add project page', () => {
    component.NavigateToAddProject();
    expect(router.navigate).toHaveBeenCalledWith(['/create-project'], {
      state: { courseID: '1' },
    });
  });

  it('Should navigate to assign evaluations page', () => {
    component.NavigateToAssignEvals();
    expect(router.navigate).toHaveBeenCalledWith(['/assign-evals'], {
      state: { courseID: '1' },
    });
  });

  it('Should navigate to project details page', () => {
    component.GoToProject(101);
    expect(router.navigate).toHaveBeenCalledWith(['/project'], {
      state: { projectID: 101 },
    });
  });
});
