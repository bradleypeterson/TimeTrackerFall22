import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { formatDate } from '@angular/common';
// import { Stopwatch } from "ts-stopwatch";
import { AbstractControl, FormGroup, UntypedFormControl, ValidationErrors, ValidatorFn } from '@angular/forms';
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
    public projectID;
    public p: number = 1;

    public pieChartOptions: ChartOptions<'pie'> = {
        // responsive: false,
        plugins: {
            legend: {
                position: 'left'
            }
        }
    };
    public pieChartLabels: any = [];
    public pieChartDatasets: any = [{ data: [] }];
    public pieChartLegend = true;
    public pieChartPlugins = [];
    public punches = [];

    @ViewChild(BaseChartDirective) chart: BaseChartDirective;
    // Shared fields, this is because this will allow this field's value to be shared in both forms, so if you typed the description but you are in the wrong mode, you don't have to copy the description from the other form to another
    description = new UntypedFormControl('');
    // Forms
    // Auto time card form
    autoForm = new FormGroup({
        description: this.description
    });
    // Manual time card form
    manualForm = new FormGroup({
        timecardStart: new UntypedFormControl(''),
        timecardEnd: new UntypedFormControl(''),
        description: this.description
    }, {
        validators: [this.CreateDateRangeValidator()]
    });

    // This function is used to make sure that the starting date is always before the ending date.  Source https://blog.angular-university.io/angular-custom-validators/#:~:text=our%20previous%20article.-,Form%2Dlevel%20(multi%2Dfield)%20Validators,-Besides%20being%20able
    CreateDateRangeValidator(): ValidatorFn {
        // The AbstractControl replaces the FormGroup because apparently the above source uses a different typescript version than this project.  It seems to be caused by a bug in the TypeScript version.  Fix source https://stackoverflow.com/a/63306484
        return (form: AbstractControl): ValidationErrors | null => {
            // The '!' at the end is the "non-null assertion operator", this tell the TypeScript compiler that a value is not null or undefined, even if its type suggests that it might be
            const start: string = form.get("timecardStart")!.value;
            const end: string = form.get("timecardEnd")!.value;

            if (start && end) {
                const dateStart = new Date(start);
                const dateEnd = new Date(end);
                const isRangeValid = (dateEnd.getTime() - dateStart.getTime() > 0);

                return isRangeValid ? null : { dateRange: true };
            }

            return null;
        }
    }

    activities: any = [];

    manualTimeCardEntry: boolean = false;  // This will be overwritten in the constructor() method below

    date: Date = new Date();
    currDate = formatDate(this.date, 'MM/dd/yyyy', 'en-US');

    seconds: any = '0' + 0;
    minutes: any = '0' + 0;
    hours: any = '0' + 0;

    start: any;
    TimerRunning = false;
    totalTime: any = "00:00:00";

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
        if (tempUser) {
            this.currentUser = JSON.parse(tempUser);
            console.log(`The current user is:`);
            console.log(this.currentUser);
        }

        this.manualTimeCardEntry = JSON.parse(localStorage.getItem('manualTimeCardEntry') || 'false');  // Determine if the local storage has the value manualTimeCardEntry inside it so we know what state the form should be in.  If however the local storage doesn't have the value, it will return what is after the || for the default.

        //this.projectID = this.activatedRoute.snapshot.params["id"];
        // This will grab values from the state variable of the navigate function we defined while navigating to this page.  This solution was found here https://stackoverflow.com/a/54365098
        console.log(`State received: ${JSON.stringify(this.router.getCurrentNavigation()?.extras.state)}`);  // For debugging only
        this.projectID = this.router.getCurrentNavigation()?.extras.state?.projectID;
        
        console.log("The current project is: " + this.projectID);
        if (this.projectID) {
            // get user type
            var userType = this.currentUser.type;
            this.userID = this.currentUser.userID;
            if (userType === 'instructor') {
                this.instructor = true;
            } else if (userType === 'student') {
                this.student = true;
            }

            // let tempProjects = localStorage.getItem('projects');
            // if (tempProjects) {
            //     const projects = JSON.parse(tempProjects);
            //     console.log(`projects from local storage is`);
            //     console.log(projects);
            //     for (let project of projects) {
            //         console.log(`Processing the data for the project:\n` + JSON.stringify(project));
            //         console.log(`Contents of \"this.projectID\": ` + this.projectID);
            //         console.log(`Current project's ID is: ` + project.projectID);
            //         if (Number(project.projectID) === Number(this.projectID)) {
            //             console.log(`Found the project inside local storage:\n` + JSON.stringify(project));
            //             this.project = project;
            //             this.loadProjectUserTimes();
            //         }
            //     }
            // }
        }
    }

    getActivities(): void {
        this.http.get<any>(`https://localhost:8080/api/Users/${this.currentUser.userID}/${this.projectID}/activities/`, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
            next: data => {
                this.errMsg = "";
                console.log(`Data returned from API call for the function getActivites()\n` + JSON.stringify(data));
                function lastFive(el: any, index: any, data: any) {
                    return index >= data.length - 5;
                }
                this.activities = data.filter(lastFive).slice().reverse();
            },
            error: error => {
                this.errMsg = error['error']['message'];
            }
        });
    }

    ngOnInit(): void {
        this.getProjectInfo();

        this.loadProjectUserTimes();

        this.getActivities();

        // iterate through the projectUsers to check against current user ID
        this.loadProjectUsers();
    }

    getProjectInfo(): void {
        this.http.get<any>(`https://localhost:8080/api/ProjectInfo/${this.projectID}`, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
            next: data => {
                this.errMsg = "";
                this.project = data;
            },
            error: error => {
                this.errMsg = error['error']['message'];
            }
        });
    }

    clockIn(): void {
        if (!this.TimerRunning) {
            localStorage.setItem("timeIn", Date.now().toString());
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

        // You can use either of the below lines of code, they will achieve the same thing.  However, the second is easier to read.  Source https://stackoverflow.com/a/67288242
        // let filtered = new Map([...this.totalTimeMap.entries()].filter((item: any) => item[1] > 0 ));
        let filtered = new Map([...this.totalTimeMap.entries()].filter(([key, value]) => value > 0 ));

        if (filtered.size == 0) {
            this.pieChartLabels.push("No time cards created");
            this.pieChartDatasets[0]["data"].push(1);
        }
        else {
            filtered.forEach((value: number, key: string) => {
                this.pieChartLabels.push(key);
                this.pieChartDatasets[0]["data"].push(this.calculateGraphTime(value));
                if (this.chart && this.chart.chart) {
                    this.chart.chart.update();
                }
            });
        }
    }

    calculateGraphTime(value: number): number {
        // Minutes Conversion
        return Number((value / 1000 / 60).toFixed(2));
    }

    loadProjectUserTimes(): void {
        this.http.get<any>(`https://localhost:8080/api/Projects/${this.projectID}/Users/`, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
            next: data => {
                this.errMsg = "";
                console.log(`Data returned from API call for the function loadProjectUserTimes()\n` + JSON.stringify(data));
                this.projectUserTimes = data.reverse();
                this.calculateTotalTime();
                this.populateGraph();
            },
            error: error => {
                this.errMsg = error['error']['message'];
            }
        });
    }

    loadProjectUsers(): void {
        this.http.get<any>(`https://localhost:8080/api/AddToProject/${this.projectID}/InProject`, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
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

    changeSubmitType(): void {
        this.manualTimeCardEntry = !this.manualTimeCardEntry;
        localStorage.setItem('manualTimeCardEntry', JSON.stringify(this.manualTimeCardEntry));  // Save the new state for the local storage variable so when the user returns back to a project page, it loads the last used form used to submit a time card. 
    }

    autoSubmit(): void {
        // An extra check condition to prevent submission of the data unless for form is valid 
        if (!this.autoForm.valid) {
            return;
        }

        this.TimerRunning = true;
        this.stopTimer();

        let req = {
            isManualEntry: false,
            // the timeIn and timeOut is the number of milliseconds since midnight, January 1, 1970 UTC.
            timeIn: localStorage.getItem("timeIn"),
            timeOut: Date.now(), // pull date from the HTML
            isEdited: false,

            userID: this.currentUser.userID,
            projectID: this.projectID,
            description: this.autoForm.controls.description.value // pull the description field from the form
        };

        console.log(JSON.stringify(req));  // For debugging

        this.http.post<any>('https://localhost:8080/api/clock/', req, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
            next: data => {
                this.errMsg = "";
                console.log(`contents of \"req.isEdited\":` + req.isEdited);

                // Clear the input inside the form
                this.autoForm.controls.description.setValue("");  // you can also us the code "this.description.setValue("");" because the code currently being used references this variable.

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

    manualSubmit(): void {
        // An extra check condition to prevent submission of the data unless for form is valid 
        if (!this.manualForm.valid) {
            return;
        }

        let req = {
            isManualEntry: true,
            // We format the timeIn and timeOut like this so that it will return the number of milliseconds since midnight, January 1, 1970 UTC.  https://stackoverflow.com/questions/9756120/how-do-i-get-a-utc-timestamp-in-javascript#:~:text=new%20Date().getTime()%20is%20always%20UTC
            timeIn: new Date(this.manualForm.controls.timecardStart.value).getTime(),
            timeOut: new Date(this.manualForm.controls.timecardEnd.value).getTime(),
            isEdited: false,

            userID: this.currentUser.userID,
            projectID: this.projectID,
            description: this.manualForm.controls.description.value // pull the description field from the form
        };

        //console.log(JSON.stringify(req));  // For debugging

        this.http.post<any>('https://localhost:8080/api/clock/', req, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
            next: data => {
                this.errMsg = "";
                console.log(`contents of \"req.isEdited\":` + req.isEdited);

                // Clear the inputs inside the form
                this.manualForm.controls.timecardStart.setValue("");
                this.manualForm.controls.timecardEnd.setValue("");
                this.manualForm.controls.description.setValue("");  // You can also us the code "this.description.setValue("");" because the code currently being used references this variable.

                this.getActivities();
                this.loadProjectUserTimes();
                this.populateGraph();

                /// populate a label to inform the user that they successfully clocked out, maybe with the time.
            },
            error: error => {
                this.errMsg = error['error']['message'];
                alert(error.error.message);  // Alert the user to the message that the server sent back so they know they have reached their limit
            }
        });
    }

    createGroup(): void {
        let payload = {
            groupName: 'New Group',
            isActive: true,
        }
        console.log(`Payload is:` + payload);

        this.http.post<any>('https://localhost:8080/api/createGroup/', payload, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
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
        if (!this.TimerRunning) {
            this.TimerRunning = true;
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
        }
    }

    stopTimer(): void {
        clearInterval(this.start);
        this.TimerRunning = false;

        this.totalTime = this.hours.toString() + ":" + this.minutes.toString() + ":" + this.seconds.toString();

        this.hours = '0' + 0;
        this.minutes = '0' + 0;
        this.seconds = '0' + 0;
    }

    AddStudents() {
        let state = {projectID: this.projectID};
        // navigate to the component that is attached to the url inside the [] and pass some information to that page by using the code described here https://stackoverflow.com/a/54365098
        this.router.navigate(['/add-students-project'], { state });    
    }

    Edit() {
        let state = {projectID: this.projectID};
        // navigate to the component that is attached to the url inside the [] and pass some information to that page by using the code described here https://stackoverflow.com/a/54365098
        this.router.navigate(['/edit-project'], { state });    
    }

    delete() {
        if(confirm("Are you sure you want to delete " + this.project.projectName + "?")){
            let req = {
                projectID: this.projectID
            };
            
            this.http.post<any>('https://localhost:8080/api/deleteProject/', req, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
                next: data => {
                    this.errMsg = "";

                    let state = {courseID: this.project.courseID};
                    // navigate to the component that is attached to the url inside the [] and pass some information to that page by using the code described here https://stackoverflow.com/a/54365098
                    // This method of navigating is special, the "replaceUrl" will make it will prevent the user from going back to this page when they delete the project.  This is documented here https://angular.io/api/router/NavigationBehaviorOptions
                    this.router.navigate(['/course'], { replaceUrl: true, state });
                },
                error: error => {
                    this.errMsg = error['error']['message'];
                }
            });
        }
    }

    GoBackToCourse() {
        let state = {courseID: this.project.courseID};
        // navigate to the component that is attached to the url inside the [] and pass some information to that page by using the code described here https://stackoverflow.com/a/54365098
        this.router.navigate(['/course'], { state });
    }

    deleteTimecard(timeslotID: number) {
        if(confirm("Are you sure you want to delete this time entry?")) {
            let req = {
                timeslotID: timeslotID
            };

            this.http.post<any>('https://localhost:8080/api/deleteTimeCard/', req, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
                next: data => {
                    this.errMsg = "";
                    window.location.reload();
                },
                error: error => {
                    this.errMsg = error['error']['message'];
                }
            });
        }
    }

    editTimeCard(projectID: number, timeslotID: number, firstName: any, lastName: any) {
        let state = {projectID: projectID, timeslotID: timeslotID, firstName: firstName, lastName: lastName};
        // navigate to the component that is attached to the url inside the [] and pass some information to that page by using the code described here https://stackoverflow.com/a/54365098
        this.router.navigate([`/edit-timecard`], { state });
    }
}
