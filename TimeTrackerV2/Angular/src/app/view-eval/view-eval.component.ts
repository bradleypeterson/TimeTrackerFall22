import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

interface EvaluationResponse {
  assignedEvalID: number;
  studentName: string;
  projectName: string;
  templateName: string;
  questionText: string;
  questionType: string;
  rating: number | null;
  response: string | null;
}

@Component({
    selector: 'app-view-eval',
    templateUrl: './view-eval.component.html',
    styleUrls: ['./view-eval.component.css'],
    standalone: false
})
export class ViewEvalComponent implements OnInit {
  public responses: EvaluationResponse[] = [];
  public errorMessage = '';
  public assignedEvalID: number | undefined;
  public courseID: number | undefined;
  private currentUser: any;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const currentUserData = localStorage.getItem('currentUser');
    if (currentUserData) {
      this.currentUser = JSON.parse(currentUserData);
    }
    const state = this.router.getCurrentNavigation()?.extras.state;
    this.assignedEvalID = state?.assignedEvalID;
    this.courseID = state?.courseID;
  }

  ngOnInit(): void {
    if (!this.assignedEvalID) {
      this.errorMessage = 'No submitted evaluation was selected.';
      return;
    }

    this.loadResponses();
  }

  public pageTitle = 'TimeTrackerV2 | View Eval';

  loadResponses(): void {
    this.http
      .get<EvaluationResponse[]>(
        `${environment.apiURL}/api/evaluationResponses/${this.assignedEvalID}/${this.currentUser.userID}`
      )
      .subscribe({
        next: (data) => {
          this.responses = data;
          this.errorMessage = '';
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Unable to load evaluation responses.';
        },
      });
  }

  backToEvaluations(): void {
    this.router.navigate(['/view-evals'], { state: { courseID: this.courseID } });
  }
}

