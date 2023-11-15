import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-edit-project',
  templateUrl: './edit-project.component.html',
  styleUrls: ['./edit-project.component.css']
})
export class EditProjectComponent implements OnInit {
  public errMsg = '';
  public projectID: any;
  public project: any;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private http: HttpClient,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
      // This will grab values from the state variable of the navigate function we defined while navigating to this page.  This solution was found here https://stackoverflow.com/a/54365098
      console.log(`State received: ${JSON.stringify(this.router.getCurrentNavigation()?.extras.state)}`);  // For debugging only    
      this.projectID = this.router.getCurrentNavigation()?.extras.state?.projectID;
    }

  ngOnInit(): void {

    // let tempProjects = localStorage.getItem('projects');
    //   if (tempProjects) {
    //     const projects = JSON.parse(tempProjects);
    //     console.log(projects);
    //     for (let project of projects) {
    //       console.log(project);
    //       console.log(this.projectID);
    //       console.log(project.projectID);
    //       if (Number(project.projectID) === Number(this.projectID)) {
    //         console.log(project);
    //         this.project = project;
    //       }
    //     }
    //   }

    this.getProjectInfo();
  }

  getProjectInfo(): void {
    this.http.get<any>(`https://localhost:8080/api/ProjectInfo/${this.projectID}`, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
        next: data => {
            this.errMsg = "";
            this.project = data;
            if (this.project) {
              this.editProjectForm.controls['projectName'].setValue(this.project.projectName);
              this.editProjectForm.controls['description'].setValue(this.project.description);
              this.editProjectForm.controls['isActive'].setValue(this.project.isActive);
            }
        },
        error: error => {
            this.errMsg = error['error']['message'];
        }
    });
  }

  editProjectForm = this.formBuilder.group({
    projectName: '',
    description: '',
    isActive: '',
    projectID: '',
  });

  onSubmit(): void {
    // An extra check condition to prevent submission of the data unless the form is valid 
    if(!this.editProjectForm.valid) {
        return;
    }
    
    let payload = {
      projectName: this.editProjectForm.value['projectName'],
      description: this.editProjectForm.value['description'],
      isActive: this.editProjectForm.value['isActive'],
      projectID: this.projectID,
    }

    this.http.post<any>(`https://localhost:8080/api/editProject`, payload, {headers: new HttpHeaders({"Access-Control-Allow-Headers": "Content-Type"})}).subscribe({
      next: data => {
        this.errMsg = "";
        this.NavigateBackToProject();
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });
  }

  NavigateBackToProject() {
    let state = {projectID: this.projectID};
    // navigate to the component that is attached to the url inside the [] and pass some information to that page by using the code described here https://stackoverflow.com/a/54365098
    this.router.navigate(['/project'], { state });
  }
}
