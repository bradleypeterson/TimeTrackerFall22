/*
##########################   MY WORK BELOW   ####################################
TESTS: 
Component Creation Test
Initialization Test
Course Loading Test
Successful Project Join Test
Failed Project Join Test
Search Projects Test
Run the test with ng test
*/

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CourseComponent } from './course.component';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

class MockRouter {
  navigate = jasmine.createSpy('navigate');
  getCurrentNavigation = jasmine
    .createSpy('getCurrentNavigation')
    .and.returnValue({ extras: { state: { courseID: 1 } } });
}

class MockActivatedRoute {
  snapshot = { paramMap: { get: (key: string) => '1' } };
}

beforeEach(async () => {
  await TestBed.configureTestingModule({
    declarations: [CourseComponent],
    providers: [
      {
        provide: HttpClient,
        useValue: {
          get: (url: string) => {
            if (url.includes('CourseInfo')) {
              return of({ courseName: 'Test Course' }); // Mock course info
            }
            if (url.includes('Projects')) {
              return of({
                allUserProjects: [{ projectName: 'Project 1' }],
                nonUserProjects: [{ projectName: 'Project 2' }],
              }); // Mock projects
            }
            return of([]);
          },
          post: (url: string, body: any) => {
            if (url.includes('joinGroup')) {
              return of({ success: true }); // Mock successful join response
            }
            if (url.includes('leaveGroup')) {
              return of({ success: true }); // Mock successful leave response
            }
            return of({});
          },
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
    fixture = TestBed.createComponent(CourseComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as unknown as MockRouter;

    // Mock the currentUser property
    component.currentUser = { userID: '123', type: 'student' };

    fixture.detectChanges();
  });

  // Component Creation Test
  it('Should create the component', () => {
    expect(component).toBeTruthy();
  });

  // Initialization Test
  it('Should initialize the component', () => {
    expect(component.courseID).toBe(1); // Mocked courseID
    expect(component.currentUser.userID).toBe('123');
    expect(component.instructor).toBe(false);
    expect(component.student).toBe(true);
  });

  // Course Loading Test
  it('Should load course and projects successfully', () => {
    spyOn(component, 'getCourseInfo').and.callThrough();
    spyOn(component, 'loadProjects').and.callThrough();

    component.loadPage();

    expect(component.getCourseInfo).toHaveBeenCalled();
    expect(component.loadProjects).toHaveBeenCalled();
    expect(component.course.courseName).toBe('Test Course');
    expect(component.allUserFilteredProjects).toEqual([
      { projectName: 'Project 1' },
    ]);
    expect(component.nonUserFilteredProjects).toEqual([
      { projectName: 'Project 2' },
    ]);
  });

  // Successful Project Join Test
  it('Should join a project successfully', () => {
    spyOn(component, 'loadPage').and.callThrough();
    const projectID = 1;

    component.join(projectID);

    expect(component.errMsg).toBe(''); // Ensure no error message
    expect(component.loadPage).toHaveBeenCalled(); // Ensure loadPage is called
  });

  // Failed Project Join Test
  it('Should handle project join failure', () => {
    spyOn(component, 'loadPage').and.callThrough();
    component.currentUser = null; // Simulate missing user

    component.join(1);

    expect(component.errMsg).toBeDefined(); // Ensure error message is set
    expect(component.loadPage).not.toHaveBeenCalled();
  });

  // Search Projects Test
  it('Should not filter projects if search query is empty', () => {
    component.allUserGroups = [{ projectName: 'Project 1' }];
    component.nonUserGroups = [{ projectName: 'Project 2' }];
    component.projectSearchQuery = ''; // Empty search query

    component.searchProjects();

    expect(component.allUserFilteredProjects).toEqual([
      { projectName: 'Project 1' },
    ]);
    expect(component.nonUserFilteredProjects).toEqual([
      { projectName: 'Project 2' },
    ]);
  });

  it('Should filter projects based on search query', () => {
    component.allUserGroups = [
      { projectName: 'Math Project' },
      { projectName: 'History Project' },
    ];
    component.nonUserGroups = [
      { projectName: 'Math Project' },
      { projectName: 'Science Project' },
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
});
