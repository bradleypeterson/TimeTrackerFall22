import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-edit-course',
  templateUrl: './edit-course.component.html',
  styleUrls: ['./edit-course.component.css']
})
export class EditCourseComponent implements OnInit {
  public errMsg = '';
  instructorID: string = '';
  userID: string = '';
  public courseID = '';
  public course: any;

  public currentUser: any;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private http: HttpClient,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    const tempUser = localStorage.getItem('currentUser');
      if (tempUser) {
        this.currentUser = JSON.parse(tempUser);
      }

    // This will grab values from the state variable of the navigate function we defined while navigating to this page.  This solution was found here https://stackoverflow.com/a/54365098
    console.log(`State received: ${JSON.stringify(this.router.getCurrentNavigation()?.extras.state)}`);  // For debugging only
    this.courseID = this.router.getCurrentNavigation()?.extras.state?.courseID;
  }

  ngOnInit(): void {

    // if(this.courseID) { // set course to course from local storage based on course ID
    //   let temp = localStorage.getItem('courses');

    //   if(temp){
    //     const courses = JSON.parse(temp);

    //     for(let course of courses){
    //       if(Number(course.courseID) === Number(this.courseID)){
    //         this.course = course;
    //       }
    //     }
    //   }
    // }

    this.getCourseInfo();
  }

  getCourseInfo(): void {
    this.http
      .get<any>(`${environment.apiURL}/api/CourseInfo/${this.courseID}`, {
        headers: new HttpHeaders({
          'Access-Control-Allow-Headers': 'Content-Type',
        }),
      })
      .subscribe({
        next: (data) => {
          this.errMsg = '';
          this.course = data;
          this.editCourseForm.controls['courseName'].setValue(
            this.course.courseName
          );
          this.editCourseForm.controls['description'].setValue(
            this.course.description
          );
          this.editCourseForm.controls['isActive'].setValue(
            this.course.isActive
          );
          this.instructorID = this.course.instructorID;
        },
        error: (error) => {
          this.errMsg = error['error']['message'];
        },
      });
  }

  editCourseForm = this.formBuilder.group({
    courseName: '',
    description: '',
    isActive: '',
    instructorID: '',
  });

  onSubmit(): void {
    // An extra check condition to prevent submission of the data unless the form is valid
    if(!this.editCourseForm.valid) {
        return;
    }

    let payload = {
      courseName: this.editCourseForm.value['courseName'],
      description: this.editCourseForm.value['description'],
      isActive: this.editCourseForm.value['isActive'],
      instructorID: this.instructorID,
      courseID: this.courseID,
    }

    this.http
      .post<any>(`${environment.apiURL}/api/editCourse/`, payload, {
        headers: new HttpHeaders({
          'Access-Control-Allow-Headers': 'Content-Type',
        }),
      })
      .subscribe({
        next: (data) => {
          console.log('data reached');
          this.errMsg = '';
          this.GoBackToCourse();
        },
        error: (error) => {
          console.log('Error reached');
          this.errMsg = error['error']['message'];
        },
      });
  }

  GoBackToCourse() {
    let state = {courseID: this.courseID};
    // navigate to the component that is attached to the url inside the [] and pass some information to that page by using the code described here https://stackoverflow.com/a/54365098
    this.router.navigate(['/course'], { state });
  }
}
