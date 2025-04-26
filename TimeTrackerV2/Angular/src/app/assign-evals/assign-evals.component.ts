import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { environment } from '../../environments/environment';

interface ProjectSelection {
    id: number;
    name: string;
    isSelected: boolean;
}

interface User {
  userID: number;
}

@Component({
    selector: 'app-assign-evals',
    templateUrl: './assign-evals.component.html',
    styleUrls: ['./assign-evals.component.css'],
    standalone: false
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
    projectInfo: any;

    constructor(
        private http: HttpClient,
        private router: Router,
        private location: Location
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
        this.LoadCourseProjects();
        this.LoadEvalTemplates();
    }

    LoadCourseProjects() {
        this.http
          .get<any>(`${environment.apiURL}/api/Projects/${this.courseID}`, {
            headers: new HttpHeaders({
              'Access-Control-Allow-Headers': 'Content-Type',
            }),
          })
          .subscribe({
            next: (data) => {
              data.forEach((project: any) => {
                // Only grab the projects that are active in the course
                if (project.isActive) {
                  // console.log("Processing the data:\n" + JSON.stringify(entry));
                  let toBeAdded: ProjectSelection = {
                    id: project.projectID,
                    name: project.projectName,
                    isSelected: false,
                  };

                  this.courseProjects.push(toBeAdded);
                }
              });
            },
            error: (err) => {
              this.ShowMessage(err.error.message);
            },
          });
    }

    LoadEvalTemplates() {
        this.http
          .get(
            `${environment.apiURL}/api/templates/${this.currentUser.userID}`,
            {
              headers: new HttpHeaders({
                'Access-Control-Allow-Headers': 'Content-Type',
              }),
            }
          )
          .subscribe({
            next: (data) => {
              this.evalTemplates = data;
            },
            error: (err) => {
              this.ShowMessage(err.error.message);
            },
          });
    }
    
    async LoadProjectInfo(projectID: number): Promise<any> {
      try {
        const response = await this.http.get<any>(`${environment.apiURL}/api/ProjectInfo/${projectID}`, {
          headers: new HttpHeaders({
            'Access-Control-Allow-Headers': 'Content-Type',
          }),
        }).toPromise();
    
        this.projectInfo = response;
        return response;
      } catch (err: any) {
        this.ShowMessage(err.error?.message || 'An error occurred');
        throw err;
      }
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

    async AssignEvals() {
      console.log("AssignEvals");

      let projectIDs: number[] = [];
      let requestBody = {
        evalTemplateID: this.evalSelected.templateID,
        projectIDs: projectIDs
      };
    
      const onlySelectedProjects = this.courseProjects.filter((project: ProjectSelection) => project.isSelected === true)
        .map((project: ProjectSelection) => project.id);
    
      requestBody.projectIDs = onlySelectedProjects;
      console.log(requestBody.projectIDs.length);
    
      for (let i = 0; i < requestBody.projectIDs.length; i++) {
        //wait for result from LoadProjectInfo
        await this.LoadProjectInfo(requestBody.projectIDs[i]);

        console.log(requestBody.projectIDs[i])
    
        const userIDs = this.projectInfo.users;
        console.log(userIDs);
    
        //iterate each user and assign eval
        for (let j = 0; j < userIDs.length; j++) {
          let evalInfo = {
            evaluatorID: this.evalSelected.evaluatorID,
            evaluateeID: userIDs[j],
            templateID: this.evalSelected.templateID,
            projectID: requestBody.projectIDs[i],
            evalCompleted: 0
          };
    
          console.log(evalInfo);
    
          this.http.post<any>(`${environment.apiURL}/api/assignEvalToProjects`, evalInfo, {
            headers: new HttpHeaders({
              'Access-Control-Allow-Headers': 'Content-Type',
            }),
          })
          .subscribe({
            next: (data) => {
              this.router.navigate(['/dashboard']);
              //this.router.navigate(['/assign-evals']); //This is for debugging
              
            },
            error: (err) => {
              this.ShowMessage(err.error.message);
            },
          });
        }
      }
    }
    
    goBackToCoursePage(): void {
        this.location.back();
    }

    // Open an alert window with the supplied message
    ShowMessage(message: string) {
        alert(message);
    }
}
