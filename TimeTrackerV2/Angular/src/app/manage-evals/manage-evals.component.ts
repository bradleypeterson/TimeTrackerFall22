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

interface CreateTemplateResponse {
  templateId: string | number;
}

type NewFormStep = 'name' | 'questions';

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
  newFormStep: NewFormStep = 'name';
  newFormQuestionCount = 0;

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
    if (!this.newTemplateName.trim()) {
      this.statusMessage = '';
      this.errorMessage = 'Evaluation form name is required.';
      return;
    }

    const newTemplate = { templateName: this.newTemplateName.trim() };
    this.http
      .post<CreateTemplateResponse>(
        `${environment.apiURL}/api/addTemplate/${this.evaluatorID}`,
        newTemplate
      )
      .subscribe(
        (data) => {
          this.selectedTemplateId = String(data.templateId);
          this.selectedTemplateName = newTemplate.templateName;
          this.selectedTemplateQuestions = [];
          this.initialQuestionsState = {};
          this.newFormQuestionCount = 0;
          this.newFormStep = 'questions';
          this.loadTemplates();
          this.errorMessage = '';
        },
        (error) => {
          this.statusMessage = '';
          this.errorMessage =
            error.error?.message || 'Unable to create the evaluation form. Please try again.';
          console.error('Error creating template:', error);
        }
      );
  }

  openNewFormWizard() {
    this.newTemplateName = '';
    this.newQuestionText = '';
    this.newQuestionType = '';
    this.newFormQuestionCount = 0;
    this.newFormStep = 'name';
    this.statusMessage = '';
    this.errorMessage = '';
    this.showModal = true;
  }

  cancelNewFormWizard() {
    this.showModal = false;
    this.errorMessage = '';
  }

  finishNewForm() {
    if (this.newFormQuestionCount === 0) {
      this.errorMessage = 'Add at least one question before saving the form.';
      return;
    }

    this.showModal = false;
    this.newTemplateName = '';
    this.newQuestionText = '';
    this.newQuestionType = '';
    this.newFormStep = 'name';
    this.statusMessage =
      'Evaluation form saved. Open an active course and choose Assign Evals to assign it to students.';
    this.errorMessage = '';
  }

  openRenameModal(template: EvalTemplate) {
    this.errorMessage = '';
    this.templateToRename = template;
    this.renameTemplateName = template.templateName;
    this.showRenameModal = true;
  }

  renameTemplate() {
    if (!this.templateToRename || !this.renameTemplateName.trim()) {
      this.statusMessage = '';
      this.errorMessage = 'Evaluation form name is required.';
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
          this.errorMessage = '';
          this.showRenameModal = false;
          this.templateToRename = null;
          this.renameTemplateName = '';
        },
        (error) => {
          this.statusMessage = '';
          this.errorMessage =
            error.error?.message || 'Unable to rename the evaluation form.';
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

    const questionText = this.newQuestionText.trim();
    if (!questionText || !this.newQuestionType) {
      this.errorMessage = 'Both question text and type are required.';
      return;
    }

    const payload = {
      questionText,
      questionType: this.newQuestionType,
      templateID: this.selectedTemplateId,
    };

    this.http.post(`${environment.apiURL}/api/AddQuestion`, payload).subscribe(
      () => {
        this.reloadQuestions();
        this.showQuestionModal = false;
        this.newQuestionText = '';
        this.newQuestionType = '';
        if (this.newFormStep === 'questions') {
          this.newFormQuestionCount++;
          this.statusMessage =
            'Question added. Add another question or save the form.';
        } else {
          this.statusMessage = '1 question added successfully.';
        }
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
