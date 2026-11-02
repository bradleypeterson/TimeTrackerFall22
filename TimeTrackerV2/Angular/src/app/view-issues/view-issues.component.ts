import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-view-issues',
  templateUrl: './view-issues.component.html',
  styleUrls: ['./view-issues.component.css']
})

export class ViewIssuesComponent implements OnInit {
    public errMsg = '';
    public unresolvedIssues: any = [];
    public resolvedIssues: any = [];

    public userID: string = '';
    public admin: boolean = false;

    public currentUser: any;
    date: Date = new Date();

    

    constructor(
        private http: HttpClient,
        private router: Router,
        private activatedRoute: ActivatedRoute,
    ) {
        const tempUser = localStorage.getItem('currentUser');
        if (tempUser) {
        this.currentUser = JSON.parse(tempUser);
        }
        // This will grab values from the state variable of the navigate function we defined while navigating to this page.  This solution was found here https://stackoverflow.com/a/54365098
        console.log(`State received: ${JSON.stringify(this.router.getCurrentNavigation()?.extras.state)}`);  // For debugging only
    }

    ngOnInit(): void {
        // get user type
        var userType = this.currentUser.type;
        this.userID = this.currentUser.userID;
        if (userType === 'admin') { this.admin = true; }

        this.loadPage();
    }

    loadPage(): void {

        // get projects
        this.loadUnresolvedIssues();
        this.loadResolvedIssues();
    }

    loadUnresolvedIssues(): void {
        this.http
        .get(`${environment.apiURL}/api/getUnresolvedIssues/`)
        .subscribe((data: any) => {
            this.unresolvedIssues = data;
        });
    }

    loadResolvedIssues(): void {
        this.http
        .get(`${environment.apiURL}/api/getResolvedIssues/`)
        .subscribe((data: any) => {
            this.resolvedIssues = data;
        });
    }

    MarkResolved(BugReportID: any) {
        this.date = new Date();
        let payload = {
            lastUpdateDate: this.date,
            bugReportID: BugReportID,
        };

        this.http.post<any>(`${environment.apiURL}/api/markIssueResolved/`, payload, {
        headers: new HttpHeaders({
            'Access-Control-Allow-Headers': 'Content-Type',
        }),
        })
        .subscribe({
        next: (data) => {
            this.errMsg = '';
            this.loadPage();
        },
        error: (error) => {
            this.errMsg = error['error']['message'];
        },
        });
    }

    MarkUnresolved(BugReportID: any) {
        this.date = new Date();
        let payload = {
            lastUpdateDate: this.date,
            bugReportID: BugReportID,
        };

        this.http.post<any>(`${environment.apiURL}/api/markIssueUnresolved/`, payload, {
        headers: new HttpHeaders({
            'Access-Control-Allow-Headers': 'Content-Type',
        }),
        })
        .subscribe({
        next: (data) => {
            this.errMsg = '';
            this.loadPage();
        },
        error: (error) => {
            this.errMsg = error['error']['message'];
        },
        });
    }
  
}
