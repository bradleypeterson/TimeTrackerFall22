import { TotalTimePipe } from './../pipes/total-time.pipe';
import { ViewEvalComponent } from './../view-eval/view-eval.component';
import { Component, Directive, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
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
  public project: any;
  public projectUsers: any;
  public totalTimeMap: Map<string, number> = new Map<string, number>();
  private projectId;
  

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
    private activatedRoute: ActivatedRoute,
  ) {
    const tempUser = localStorage.getItem('currentUser');
    if (!tempUser){
      this.router.navigate(["/Login"]);
      return;
    }
    this.currentUser = JSON.parse(tempUser);
    console.log(this.currentUser);
    this.projectId = this.activatedRoute.snapshot.params["id"];
    console.log("The current project is: " + this.projectId);
    if(this.projectId) {
      let tempProjects = localStorage.getItem('projects');
      if(tempProjects){
        const projects = JSON.parse(tempProjects);
        console.log(projects);
        for(let project of projects){
          console.log(project);
          console.log(this.projectId);
          console.log(project.projectID);
          if(Number(project.projectID) === Number(this.projectId)){
            console.log(project);
            this.project = project;
            this.loadProjectUsers();
          }
        }
      }
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
  
  calculateTotalTime(): void{
    this.totalTimeMap = new Map<string, number>();
    for(let teamMate of this.projectUsers){
      const fullName = `${teamMate.firstName} ${teamMate.lastName}`;
      if(!teamMate.timeIn){
        this.totalTimeMap.set(fullName, 0);
        continue;
      }
      if(this.totalTimeMap.has(fullName)){
        const timeDifference = teamMate.timeOut - teamMate.timeIn;
        this.totalTimeMap.set(fullName, timeDifference + this.totalTimeMap.get(fullName)!);
      }
      else{
        const timeDifference = teamMate.timeOut - teamMate.timeIn;
        this.totalTimeMap.set(fullName, timeDifference);
      }
    }
  }

  loadProjectUsers(): void{
    this.http.get<any>(`http://localhost:8080/Projects/${this.projectId}/Users/`, {headers: new HttpHeaders({"Access-Control-Allow-Headers": "Content-Type"})}).subscribe({
      next: data => {
        this.errMsg = "";
        console.log(data);
        this.projectUsers=data;
        this.calculateTotalTime();
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });
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
        this.loadProjectUsers();

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
