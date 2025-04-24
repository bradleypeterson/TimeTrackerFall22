import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css'],
})
export class CoursesComponent implements OnInit {
  public pageTitle = 'TimeTrackerV2 | Courses';
  public errMsg = '';
  public courses: any[] = [];
  public allUserCourses: any[] = [];
  public nonUserCourses: any[] = [];
  public PendUserCourses: any[] = [];
  public allUserFilteredCourses: any = [];
  public nonUserFilteredCourses: any = [];
  public searchQuery: any = '';
  public searched = false;
  public courseData: any = [];

  public instructorID: any;
  public courseID: any;
  public currentUser: any;
  public userID: any;

  constructor(private http: HttpClient, private router: Router) {
    const tempUser = localStorage.getItem('currentUser');
    if (tempUser) {
      this.currentUser = JSON.parse(tempUser);
    }
  }

  ngOnInit(): void {
    this.loadCourses();
    // this.loadAllCourses();
    //this.loadStudentCourses();
    // this.loadAllUserCourses();
  }

  /*createCourse(): void {
    let payload = {
      courseName: 'New Course',
      isActive: true,
    }
    console.log(payload);

    this.http.post<any>('https://localhost:8080/api/createCourse/', payload, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
      next: data => {
        this.errMsg = "";
        localStorage.setItem('currentCourse', JSON.stringify(data['course']));
        this.router.navigate(['./course']);
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });
  }*/

  // loadCourses(courses: Array<string>): void {
  //   this.http.get("https://localhost:8080/api/Courses").subscribe((data: any) =>{
  //   for(let i = 0; i < data.length; i++) {
  //     courses.push(data[i].courseName);
  //   }
  // });
  // }

  loadCourses(reload: boolean = true): void {
    this.loadAllUserCourses();
    this.loadNonUserCourses();
    this.loadPenUserCourses();

    if (!localStorage.getItem('foo')) {
      localStorage.setItem('foo', 'no reload');
      location.reload();
    } else {
      localStorage.removeItem('foo');
    }
  }

  loadAllUserCourses(): void {
    this.http
      .get<any[]>(`${environment.apiURL}/api/Users/1/getUserCourses/`)
      .subscribe({
        next: (data) => {
          this.allUserCourses = Array.isArray(data) ? data : []; // Ensure it's an array
        },
        error: (error) => {
          this.errMsg = error.error?.message || 'Error loading user courses';
        },
      });
  }

  loadNonUserCourses(): void {
    this.http
      .get<any[]>(`${environment.apiURL}/api/Users/1/getNonUserCourses/`)
      .subscribe({
        next: (data) => {
          this.nonUserCourses = Array.isArray(data) ? data : []; // Ensure it's an array
        },
        error: (error) => {
          this.errMsg =
            error.error?.message || 'Error loading non-user courses';
        },
      });
  }

  loadPenUserCourses(): void {
    this.http
      .get<any[]>(`${environment.apiURL}/api/Users/1/getCoursesPendCourses/`)
      .subscribe({
        next: (data) => {
          this.PendUserCourses = Array.isArray(data) ? data : []; // Ensure it's an array
        },
        error: (error) => {
          this.errMsg = error.error?.message || 'Error loading pending courses';
        },
      });
  }

  register(courseId: number | null): void {
    if (!courseId) {
      this.errMsg = 'Missing one or more required arguments';
      return;
    }


    const payload = { userID: this.currentUser.userID, courseID: courseId };
    this.http
      .post(`${environment.apiURL}/api/putUserInPending/`, payload)
      .subscribe({
        next: () => {
          this.errMsg = '';
          this.loadCourses();
        },
        error: (error) => {
          this.errMsg = error.error?.message || 'Error registering for course';
        },
      });
  }

  drop(CourseId: any) {
    let req = {
      userID: this.currentUser.userID,
      courseID: CourseId,
    };

    this.http
      .post<any>(`${environment.apiURL}/api/deleteUserCourse/`, req, {
        headers: new HttpHeaders({
          'Access-Control-Allow-Headers': 'Content-Type',
        }),
      })
      .subscribe({
        next: (data) => {
          this.errMsg = '';
          this.loadCourses();
        },
        error: (error) => {
          this.errMsg = error['error']['message'];
        },
      });
  }

  GoToCourse(courseID: number) {
    let state = { courseID: courseID };
    // navigate to the component that is attached to the url inside the [] and pass some information to that page by using the code described here https://stackoverflow.com/a/54365098
    this.router.navigate(['/course'], { state });
  }

  cancel(CourseId: any) {
    let req = {
      userID: this.currentUser.userID,
      courseID: CourseId,
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
          this.loadCourses();
        },
        error: (error) => {
          this.errMsg = error['error']['message'];
        },
      });
  }

  searchCourses(): void {
    this.searched = true;
    // Clear filtered courses arrays
    this.allUserFilteredCourses = [];
    this.nonUserFilteredCourses = [];

    // If search query is empty, do nothing further
    if (this.searchQuery == '') {
      return;
    }
    ///Directly use .filter() to populate the filtered arrays instead of manually iterating through the courses with for loops.
    // Filter non-registered courses
    this.nonUserFilteredCourses = this.nonUserCourses.filter((c: any) =>
      c.courseName.toLowerCase().includes(this.searchQuery.toLowerCase())
    );

    // Filter registered courses
    this.allUserFilteredCourses = this.allUserCourses.filter((c: any) =>
      c.courseName.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }
}
