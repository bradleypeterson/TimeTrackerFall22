import { Component, DestroyRef, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, merge, of, timer } from 'rxjs';
import { catchError, filter, map, switchMap, tap } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { IssueCountService } from './view-issues/issue-count.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  userType!: string;
  instructor = false;
  student = false;
  admin = false;
  nullType = false;
  name = '';
  userID = '';
  isNavbarExpanded = false;
  openMenu: 'account' | 'course' | null = null;
  logoutBusy = false;
  openIssueCount = 0;
  title = 'TimeTrackerV2';

  constructor(
    private router: Router,
    private http: HttpClient,
    private issueCount: IssueCountService,
    private destroyRef: DestroyRef,
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();

    const navigation$ = this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      tap(() => this.loadCurrentUser()),
    );

    merge(timer(0, 30000), navigation$, this.issueCount.changes$).pipe(
      switchMap(() => {
        if (!this.admin) return of(0);

        return this.http.get<unknown[]>(
          `${environment.apiURL}/api/getUnresolvedIssues/`,
          { withCredentials: true },
        ).pipe(
          map((issues) => issues.length),
          catchError((error) =>
            error.status === 401 || error.status === 403 ? of(0) : EMPTY,
          ),
        );
      }),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((count) => {
      this.openIssueCount = count;
    });
  }

  loadCurrentUser(): void {
    const currentUser = localStorage.getItem('currentUser');
    const userData = currentUser ? JSON.parse(currentUser) : null;

    this.userType = userData?.type;
    this.userID = userData?.userID;
    this.instructor = false;
    this.student = false;
    this.admin = false;
    this.nullType = false;
    this.name = '';

    if (this.userType === 'admin') {
      this.admin = true;
      this.name = userData.firstName + ' ' + userData.lastName;
    } else if (this.userType === 'instructor') {
      this.instructor = true;
      this.name = userData.firstName + ' ' + userData.lastName;
    } else if (this.userType === 'student') {
      this.student = true;
      this.name = userData.firstName + ' ' + userData.lastName;
    } else {
      this.nullType = true;
    }
  }

  toggleMenu(menu: 'account' | 'course'): void {
    this.openMenu = this.openMenu === menu ? null : menu;
  }

  onUserOptionChange(selectedOption: 'viewProfile' | '#'): void {
    this.openMenu = null;

    if (selectedOption === 'viewProfile') {
      this.ViewProfile();
    } else if (selectedOption === '#') {
      this.logout();
    }
  }

  logout(): void {
    if (this.logoutBusy) return;
    this.logoutBusy = true;

    this.http.post(
      `${environment.apiURL}/api/logout`,
      {},
      { withCredentials: true },
    ).subscribe({
      next: () => {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userProfile');

        this.openMenu = null;
        this.isNavbarExpanded = false;
        this.loadCurrentUser();
        this.issueCount.refresh();
        this.logoutBusy = false;

        this.router.navigate(['/']);
      },
      error: () => {
        this.logoutBusy = false;
        alert('Unable to log out. Please try again.');
      },
    });
  }

  ViewProfile(): void {
    const state = { userID: this.userID };
    this.router.navigateByUrl('/', { skipLocationChange: true })
      .then(() => this.router.navigate(['/profile'], { state }));
  }
}