import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-delete-course',
  templateUrl: './delete-course.component.html',
  styleUrls: ['./delete-course.component.css']
})
export class DeleteCourseComponent implements OnInit {
  public errMsg = '';
  private courseID: any;
  instructor: boolean = false;
  student: boolean = false;
  userID: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    // get user type
    let currentUser = localStorage.getItem('currentUser');
    var userDate = currentUser ? JSON.parse(currentUser) : null;
    var userType = userDate.type;
    this.userID = userDate.userID;
    if(userType === 'instructor'){
      this.instructor = true;
    }else if(userType === 'student'){
      this.student = true;
    }

    // ensure user is instructor
    if(this.instructor){
      this.courseID = this.activatedRoute.snapshot.params['id']; // get course id from URL

      this.delete(this.courseID);
    }else{
      this.errMsg = "Only instructors can delete courses!";
    }

    
  }

  delete(CourseId: any){
    let req = {
      courseID: CourseId
    };
    
    this.http.post<any>('http://localhost:8080/api/deleteCourse/', req, {headers: new HttpHeaders({"Access-Control-Allow-Headers": "Content-Type"})}).subscribe({
      next: data => {
        this.errMsg = "";
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });
  }
}
