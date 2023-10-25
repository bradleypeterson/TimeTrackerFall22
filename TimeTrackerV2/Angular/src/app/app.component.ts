import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  userType!: string;
  instructor: boolean = false;
  student: boolean = false;
  admin: boolean = false;
  nullType: boolean = false;
  name: string = '';
  userID: string = '';


  ngOnInit(): void {
    let currentUser = localStorage.getItem('currentUser');
    var userDate = currentUser ? JSON.parse(currentUser) : null;
    this.userType = userDate.type;
    this.userID = userDate.userID;
    if (this.userType === 'admin') {
      this.admin = true;
      this.name = userDate.firstName + ' ' + userDate.lastName;
    }
    else if (this.userType === 'instructor') {
      this.instructor = true;
      this.name = userDate.firstName + ' ' + userDate.lastName;
    } else if (this.userType === 'student') {
      this.student = true;
      this.name = userDate.firstName + ' ' + userDate.lastName;
    } else {
      this.nullType = true;
    }
    // console.log(this.userType);
  }
  title = 'TimeTrackerV2';
}
