import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-edit-course',
  templateUrl: './edit-course.component.html',
  styleUrls: ['./edit-course.component.css']
})
export class EditCourseComponent implements OnInit {
  public errMsg = '';
  instructorID: string = '';
  public courseID = '';
  public course: any;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private http: HttpClient,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    // This will grab values from the state variable of the navigate function we defined while navigating to this page.  This solution was found here https://stackoverflow.com/a/54365098
    console.log(`State received: ${JSON.stringify(this.router.getCurrentNavigation()?.extras.state)}`);  // For debugging only
    this.courseID = this.router.getCurrentNavigation()?.extras.state?.returnCourseID;
  }

  ngOnInit(): void {
    let currentUser = localStorage.getItem('currentUser');
    var userDate = currentUser ? JSON.parse(currentUser) : null;
    var userType = userDate.type;
    this.instructorID = userDate.userID;
    if(userType !== 'instructor'){ // redirect to dashboard if the user isn't an instructor
      window.location.replace("/dashboard");
    }

    //this.courseID = this.activatedRoute.snapshot.params['id']; // get course id from URL

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
    this.http.get<any>(`https://localhost:8080/api/CourseInfo/${this.courseID}`, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
        next: data => {
            this.errMsg = "";
            this.course = data;
            this.editCourseForm.controls['courseName'].setValue(this.course.courseName);
            this.editCourseForm.controls['description'].setValue(this.course.description);
        },
        error: error => {
            this.errMsg = error['error']['message'];
        }
    });
  }

  editCourseForm = this.formBuilder.group({
    courseName: '',
    description: '',
    isActive: '',
    instructorID: '',
  });

  onSubmit(): void {
    let payload = {
      courseName: this.editCourseForm.value['courseName'],
      description: this.editCourseForm.value['description'],
      isActive: true,
      instructorID: this.instructorID,
      courseID: this.courseID,
    }

    this.http.post<any>('https://localhost:8080/api/editCourse/', payload, {headers: new HttpHeaders({"Access-Control-Allow-Headers": "Content-Type"})}).subscribe({
      next: data => {
        console.log("data reached");
        this.errMsg = "";
        this.GoBackToCourse();
      },
      error: error => {
        console.log("Error reached");
        this.errMsg = error['error']['message'];
      }
    });
  }

  GoBackToCourse() {
    let state = {courseID: this.courseID};
    // navigate to the component that is attached to the url '/course' and pass some information to that page by using the code described here https://stackoverflow.com/a/54365098
    this.router.navigate(['/course'], { state });
  }
}
