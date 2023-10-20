import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { formatDate } from '@angular/common';
// import { Stopwatch } from "ts-stopwatch";
import { UntypedFormControl } from '@angular/forms';
import { ChartOptions } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';


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
  public projectUserTimes: any;
  public totalTimeMap: Map<string, number> = new Map<string, number>();
  private projectId;

  public pieChartOptions: ChartOptions<'pie'> = {
    responsive: false,
  };
  public pieChartLabels: any = [];
  public pieChartDatasets: any = [{ data: [] }];
  public pieChartLegend = true;
  public pieChartPlugins = [];
  public punches = [];

  @ViewChild(BaseChartDirective) chart: BaseChartDirective;

  description = new UntypedFormControl('');
  activities: any = [];

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

  instructor: boolean = false;
  student: boolean = false;
  userID: string = '';
  isProjectUser: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    this.chart = null!;
    const tempUser = localStorage.getItem('currentUser');
    if (!tempUser) {
      this.router.navigate(["/Login"]);
      return;
    }
    this.currentUser = JSON.parse(tempUser);
    console.log(`The current user is:`);
    console.log(this.currentUser)
    this.projectId = this.activatedRoute.snapshot.params["id"];
    console.log("The current project is: " + this.projectId);
    if (this.projectId) {
      // get user type
      let currentUser = localStorage.getItem('currentUser');
      var userDate = currentUser ? JSON.parse(currentUser) : null;
      var userType = userDate.type;
      this.userID = userDate.userID;
      if (userType === 'instructor') {
        this.instructor = true;
      } else if (userType === 'student') {
        this.student = true;
      }

      let tempProjects = localStorage.getItem('projects');
      if (tempProjects) {
        const projects = JSON.parse(tempProjects);
        console.log(`projects from local storage is`);
        console.log(projects);
        for (let project of projects) {
          console.log(`Processing the data for the project:\n` + JSON.stringify(project));
          console.log(`Contents of \"this.projectId\": ` + this.projectId);
          console.log(`Current project's ID is: ` + project.projectID);
          if (Number(project.projectID) === Number(this.projectId)) {
            console.log(`Found the project inside local storage:\n` + JSON.stringify(project));
            this.project = project;
            this.loadProjectUserTimes();
          }
        }
      }
    }
  }

  getActivities(): void {
    this.http.get<any>(`http://localhost:8080/api/Users/${this.currentUser.userID}/${this.projectId}/activities/`, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
      next: data => {
        this.errMsg = "";
        console.log(`Data returned from API call for the function getActivites()\n` + JSON.stringify(data));
        this.activities = data;
        /// populate a label to inform the user that they successfully clocked out, maybe with the time.
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });
  }

  ngOnInit(): void {
    this.getActivities();

    // iterate through the projectUsers to check against current user ID
    this.loadProjectUsers();
  }

  clockIn(): void {
    if (!this.isTimerRunning) {
      localStorage.setItem("timeIn", Date.now().toString());

      this.startClickedLast = true;
      this.startTimer();
    }
  }

  calculateTotalTime(): void {
    this.totalTimeMap = new Map<string, number>();
    for (let teamMate of this.projectUserTimes) {
      const fullName = `${teamMate.firstName} ${teamMate.lastName}`;
      if (!teamMate.timeIn) {
        this.totalTimeMap.set(fullName, 0);
        continue;
      }
      if (this.totalTimeMap.has(fullName)) {
        const timeDifference = teamMate.timeOut - teamMate.timeIn;
        this.totalTimeMap.set(fullName, timeDifference + this.totalTimeMap.get(fullName)!);
      }
      else {
        const timeDifference = teamMate.timeOut - teamMate.timeIn;
        this.totalTimeMap.set(fullName, timeDifference);
      }
    }
  }

  populateGraph(): void {
    this.pieChartDatasets = [{ data: [] }];
    this.pieChartLabels = [];
    if(this.totalTimeMap.size == 0) {
        this.pieChartLabels.push("No time cards created");
        this.pieChartDatasets[0]["data"].push(1);
    }
    this.totalTimeMap.forEach((value: number, key: string) => {
      this.pieChartLabels.push(key);
      this.pieChartDatasets[0]["data"].push(this.calculateGraphTime(value));
      if (this.chart && this.chart.chart) {
        this.chart.chart.update();
      }
    });
  }

  calculateGraphTime(value: number): number {
    // Minutes Conversion
    return Number((value / 1000 / 60).toFixed(2));
  }

  loadProjectUserTimes(): void {
    this.http.get<any>(`http://localhost:8080/api/Projects/${this.projectId}/Users/`, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
      next: data => {
        this.errMsg = "";
        console.log(`Data returned from API call for the function loadProjectUserTimes()\n` + JSON.stringify(data));
        this.projectUserTimes = data;
        this.calculateTotalTime();
        this.populateGraph();
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });
  }

  loadProjectUsers(): void {
    this.http.get<any>(`http://localhost:8080/api/AddToProject/${this.projectId}/InProject`, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
      next: data => {
        this.errMsg = "";
        console.log(`Data returned from API call for the function loadProjectUsers()\n` + JSON.stringify(data));
        this.projectUsers = data;
        for (let user of this.projectUsers) {
          if (Number(user.userID) === Number(this.userID)) {
            this.isProjectUser = true;
          }
        }
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });
  }

  submit(): void {
    this.startClickedLast = false;
    this.isTimerRunning = true;
    this.startTimer();
    let req = {
      timeIn: localStorage.getItem("timeIn"),
      timeOut: Date.now(), /// pull date from the HTML
      isEdited: false,

      userID: this.currentUser.userID,
      projectID: this.projectId,
      description: this.description.value /// pull description from the HTML
    };

    if (this.description.value === '') {
      return;
    }

    this.http.post<any>('http://localhost:8080/api/clock/', req, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
      next: data => {
        this.errMsg = "";
        console.log(`contents of \"req.isEdited\":` + req.isEdited);
        this.description.setValue("");
        this.getActivities();
        this.loadProjectUserTimes();
        this.populateGraph();

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
    console.log(`Payload is:` + payload);

    this.http.post<any>('http://localhost:8080/api/createGroup/', payload, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
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
    if (!this.isTimerRunning) {
      this.isTimerRunning = true;
      this.start = setInterval(() => {
        this.seconds++;
        this.seconds = this.seconds < 10 ? '0' + this.seconds : this.seconds;

        if (this.seconds === 60) {
          this.minutes++;
          this.minutes = this.minutes < 10 ? '0' + this.minutes : this.minutes;
          this.seconds = '0' + 0;
        }

        if (this.minutes === 60) {
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
