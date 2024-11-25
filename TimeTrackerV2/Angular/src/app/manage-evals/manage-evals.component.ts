// manage-evals.compnents.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin } from 'rxjs';

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

  // loadQuestionsForTemplate(templateId: string) {
  //   this.http.get<Question[]>(`https://localhost:8080/api/questions/${templateId}`).subscribe(
  //     data => {
  //       this.selectedTemplateQuestions = data;
  //       // Store initial state
  //       this.storeInitialState(data);
  //       console.log('Fetched Questions:', data);
  //     },
  //     error => console.error('Error fetching questions:', error)
  //   );
  // }

  // loadDefaultTemplate() {
  //   this.selectedTemplateId = this.defaultTemplateId;
  //   this.loadQuestionsForTemplate(this.defaultTemplateId);
  // }

  loadTemplates() {
    this.http
      .get<EvalTemplate[]>(
        `https://localhost:8080/api/templates/${this.evaluatorID}`
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
      .get<string[]>('https://localhost:8080/api/questionTypes')
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
      .get<Question[]>(`https://localhost:8080/api/questions/${templateId}`)
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
          `https://localhost:8080/api/questions/${this.selectedTemplateId}`
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
        `https://localhost:8080/api/addTemplate/${this.evaluatorID}`,
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

    this.http.post('https://localhost:8080/api/AddQuestion', payload).subscribe(
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
      .delete(`https://localhost:8080/api/deleteQuestion/${questionID}`)
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
        `https://localhost:8080/api/updateQuestion/${update?.id}`,
        update?.payload
      )
    );

    forkJoin(updateRequests).subscribe(
      () => {
        this.reloadQuestions(); 
      // WHY DO INSTRUCTORS HAVE DROP DOWN TO MANAGE COURSES ALONG WITH BUTTONS ON DASHBOARD....SEEMS REDUNDANT - Ask group...
      // PREVIEW OF EVAL FORM - Question text can overrun the box....need to either trim it or have div wrap...
      // Displays Save Successful -- RIGHT NOW DOESN'T DEFAULT BACK TO NOT SHOwiNG SAVE MESSAGE
      // SAVE -- Not always popping up, not resetting (See above comment for failure to not disappear)
      this.saveSuccessful = true; // Show success message
      setTimeout(() => {
        this.saveSuccessful = false
      }, 3000);

      },
      (error) => {
        alert('Error updating questions. Please try again.');
        console.error('Error updating questions:', error);
      }
    );
  }
}
