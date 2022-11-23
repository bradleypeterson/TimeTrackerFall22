import { ViewEvalComponent } from './../view-eval/view-eval.component';
import { Component, Directive, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Router} from '@angular/router';
import { formatDate } from '@angular/common';
// import { Stopwatch } from "ts-stopwatch";
import { FormControl } from '@angular/forms';


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
  
  description = new FormControl('');
  activities: any=[];

  date: Date = new Date();
  currDate = formatDate(this.date, 'MM/dd/yyyy', 'en-US');

  seconds: any = '0' + 0;
  minutes: any = '0' + 0;
  hours: any = '0' + 0;

  start: any;
  isTimerRunning = false;
  totalTime: any = "00:00:00";
  startClickedLast = false;

  currentUser: any;

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    const tempUser = localStorage.getItem('currentUser');
    if (!tempUser){
      this.router.navigate(["/Login"]);
      return;
    }
    this.currentUser = JSON.parse(tempUser);
    console.log(this.currentUser);
    this.item = localStorage.getItem('currentProject');
    console.log("The current project is: " + this.item);
    if(this.item) {
      this.item = JSON.parse(this.item);
      this.projectName = this.item[0];
      this.projectDescription = this.item[3];
    }
  }

  getActivities(): void{
    this.http.get<any>(`http://localhost:8080/Users/${this.currentUser.userID}/activities/`, {headers: new HttpHeaders({"Access-Control-Allow-Headers": "Content-Type"})}).subscribe({
      next: data => {
        this.errMsg = "";
        console.log(data);
        this.activities=data;
        /// populate a label to inform the user that they successfully clocked out, maybe with the time.
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });
  }

  ngOnInit(): void {
    this.getActivities();
  }

  clockIn(): void {
    if(!this.isTimerRunning) {
      localStorage.setItem("timeIn", Date.now().toString());

      this.startClickedLast = true;
      this.startTimer();
    }
  }

  submit(): void{
    this.startClickedLast = false;
    this.isTimerRunning = true;  
    this.startTimer();

    let req = {
      timeIn: localStorage.getItem("timeIn"), 
      timeOut: Date.now(), /// pull date from the HTML
      isEdited: false,
      userID: this.currentUser.userID,
      projectID: 1,
      description: this.description.value /// pull description from the HTML
    };

    if(this.description.value===''){
      return;
    }

    this.http.post<any>('http://localhost:8080/clock/', req, {headers: new HttpHeaders({"Access-Control-Allow-Headers": "Content-Type"})}).subscribe({
      next: data => {
        this.errMsg = "";
        console.log(req.isEdited);
        this.description.setValue("");
        this.getActivities();

        /// populate a label to inform the user that they successfully clocked out, maybe with the time.
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });
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
