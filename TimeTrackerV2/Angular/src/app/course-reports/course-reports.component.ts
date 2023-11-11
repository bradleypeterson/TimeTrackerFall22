import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

// Interfaces
// interface TimeLog {
//     date: Date;
//     hours: number;
// }

interface Project {
    id: number;
    name: string;
    totalTime: number;
}

// interface Course {
//     title: string;
//     projects: Project[];
// }

interface StudentReport {
    id: number;
    studentName: string;
    projects: Project[];
}

@Component({
  selector: 'app-course-reports',
  templateUrl: './course-reports.component.html',
  styleUrls: ['./course-reports.component.css']
})
export class CourseReportsComponent implements OnInit {
    studentReports: StudentReport[] = [];
    expandedCards: { [cardID: number]: boolean } = {};

    courseID: number;

    public filteredStudents: any = [];
    public studentSearchQuery: any = '';

    constructor(
        private http: HttpClient,
        private route: ActivatedRoute,
        private router: Router
    ) {
        // The below line of code will grab the section of the URL that is ":id" and store it into the variable courseID.  Where I found this code https://stackoverflow.com/questions/44864303/send-data-through-routing-paths-in-angular
        // The '!' at the end is the "non-null assertion operator", this tell the TypeScript compiler that a value is not null or undefined, even if its type suggests that it might be
        // this.courseID = Number(this.route.snapshot.paramMap.get('id')!);
        
        // This will grab values from the state variable of the navigate function we defined while navigating to the page THAT MAKES USE OF THIS COMPONENT I.E. the course component.  This solution was found here https://stackoverflow.com/a/54365098
        this.courseID = this.router.getCurrentNavigation()?.extras.state?.courseID;
     }

    ngOnInit(): void {
        this.studentReports = this.getStudentReports(this.courseID);
    }

    // Method to toggle expanded state of student card
    toggleCard(cardID: number) {
        this.expandedCards[cardID] = !this.expandedCards[cardID];
        var cardArrow = document.getElementById(cardID.toString());
        // console.log(cardArrow);
        //make sure that the element fetched is not null before changing it's class name
        if (cardArrow === null) {
            alert('oops, there is no element with the ID of ' + cardID);
        }
        else {
            // since you've done the nullable check
            // TS won't complain from this point on
            // if they are expanding the card, change the image's class to be collapsedArrow, otherwise change it to expandedArrow
            this.expandedCards[cardID] ? cardArrow.className = "collapseArrow" : cardArrow.className = "expandArrow";
        }
    }

    // Grab a list of students registered for the course and the totalTimes for their projects
    getStudentReports(courseID: number): StudentReport[] {
        let returnData: StudentReport[] = []

        this.http.get(`https://localhost:8080/api/Course/${courseID}/GetReportsData`).subscribe((data: any) => {
            // console.log("Data returned\n" + JSON.stringify(data));

            // for every entry in data
            data.forEach((entry: any) => {
                // console.log("Processing the data:\n" + JSON.stringify(entry));
                var toBeAdded: StudentReport = {
                    id: entry.userID,
                    studentName: entry.studentName,
                    projects: [],  // See about using map here
                };

                // for every project in entry.projects
                entry.projects.forEach((project: any, index: number) => {
                    toBeAdded.projects.push({
                        id: project.projectID,
                        name: project.projectName,
                        totalTime: project.totalTime,
                    });
                });

                // after processing the data, add it to the array "returnData" and increment the value of cardID
                returnData.push(toBeAdded);
            });
        });

        return returnData;
    }

    SeeTimeLogs(studentID: number, projectID: number) {
        let state = {studentID: studentID, projectID: projectID, courseID: this.courseID};
        console.log(`Navigate to the detailed report in the component \"view-report\" with the the following states ${JSON.stringify(state)}`);
        // navigate to the component that is attached to the url inside the [] and pass some information to that page by using the code described here https://stackoverflow.com/a/54365098
        this.router.navigate(['/report'], { state });
    }

    searchStudents(): void {
        let sizeOfFilteredStudents = 0;
        if (this.studentSearchQuery == '') {
            this.filteredStudents = [];
        }
        else {
            sizeOfFilteredStudents = this.filteredStudents.length;
            this.filteredStudents.splice(0, sizeOfFilteredStudents-1);
            this.filteredStudents.splice(0, sizeOfFilteredStudents);
            for (let s of this.studentReports) {
                if (s.studentName.toLowerCase().search(this.studentSearchQuery.toLowerCase()) != -1) {
                    this.filteredStudents.push(s);
                }
                else {
                    sizeOfFilteredStudents = this.filteredStudents.length;
                    this.filteredStudents.splice(0, sizeOfFilteredStudents-1);
                }
            }
        }
        
    }
}