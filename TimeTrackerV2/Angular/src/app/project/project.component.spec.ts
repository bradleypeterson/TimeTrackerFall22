import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectComponent } from './project.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { environment } from '../../environments/environment';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { NgxPaginationModule } from 'ngx-pagination';
import { TotalTimePipe } from '../pipes/total-time.pipe';

describe('ProjectComponent', () => {
  let component: ProjectComponent;
  let fixture: ComponentFixture<ProjectComponent>;
  let httpClient: jasmine.SpyObj<HttpClient>;
  let router: jasmine.SpyObj<Router>;
  let activatedRoute: jasmine.SpyObj<ActivatedRoute>;

  // Mock data
  const mockUser = {
    userID: 1,
    type: 'student',
  };

  const mockProjectUsers = [
    { userID: 1, firstName: 'John', lastName: 'Doe' },
    { userID: 2, firstName: 'Jane', lastName: 'Smith' },
  ];

  const mockProject = {
    projectID: 1,
    projectName: 'Test Project',
    isActive: true,
    courseID: 100,
  };

  const mockProjectUserTimes = [
    {
      timeslotID: 1,
      firstName: 'John',
      lastName: 'Doe',
      timeIn: new Date('2024-03-20T10:00:00').getTime(),
      timeOut: new Date('2024-03-20T12:00:00').getTime(),
    },
  ];

  const mockActivities = [
    {
      timeIn: new Date('2024-03-20T10:00:00').getTime(),
      timeOut: new Date('2024-03-20T12:00:00').getTime(),
      description: 'Test activity',
    },
  ];

  beforeEach(async () => {
    // Create spies for our dependencies
    httpClient = jasmine.createSpyObj('HttpClient', ['get', 'post']);
    router = jasmine.createSpyObj('Router', [
      'navigate',
      'getCurrentNavigation',
    ]);
    activatedRoute = jasmine.createSpyObj('ActivatedRoute', [], {
      snapshot: { params: { id: '1' } },
    });

    // Mock localStorage
    spyOn(localStorage, 'getItem').and.returnValue(JSON.stringify(mockUser));

    // Mock router navigation state
    router.getCurrentNavigation.and.returnValue({
      extras: {
        state: {
          projectID: 1,
        },
      },
    } as any);

    await TestBed.configureTestingModule({
      declarations: [ProjectComponent, TotalTimePipe],
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        FormsModule,
        ReactiveFormsModule,
        NgChartsModule,
        NgxPaginationModule,
      ],
      providers: [
        { provide: HttpClient, useValue: httpClient },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: activatedRoute },
      ],
    }).compileComponents();

    // Set up default response for any unmatched GET requests
    httpClient.get.and.returnValue(of([]));

    // Mock HTTP responses for specific endpoints
    httpClient.get
      .withArgs(
        `${environment.apiURL}/api/AddToProject/1/InProject`,
        jasmine.any(Object)
      )
      .and.returnValue(of(mockProjectUsers));

    httpClient.get
      .withArgs(`${environment.apiURL}/api/ProjectInfo/1`, jasmine.any(Object))
      .and.returnValue(of(mockProject));

    httpClient.get
      .withArgs(
        `${environment.apiURL}/api/Projects/1/Users/`,
        jasmine.any(Object)
      )
      .and.returnValue(of(mockProjectUserTimes));

    // httpClient.get
    //   .withArgs(
    //     `${environment.apiURL}/api/Users/1/1/activities/`,
    //     jasmine.any(Object)
    //   )
    //   .and.returnValue(of(mockActivities));
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  //Testing the component creation:
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  //Testing that we can load the project users:
  it('should load all project users', () => {
    component.loadProjectUsers();

    expect(httpClient.get).toHaveBeenCalledWith(
      jasmine.stringMatching('/api/AddToProject/1/InProject'),
      jasmine.any(Object)
    );
    expect(component.projectUsers).toEqual(mockProjectUsers);
  });

  //Testing that we can load the project info:
  it('should load project info', () => {
    component.getProjectInfo();

    expect(httpClient.get).toHaveBeenCalledWith(
      jasmine.stringMatching('/api/ProjectInfo/1'),
      jasmine.any(Object)
    );
    expect(component.project).toEqual(mockProject);
  });

  //Testing that we can load the project users times:
  it('should load project users times', () => {
    component.loadProjectUserTimes();

    expect(httpClient.get).toHaveBeenCalledWith(
      jasmine.stringMatching('/api/Projects/1/Users/'),
      jasmine.any(Object)
    );
    expect(component.projectUserTimes).toEqual(mockProjectUserTimes);
  });

  //Tested the edit timecard function (redirecting to the edit-timecard page):
  it('should navigate to edit timecard page with correct parameters', () => {
    const projectID = 1;
    const timeslotID = 123;
    const firstName = 'John';
    const lastName = 'Doe';

    component.editTimeCard(projectID, timeslotID, firstName, lastName);

    expect(router.navigate).toHaveBeenCalledWith(['/edit-timecard'], {
      state: {
        projectID: projectID,
        timeslotID: timeslotID,
        firstName: firstName,
        lastName: lastName,
      },
    });
  });
});
