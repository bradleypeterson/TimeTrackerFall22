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
  public punches = [];

  date: Date = new Date();
  currDate = formatDate(this.date, 'MM/dd/yyyy', 'en-US');

  seconds: any = '0' + 0;
  minutes: any = '0' + 0;
  hours: any = '0' + 0;

  start: any;
  isTimerRunning = false;
  totalTime: any = "00:00:00";
  startClickedLast = false;

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
    this.loadPunches(this.punches);
  }

  loadPunches(punches: Array<string>): void {
    this.http.get("http://localhost:8080/timeCard").subscribe((data: any) =>{ 
    for(let i = 0; i < data.length; i++) {
      console.log(data[i].timeIn.toString());
      punches.push(data[i].timeIn);
    }
  });
  }

  clockIn(): void {
    if(!this.isTimerRunning) {
      var nowDate = Date.now();
      var formattedNowDate = formatDate(nowDate, 'MM/dd/yyyy HH:mm:s', 'en-US');

      localStorage.setItem("timeIn", formattedNowDate);

      this.startClickedLast = true;
      this.startTimer();
    }

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
    if(this.startClickedLast) {
      this.startClickedLast = false;
      this.isTimerRunning = true;  
      this.startTimer();

      var nowDate = Date.now();
      var formattedNowDate = formatDate(nowDate, 'MM/dd/yyyy', 'en-US');
      var formattedTime = formatDate(nowDate, "HH:mm:s", 'en-US');
      /*var item = localStorage.getItem('currentUser');
    
      if (typeof item === 'string')
      {
        this.user = JSON.parse(item) as User
      }

      if (this.user !== null )
      {*/
          let req = {
            timeIn: localStorage.getItem("timeIn"), 
            timeOut: formattedNowDate + " " + formattedTime, /// pull date from the HTML
            isEdited: false,
            createdOn: formattedNowDate,
            userID: 1,
            description: "This is the Description field" /// pull description from the HTML
          };
      

        /*if (req !== null)
        {*/
          this.http.post<any>('http://localhost:8080/clock/', req, {headers: new  HttpHeaders({"Access-Control-Allow-Headers": "Content-Type"})}). subscribe({
            next: data => {
              this.errMsg = "";
              /// populate a label to inform the user that they successfully clocked out, maybe with the time.
            },
            error: error => {
              this.errMsg = error['error']['message'];
            }
          });
        /*}
      }*/
    }
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

  startTimer(): void {
    if(!this.isTimerRunning) {
      this.isTimerRunning = true;
      this.start = setInterval(() => {
        this.seconds++;
        this.seconds = this.seconds < 10 ? '0' + this.seconds : this.seconds;

        if(this.seconds === 60) {
          this.minutes++;
          this.minutes = this.minutes < 10 ? '0' + this.minutes : this.minutes;
          this.seconds = '0' + 0;
        }

        if(this.minutes === 60) {
          this.hours++;
          this.hours = this.hours < 10 ? '0' + this.hours : this.hours;
          this.minutes = '0' + 0;
        }
      }, 1000);
    } else {
      this.stopTimer();
    }
  }

  stopTimer(): void {
    clearInterval(this.start);
    this.isTimerRunning = false;

    this.totalTime = this.hours.toString() + ":" + this.minutes.toString() + ":" + this.seconds.toString();

    this.hours = '0' + 0;
    this.minutes = '0' + 0;
    this.seconds = '0' + 0;
  }
}
