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
  public inactiveCourses: any[] = []; // Initialize as an empty array

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
    this.http.get(`${environment.apiURL}/api/getInactiveCourses`).subscribe({
      next: (data) => {
        console.log('Mocked data received:', data); // Debugging
        this.inactiveCourses = Array.isArray(data) ? data : [];
        this.errMsg = ''; // Set errMsg to an empty string on success
      },
      error: (error) => {
        this.errMsg = error.error.message;
      },
    });
  }

  GoToCourse(courseID: number) {
    let state = {courseID: courseID};
    // navigate to the component that is attached to the url inside the [] and pass some information to that page by using the code described here https://stackoverflow.com/a/54365098
    this.router.navigate(['/course'], { state });
  }
}
