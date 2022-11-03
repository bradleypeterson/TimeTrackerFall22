import { Component, Directive, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Router} from '@angular/router';
import { formatDate } from '@angular/common';

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

  date: Date = new Date();
  currDate = formatDate(this.date, 'MM/dd/yyyy', 'en-US');

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

  clockIn(): void {
    localStorage.setItem("timeIn", Date.now().toString());

    /*var item = localStorage.getItem('currentUser');
    
    if (typeof item === 'string')
    {
      this.user = JSON.parse(item) as User
    }
    
    if (this.user !== null)
    {
        let req = {
          timeIn: Date.now(), /// pull date from the HTML
          timeOut: null,
          createdOn: Date.now(),
          userID: this.user.userID,
          description: null /// pull description from the HTML
        };
      
        console.log(req);
        
      if (req !== null)
      {
        this.http.post<any>('http://localhost:8080/clock/', req, {headers: new HttpHeaders({"Access-Control-Allow-Headers": "Content-Type"})}).subscribe({
          next: data => {
            this.errMsg = "";
            console.log("user clocked in: " + this.user.username);
            /// populate a label to inform the user that they successfully clocked in, maybe with the time.
          },
          error: error => {
            this.errMsg = error['error']['message'];
          }
        });
      } 
    }*/
  }

  clockOut(): void {    
    /*var item = localStorage.getItem('currentUser');
    
    if (typeof item === 'string')
    {
      this.user = JSON.parse(item) as User
    }

    if (this.user !== null )
    {*/
        let req = {
          timeIn: localStorage.getItem("timeIn"), 
          timeOut: Date.now(), /// pull date from the HTML
          isEdited: false,
          createdOn: Date.now(),
          userID: 1,
          description: "This is the Description field" /// pull description from the HTML
        };
      

      /*if (req !== null)
      {*/
        this.http.post<any>('http://localhost:8080/clock/', req, {headers: new HttpHeaders({"Access-Control-Allow-Headers": "Content-Type"})}).subscribe({
          next: data => {
            this.errMsg = "";
            console.log(req.isEdited);
            /// populate a label to inform the user that they successfully clocked out, maybe with the time.
          },
          error: error => {
            this.errMsg = error['error']['message'];
          }
        });
      /*}
    }*/

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
