// manage-evals.compnents.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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
  styleUrls: ['./manage-evals.component.css']
})
export class ManageEvalsComponent implements OnInit {
  showModal: boolean = false;
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

  constructor(private http: HttpClient) {

  }

  ngOnInit() {
    this.getCurrentUser();
    this.loadTemplates();
    // this.loadDefaultTemplate();


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

    this.http.get<EvalTemplate[]>(`https://localhost:8080/api/templates/${this.evaluatorID}`).subscribe(
      data => {
        this.templates = data;
        console.log('Fetched Templates:', data);
      },
      error => console.error('Error fetching templates:', error)
    );
  }

  onTemplateSelect(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const templateId = selectElement.value;
    this.selectedTemplateId = templateId;

    this.http.get<Question[]>(`https://localhost:8080/api/questions/${templateId}`).subscribe(
      data => {
        this.selectedTemplateQuestions = data;
        // Store initial state
        this.storeInitialState(data);
        console.log('Fetched Questions:', data);
      },
      error => console.error('Error fetching questions:', error)
    );
  }

  storeInitialState(questions: Question[]) {
    this.initialQuestionsState = {};
    questions.forEach(question => {
      this.initialQuestionsState[question.questionID] = { ...question };
    });
  }
  reloadQuestions() {
    if (this.selectedTemplateId) {
      this.http.get<Question[]>(`https://localhost:8080/api/questions/${this.selectedTemplateId}`).subscribe(
        data => {
          this.selectedTemplateQuestions = data;
          console.log('Fetched Questions:', data);
        },
        error => console.error('Error fetching questions:', error)
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
    this.http.post(`https://localhost:8080/api/addTemplate/${this.evaluatorID}`, newTemplate).subscribe(
      () => {
        // alert('Template created successfully!');
        this.loadTemplates(); // Reload templates to include the new one
        this.showModal = false;
      },
      error => {
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
      templateID: this.selectedTemplateId
    };

    this.http.post('https://localhost:8080/api/AddQuestion', payload).subscribe(
      () => {
        // alert('Question added successfully!');
        this.reloadQuestions();
        this.showQuestionModal = false;
        this.newQuestionText = '';
        this.newQuestionType = '';
      },
      error => {
        alert('Error updating question!');
        console.error('Error adding question:', error)
      }
    );
  }

  deleteQuestion(questionID: string) {
    console.log("questionID", questionID);

    this.http.delete(`https://localhost:8080/api/deleteQuestion/${questionID}`).subscribe(
      () => {
        // alert('Question deleted successfully!');
        this.reloadQuestions();
      },
      error => {
        alert('Error creating deleting question. Please try again.');
        console.error('Error deleting question:', error);
      }
    );
  }

  submitUpdates(questionID: string, updatedText: string, updatedType: string) {
    // Log the values
    console.log('Updated Text:', updatedText);
    console.log('Updated Type:', updatedType);
    
    const originalQuestion = this.initialQuestionsState[questionID]; // Use initial state for comparison
    const payload: UpdateQuestionPayload = {
        questionText: updatedText,
        questionType: updatedType
    };

    if (originalQuestion.questionText == payload.questionText && originalQuestion.questionType == payload.questionType) {
      console.error('No changes to submit');
      return;
    }

    // Send the update request
    this.http.put(`https://localhost:8080/api/updateQuestion/${questionID}`, payload).subscribe(
      () => {
        // alert('Question updated successfully!');
        this.reloadQuestions();
      },
      error => {
        alert('Error updating question. Please try again.');
        console.error('Error updating question:', error);
      }
    );
  }
}