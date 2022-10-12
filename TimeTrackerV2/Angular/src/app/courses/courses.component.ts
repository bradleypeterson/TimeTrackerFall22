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
  public courses = [];

  constructor(
    private http: HttpClient,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.loadCourses(this.courses);
  }

  createCourse(): void {
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
  }

  loadCourses(courses: Array<string>): void {
    let coursesData = this.http.get("http://localhost:8080/Courses");
    courses.push("CS 1010");
    courses.push("CS 1030");
  }
}
