import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-admin-evals',
  templateUrl: './admin-evals.component.html',
  styleUrls: ['./admin-evals.component.css']
})

export class AdminEvalsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }



  public pageTitle = 'TimeTrackerV2 | Admin Evals'

}
