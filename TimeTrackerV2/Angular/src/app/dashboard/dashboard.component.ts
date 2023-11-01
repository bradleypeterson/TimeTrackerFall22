import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

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

  instructor: boolean = false;
  student: boolean = false;
  userID: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    const tempUser = localStorage.getItem('currentUser');
    if (!tempUser) {
      this.router.navigate(["/Login"]);
      return;
    }
    this.currentUser = JSON.parse(tempUser);
  }

  ngOnInit(): void {

    // get user type
    let currentUser = localStorage.getItem('currentUser');
    var userDate = currentUser ? JSON.parse(currentUser) : null;
    var userType = userDate.type;
    this.userID = userDate.userID;
    if (userType === 'instructor') {
      this.instructor = true;
    }
    else if (userType === 'student') {
      this.student = true;
    }

    // get projects and courses
    this.loadProjects();
    this.loadCourses();
    this.loadPenUserCourses();
    this.loadInstrPenUserCourses()

    if (!localStorage.getItem('foo')) {
      localStorage.setItem('foo', 'no reload')
      location.reload()
    }
    else {
      localStorage.removeItem('foo')
    }
  }

  public pageTitle = 'TimeTrackerV2 | Dashboard';

  loadProjects(): void {
    this.http.get(`https://localhost:8080/api/ProjectsForUser/${this.userID}`).subscribe((data: any) => {
      //console.log(data);
      this.projects = data;
      if (this.projects) {
        localStorage.setItem("projects", JSON.stringify(this.projects));
      }
    });
  }

  loadCourses(): void {
    // attempt to pull only the courses the instructor has created
    if (this.instructor) {
      var request = `https://localhost:8080/api/Courses/${this.userID}`;
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
      var request = `https://localhost:8080/api/Users/${this.userID}/getUserCourses`
      this.http.get(request).subscribe((data: any) => {
        console.log(data);
        this.courses = data;
        for (let i = 0; i < data.length; i++) {
          localStorage.setItem("courses", JSON.stringify(this.courses));
        }
      });
    }
  }

  loadPenUserCourses(): void {
    this.http.get<any>(`https://localhost:8080/api/Users/${this.currentUser.userID}/getCoursesPendCourses/`, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
      next: data => {
        this.errMsg = "";
        console.log(data);
        this.PendUserCourses = data;
        /// populate a label to inform the user that they successfully clocked out, maybe with the time.
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });
  }

  cancel(CourseId: any) {
    let req = {
      userID: this.currentUser.userID,
      courseID: CourseId
    };

    this.http.post<any>('https://localhost:8080/api/removePendUser/', req, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
      next: data => {
        this.errMsg = "";
        // Refresh the data on the page
        this.loadCourses();
        // The following line will refresh the page
        location.reload();
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });
  }

  cancelIns(CourseId: any, UserID: any) {
    let req = {
      userID: UserID,
      courseID: CourseId
    };

    this.http.post<any>('https://localhost:8080/api/removePendUser/', req, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
      next: data => {
        this.errMsg = "";
        // Refresh the data on the page
        this.loadCourses();
        // The following line will refresh the page
        location.reload();
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });
  }





  loadInstrPenUserCourses(): void {
    this.http.get<any>(`https://localhost:8080/api/Users/${this.currentUser.userID}/getPendInstrCourses/`, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
      next: data => {
        this.errMsg = "";
        console.log(data);
        this.PendInstrCourses = data;
        /// populate a label to inform the user that they successfully clocked out, maybe with the time.
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });
  }

  register(CourseId: any, UserID: any) {
    console.log("Register function called");
    console.log("the course ", CourseId);
    console.log("student userID", UserID);

    let req = {
      userID: UserID,
      courseID: CourseId
    };

    this.http.post<any>('https://localhost:8080/api/addUserCourse/', req, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
      next: data => {
        this.errMsg = "";
        this.cancelIns(CourseId, UserID);
        // this.loadCourses();
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });

  }


}