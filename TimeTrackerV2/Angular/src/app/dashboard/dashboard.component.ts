import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Router} from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {
  public projects = [];
  public courses = [];

  constructor(
    private http: HttpClient,
    private router: Router,
  ) { }

  ngOnInit(): void {

    this.loadProjects(this.projects);
    this.loadCourses(this.courses);
    if (!localStorage.getItem('foo')) { 
      localStorage.setItem('foo', 'no reload') 
      location.reload() 
    } else {
      localStorage.removeItem('foo') 
    }
    
  }


  public pageTitle = 'TimeTrackerV2 | Dashboard'

  loadProjects(projects: Array<string>): void {
    this.http.get("http://localhost:8080/Projects").subscribe((data: any) =>{ 
    for(let i = 0; i < data.length; i++) {
      projects.push(data[i].projectName);
    }
  });
  }

  loadCourses(courses: Array<string>): void {
    this.http.get("http://localhost:8080/Courses").subscribe((data: any) =>{ 
    for(let i = 0; i < data.length; i++) {
      courses.push(data[i].courseName);
    }
  });
  }

}



