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

  initialQuestionsState: Record<string, Question> = {};

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.loadTemplates();
    this.loadQuestionsForTemplate("1");
  }

  loadQuestionsForTemplate(templateId: string) {
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
    this.http.post(`https://localhost:8080/api/addTemplate`, newTemplate).subscribe(
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
    const payload: UpdateQuestionPayload = {};
    const originalQuestion = this.initialQuestionsState[questionID]; // Use initial state for comparison

    if (!originalQuestion) {
      console.error('Question not found');
      return;
    }

    console.log('Original Question (immediately after retrieval):', originalQuestion);

    // Log updated values
    console.log('Updated Text:', updatedText);
    console.log('Updated Type:', updatedType);

    // Check if the text or type has been changed
    if (originalQuestion.questionText !== updatedText) {
      console.log('Text has changed');
      payload.questionText = updatedText;
    }

    if (originalQuestion.questionType !== updatedType) {
      console.log('Type has changed');
      payload.questionType = updatedType;
    }

    // Log payload before checking if it's empty
    console.log('Payload before submission:', payload);

    if (Object.keys(payload).length === 0) {
      console.log('No changes to submit');
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