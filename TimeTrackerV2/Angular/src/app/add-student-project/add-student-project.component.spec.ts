import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { AddStudentProjectComponent } from './add-student-project.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { of } from 'rxjs';
import { environment } from 'src/environments/environment';

describe('AddStudentProjectComponent', () => {
  let component: AddStudentProjectComponent;
  let fixture: ComponentFixture<AddStudentProjectComponent>;
  let httpClient: jasmine.SpyObj<HttpClient>;
  let router: jasmine.SpyObj<Router>;
  let activatedRoute: ActivatedRoute;

  const mockProject = {
    projectID: 1,
    name: 'Test Project',
    description: 'Test Description',
  };

  const mockStudentsInProject = [
    { userID: 1, name: 'Student 1' },
    { userID: 2, name: 'Student 2' },
  ];

  // Mock data for students not in the project
  const mockStudentsNotInProject = [
    { userID: 3, name: 'Student 3' },
    { userID: 4, name: 'Student 4' },
  ];

  beforeEach(async () => {
    // Create spies
    httpClient = jasmine.createSpyObj('HttpClient', ['get', 'post']);
    router = jasmine.createSpyObj('Router', [
      'navigate',
      'getCurrentNavigation',
    ]);
    activatedRoute = { snapshot: { params: { id: '1' } } } as any;

    // Mock router state
    (router.getCurrentNavigation as jasmine.Spy).and.returnValue({
      extras: {
        state: { projectID: 1 },
      },
    });

    // Mock localStorage
    spyOn(localStorage, 'getItem').and.returnValue(
      JSON.stringify({ userID: 1 })
    );
    spyOn(localStorage, 'setItem');
    spyOn(localStorage, 'removeItem');

    await TestBed.configureTestingModule({
      imports: [NgxPaginationModule],
      declarations: [AddStudentProjectComponent],
      providers: [
        { provide: HttpClient, useValue: httpClient },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: activatedRoute },
      ],
    }).compileComponents();

    // Mock HTTP responses
    httpClient.get.and.returnValue(of(mockProject)); // Default response for all get calls

    // Specific responses for different endpoints
    httpClient.get
      .withArgs(`${environment.apiURL}/api/ProjectInfo/1`, jasmine.any(Object))
      .and.returnValue(of(mockProject));

    httpClient.get
      .withArgs(
        `${environment.apiURL}/api/AddToProject/1/InProject`,
        jasmine.any(Object)
      )
      .and.returnValue(of(mockStudentsInProject));

    httpClient.get
      .withArgs(
        `${environment.apiURL}/api/AddToProject/1/NotInProject`,
        jasmine.any(Object)
      )
      .and.returnValue(of(mockStudentsNotInProject));

    // Mock post responses
    httpClient.post.and.returnValue(of({ success: true }));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddStudentProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  //Testing that the component gets created in teh first place:
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  //Testing that the project info is loaded correctly:
  it('should load project info on init', () => {
    expect(component.project).toEqual(mockProject);
    expect(httpClient.get).toHaveBeenCalledWith(
      jasmine.stringMatching('/api/ProjectInfo/1'),
      jasmine.any(Object)
    );
  });

  //Testing that the students in and not in project are loaded correctly:
  it('should load students in and not in project', () => {
    expect(component.studentsInProject).toEqual(mockStudentsInProject);
    expect(component.studentsNotInProject).toEqual(mockStudentsNotInProject);

    expect(httpClient.get).toHaveBeenCalledWith(
      jasmine.stringMatching('/api/AddToProject/1/InProject'),
      jasmine.any(Object)
    );
    expect(httpClient.get).toHaveBeenCalledWith(
      jasmine.stringMatching('/api/AddToProject/1/NotInProject'),
      jasmine.any(Object)
    );
  });

  //Testing that the student is added to the project correctly:
  it('should add student to project', () => {
    const studentToAdd = { userID: 3 };
    httpClient.post.and.returnValue(of({ success: true }));

    component.add(studentToAdd.userID);

    expect(httpClient.post).toHaveBeenCalledWith(
      jasmine.stringMatching('/api/joinGroup/'),
      {
        userID: studentToAdd.userID,
        projectID: 1,
      },
      jasmine.any(Object)
    );
  });

  //Testing that the student is removed from the project correctly:
  it('should remove student from project', () => {
    const studentToRemove = { userID: 1 };
    httpClient.post.and.returnValue(of({ success: true }));

    component.drop(studentToRemove.userID);

    expect(httpClient.post).toHaveBeenCalledWith(
      jasmine.stringMatching('/api/leaveGroup/'),
      {
        userID: studentToRemove.userID,
        projectID: 1,
      },
      jasmine.any(Object)
    );
  });
});
