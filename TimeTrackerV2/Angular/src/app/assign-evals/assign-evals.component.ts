import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-assign-evals',
  templateUrl: './assign-evals.component.html',
  styleUrls: ['./assign-evals.component.css']
})

export class AssignEvalsComponent implements OnInit {
  public pageTitle = 'TimeTrackerV2 | Assign Evals'

  public currentUser: any;

  courseID!: number;  // The '!' at the end of "CourseID" is the "non-null assertion operator", this tell the TypeScript compiler that a value is not null or undefined, even if its type suggests that it might be
  courseProjects: any;
  evalTemplates: any;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const tempUser = localStorage.getItem('currentUser');
    if (!tempUser) {
      this.router.navigate(["/Login"]);
      return;
    }
    this.currentUser = JSON.parse(tempUser);

    // This will grab values from the state variable of the navigate function we defined while navigating to this page.  This solution was found here https://stackoverflow.com/a/54365098
    console.log(`State received: ${JSON.stringify(this.router.getCurrentNavigation()?.extras.state)}`);  // For debugging only
    this.courseID = this.router.getCurrentNavigation()?.extras.state?.courseID;
  }

  ngOnInit(): void {
    this.LoadCourseProjects();
    this.LoadEvalTemplates();
  }

  LoadCourseProjects() {
    this.http.get(`https://localhost:8080/api/Projects/${this.courseID}`, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({ next: data => {
      this.courseProjects = data;
      },
      error: err => {
        alert(`${err.error.message}`);
      }
    });
  }

  LoadEvalTemplates() {
    this.http.get(`https://localhost:8080/api/templates`, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({ next: data => {
      this.evalTemplates = data;
      },
      error: err => {
        alert(`${err.error.message}`);
      }
    });
  }
}
