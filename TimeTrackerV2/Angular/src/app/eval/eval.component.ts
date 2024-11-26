import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormBuilder } from '@angular/forms';

interface Question {
  questionText: string;
  questionType: string;
  questionID: string;
  response: string | number;
  projectName: string;
  evaluatorID: number;
}

interface QuestionGroup {
  // courseName: string;
  projectName: string;
  questions: Question[];
}

@Component({
  selector: 'app-evals',
  templateUrl: './eval.component.html',
  styleUrls: ['./eval.component.css']
})

export class EvalComponent implements OnInit {
  selectedTemplateQuestions: Question[] = [];
  evalForm: FormGroup;
  currentUser: any;
  evaluateeID: any;
  forms: FormGroup[] = [];
  userName: string | undefined;
  // courseName: string | undefined;
  projectName = "place holder"; // assign actual project name
  // projectName: string | undefined;
  questionGroups: QuestionGroup[] = [];

  constructor(private http: HttpClient, private formBuilder: FormBuilder) {
    this.evalForm = this.formBuilder.group({});
  }

  ngOnInit() {
    this.getCurrentUser();
    this.fetchEval();
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


  fetchEval() {
    this.http.get<any[]>(`https://localhost:8080/api/getAssignedEvals/${this.evaluateeID}`).subscribe(
      response => {
        console.log("Response received:", response);

        let evalIDs: any[] = [];

        if (response.length > 0) {
            // for (let i = 0; i < response.length; i++) {
            //     for (let j = 0; j < evalIDs.length; j++) {
            //       if (response[i].evaluatorID === evalIDs[j]) {
            //         console.log("j val: " + j);
            //         console.log("After the second for, in the if statement: " + evalIDs.length);
            //         console.log("EvalIDs content: " + evalIDs);
            //         console.log("Response evaluatorID: " + response[i].evaluatorID);
            //         push = false;
            //       }
            //     }
            //     if (push === true) evalIDs.push(response[i].evaluatorID);
            // }

        
            response.forEach(function (question) {
                if (!evalIDs.includes(question.evaluatorID)) {
                    evalIDs.push(question.evaluatorID);
                }
                console.log(evalIDs);
            });



          if (response[0] instanceof Array) {
            // Response is a 2-D array of QuestionGroup
            this.questionGroups = response.map((group: Question[]) => ({
              projectName: group[0]?.projectName || 'Default Project',
              questions: group,
              evalIDs: evalIDs
            }));
          } else {
            // Response is a 1-D array of Question, wrap it in a single QuestionGroup
            this.questionGroups = [{
              projectName: response[0]?.projectName || 'Default Project',
              questions: response,
            }];
          }
        } else {
          this.questionGroups = [];
        }

        this.forms = this.questionGroups.map(group => this.createFormGroupForGroup(group.questions));
      },
      error => console.error('Error fetching questions:', error)
    );
  }

  private createFormGroupForGroup(questions: Question[]): FormGroup {
    const group: any = {};
    questions.forEach(question => {
      group['response-' + question.questionID] = [''];
    });
    return this.formBuilder.group(group);
  }

  onSubmit(form: FormGroup) {
    if (!form.valid) {
      alert('Please fill out the form correctly.');
      return;
    }

    const responses = form.value;
    console.log('responses:', responses);
    const apiUrl = 'https://localhost:8080/api/submitResponses'; // Replace with the actual API endpoint

    this.http.post(apiUrl, responses).subscribe(
      () => {
        // alert('Responses submitted successfully!');
      },
      error => {
        alert('Error submitting responses!');
        console.error('Error:', error);
      }
    );
  }


}
