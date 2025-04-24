import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-add-courses',
  templateUrl: './add-courses.component.html',
  styleUrls: ['./add-courses.component.css'],
})
export class AddCoursesComponent implements OnInit {
  public courses: { courseName: string; courseID: string }[] = [];
  public RegisteredCourses = [];

  public currentUser: any;

  constructor(private http: HttpClient, private router: Router) {
    const tempUser = localStorage.getItem('currentUser');
    if (tempUser) {
      this.currentUser = JSON.parse(tempUser);
    }
  }

  ngOnInit(): void {}

  // loadCourses(): void {
  //   this.http
  //     .get<{ courseName: string; courseID: string }[]>(
  //       `${environment.apiURL}/api/Courses`
  //     )
  //     .subscribe((data) => {
  //       this.courses = data; // Populate the courses array with the fetched data
  //     });
  // }

  navigateToCourse(courseID: string): void {
    this.router.navigate(['/course'], { state: { courseID } });
  }
}
