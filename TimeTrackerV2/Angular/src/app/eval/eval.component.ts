import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-evals',
  templateUrl: './eval.component.html',
  styleUrls: ['./eval.component.css']
})

export class EvalComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  public pageTitle = 'TimeTrackerV2 | Eval'

}
