import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

interface CourseEvaluation {
  assignedEvalID: number;
  studentName: string;
  projectName: string;
  templateName: string;
  evalCompleted: number;
}

@Component({
    selector: 'app-view-evals',
    templateUrl: './view-evals.component.html',
    styleUrls: ['./view-evals.component.css'],
    standalone: false
})
export class ViewEvalsComponent implements OnInit {
  public evaluations: CourseEvaluation[] = [];
  public courseID: number | undefined;
  public errorMessage = '';
  private currentUser: any;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    const currentUserData = localStorage.getItem('currentUser');
    if (currentUserData) {
      this.currentUser = JSON.parse(currentUserData);
    }
    this.courseID = this.router.getCurrentNavigation()?.extras.state?.courseID;
  }

  ngOnInit(): void {
    if (!this.courseID) {
      this.errorMessage = 'No course was selected.';
      return;
    }

    this.loadEvaluations();
  }

  public pageTitle = 'TimeTrackerV2 | View Evals';

  loadEvaluations(): void {
    this.http
      .get<CourseEvaluation[]>(
        `${environment.apiURL}/api/courseEvaluations/${this.courseID}/${this.currentUser.userID}`
      )
      .subscribe({
        next: (data) => {
          this.evaluations = data;
          this.errorMessage = '';
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Unable to load evaluations.';
        },
      });
  }

  viewEvaluation(assignedEvalID: number): void {
    this.router.navigate(['/view-eval'], {
      state: { assignedEvalID, courseID: this.courseID },
    });
  }

  backToCourse(): void {
    this.router.navigate(['/course'], { state: { courseID: this.courseID } });
  }

}
