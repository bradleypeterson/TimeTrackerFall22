import { CommonModule } from '@angular/common';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { NgxPaginationModule } from 'ngx-pagination';
import { DashboardComponent } from './dashboard.component';
import { environment } from '../../environments/environment';

describe('Dashboard role capabilities', () => {
  let http: HttpTestingController;
  let savedUser: string | null;

  beforeEach(async () => {
    savedUser = localStorage.getItem('currentUser');
    await TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      imports: [CommonModule, HttpClientTestingModule, NgxPaginationModule],
      providers: [{ provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } }],
    }).compileComponents();
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    if (savedUser === null) localStorage.removeItem('currentUser');
    else localStorage.setItem('currentUser', savedUser);
  });

  for (const role of ['admin', 'instructor', 'student']) {
    it(`shows the appropriate dashboard and request controls for ${role}`, () => {
      localStorage.setItem('currentUser', JSON.stringify({ type: role, userID: 42 }));
      const fixture = TestBed.createComponent(DashboardComponent);
      fixture.detectChanges();
      if (role === 'student') {
        http.expectNone(`${environment.apiURL}/api/Users/42/getPendInstrCourses/`);
        http.expectNone(`${environment.apiURL}/api/Courses/42`);
        http.expectNone(`${environment.apiURL}/api/Courses`);
        http.expectOne(`${environment.apiURL}/api/Users/42/getUserCourses`).flush([]);
      } else {
        http.expectOne(`${environment.apiURL}/api/Users/42/getPendInstrCourses/`).flush([
          { courseID: 7, studentID: 9, courseName: 'Course', studentFirstName: 'Pending', studentLastName: 'Student' },
        ]);
        const courseURL = role === 'admin'
          ? `${environment.apiURL}/api/Courses`
          : `${environment.apiURL}/api/Courses/42`;
        http.expectOne(courseURL).flush([]);
        http.expectNone(role === 'admin'
          ? `${environment.apiURL}/api/Courses/42`
          : `${environment.apiURL}/api/Courses`);
      }
      if (role === 'admin') {
        http.expectOne(`${environment.apiURL}/api/UsersPendingApproval`).flush({ count: 2 });
        for (const resource of ['Users', 'Courses', 'Projects']) {
          http.expectOne(`${environment.apiURL}/api/GetRecent${resource}/`).flush([]);
        }
      } else {
        http.expectNone(`${environment.apiURL}/api/UsersPendingApproval`);
      }
      for (const request of http.match(() => true)) request.flush([]);
      fixture.detectChanges();
      const page: HTMLElement = fixture.nativeElement;
      if (role !== 'student') {
        const coursesSection = page.querySelector('h3.box-head')!.parentElement!.parentElement!;
        expect(coursesSection.querySelector('h3')!.textContent!.trim()).toBe(
          role === 'admin' ? 'All Courses' : 'Courses'
        );
        expect(coursesSection.querySelector('.alert')!.textContent!.trim()).toBe(
          role === 'admin' ? 'No courses have been created.' : 'You have no active courses assigned.'
        );
      }
      expect(page.textContent!.includes('Manage Users')).toBe(role === 'admin');
      expect(page.querySelectorAll('.dashboard-head').length).toBe(1);
      const buttons = Array.from(page.querySelectorAll('button'));
      const approve = buttons.find(button => button.textContent!.trim() === 'Approve');
      const deny = buttons.find(button => button.textContent!.trim() === 'Deny');
      if (role === 'student') {
        expect(approve).toBeUndefined();
        expect(deny).toBeUndefined();
      } else {
        const register = spyOn(fixture.componentInstance, 'register');
        const cancel = spyOn(fixture.componentInstance, 'cancelIns');
        approve!.click();
        deny!.click();
        expect(register).toHaveBeenCalledWith(7, 9);
        expect(cancel).toHaveBeenCalledWith(7, 9);
      }
    });
  }

  it('keeps the Admin all-course list separate from Recent Courses', () => {
    localStorage.setItem('currentUser', JSON.stringify({ type: 'admin', userID: 42 }));
    const fixture = TestBed.createComponent(DashboardComponent);
    fixture.detectChanges();
    const courses = [
      { courseID: 7, courseName: 'Another instructor course', description: 'Active course' },
      { courseID: 8, courseName: 'Archived course', description: 'Inactive course' },
    ];
    const recentCourses = [
      { ...courses[1], firstName: 'Another', lastName: 'Instructor' },
    ];
    http.expectOne(`${environment.apiURL}/api/Courses`).flush(courses);
    http.expectNone(`${environment.apiURL}/api/Courses/42`);
    http.expectOne(`${environment.apiURL}/api/GetRecentCourses/`).flush(recentCourses);
    for (const request of http.match(() => true)) request.flush([]);
    fixture.detectChanges();
    expect(fixture.componentInstance.courses).toEqual(courses);
    expect(fixture.componentInstance.recentCourses).toEqual(recentCourses);
    const headings = Array.from(fixture.nativeElement.querySelectorAll('h5.card-header') as NodeListOf<HTMLElement>);
    expect(headings.map(heading => heading.textContent!.trim())).toEqual([
      'Another instructor course', 'Archived course', 'Archived course',
    ]);
  });
});
