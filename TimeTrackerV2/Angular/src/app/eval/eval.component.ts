import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormBuilder } from '@angular/forms';

interface Question {
  questionText: string;
  questionType: string;
  questionID: string;
  response: string | number;
}

interface QuestionGroup {
  courseName: string;
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
  courseName = "place holder"; // assign actual course name
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

  // fetchEval() {
  //   this.currentUser = 1; // Delete this line
  //   this.http.get<Question[]>(`https://localhost:8080/api/questions/${this.currentUser}`).subscribe(
  //     data => {
  //       this.selectedTemplateQuestions = data;
  //       this.setupForm();
  //     },
  //     error => console.error('Error fetching questions:', error)
  //   );
  // }

  fetchEval() {
    this.currentUser = 1; // Delete this line
    this.http.get<Question[] | QuestionGroup[]>(`https://localhost:8080/api/getAssignedEvals/${this.evaluateeID}`).subscribe(
      response => {
        console.log("Response received:", response);


        if (response.length > 0 && 'questions' in response[0]) {
          // Response is an array of QuestionGroup
          this.questionGroups = response as QuestionGroup[];
        } else {
          // Response is an array of Question, wrap it in a single QuestionGroup
          this.questionGroups = [{
            courseName: this.courseName,
            projectName: this.projectName,
            questions: response as Question[]
          }];
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
