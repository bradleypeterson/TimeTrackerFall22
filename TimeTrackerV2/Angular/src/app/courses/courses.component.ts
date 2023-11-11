import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.css']
})

export class CoursesComponent implements OnInit {
  public pageTitle = 'TimeTrackerV2 | Courses'
  public errMsg = '';
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

    if (!localStorage.getItem('foo')) {
      localStorage.setItem('foo', 'no reload')
      location.reload()
    } else {
      localStorage.removeItem('foo')
    }
  }



  loadAllUserCourses(): void {
    this.http.get<any>(`https://localhost:8080/api/Users/${this.currentUser.userID}/getUserCourses/`, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
      next: data => {
        this.errMsg = "";
        console.log(data);
        this.allUserCourses = data;
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });
  }

  loadNonUserCourses(): void {
    this.http.get<any>(`https://localhost:8080/api/Users/${this.currentUser.userID}/getNonUserCourses/`, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
      next: data => {
        this.errMsg = "";
        console.log(data);
        this.nonUserCourses = data;
        /// populate a label to inform the user that they successfully clocked out, maybe with the time.
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });
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

  register(CourseId: any) {
    console.log(CourseId);
    console.log(this.currentUser.userID);

    let req = {
      userID: this.currentUser.userID,
      courseID: CourseId
    };

    this.http.post<any>('https://localhost:8080/api/putUserInPending/', req, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
      next: data => {
        this.errMsg = "";
        this.loadCourses();
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });
  }

  drop(CourseId: any) {
    let req = {
      userID: this.currentUser.userID,
      courseID: CourseId
    };

    this.http.post<any>('https://localhost:8080/api/deleteUserCourse/', req, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
      next: data => {
        this.errMsg = "";
        this.loadCourses();
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });
  }

  GoToCourse(courseID: number) {
        let state = {courseID: courseID};
        // navigate to the component that is attached to the url inside the [] and pass some information to that page by using the code described here https://stackoverflow.com/a/54365098
        this.router.navigate(['/course'], { state });
    }

  cancel(CourseId: any) {
    let req = {
      userID: this.currentUser.userID,
      courseID: CourseId
    };

    this.http.post<any>('https://localhost:8080/api/removePendUser/', req, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
      next: data => {
        this.errMsg = "";
        this.loadCourses();
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });
  }




  searchCourses(): void {
    this.searched = true;
    let sizeOfAllFilteredCourses = 0;
    let sizeOfNonFilteredCourses = 0;
    if (this.searchQuery == '') {
      this.allUserFilteredCourses = [];
      this.nonUserFilteredCourses = [];
    }
    else {
      sizeOfAllFilteredCourses = this.allUserFilteredCourses.length;
      sizeOfNonFilteredCourses = this.nonUserFilteredCourses.length;
      this.allUserFilteredCourses.splice(0, sizeOfAllFilteredCourses);
      this.nonUserFilteredCourses.splice(0, sizeOfNonFilteredCourses);
      for (let c of this.nonUserCourses) {
        if (c.courseName.toLowerCase().search(this.searchQuery.toLowerCase()) != -1) {
          this.nonUserFilteredCourses.push(c);
        }
        else {
          sizeOfNonFilteredCourses = this.nonUserFilteredCourses.length;
          this.nonUserFilteredCourses.splice(0, sizeOfNonFilteredCourses);
          sizeOfAllFilteredCourses = this.allUserFilteredCourses.length;
          this.allUserFilteredCourses.splice(0, sizeOfAllFilteredCourses);
        }
      }
      for (let c of this.allUserCourses) {
        if (c.courseName.toLowerCase().search(this.searchQuery.toLowerCase()) != -1) {
          this.allUserFilteredCourses.push(c);
        }
        else {
          sizeOfAllFilteredCourses = this.allUserFilteredCourses.length;
          this.allUserFilteredCourses.splice(0, sizeOfAllFilteredCourses);
          sizeOfNonFilteredCourses = this.nonUserFilteredCourses.length;
          this.nonUserFilteredCourses.splice(0, sizeOfNonFilteredCourses);
        }
      }
    }
  }

}

