import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-changepassword',
  templateUrl: './changepassword.component.html',
  styleUrls: ['./changepassword.component.css']
})

export class ChangePasswordComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  public pageTitle = 'TimeTrackerV2 | Change Password'

}
