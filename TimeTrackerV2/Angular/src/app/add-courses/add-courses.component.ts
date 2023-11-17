import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-courses',
  templateUrl: './add-courses.component.html',
  styleUrls: ['./add-courses.component.css']
})
export class AddCoursesComponent implements OnInit {

  public courses = [];
  public RegisteredCourses = [];

  public currentUser: any;


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
  }

  loadCourses(courses: Array<{}>): void {
    this.http.get("https://localhost:8080/api/Courses").subscribe((data: any) => {
      for (let i = 0; i < data.length; i++) {
        courses.push(data[i]);
      }
    });
  }

}
