import { Component, OnInit } from '@angular/core';

// Interfaces
interface TimeLog {
  date: Date;
  hours: number;
}

interface Project {
  name: string;
  timeLogs: TimeLog[];
}

interface Course {
  title: string;
  projects: Project[];
}

interface StudentReport {
  cardID: number;
  studentName: string;
  courses: Course[];
}

@Component({
  selector: 'app-instructor-reports',
  templateUrl: './instructor-reports.component.html',
  styleUrls: ['./instructor-reports.component.css']
})
export class InstructorReportsComponent implements OnInit {

  reports: StudentReport[] = [];
  expandedCards: { [cardID: number]: boolean } = {};

  ngOnInit(): void {
    this.reports = this.getStudentReportMock();
  }

  // Method to toggle expanded state of student card
  toggleCard(cardID: number) {
    this.expandedCards[cardID] = !this.expandedCards[cardID];
    var cardArrow = document.getElementById(cardID.toString());
    console.log(cardArrow);
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
  // Mock data to simulate an API call
  getStudentReportMock(): StudentReport[] {
    return [
      {
        cardID: 0,
        studentName: 'John Doe',
        courses: [
          {
            title: 'cs9999',
            projects: [
              {
                name: 'Project 1',
                timeLogs: [
                  { date: new Date(2023, 8, 1), hours: 5 },
                  { date: new Date(2023, 8, 2), hours: 3 }
                ]
              },
              {
                name: 'Project 2',
                timeLogs: [
                  { date: new Date(2023, 8, 3), hours: 4 }
                ]
              }
            ]
          },
          {
            title: 'CS 2222',
            projects: [
              {
                name: 'Project 2',
                timeLogs: [
                  { date: new Date(2023, 8, 5), hours: 2 }
                ]
              }
            ]
          }
        ]
      },
      {
        cardID: 1,
        studentName: 'Jane Smith',
        courses: [
          {
            title: 'CS 11111',
            projects: [
              {
                name: 'Project 1',
                timeLogs: [
                  { date: new Date(2023, 8, 1), hours: 3 },
                  { date: new Date(2023, 8, 5), hours: 5 }
                ]
              }
            ]
          }
        ]
      }
    ];
  }
}

