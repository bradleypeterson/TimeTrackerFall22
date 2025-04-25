import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-inactive-courses',
  templateUrl: './inactive-courses.component.html',
  styleUrls: ['./inactive-courses.component.css']
})
export class InactiveCoursesComponent implements OnInit {
  public inactiveCourses: any;

  public currentUser: any;

  public errMsg: any;

  public p: number = 1;

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
    this.loadInactiveCourses();
  }

  loadInactiveCourses(): void {
    this.http
      .get<any>(
        `${environment.apiURL}/api/Courses/${this.currentUser.userID}/getInactiveCourses/`,
        {
          headers: new HttpHeaders({
            'Access-Control-Allow-Headers': 'Content-Type',
          }),
        }
      )
      .subscribe({
        next: (data) => {
          this.errMsg = '';
          console.log(data);
          this.inactiveCourses = data.reverse();
        },
        error: (error) => {
          this.errMsg = error['error']['message'];
        },
      });
  }

  GoToCourse(courseID: number) {
    let state = {courseID: courseID};
    // navigate to the component that is attached to the url inside the [] and pass some information to that page by using the code described here https://stackoverflow.com/a/54365098
    this.router.navigate(['/course'], { state });
  }
}
