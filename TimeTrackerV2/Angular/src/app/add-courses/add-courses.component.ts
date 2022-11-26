import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Router} from '@angular/router';

@Component({
  selector: 'app-add-courses',
  templateUrl: './add-courses.component.html',
  styleUrls: ['./add-courses.component.css']
})
export class AddCoursesComponent implements OnInit {

  public courses = [];
  public RegisteredCourses = [];


  constructor(
    private http: HttpClient,
    private router: Router,
    ) { }

  ngOnInit(): void {
  }

  loadCourses(courses: Array<{}>): void {
    this.http.get("http://localhost:8080/Add-Courses").subscribe((data: any) =>{ 
    for(let i = 0; i < data.length; i++) {
      courses.push(data[i]);
    }
  });
  }

}
