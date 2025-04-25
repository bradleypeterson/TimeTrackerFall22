import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../environments/environment';

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

  public p: number = 1;

  constructor(
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
      this.projectID = this.router.getCurrentNavigation()?.extras.state?.projectID;
    }

  ngOnInit(): void {

    this.getProjectInfo();

    // set to project from local storage
    // if (this.projectID) {
    //   let tempProjects = localStorage.getItem('projects');

    //   if (tempProjects) {
    //     const projects = JSON.parse(tempProjects);

    //     for (let project of projects) {
    //       if (Number(project.projectID) === Number(this.projectID)) {
    //         this.project = project;
    //       }
    //     }
    //   }
    // }
  }

  getProjectInfo(): void {
    this.http
      .get<any>(`${environment.apiURL}/api/ProjectInfo/${this.projectID}`, {
        headers: new HttpHeaders({
          'Access-Control-Allow-Headers': 'Content-Type',
        }),
      })
      .subscribe({
        next: (data) => {
          this.errMsg = '';
          this.project = data;
          if (this.project) {
            this.loadPage();
          }
        },
        error: (error) => {
          this.errMsg = error['error']['message'];
        },
      });
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
    this.http
      .get<any>(
        `${environment.apiURL}/api/AddToProject/${this.projectID}/InProject`,
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
          this.studentsInProject = data;
          if (this.studentsInProject) {
            localStorage.setItem(
              'studentsInProject',
              JSON.stringify(this.studentsInProject)
            );
          }
        },
        error: (error) => {
          this.errMsg = error['error']['message'];
        },
      });
  }

  loadStudentsNotInProject(): void {
    this.http
      .get<any>(
        `${environment.apiURL}/api/AddToProject/${this.projectID}/NotInProject`,
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
          this.studentsNotInProject = data;
          if (this.studentsNotInProject) {
            localStorage.setItem(
              'studentsNotInProject',
              JSON.stringify(this.studentsNotInProject)
            );
          }
        },
        error: (error) => {
          this.errMsg = error['error']['message'];
        },
      });
  }

  add(UserID: any) {
    let req = {
      userID: UserID,
      projectID: this.projectID
    };

    this.http
      .post<any>(`${environment.apiURL}/api/joinGroup/`, req, {
        headers: new HttpHeaders({
          'Access-Control-Allow-Headers': 'Content-Type',
        }),
      })
      .subscribe({
        next: (data) => {
          this.errMsg = '';
          this.loadPage();
        },
        error: (error) => {
          this.errMsg = error['error']['message'];
        },
      });
  }

  drop(UserID: any) {
    let req = {
      userID: UserID,
      projectID: this.projectID
    };

    this.http
      .post<any>(`${environment.apiURL}/api/leaveGroup/`, req, {
        headers: new HttpHeaders({
          'Access-Control-Allow-Headers': 'Content-Type',
        }),
      })
      .subscribe({
        next: (data) => {
          this.errMsg = '';
          this.loadPage();
        },
        error: (error) => {
          this.errMsg = error['error']['message'];
        },
      });
  }

  NavigateBackToProject() {
    let state = {projectID: this.projectID};
    // navigate to the component that is attached to the url inside the [] and pass some information to that page by using the code described here https://stackoverflow.com/a/54365098
    this.router.navigate(['/project'], { state });
  }
}
