import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.css']
})

export class CourseComponent implements OnInit {
  public course: any;
  public projects: any = [];

  private courseID: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    
    this.courseID = this.activatedRoute.snapshot.params['id']; // get course id from URL

    if(this.courseID) { // set course to course from local storage based on course ID
      let temp = localStorage.getItem('courses');

      if(temp){
        const courses = JSON.parse(temp);

        for(let course of courses){
          if(Number(course.courseID) === Number(this.courseID)){
            this.course = course;
          }
        }
      }
    }

    // get projects
    this.loadProjects();


  }

  loadProjects(): void {
    this.http.get("http://localhost:8080/Projects/" + this.courseID).subscribe((data: any) =>{ 
    this.projects = data;
    if(this.projects){
      localStorage.setItem("projects", JSON.stringify(this.projects));
    }
  });
  }




}
