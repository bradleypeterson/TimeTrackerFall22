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

  }

  createCourseForm = this.formBuilder.group({
    courseName: '',
    description: '',
  });

  onSubmit(): void {
    // An extra check condition to prevent submission of the data unless the form is valid
    if (!this.createCourseForm.valid) {
        return;
    }

    let payload = {
      courseName: this.createCourseForm.value['courseName'],
      description: this.createCourseForm.value['description'],
      isActive: true,
      instructorID: this.currentUser.userID,
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
