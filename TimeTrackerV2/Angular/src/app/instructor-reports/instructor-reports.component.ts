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
  expandedCards: { [studentName: string]: boolean } = {};

  ngOnInit(): void {
    this.reports = this.getStudentReportMock();
  }

  // Method to toggle expanded state of student card
  toggleCard(studentName: string) {
    this.expandedCards[studentName] = !this.expandedCards[studentName];
  }
  // Mock data to simulate an API call
  getStudentReportMock(): StudentReport[] {
    return [
      {
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

