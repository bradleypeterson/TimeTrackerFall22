import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-manage-evals',
  templateUrl: './manage-evals.component.html',
  styleUrls: ['./manage-evals.component.css']
})
export class ManageEvalsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  public pageTitle = 'TimeTrackerV2 | Manage Evals'

}
