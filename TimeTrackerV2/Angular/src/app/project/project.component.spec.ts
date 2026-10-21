import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectComponent } from './project.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { defer, of } from 'rxjs';
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
  const hour = 60 * 60 * 1000;

  function timecard(
    userID: number,
    hours: number,
    timeslotID = userID,
    firstName = 'Alex',
    lastName = 'Taylor'
  ) {
    const timeIn = Date.UTC(2026, 0, 1, 10);
    return {
      userID,
      timeslotID,
      firstName,
      lastName,
      timeIn,
      timeOut: timeIn + hours * hour,
    };
  }

  function loadContributions(timecards: any[]): void {
    httpClient.get
      .withArgs(
        `${environment.apiURL}/api/Projects/1/Users/`,
        jasmine.any(Object)
      )
      .and.returnValue(defer(() => of(timecards.map(entry => ({ ...entry })))));
    component.loadProjectUserTimes();
  }

  function chartContributions(): Map<string, number> {
    return new Map(
      component.pieChartLabels.map((label: string, index: number) => [
        label,
        component.pieChartDatasets[0].data[index],
      ])
    );
  }

  function contributionRows(): string[][] {
    const root: HTMLElement = fixture.nativeElement;
    const tables = Array.from(root.querySelectorAll('table')).filter(
      table => table.tHead?.rows[0].cells.length === 2
    );
    expect(tables.length).toBe(1);
    return Array.from(tables[0].tBodies[0].rows).map(row =>
      Array.from(row.cells).map(cell => cell.textContent!.trim())
    );
  }

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
      userID: 1,
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
    spyOn(localStorage, 'getItem').and.callFake(key =>
      key === 'currentUser' ? JSON.stringify(mockUser) : null
    );

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

    // Mock HTTP responses for specific endpoints:
    httpClient.get
      .withArgs(
        `${environment.apiURL}/api/AddToProject/1/InProject`,
        jasmine.any(Object)
      )
      .and.returnValue(of(mockProjectUsers));

    httpClient.get
      .withArgs(`${environment.apiURL}/api/ProjectInfo/1`, jasmine.any(Object))
      .and.returnValue(of({ project: mockProject, users: [1, 2] }));

    httpClient.get
      .withArgs(
        `${environment.apiURL}/api/Projects/1/Users/`,
        jasmine.any(Object)
      )
      .and.returnValue(defer(() => of(mockProjectUserTimes.map(entry => ({ ...entry })))));

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

  afterEach(() => {
    fixture.destroy();
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

  it('should keep same-named students separate by user ID', () => {
    loadContributions([timecard(101, 2), timecard(102, 5)]);

    expect(component.totalTimeMap.size).toBe(2);
    expect(component.totalTimeMap.get(101)).toEqual({
      name: 'Alex Taylor',
      displayName: 'Alex Taylor (ID: 101)',
      totalTime: 2 * hour,
    });
    expect(component.totalTimeMap.get(102)).toEqual({
      name: 'Alex Taylor',
      displayName: 'Alex Taylor (ID: 102)',
      totalTime: 5 * hour,
    });
  });

  it('should chart separate contributions of 120 and 300 minutes', () => {
    loadContributions([timecard(101, 2), timecard(102, 5)]);

    expect(component.pieChartDatasets[0].data.length).toBe(2);
    expect(chartContributions()).toEqual(new Map([
      ['Alex Taylor (ID: 101)', 120],
      ['Alex Taylor (ID: 102)', 300],
    ]));
  });

  it('should sum multiple timecards for each same-named student', () => {
    loadContributions([
      timecard(101, 1, 1),
      timecard(102, 2, 2),
      timecard(101, 1, 3),
      timecard(102, 3, 4),
    ]);

    expect(component.totalTimeMap.size).toBe(2);
    expect(component.totalTimeMap.get(101)!.totalTime).toBe(2 * hour);
    expect(component.totalTimeMap.get(102)!.totalTime).toBe(5 * hour);
    expect(chartContributions()).toEqual(new Map([
      ['Alex Taylor (ID: 101)', 120],
      ['Alex Taylor (ID: 102)', 300],
    ]));
  });

  it('should keep the plain name for one student with multiple timecards', () => {
    loadContributions([timecard(101, 1, 1), timecard(101, 1, 2)]);

    expect(component.totalTimeMap.size).toBe(1);
    expect(component.totalTimeMap.get(101)!.displayName).toBe('Alex Taylor');
    expect(chartContributions()).toEqual(new Map([['Alex Taylor', 120]]));
  });

  it('should treat numeric and string versions of a user ID as the same student', () => {
    loadContributions([
      timecard(101, 1, 1),
      { ...timecard(101, 1, 2), userID: '101' },
    ]);

    expect(component.totalTimeMap.size).toBe(1);
    expect(component.totalTimeMap.get(101)!.totalTime).toBe(2 * hour);
    expect(chartContributions()).toEqual(new Map([['Alex Taylor', 120]]));
  });

  for (const zeroFirst of [true, false]) {
    it(`should preserve another Alex Taylor's hours with the zero-hour student ${zeroFirst ? 'first' : 'last'}`, () => {
      const recorded = timecard(101, 2);
      const noTimecards = {
        ...timecard(102, 0),
        timeIn: null,
        timeOut: null,
        timeslotID: null,
      };
      loadContributions(zeroFirst ? [noTimecards, recorded] : [recorded, noTimecards]);
      fixture.detectChanges();

      expect(component.totalTimeMap.size).toBe(2);
      expect(component.totalTimeMap.get(101)!.totalTime).toBe(2 * hour);
      expect(component.totalTimeMap.get(102)!.totalTime).toBe(0);
      expect(contributionRows()).toEqual([
        ['Alex Taylor (ID: 101)', '2 hr 0 min 0 sec'],
        ['Alex Taylor (ID: 102)', '0 sec'],
      ]);
      expect(chartContributions()).toEqual(new Map([['Alex Taylor (ID: 101)', 120]]));
    });
  }

  it('should preserve plain names, totals, and alphabetical table order for different names', () => {
    loadContributions([
      timecard(102, 5, 2, 'Jane', 'Smith'),
      timecard(101, 2, 1, 'John', 'Doe'),
    ]);
    fixture.detectChanges();

    expect(contributionRows()).toEqual([
      ['Jane Smith', '5 hr 0 min 0 sec'],
      ['John Doe', '2 hr 0 min 0 sec'],
    ]);
    expect(chartContributions()).toEqual(new Map([
      ['Jane Smith', 300],
      ['John Doe', 120],
    ]));
  });

  it('should recalculate without accumulating stale totals or duplicate-name labels', () => {
    loadContributions([timecard(101, 2), timecard(102, 5)]);
    loadContributions([timecard(101, 2)]);
    component.calculateTotalTime();
    component.populateGraph();

    expect(component.totalTimeMap.size).toBe(1);
    expect(component.totalTimeMap.get(101)!.totalTime).toBe(2 * hour);
    expect(chartContributions()).toEqual(new Map([['Alex Taylor', 120]]));
  });

  it('should continue excluding nonpositive totals from the chart', () => {
    loadContributions([
      timecard(101, 2),
      timecard(102, 0, 2, 'Zero', 'Hours'),
      timecard(103, -1, 3, 'Negative', 'Hours'),
    ]);

    expect(component.totalTimeMap.size).toBe(3);
    expect(chartContributions()).toEqual(new Map([['Alex Taylor', 120]]));
  });

  it('should preserve the empty chart placeholder when there are no users', () => {
    loadContributions([]);
    fixture.detectChanges();

    expect(contributionRows()).toEqual([]);
    expect(component.pieChartLabels).toEqual(['No time cards created']);
    expect(component.pieChartDatasets).toEqual([{ data: [1] }]);
  });

  it('should preserve the empty chart placeholder when all students have no timecards', () => {
    loadContributions([101, 102].map(userID => ({
      ...timecard(userID, 0),
      timeIn: null,
      timeOut: null,
      timeslotID: null,
    })));
    fixture.detectChanges();

    expect(contributionRows()).toEqual([
      ['Alex Taylor (ID: 101)', '0 sec'],
      ['Alex Taylor (ID: 102)', '0 sec'],
    ]);
    expect(component.pieChartLabels).toEqual(['No time cards created']);
    expect(component.pieChartDatasets).toEqual([{ data: [1] }]);
  });

  for (const view of [
    { name: 'project member', isProjectUser: true, instructor: false },
    { name: 'nonmember', isProjectUser: false, instructor: false },
    { name: 'instructor', isProjectUser: false, instructor: true },
  ]) {
    it(`should display separate totals and chart legends in the ${view.name} view`, () => {
      component.isProjectUser = view.isProjectUser;
      component.instructor = view.instructor;
      loadContributions([timecard(102, 5), timecard(101, 2)]);
      fixture.detectChanges();

      expect(contributionRows()).toEqual([
        ['Alex Taylor (ID: 101)', '2 hr 0 min 0 sec'],
        ['Alex Taylor (ID: 102)', '5 hr 0 min 0 sec'],
      ]);
      const chart = component.chart.chart!;
      expect(chart.data.labels).toEqual(component.pieChartLabels);
      expect(chart.data.datasets[0].data).toEqual([120, 300]);
      expect(chart.legend!.legendItems!.map(item => item.text)).toEqual([
        'Alex Taylor (ID: 101)',
        'Alex Taylor (ID: 102)',
      ]);
    });
  }

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
