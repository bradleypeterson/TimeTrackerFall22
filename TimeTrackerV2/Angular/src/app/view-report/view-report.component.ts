import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-view-report',
    templateUrl: './view-report.component.html',
    styleUrls: ['./view-report.component.css']
})
export class ViewReportComponent implements OnInit {
    public reportHeader: string = "";
    public timeTables: any;
    public errMsg = '';

    uID: string = "";
    pID: string = "";

    constructor(
        private http: HttpClient,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {

        // The below line of code will grab the section of the URL that is ":uID" and ":pID" and store them into the respective variables.  Where I found this code https://stackoverflow.com/questions/44864303/send-data-through-routing-paths-in-angular.  This is temporary and will be replaced with this code as described here so we don't need to pass the parameters by the URL https://stackoverflow.com/a/54365098
        // The '!' at the end is the "non-null assertion operator", this tell the TypeScript compiler that a value is not null or undefined, even if its type suggests that it might be
        this.uID = this.route.snapshot.paramMap.get('uID')!;
        this.pID = this.route.snapshot.paramMap.get('pID')!;

        this.GetDetailedReport();
    }

    GetDetailedReport(): void {
        this.http.get<any>(`http://localhost:8080/api//Users/${this.uID}/${this.pID}/activities/`, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
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