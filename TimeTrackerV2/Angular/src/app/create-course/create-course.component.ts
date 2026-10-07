import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-create-course',
  templateUrl: './create-course.component.html',
  styleUrls: ['./create-course.component.css']
})
export class CreateCourseComponent implements OnInit {
  public errMsg = '';

  public currentUser: any;
  public instructors: any[] = [];

  constructor(
    private formBuilder: UntypedFormBuilder,
    private http: HttpClient,
    private router: Router,
  ) {
    const tempUser = localStorage.getItem('currentUser');
    if (tempUser) {
      this.currentUser = JSON.parse(tempUser);
    }
  }

  ngOnInit(): void {
    if (this.currentUser?.type === 'admin') {
      this.loadInstructors();
    }
  }

  loadInstructors(): void {
    this.http.get<any[]>(`${environment.apiURL}/api/Users`).subscribe({
      next: (users) => {
        this.instructors = users.filter((user) => user.type === 'instructor');
        this.errMsg = this.instructors.length === 0
          ? 'No instructors are available. Add an instructor before creating a course.'
          : '';
      },
      error: (error) => {
        this.errMsg = error.error?.message || 'Unable to load instructors.';
      },
    });
  }

  createCourseForm = this.formBuilder.group({
    courseName: '',
    description: '',
    instructorID: '',
  });

  onSubmit(): void {
    // An extra check condition to prevent submission of the data unless the form is valid
    if (!this.createCourseForm.valid) {
        return;
    }

    const instructorID = this.currentUser?.type === 'admin'
      ? this.createCourseForm.value['instructorID']
      : this.currentUser.userID;
    if (this.currentUser?.type === 'admin' && !this.instructors.some(
      (instructor) => String(instructor.userID) === String(instructorID)
    )) {
      return;
    }

    let payload = {
      courseName: this.createCourseForm.value['courseName'],
      description: this.createCourseForm.value['description'],
      isActive: true,
      instructorID: instructorID,
    }

    this.http
      .post<any>(`${environment.apiURL}/api/createCourse`, payload, {
        headers: new HttpHeaders({
          'Access-Control-Allow-Headers': 'Content-Type',
        }),
      })
      .subscribe({
        next: (data) => {
          this.errMsg = '';
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.errMsg = error['error']['message'];
        },
      });
  }

}
