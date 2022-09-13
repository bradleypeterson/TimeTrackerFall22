import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-view-evals',
  templateUrl: './view-evals.component.html',
  styleUrls: ['./view-evals.component.css']
})
export class ViewEvalsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  public pageTitle = 'TimeTrackerV2 | View Evals'

}
