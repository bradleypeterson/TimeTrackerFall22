// manage-evals.compnents.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { environment } from '../../environments/environment';

interface EvalTemplate {
  templateID: string;
  templateName: string;
  isArchived: boolean;
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
  selectedTemplateName = '';
  newTemplateName: string = '';
  renameTemplateName: string = '';
  templateToRename: EvalTemplate | null = null;
  showQuestionModal = false;
  showRenameModal = false;
  newQuestionText = '';
  newQuestionType = '';
  initialQuestionsState: Record<string, Question> = {};
  currentUser: any;
  evaluatorID: string = '';
  saveSuccessful: boolean = false;
  statusMessage = '';
  errorMessage = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getCurrentUser();
    this.loadTemplates();
    // this.loadDefaultTemplate();
    this.LoadQuestionTypes();
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
        + '?includeArchived=true'
      )
      .subscribe(
        (data) => {
          this.templates = data;
          console.log('Fetched Templates:', data);
        },
        (error) => {
          this.errorMessage = error.error?.message || 'Unable to load evaluation forms.';
          console.error('Error fetching templates:', error);
        }
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
        (error) => {
          this.errorMessage = error.error?.message || 'Unable to load question types.';
          console.error('Error fetching question types:', error);
        }
      );
  }

  selectTemplate(template: EvalTemplate) {
    this.selectedTemplateId = template.templateID;
    this.selectedTemplateName = template.templateName;
    this.statusMessage = '';
    this.errorMessage = '';

    this.http
      .get<Question[]>(`${environment.apiURL}/api/questions/${template.templateID}`)
      .subscribe(
        (data) => {
          this.selectedTemplateQuestions = data;
          // Store initial state
          this.storeInitialState(data);
          console.log('Fetched Questions:', data);
        },
        (error) => {
          this.errorMessage = error.error?.message || 'Unable to load evaluation questions.';
          console.error('Error fetching questions:', error);
        }
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
          (error) => {
            this.errorMessage = error.error?.message || 'Unable to load evaluation questions.';
            console.error('Error fetching questions:', error);
          }
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
          this.loadTemplates();
          this.statusMessage = 'Evaluation form created.';
          this.newTemplateName = '';
          this.showModal = false;
        },
        (error) => {
          alert('Error creating template. Please try again.');
          console.error('Error creating template:', error);
        }
      );
  }

  openRenameModal(template: EvalTemplate) {
    this.templateToRename = template;
    this.renameTemplateName = template.templateName;
    this.showRenameModal = true;
  }

  renameTemplate() {
    if (!this.templateToRename || !this.renameTemplateName.trim()) {
      return;
    }

    this.http
      .put(
        `${environment.apiURL}/api/templates/${this.templateToRename.templateID}`,
        {
          evaluatorID: this.evaluatorID,
          templateName: this.renameTemplateName,
        }
      )
      .subscribe(
        () => {
          this.loadTemplates();
          this.statusMessage = 'Evaluation form renamed.';
          this.showRenameModal = false;
          this.templateToRename = null;
          this.renameTemplateName = '';
        },
        (error) => {
          alert(error.error?.message || 'Unable to rename the evaluation form.');
        }
      );
  }

  archiveTemplate(template: EvalTemplate) {
      if (!confirm(`Archive "${template.templateName}"? It will remain available for history but cannot be assigned again.`)) {
        return;
      }

      this.http
        .post(
          `${environment.apiURL}/api/templates/${template.templateID}/archive`,
          { evaluatorID: this.evaluatorID }
        )
        .subscribe(
          () => {
            if (this.selectedTemplateId === template.templateID) {
              this.selectedTemplateId = null;
              this.selectedTemplateName = '';
              this.selectedTemplateQuestions = [];
            }
            this.loadTemplates();
            this.statusMessage = 'Evaluation form archived.';
          },
          (error) => {
            alert(error.error?.message || 'Unable to archive the evaluation form.');
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
        this.reloadQuestions();
        this.showQuestionModal = false;
        this.newQuestionText = '';
        this.newQuestionType = '';
        this.statusMessage = '1 question added successfully.';
        this.errorMessage = '';
      },
      (error) => {
        this.errorMessage = error.error?.message || 'Unable to add the question. Please try again.';
        this.statusMessage = '';
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
          this.reloadQuestions();
          this.statusMessage = '1 question deleted successfully.';
          this.errorMessage = '';
        },
        (error) => {
          this.errorMessage = error.error?.message || 'Unable to delete the question. Please try again.';
          this.statusMessage = '';
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
      this.statusMessage = 'There are no question changes to save.';
      this.errorMessage = '';
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
        this.statusMessage = 'Question changes saved successfully.';
        this.errorMessage = '';
        this.saveSuccessful = true; // Show success message
        setTimeout(() => {
          this.saveSuccessful = false;
        }, 3000);
      },
      (error) => {
        this.errorMessage = error.error?.message || 'Unable to save question changes. Please try again.';
        this.statusMessage = '';
        console.error('Error updating questions:', error);
      }
    );
  }
}
