import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Router} from '@angular/router';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css']
})
export class ProjectComponent implements OnInit {
  public pageTitle = 'TimeTrackerV2 | Project'
  public errMsg = '';
  private item;
  public projectName;
  public projectDescription;

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    this.item = localStorage.getItem('currentProject');
    console.log("The current project is: " + this.item);
    if(this.item) {
      this.item = JSON.parse(this.item);
      this.projectName = this.item[0];
      this.projectDescription = this.item[3];
    }
  }

  ngOnInit(): void {
  }

  createGroup(): void {
    let payload = {
      groupName: 'New Group',
      isActive: true,
    }
    console.log(payload);

    this.http.post<any>('http://localhost:8080/createGroup/', payload, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
      next: data => {
        this.errMsg = "";
        localStorage.setItem('currentGroup', JSON.stringify(data['group']));
        this.router.navigate(['./group']);
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });
  }
}
