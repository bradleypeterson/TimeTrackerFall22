import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Router} from '@angular/router';

@Component({
  selector: 'app-course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.css']
})

export class CourseComponent implements OnInit {
  public pageTitle = 'TimeTrackerV2 | Course'
  public errMsg = '';
  private item;
  public courseName;
  public courseDescription;
  public projects = [];
  public students = [];

  constructor(
    private http: HttpClient,
    private router: Router,
  ) { 
    this.item = localStorage.getItem('currentCourse');
    console.log("The current course is: " + this.item);
    if(this.item) {
      this.item = JSON.parse(this.item);
      this.courseName = this.item[0];
      this.courseDescription = this.item[3];
    }
  }

  ngOnInit(): void {
    this.loadProjects(this.projects);
    this.loadStudents(this.students);
  }

  /*createProject(): void {
    let payload = {
      projectName: 'New Project',
      isActive: true,
    }
    console.log(payload);

    this.http.post<any>('http://localhost:8080/createProject/', payload, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
      next: data => {
        this.errMsg = "";
        localStorage.setItem('currentProject', JSON.stringify(data['project']));
        this.router.navigate(['./project']);
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });
  }*/

  loadProjects(projects: Array<string>): void {
    this.http.get("http://localhost:8080/Projects").subscribe((data: any) =>{ 
    for(let i = 0; i < data.length; i++) {
      projects.push(data[i].projectName);
    }
  });
  }

  loadStudents(students: Array<string>): void {
    this.http.get("http://localhost:8080/Users").subscribe((data: any) =>{ 
    for(let i = 0; i < data.length; i++) {
      students.push(data[i].firstName);
    }
  });
  }

}
