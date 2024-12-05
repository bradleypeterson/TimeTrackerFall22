import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {
  public projects: any = [];
  public courses: any = [];
  public currentUser: any;
  public PendUserCourses: any = [];
  public PendInstrCourses: any = [];
  public errMsg = '';
  public p: number = 1;
  public hasPendingEvals: boolean = false;
  public awaitingApprovalCount: number = 0; // Will hold count of users awaiting approval

  public recentUsers: any = [];
  public recentCourses: any = [];
  public recentProjects: any = [];

  instructor: boolean = false;
  student: boolean = false;
  admin: boolean = false;
  userID: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    const tempUser = localStorage.getItem('currentUser');
    if (tempUser) {
      this.currentUser = JSON.parse(tempUser);
    }
  }

  ngOnInit(): void {
    // get user type
    var userType = this.currentUser.type;
    this.userID = this.currentUser.userID;
    if (userType === 'instructor') {
      this.instructor = true;
      this.loadInstrPenUserCourses();
    }
    else if (userType === 'student') {
      this.student = true;
      this.loadProjects();
      this.loadPenUserCourses();
      this.checkForPendingEvals();
    }
    else if (userType === 'admin') {
      this.admin = true;
      this.loadRecentUsers();
      this.loadRecentCourses();
      this.loadRecentProjects();
      this.checkForPendingApproval(); // Check for users where isApproved = false (awaiting approval)
    }

    // get courses
    this.loadCourses();

    // makes the page properly update on changes
    if (!localStorage.getItem('foo')) {
      localStorage.setItem('foo', 'no reload')
      location.reload()
    }
    else {
      localStorage.removeItem('foo')
    }
  }

  public pageTitle = 'TimeTrackerV2 | Dashboard';

  // Checks if any users are awaiting approval
  checkForPendingApproval() {
    this.http
      .get<any>(`${environment.apiURL}/api/UsersPendingApproval`, {
        headers: new HttpHeaders({
          'Access-Control-Allow-Headers': 'Content-Type',
        }),
      })
      .subscribe({
        next: (data) => {
          this.awaitingApprovalCount = data.count; // Stores count returned by the API
        },
        error: (err) => {
          console.error('Error fetching pending approval count', err);
        },
      });
}

  // get projects student is in
  loadProjects(): void {
    this.http
      .get(`${environment.apiURL}/api/ProjectsForUser/${this.userID}`)
      .subscribe((data: any) => {
        this.projects = data;
        if (this.projects) {
          localStorage.setItem('projects', JSON.stringify(this.projects));
        }
      });
  }

  loadCourses(): void {
    // attempt to pull only the courses the instructor has created
    if (this.instructor) {
      var request = `${environment.apiURL}/api/Courses/${this.userID}`;
      this.http.get(request).subscribe((data: any) => {
        console.log(data);
        this.courses = data;
        for (let i = 0; i < data.length; i++) {
          localStorage.setItem("courses", JSON.stringify(this.courses));
        }
      });
    }

    // attempt to pull the courses that the student is registered for
    else if (this.student) {
      var request = `${environment.apiURL}/api/Users/${this.userID}/getUserCourses`;
      this.http.get(request).subscribe((data: any) => {
        console.log(data);
        this.courses = data;
        for (let i = 0; i < data.length; i++) {
          localStorage.setItem("courses", JSON.stringify(this.courses));
        }
      });
    }
  }

  // get courses student has applied for
  loadPenUserCourses(): void {
    this.http
      .get<any>(
        `${environment.apiURL}/api/Users/${this.currentUser.userID}/getCoursesPendCourses/`,
        {
          headers: new HttpHeaders({
            'Access-Control-Allow-Headers': 'Content-Type',
          }),
        }
      )
      .subscribe({
        next: (data) => {
          this.errMsg = '';
          console.log(data);
          this.PendUserCourses = data;
        },
        error: (error) => {
          this.errMsg = error['error']['message'];
        },
      });
  }

  // for admins, load 8 most recent users
  loadRecentUsers(): void {
    this.http
      .get(`${environment.apiURL}/api/GetRecentUsers/`)
      .subscribe((data: any) => {
        this.recentUsers = data;
      });
  }

  // for admins, load 8 most recent courses
  loadRecentCourses(): void {
    this.http
      .get(`${environment.apiURL}/api/GetRecentCourses/`)
      .subscribe((data: any) => {
        this.recentCourses = data;
      });
  }

  // for admins, load 8 most recent projects
  loadRecentProjects(): void {
    this.http
      .get(`${environment.apiURL}/api/GetRecentProjects/`)
      .subscribe((data: any) => {
        this.recentProjects = data;
      });
  }

  // navigate to course page
  GoToCourse(courseID: number) {
    let state = { courseID: courseID };
    // navigate to the component that is attached to the url inside the [] and pass some information to that page by using the code described here https://stackoverflow.com/a/54365098
    this.router.navigate(['/course'], { state });
  }

  // navigate to project page
  GoToProject(projectID: number) {
    let state = { projectID: projectID };
    // navigate to the component that is attached to the url inside the [] and pass some information to that page by using the code described here https://stackoverflow.com/a/54365098
    this.router.navigate(['/project'], { state });
  }

  // student chooses to cancel a pending course
  cancel(CourseId: any) {
    let req = {
      userID: this.currentUser.userID,
      courseID: CourseId
    };

    this.http
      .post<any>(`${environment.apiURL}/api/removePendUser/`, req, {
        headers: new HttpHeaders({
          'Access-Control-Allow-Headers': 'Content-Type',
        }),
      })
      .subscribe({
        next: (data) => {
          this.errMsg = '';
          // Refresh the data on the page
          this.loadCourses();
          // The following line will refresh the page
          location.reload();
        },
        error: (error) => {
          this.errMsg = error['error']['message'];
        },
      });
  }

  // instructor denies a student for a course
  cancelIns(CourseId: any, UserID: any) {
    let req = {
      userID: UserID,
      courseID: CourseId
    };

    this.http
      .post<any>(`${environment.apiURL}/api/removePendUser/`, req, {
        headers: new HttpHeaders({
          'Access-Control-Allow-Headers': 'Content-Type',
        }),
      })
      .subscribe({
        next: (data) => {
          this.errMsg = '';
          // Refresh the data on the page
          this.loadCourses();
          // The following line will refresh the page
          location.reload();
        },
        error: (error) => {
          this.errMsg = error['error']['message'];
        },
      });
  }

  // get students who have applied to courses for the instructor
  loadInstrPenUserCourses(): void {
    this.http
      .get<any>(
        `${environment.apiURL}/api/Users/${this.currentUser.userID}/getPendInstrCourses/`,
        {
          headers: new HttpHeaders({
            'Access-Control-Allow-Headers': 'Content-Type',
          }),
        }
      )
      .subscribe({
        next: (data) => {
          this.errMsg = '';
          console.log(data);
          this.PendInstrCourses = data;
        },
        error: (error) => {
          this.errMsg = error['error']['message'];
        },
      });
  }

  // instructor approves student application to course
  register(CourseId: any, UserID: any) {
    console.log("Register function called");
    console.log("the course ", CourseId);
    console.log("student userID", UserID);

    let req = {
      userID: UserID,
      courseID: CourseId
    };

    this.http
      .post<any>(`${environment.apiURL}/api/addUserCourse/`, req, {
        headers: new HttpHeaders({
          'Access-Control-Allow-Headers': 'Content-Type',
        }),
      })
      .subscribe({
        next: (data) => {
          this.errMsg = '';
          this.cancelIns(CourseId, UserID);
          // this.loadCourses();
        },
        error: (error) => {
          this.errMsg = error['error']['message'];
        },
      });

  }

  // navigate to a user's profile
  ViewProfile(userID: number) {
    let state = { userID: userID };
    // navigate to the component that is attached to the url inside the [] and pass some information to that page by using the code described here https://stackoverflow.com/a/54365098
    this.router.navigate(['/profile'], { state });
  }

  checkForPendingEvals(): void {
    // Since there is no actual API, we simulate the API call here.
    // In real scenario, this should be an HTTP GET request to check pending evaluations.
    this.hasPendingEvals = true; // Assuming there are pending evaluations.
  }

}
