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

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.loadTemplates();
  }

  loadTemplates() {
    this.http.get<EvalTemplate[]>('https://localhost:8080/api/templates').subscribe(
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
        console.log('Fetched Questions:', data);
      },
      error => console.error('Error fetching questions:', error)
    );
  }

  submitUpdates(questionID: string, questionText: string, questionType: string) {
    if (!this.selectedTemplateId) {
      alert('No template selected!');
      return;
    }

    let payload: UpdateQuestionPayload = {};
    const question = this.selectedTemplateQuestions.find(q => q.questionID === questionID);

    if (question) {
      if (question.questionText !== questionText) {
        payload.questionText = questionText;
      }
      if (question.questionType !== questionType) {
        payload.questionType = questionType;
      }
    }

    if (Object.keys(payload).length === 0) {
      alert('No changes detected!');
      return;
    }

    this.http.post(`https://localhost:8080/api/UpdateQuestion/${questionID}`, payload).subscribe(
      () => {
        alert('Responses submitted successfully!');
        this.reloadQuestions();
      },
      error => console.error('Error submitting responses:', error)
    );
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
    this.http.post(`https://localhost:8080/api/addTemplate`, newTemplate).subscribe(
      () => {
        alert('Template created successfully!');
        this.loadTemplates(); // Reload templates to include the new one
      },
      error => console.error('Error creating template:', error)
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
        alert('Question added successfully!');
        this.reloadQuestions();
        this.showQuestionModal = false;
        this.newQuestionText = '';
        this.newQuestionType = '';
      },
      error => console.error('Error adding question:', error)
    );
  }

  deleteQuestion(questionID: string) {
    console.log("questionID", questionID);

    this.http.delete(`https://localhost:8080/api/deleteQuestion/${questionID}`).subscribe(
      () => {
        alert('Question deleted successfully!');
        this.reloadQuestions();
      },
      error => console.error('Error deleting question:', error)
    );
  }
}