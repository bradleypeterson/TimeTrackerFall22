import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Router} from '@angular/router';

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
    if (!tempUser){
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

    this.http.post<any>('http://localhost:8080/createCourse/', payload, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
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
  //   this.http.get("http://localhost:8080/api/Courses").subscribe((data: any) =>{ 
  //   for(let i = 0; i < data.length; i++) {
  //     courses.push(data[i].courseName);
  //   }
  // });
  // }

  loadCourses(): void{
    // this.http.get<any>(`http://localhost:8080/Users/CourseList`, {headers: new HttpHeaders({"Access-Control-Allow-Headers": "Content-Type"})}).subscribe({
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
    
    if (!localStorage.getItem('foo')) { 
      localStorage.setItem('foo', 'no reload') 
      location.reload() 
    } else {
      localStorage.removeItem('foo') 
    }
  }



  loadAllUserCourses(): void{
    this.http.get<any>(`http://localhost:8080/Users/${this.currentUser.userID}/getUserCourses/`, {headers: new HttpHeaders({"Access-Control-Allow-Headers": "Content-Type"})}).subscribe({
      next: data => {
        this.errMsg = "";
        console.log(data);
        this.allUserCourses=data;
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });
  }

  loadNonUserCourses(): void{
    this.http.get<any>(`http://localhost:8080/Users/${this.currentUser.userID}/getNonUserCourses/`, {headers: new HttpHeaders({"Access-Control-Allow-Headers": "Content-Type"})}).subscribe({
      next: data => {
        this.errMsg = "";
        console.log(data);
        this.nonUserCourses=data;
        /// populate a label to inform the user that they successfully clocked out, maybe with the time.
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });
  }

  register(CourseId: any){
    console.log(CourseId);
    console.log(this.currentUser.userID);

    let req = {
      userID: this.currentUser.userID,
      courseID: CourseId
    };

    this.http.post<any>('http://localhost:8080/addUserCourse/', req, {headers: new HttpHeaders({"Access-Control-Allow-Headers": "Content-Type"})}).subscribe({
      next: data => {
        this.errMsg = "";
        this.loadCourses();
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });
  }

  drop(CourseId: any){
    let req = {
      userID: this.currentUser.userID,
      courseID: CourseId
    };
    
    this.http.post<any>('http://localhost:8080/deleteUserCourse/', req, {headers: new HttpHeaders({"Access-Control-Allow-Headers": "Content-Type"})}).subscribe({
      next: data => {
        this.errMsg = "";
        this.loadCourses();
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });
  }

}

