import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

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
      if (tempUser) {
        this.currentUser = JSON.parse(tempUser);
      }
  }

  ngOnInit(): void {
  }

  loadCourses(courses: Array<{}>): void {
    this.http
      .get(`${environment.apiURL}/api/Courses`)
      .subscribe((data: any) => {
        for (let i = 0; i < data.length; i++) {
          courses.push(data[i]);
        }
      });
  }

}
