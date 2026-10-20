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
  public successMsg = '';
  public courses: any = [];
  public allUserCourses: any = [];
  public nonUserCourses: any = [];
  public PendUserCourses: any = [];
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

  loadCourses(): void {
    // this.http.get<any>(`https://localhost:8080/Users/CourseList`, {headers: new HttpHeaders({"Access-Control-Allow-Headers": "Content-Type"})}).subscribe({
    //   next: data => {
    //     this.errMsg = "";
    //     console.log(data);
    //     this.courses=data;
    //   },
    //   error: error => {
    //     this.errMsg = error['error']['message'];
    //   }
    // });

    this.loadAllUserCourses();
    this.loadNonUserCourses();
    this.loadPenUserCourses();

  }

  loadAllUserCourses(): void {
    this.http
      .get<any>(
        `${environment.apiURL}/api/Users/${this.currentUser.userID}/getUserCourses/`,
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
          this.allUserCourses = data;
        },
        error: (error) => {
          this.errMsg = error['error']['message'];
        },
      });
  }

  loadNonUserCourses(): void {
    this.http
      .get<any>(
        `${environment.apiURL}/api/Users/${this.currentUser.userID}/getNonUserCourses/`,
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
          this.nonUserCourses = data;
          /// populate a label to inform the user that they successfully clocked out, maybe with the time.
        },
        error: (error) => {
          this.errMsg = error['error']['message'];
        },
      });
  }

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
          /// populate a label to inform the user that they successfully clocked out, maybe with the time.
        },
        error: (error) => {
          this.errMsg = error['error']['message'];
        },
      });
  }

  register(CourseId: any) {
    console.log(CourseId);
    console.log(this.currentUser.userID);

    let req = {
      userID: this.currentUser.userID,
      courseID: CourseId,
    };

    this.http
      .post<any>(`${environment.apiURL}/api/putUserInPending/`, req, {
        headers: new HttpHeaders({
          'Access-Control-Allow-Headers': 'Content-Type',
        }),
      })
      .subscribe({
        next: (data) => {
          this.errMsg = '';
          this.successMsg = 'Course registration request submitted.';
          this.loadCourses();
        },
        error: (error) => {
          this.errMsg = error['error']['message'];
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
          this.successMsg = 'You dropped the course.';
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
          this.successMsg = 'Course registration request cancelled.';
          this.loadCourses();
        },
        error: (error) => {
          this.errMsg = error['error']['message'];
        },
      });
  }

  searchCourses(): void {
    const searchTerm = this.searchQuery.trim().toLowerCase();

    this.allUserFilteredCourses = [];
    this.nonUserFilteredCourses = [];

    if (!searchTerm) {
      this.searched = false;
      return;
    }

    this.searched = true;
    this.nonUserFilteredCourses = this.nonUserCourses.filter((course: any) =>
      this.courseMatchesSearch(course, searchTerm)
    );
    this.allUserFilteredCourses = this.allUserCourses.filter((course: any) =>
      this.courseMatchesSearch(course, searchTerm)
    );
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.searched = false;
    this.allUserFilteredCourses = [];
    this.nonUserFilteredCourses = [];
  }

  private courseMatchesSearch(course: any, searchTerm: string): boolean {
    const instructorName =
      `${course.instructorFN ?? ''} ${course.instructorLN ?? ''}`.trim();
    const searchableFields = [
      course.courseName,
      course.instructorFN,
      course.instructorLN,
      instructorName,
      course.description,
    ];

    return searchableFields.some((field) =>
      String(field ?? '').toLowerCase().includes(searchTerm)
    );
  }
}
