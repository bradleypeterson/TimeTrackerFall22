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
      } else {
        http.expectOne(`${environment.apiURL}/api/Users/42/getPendInstrCourses/`).flush([
          { courseID: 7, studentID: 9, courseName: 'Course', studentFirstName: 'Pending', studentLastName: 'Student' },
        ]);
        http.expectOne(`${environment.apiURL}/api/Courses/42`).flush([]);
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
});
