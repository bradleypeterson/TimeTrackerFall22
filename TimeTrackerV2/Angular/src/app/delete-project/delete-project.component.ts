import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-delete-project',
  templateUrl: './delete-project.component.html',
  styleUrls: ['./delete-project.component.css']
})
export class DeleteProjectComponent implements OnInit {
  public errMsg = '';
  private projectID: any;
  instructor: boolean = false;
  student: boolean = false;
  userID: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    // get user type
    let currentUser = localStorage.getItem('currentUser');
    var userDate = currentUser ? JSON.parse(currentUser) : null;
    var userType = userDate.type;
    this.userID = userDate.userID;
    if (userType === 'instructor') {
      this.instructor = true;
    } else if (userType === 'student') {
      this.student = true;
    }

    // ensure user is instructor
    if (this.instructor) {
      this.projectID = this.activatedRoute.snapshot.params['id']; // get project id from URL

      this.delete(this.projectID);
    } else {
      this.errMsg = "Only instructors can delete projects!";
    }


  }

  delete(ProjectId: any) {
    let req = {
      projectID: ProjectId
    };

    this.http.post<any>('http://localhost:8080/api/deleteProject/', req, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
      next: data => {
        this.errMsg = "";
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });
  }
}
