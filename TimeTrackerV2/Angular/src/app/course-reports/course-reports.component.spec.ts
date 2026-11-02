import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseReportsComponent } from './course-reports.component';
import { TotalTimePipe } from '../pipes/total-time.pipe';
import { environment } from '../../environments/environment';

describe('CourseReportsComponent refresh', () => {
  let fixture: ComponentFixture<CourseReportsComponent>;
  let component: CourseReportsComponent;
  let http: HttpTestingController;
  let savedUser: string | null;
  const reportURL = `${environment.apiURL}/api/Course/2/GetReportsData`;
  const removalURL = `${environment.apiURL}/api/deleteUserCourse/`;
  const reports = [
    { userID: 3, studentName: 'Student A', projects: [
      { projectID: 2, projectName: 'History Project', totalTime: 3600000 },
    ] },
    { userID: 4, studentName: 'Student B', projects: [
      { projectID: null, projectName: null, totalTime: null },
    ] },
  ];

  beforeEach(async () => {
    savedUser = localStorage.getItem('currentUser');
    localStorage.setItem('currentUser', JSON.stringify({ type: 'instructor', userID: 2 }));
    await TestBed.configureTestingModule({
      declarations: [CourseReportsComponent, TotalTimePipe],
      imports: [CommonModule, FormsModule, HttpClientTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: {} },
        { provide: Router, useValue: {
          getCurrentNavigation: () => ({ extras: { state: { courseID: 2 } } }),
          navigate: jasmine.createSpy('navigate'),
        } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(CourseReportsComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    http.expectOne(reportURL).flush(reports);
    fixture.detectChanges();
  });

  afterEach(() => {
    http.verify();
    if (savedUser === null) localStorage.removeItem('currentUser');
    else localStorage.setItem('currentUser', savedUser);
  });

  it('keeps project totals and students without projects in a nonempty roster', () => {
    expect(component.studentReports).toEqual([
      { id: 3, studentName: 'Student A', projects: [
        { id: 2, name: 'History Project', totalTime: 3600000 },
      ] },
      { id: 4, studentName: 'Student B', projects: [
        { id: null as any, name: null as any, totalTime: null as any },
      ] },
    ]);
    expect(fixture.nativeElement.querySelectorAll('.report-card').length).toBe(2);
    component.expandedCards[4] = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('This user has not been assigned to any projects yet.');
  });

  it('clears reports, search results, and expanded cards on an empty refresh', () => {
    component.studentSearchQuery = 'Student A';
    component.searchStudents();
    component.expandedCards = { 3: true, 4: false };
    component.getStudentReports(2);
    http.expectOne(reportURL).flush([]);
    fixture.detectChanges();

    expect(component.studentReports).toEqual([]);
    expect(component.filteredStudents).toEqual([]);
    expect(component.expandedCards).toEqual({});
    expect(component.studentSearchQuery).toBe('Student A');
    expect(component.filtering).toBeTrue();
    expect(fixture.nativeElement.querySelectorAll('.report-card').length).toBe(0);
    expect(fixture.nativeElement.textContent).toContain('No users found');
  });

  for (const role of ['instructor', 'admin']) {
    it(`refreshes after ${role} removes the final student`, () => {
      component.instructor = role === 'instructor';
      component.admin = role === 'admin';
      component.getStudentReports(2);
      http.expectOne(reportURL).flush([reports[0]]);
      component.expandedCards[3] = true;
      fixture.detectChanges();
      spyOn(window, 'confirm').and.returnValue(true);

      const buttons = Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>);
      buttons.find(button => button.textContent!.trim() === 'Remove Student')!.click();
      const removal = http.expectOne(removalURL);
      expect(removal.request.method).toBe('POST');
      expect(removal.request.body).toEqual({ userID: 3, courseID: 2 });
      expect(component.studentReports.length).toBe(1);
      http.expectNone(reportURL);
      removal.flush({ message: 'User Course deleted.' });
      http.expectOne(reportURL).flush([]);
      fixture.detectChanges();

      expect(component.studentReports).toEqual([]);
      expect(component.filteredStudents).toEqual([]);
      expect(component.expandedCards).toEqual({});
      expect(fixture.nativeElement.querySelectorAll('.report-card').length).toBe(0);
      expect(fixture.nativeElement.textContent).toContain('No users found');
    });
  }

  it('removes one student while retaining the remaining student and expansion state', () => {
    component.expandedCards = { 3: true, 4: true };
    spyOn(window, 'confirm').and.returnValue(true);
    component.RemoveStudentFromCourse(3);
    http.expectOne(removalURL).flush({ message: 'User Course deleted.' });
    http.expectOne(reportURL).flush([reports[1]]);
    fixture.detectChanges();

    expect(component.studentReports.map(report => report.id)).toEqual([4]);
    expect(component.filteredStudents.map((report: any) => report.id)).toEqual([4]);
    expect(component.expandedCards).toEqual({ 4: true });
    expect(fixture.nativeElement.querySelectorAll('.report-card').length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('Student B');
    expect(fixture.nativeElement.textContent).not.toContain('Student A');
  });

  it('reapplies the active search and retains expansion state for students outside the search', () => {
    component.studentSearchQuery = 'Student A';
    component.searchStudents();
    component.expandedCards = { 3: true, 4: true };
    component.getStudentReports(2);
    http.expectOne(reportURL).flush([reports[1]]);
    fixture.detectChanges();

    expect(component.studentReports.map(report => report.id)).toEqual([4]);
    expect(component.filteredStudents).toEqual([]);
    expect(component.studentSearchQuery).toBe('Student A');
    expect(component.filtering).toBeTrue();
    expect(component.expandedCards).toEqual({ 4: true });
    component.studentSearchQuery = 'DENT B';
    component.searchStudents();
    expect(component.filteredStudents.map((report: any) => report.id)).toEqual([4]);
  });

  it('keeps existing reports, search results, and expansion state when removal fails', () => {
    component.studentSearchQuery = 'Student A';
    component.searchStudents();
    component.expandedCards = { 3: true, 4: false };
    const previousReports = component.studentReports;
    const previousResults = component.filteredStudents;
    spyOn(window, 'confirm').and.returnValue(true);
    const alert = spyOn(window, 'alert');
    component.RemoveStudentFromCourse(3);
    http.expectOne(removalURL).flush({ message: 'Removal failed.' }, { status: 500, statusText: 'Server Error' });
    http.expectNone(reportURL);

    expect(component.studentReports).toBe(previousReports);
    expect(component.filteredStudents).toBe(previousResults);
    expect(component.expandedCards).toEqual({ 3: true, 4: false });
    expect(component.studentSearchQuery).toBe('Student A');
    expect(alert).toHaveBeenCalledWith('Removal failed.');
  });

  it('does not send a request or change the roster when removal is cancelled', () => {
    const previousReports = component.studentReports;
    component.expandedCards = { 3: true };
    spyOn(window, 'confirm').and.returnValue(false);
    component.RemoveStudentFromCourse(3);
    http.expectNone(removalURL);
    http.expectNone(reportURL);
    expect(component.studentReports).toBe(previousReports);
    expect(component.expandedCards).toEqual({ 3: true });
  });
});
