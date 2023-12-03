import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Location } from '@angular/common'

interface ProjectSelection {
  id: number;
  name: string;
  isSelected: boolean;
}

@Component({
  selector: 'app-assign-evals',
  templateUrl: './assign-evals.component.html',
  styleUrls: ['./assign-evals.component.css']
})

export class AssignEvalsComponent implements OnInit {
  public pageTitle = 'TimeTrackerV2 | Assign Evals'

  public currentUser: any;

  courseID!: number;  // The '!' at the end of "CourseID" is the "non-null assertion operator", this tell the TypeScript compiler that a value is not null or undefined, even if its type suggests that it might be
  selectAllProjects: boolean = false;
  courseProjects: ProjectSelection[] = [];
  aProjectIsSelected: boolean = true;
  evalTemplates: any;
  evalSelected: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private location: Location
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
    this.http.get<any>(`https://localhost:8080/api/Projects/${this.courseID}`, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
      next: data => {
        data.forEach((project: any) => {
          // console.log("Processing the data:\n" + JSON.stringify(entry));
          let toBeAdded: ProjectSelection = {
            id: project.projectID,
            name: project.projectName,
            isSelected: false
          };

          this.courseProjects.push(toBeAdded);
        });
      },
      error: err => {
        alert(`${err.error.message}`);
      }
    });
  }

  LoadEvalTemplates() {
    this.http.get(`https://localhost:8080/api/templates/${this.currentUser.userID}`, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
      next: data => {
        this.evalTemplates = data;
      },
      error: err => {
        alert(`${err.error.message}`);
      }
    });
  }

  // The original idea for both the ToggleSelectAll() and OptionClicked() functions was found here and they were modified to fit my needs https://stackblitz.com/edit/angular-material-select-all-checkbox?file=src%2Fapp%2Fapp.component.ts,src%2Fapp%2Fapp.component.html
  ToggleSelectAll(eventTarget: any) {
    this.courseProjects.forEach((project: ProjectSelection) => {
        project.isSelected = eventTarget.checked;
    })
    this.aProjectIsSelected = eventTarget.checked;
  }

  OptionClicked() {
    let newSelectAllProjects = true;
    let newAProjectIsSelected = false;
    // Go through each project in the course and see if at least one project or all projects have been selected.
    this.courseProjects.forEach((project: ProjectSelection) => {
        newAProjectIsSelected = newAProjectIsSelected || project.isSelected;
        newSelectAllProjects = newSelectAllProjects && project.isSelected;
    });
    // Now assign selectAllProjects to aProjectIsSelected and newSelectAllProjects to selectAllProjects to signify if at least one or all projects have been selected or not
    this.aProjectIsSelected = newAProjectIsSelected;
    this.selectAllProjects = newSelectAllProjects;
  }

  AssignEvals() {
    // Make a body variable for the http.put request so we can assign the eval to students in the project
    let projects: number[] = [];  // This is placed outside of the {} for the requestBody, because you can't seem to define an array of numbers inside it
    let requestBody = {
        projects: projects,
        evalTemplate: this.evalSelected.templateID
    };

    // This will filter all the projects by selecting only the projects that has their "isSelected" property set as true, I.E. it has been selected.  It will then grab all the id for said projects because we don't need the name of the projects to be sent to the server.
    const onlySelectedProjects = this.courseProjects.filter((project: ProjectSelection) => {
        return project.isSelected == true
    }).map((project: ProjectSelection) => {
        return project.id
    });

    requestBody.projects = onlySelectedProjects;
    console.log("API call to assign eval to the selected projects\n\"Select All\" Selected:", this.selectAllProjects, "\ncourseProjects state:", this.courseProjects, "\nEval Template Selected:", this.evalSelected);  // For debugging to make sure that the ngModel is working
  }

  goBackToCoursePage(): void {
    this.location.back();
  }
}
