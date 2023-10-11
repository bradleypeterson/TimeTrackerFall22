import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-add-student-project',
  templateUrl: './add-student-project.component.html',
  styleUrls: ['./add-student-project.component.css']
})
export class AddStudentProjectComponent implements OnInit {
  public project: any;
  public errMsg = '';
  public studentsInProject: any = [];
  public studentsNotInProject: any = [];

  private projectID: any;

  public currentUser: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    const tempUser = localStorage.getItem('currentUser');
    if (!tempUser) {
      this.router.navigate(["/Login"]);
      return;
    }
    this.currentUser = JSON.parse(tempUser);
  }

  ngOnInit(): void {
    this.projectID = this.activatedRoute.snapshot.params["id"]; // get projectID from url

    // set to project from local storage
    if (this.projectID) {
      let tempProjects = localStorage.getItem('projects');

      if (tempProjects) {
        const projects = JSON.parse(tempProjects);

        for (let project of projects) {
          if (Number(project.projectID) === Number(this.projectID)) {
            this.project = project;
          }
        }
      }
    }

    this.loadPage();
  }

  loadPage(): void {
    // get students
    this.loadStudentsInProject();
    this.loadStudentsNotInProject();

    if (!localStorage.getItem('foo')) {
      localStorage.setItem('foo', 'no reload');
      location.reload();
    } else {
      localStorage.removeItem('foo');
    }
  }

  loadStudentsInProject(): void {
    this.http.get<any>(`http://localhost:8080/api/AddToProject/${this.projectID}/InProject`, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
      next: data => {
        this.errMsg = "";
        console.log(data);
        this.studentsInProject = data;
        if (this.studentsInProject) {
          localStorage.setItem("studentsInProject", JSON.stringify(this.studentsInProject));
        }
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });
  }

  loadStudentsNotInProject(): void {
    this.http.get<any>(`http://localhost:8080/api/AddToProject/${this.projectID}/NotInProject`, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
      next: data => {
        this.errMsg = "";
        console.log(data);
        this.studentsNotInProject = data;
        if (this.studentsNotInProject) {
          localStorage.setItem("studentsNotInProject", JSON.stringify(this.studentsNotInProject));
        }
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });
  }

  add(UserID: any) {
    let req = {
      userID: UserID,
      projectID: this.projectID
    };

    this.http.post<any>('http://localhost:8080/api/joinGroup/', req, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
      next: data => {
        this.errMsg = "";
        this.loadPage();
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });
  }

  drop(UserID: any) {
    let req = {
      userID: UserID,
      projectID: this.projectID
    };

    this.http.post<any>('http://localhost:8080/api/leaveGroup/', req, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
      next: data => {
        this.errMsg = "";
        this.loadPage();
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });
  }
}
