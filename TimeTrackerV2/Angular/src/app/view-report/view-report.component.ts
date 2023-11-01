import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
    selector: 'app-view-report',
    templateUrl: './view-report.component.html',
    styleUrls: ['./view-report.component.css']
})
export class ViewReportComponent implements OnInit {
    public reportHeader: string = "";
    public timeTables: any;
    public errMsg = '';
    public cID: string = "";
    public studentName: string = ""
    public projectName: string = ""

    sID: string = "";
    pID: string = "";

    constructor(
        private http: HttpClient,
        private router: Router,
    ) {
        // This will grab the userID and projectID values from the state of the navigate function we defined inside the instructor-reports.ts component in the function SeeTimeLogs().  This solution was found here https://stackoverflow.com/a/54365098
        console.log(JSON.stringify(this.router.getCurrentNavigation()?.extras.state));
        this.sID = this.router.getCurrentNavigation()?.extras.state?.studentID;
        this.pID = this.router.getCurrentNavigation()?.extras.state?.projectID;
        this.cID = this.router.getCurrentNavigation()?.extras.state?.courseID;
    }

    ngOnInit(): void {
        this.GetUserInfo();
        this.GetProjectInfo();
        this.GetDetailedReport();
    }

    GetUserInfo(): void {
        console.log(`Grabbing the user's info that has the userID of \"${this.sID}\"`);

        this.http.get<any>(`https://localhost:8080/api/GetUserInfo/${this.sID}`, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
            next: data => {
                this.errMsg = "";
                this.studentName = `${data.firstName} ${data.lastName}`;
            },
            error: error => {
                this.errMsg = error['error']['message'];
            }
        });
    }

    GetProjectInfo(): void {
        console.log(`Grabbing the project's info that has the projectID of \"${this.pID}\"`);

        this.http.get<any>(`https://localhost:8080/api/ProjectInfo/${this.pID}`, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
            next: data => {
                this.errMsg = "";
                this.projectName = data.projectName;
            },
            error: error => {
                this.errMsg = error['error']['message'];
            }
        });
    }

    GetDetailedReport(): void {
        console.log(`Finding the reports for the user with the id of \"${this.sID}\" for the project with the id of \"${this.pID}\"`);

        this.http.get<any>(`https://localhost:8080/api/Users/${this.sID}/${this.pID}/activities/`, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
            next: data => {
                this.errMsg = "";
                this.timeTables = data;
            },
            error: error => {
                this.errMsg = error['error']['message'];
            }
        });
    }
}