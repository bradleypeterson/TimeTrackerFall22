import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Router} from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {
  public projects: any = [];
  public courses: any = [];

  instructor: boolean = false;
  student: boolean = false;
  userID: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
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

    // get projects and courses
    this.loadProjects();
    this.loadCourses();

    if (!localStorage.getItem('foo')) { 
      localStorage.setItem('foo', 'no reload') 
      location.reload() 
    } else {
      localStorage.removeItem('foo') 
    }
    
  }

  public pageTitle = 'TimeTrackerV2 | Dashboard';

  loadProjects(): void {
    this.http.get(`http://localhost:8080/api/ProjectsForUser/${this.userID}`).subscribe((data: any) =>{ 
    //console.log(data);
    this.projects = data;
    if(this.projects){
      localStorage.setItem("projects", JSON.stringify(this.projects));
    }
  });
  }

  loadCourses(): void {
    var request = 'http://localhost:8080/api/Courses/' + this.userID; // attempt to pull only the courses the instructor has created
    this.http.get(request).subscribe((data: any) =>{
    console.log(data);
    this.courses = data;
    for(let i = 0; i < data.length; i++) {
      localStorage.setItem("courses", JSON.stringify(this.courses));
    }
  });
  }

}



