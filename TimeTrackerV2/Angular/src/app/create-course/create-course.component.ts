import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-course',
  templateUrl: './create-course.component.html',
  styleUrls: ['./create-course.component.css']
})
export class CreateCourseComponent implements OnInit {
  public errMsg = '';
  instructorID: string = '';

  constructor(
    private formBuilder: UntypedFormBuilder,
    private http: HttpClient,
    private router: Router,
  ) { }

  ngOnInit(): void {
    let currentUser = localStorage.getItem('currentUser');
    var userDate = currentUser ? JSON.parse(currentUser) : null;
    var userType = userDate.type;
    this.instructorID = userDate.userID;
    if (userType !== 'instructor') { // redirect to dashboard if the user isn't an instructor
      window.location.replace("/dashboard");
    }
  }

  createCourseForm = this.formBuilder.group({
    courseName: '',
    description: '',
    isActive: '',
    instructorID: '',
  });

  onSubmit(): void {
    // An extra check condition to prevent submission of the data unless for form is valid 
    if (!this.createCourseForm.valid) {
        return;
    }

    let payload = {
      courseName: this.createCourseForm.value['courseName'],
      description: this.createCourseForm.value['description'],
      isActive: true,
      instructorID: this.instructorID,
    }

    this.http.post<any>('https://localhost:8080/api/createCourse', payload, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
      next: data => {
        this.errMsg = "";
        this.router.navigate(['/dashboard']);
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });
  }

}
