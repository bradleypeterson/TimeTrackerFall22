import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

interface Question{
  questionID: number;
  questionText: string;
  questionType: string;
  templateID: number;
  evaluatorID: number
}

@Component({
    selector: 'app-evals', templateUrl: './eval.component.html',
    styleUrls: ['./eval.component.css'],
    standalone: false
})

export class EvalComponent implements OnInit {
  eval: Question[] = [];
  evalForm: FormGroup;
  evalID : number = 0;
  public projectID: number;
  currentUser: any;
  evaluateeID: any;
  userName: string | undefined;
  // courseName: string | undefined;
  projectName: string | undefined;
  numQuestions: number = 0;

  constructor(private http: HttpClient, private formBuilder: FormBuilder, private router: Router,) {
    this.evalForm = this.formBuilder.group({});

    //console.log(`State received: ${JSON.stringify(this.router.getCurrentNavigation()?.extras.state)}`);
    this.projectID = this.router.getCurrentNavigation()?.extras.state?.projectID;
  }

  ngOnInit() {
    this.getCurrentUser();
    this.fetchEval(this.projectID);
    // this.evalForm = this.formBuilder.group({});
  }

  public pageTitle = 'TimeTrackerV2 | Eval'

  private getCurrentUser() {
    const currentUserData = localStorage.getItem('currentUser');
    if (currentUserData) {
      this.currentUser = JSON.parse(currentUserData);
      this.userName = this.currentUser.firstName + " " + this.currentUser.lastName;
      this.evaluateeID = this.currentUser.userID;

      console.log('Current UserID:', this.evaluateeID);
    } else {
      console.log('No current user found in local storage.');
    }
  }

  sortEval(data: any) {
    this.numQuestions = data.length;
    const formControls: { [key: string]: FormControl } = {};

    this.projectName = data[0].projectName;
    this.evalID = data[0].evalID;
    this.eval = data.map((question: Question) => {
      // Use question IDs so these controls match the HTML fields
      formControls['response_' + question.questionID] = new FormControl('');
      return question;
    });
    this.evalForm = new FormGroup(formControls);
  }

  fetchEval(projectID: number) {
    this.http
    .get(
      `${environment.apiURL}/api/getAssignedEvals/${this.evaluateeID}/${this.projectID}`,
      {
        headers: new HttpHeaders({
          'Access-Control-Allow-Headers': 'Content-Type',
        }),
      }
    )
    .subscribe({
      next: (data) => {
        if (data && Object.keys(data).length === 0) {
          // if there is not data go home
          this.router.navigate(['/dashboard']);
        } else {
          // Sort data if there is an eval
          this.sortEval(data);
        }
      },
      error: (err) => {
        // Show a helpful message when the server provides no details
        this.ShowMessage(err.error?.message || 'Unable to load this evaluation.');
      },
    });
  }

  evalCompleted(){
    let completed = {
      evalID: this.evalID
    }

    this.http.post<any>(`${environment.apiURL}/api/evalCompleted`, completed, {
      headers: new HttpHeaders({
        'Access-Control-Allow-Headers': 'Content-Type',
      }),
    })
    .subscribe({
      next: (data) => {
        console.log('Evaluation completed:', data);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        // Show a helpful message when the server provides no details
        this.ShowMessage(err.error?.message || 'Unable to complete the evaluation.');
      },
    });
  }

  async SubmitResponses() {
    // Do not save the evaluation until every question has an answer
    const unansweredQuestions = this.eval
      .map((question, index) => ({
        question,
        index,
        value: this.evalForm.get('response_' + question.questionID)?.value,
      }))
      .filter((entry) => entry.value === null || entry.value === '');

    if (unansweredQuestions.length > 0) {
      alert(`Please answer question${unansweredQuestions.length === 1 ? '' : 's'} ${unansweredQuestions.map((entry) => entry.index + 1).join(', ')}.`);
      return;
    }

    try {
      // Save every response before marking the evaluation as complete
      for (const question of this.eval) {
        const value = this.evalForm.get('response_' + question.questionID)?.value;
        await this.http.post<any>(`${environment.apiURL}/api/submitResponses`, {
          evalID: this.evalID,
          userID: this.currentUser.userID,
          questionID: question.questionID,
          rating: question.questionType === '1-5 Rating' ? Number(value) : null,
          response: question.questionType === 'Text Response' ? value : null,
        }).toPromise();
      }
      this.evalCompleted();
    } catch (err: any) {
      this.ShowMessage(err.error?.message || 'Unable to save the evaluation responses.');
    }
  }

  ShowMessage(message: string) {
    alert(message);
  }
}
