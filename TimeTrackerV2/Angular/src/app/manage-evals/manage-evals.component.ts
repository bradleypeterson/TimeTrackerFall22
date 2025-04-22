// manage-evals.compnents.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { environment } from '../../environments/environment';

interface EvalTemplate {
  templateID: string;
  templateName: string;
}

interface Question {
  questionText: string;
  questionType: string;
  questionID: string;
  response: string | number;
}

interface UpdateQuestionPayload {
  questionText?: string;
  questionType?: string;
}

@Component({
    selector: 'app-manage-evals',
    templateUrl: './manage-evals.component.html',
    styleUrls: ['./manage-evals.component.css'],
    standalone: false
})
export class ManageEvalsComponent implements OnInit {
  showModal: boolean = false;
  questionTypes: string[] = [];
  templates: EvalTemplate[] = [];
  selectedTemplateQuestions: Question[] = [];
  selectedTemplateId: string | null = null;
  newTemplateName: string = '';
  showQuestionModal = false;
  newQuestionText = '';
  newQuestionType = '';
  defaultTemplateId = '1';
  initialQuestionsState: Record<string, Question> = {};
  currentUser: any;
  evaluatorID: string = '';
  saveSuccessful: boolean = false;
  isEvalSelected: boolean = false;
  isFormChanged: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getCurrentUser();
    this.loadTemplates();
    // this.loadDefaultTemplate();
    this.LoadQuestionTypes();
  }

  onEvalSelected() {
    this.isEvalSelected = true;
  }

  onEvalDeselected() {
    this.isEvalSelected = false;
  }

  private getCurrentUser() {
    const currentUserData = localStorage.getItem('currentUser');
    if (currentUserData) {
      this.currentUser = JSON.parse(currentUserData);
      this.evaluatorID = this.currentUser.userID;
      console.log('Current UserID:', this.evaluatorID);
    } else {
      console.log('No current user found in local storage.');
    }
  }

  loadTemplates() {
    this.http
      .get<EvalTemplate[]>(
        `${environment.apiURL}/api/templates/${this.evaluatorID}`
      )
      .subscribe(
        (data) => {
          this.templates = data;
          console.log('Fetched Templates:', data);
        },
        (error) => console.error('Error fetching templates:', error)
      );
  }

  LoadQuestionTypes() {
    this.http
      .get<string[]>(`${environment.apiURL}/api/questionTypes`)
      .subscribe(
        (data) => {
          this.questionTypes = data;
          console.log('Fetched question types:', data);
        },
        (error) => console.error('Error fetching question types:', error)
      );
  }

  onTemplateSelect(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const templateId = selectElement.value;
    this.selectedTemplateId = templateId;

    this.http
      .get<Question[]>(`${environment.apiURL}/api/questions/${templateId}`)
      .subscribe(
        (data) => {
          this.selectedTemplateQuestions = data;
          // Store initial state
          this.storeInitialState(data);
          console.log('Fetched Questions:', data);
        },
        (error) => console.error('Error fetching questions:', error)
      );
  }

  storeInitialState(questions: Question[]) {
    this.initialQuestionsState = {};
    questions.forEach((question) => {
      this.initialQuestionsState[question.questionID] = { ...question };
    });
  }
  reloadQuestions() {
    if (this.selectedTemplateId) {
      this.http
        .get<Question[]>(
          `${environment.apiURL}/api/questions/${this.selectedTemplateId}`
        )
        .subscribe(
          (data) => {
            this.selectedTemplateQuestions = data;
            console.log('Fetched Questions:', data);
          },
          (error) => console.error('Error fetching questions:', error)
        );
    }
  }

  createTemplate() {
    if (!this.newTemplateName) {
      alert('Please enter a template name.');
      return;
    }

    const newTemplate = { templateName: this.newTemplateName };
    console.error('evaluatorID:', this.evaluatorID);
    this.http
      .post(
        `${environment.apiURL}/api/addTemplate/${this.evaluatorID}`,
        newTemplate
      )
      .subscribe(
        () => {
          // alert('Template created successfully!');
          this.loadTemplates(); // Reload templates to include the new one
          this.showModal = false;
        },
        (error) => {
          alert('Error creating template. Please try again.');
          console.error('Error creating template:', error);
        }
      );
  }

  addQuestion() {
    if (!this.selectedTemplateId) {
      alert('Please select a template first.');
      return;
    }

    if (!this.newQuestionText || !this.newQuestionType) {
      alert('Both question text and type are required');
      return;
    }

    const payload = {
      questionText: this.newQuestionText,
      questionType: this.newQuestionType,
      templateID: this.selectedTemplateId,
    };

    this.http.post(`${environment.apiURL}/api/AddQuestion`, payload).subscribe(
      () => {
        // alert('Question added successfully!');
        this.reloadQuestions();
        this.showQuestionModal = false;
        this.newQuestionText = '';
        this.newQuestionType = '';
      },
      (error) => {
        alert('Error updating question!');
        console.error('Error adding question:', error);
      }
    );
  }

  deleteQuestion(questionID: string) {
    console.log('questionID', questionID);

    this.http
      .delete(`${environment.apiURL}/api/deleteQuestion/${questionID}`)
      .subscribe(
        () => {
          // alert('Question deleted successfully!');
          this.reloadQuestions();
        },
        (error) => {
          alert('Error creating deleting question. Please try again.');
          console.error('Error deleting question:', error);
        }
      );
  }

  submitAllUpdates() {
    const updates = this.selectedTemplateQuestions
      .map((question) => {
        const originalQuestion =
          this.initialQuestionsState[question.questionID];
        const payload: UpdateQuestionPayload = {
          questionText: question.questionText,
          questionType: question.questionType,
        };

        if (
          originalQuestion.questionText !== payload.questionText ||
          originalQuestion.questionType !== payload.questionType
        ) {
          return { id: question.questionID, payload };
        }
        return null;
      })
      .filter(Boolean);

    if (updates.length === 0) {
      console.error('No changes to submit');
      return;
    }
    const updateRequests = updates.map((update) =>
      this.http.put(
        `${environment.apiURL}/api/updateQuestion/${update?.id}`,
        update?.payload
      )
    );

    forkJoin(updateRequests).subscribe(
      () => {
        this.reloadQuestions();
        this.saveSuccessful = true; // Show success message
        setTimeout(() => {
          this.saveSuccessful = false;
        }, 3000);
      },
      (error) => {
        alert('Error updating questions. Please try again.');
        console.error('Error updating questions:', error);
      }
    );
  }
}
