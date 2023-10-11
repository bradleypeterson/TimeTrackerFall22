import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-create-project',
  templateUrl: './create-project.component.html',
  styleUrls: ['./create-project.component.css']
})
export class CreateProjectComponent implements OnInit {
  public errMsg = '';
  public courseID: any;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private http: HttpClient,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit(): void {

    this.courseID = this.activatedRoute.snapshot.params['id']; // get course id from URL

  }

  createProjectForm = this.formBuilder.group({
    projectName: '',
    description: '',
    isActive: '',
    courseID: '',
  });

  onSubmit(): void {
    let payload = {
      projectName: this.createProjectForm.value['projectName'],
      description: this.createProjectForm.value['description'],
      isActive: true,
      courseID: this.courseID,
    }

    this.http.post<any>('http://localhost:8080/api/createProject', payload, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
      next: data => {
        this.errMsg = "";
        this.router.navigate(['/course/' + this.courseID]);
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });
  }

}
