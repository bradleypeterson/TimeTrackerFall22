// manage-evals.compnents.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface EvalTemplate {
  templateID: string;
  templateName: string;
}

interface Question {
  questionText: string;
  responseType: string;
  response: string | number;
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
  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.loadTemplates();
  }

  loadTemplates() {
    this.http.get<EvalTemplate[]>('https://localhost:8080/api/templates').subscribe(
      data => {
        this.templates = data;
        console.log('Fetched Templates:', data); // Log the response here
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
        console.log('Fetched Questions:', data); // Log the questions here
      },
      error => console.error('Error fetching questions:', error)
    );
  }



  submitResponses() {
    if (!this.selectedTemplateId) {
      alert('No template selected!');
      return;
    }

    const payload = {
      templateId: this.selectedTemplateId,
      responses: this.selectedTemplateQuestions
    };

    this.http.post('https://localhost:8080/api/UpdateQuestion/${templateId}', payload).subscribe(
      () => alert('Responses submitted successfully!'),
      error => console.error('Error submitting responses:', error)
    );
  }

  createTemplate() {
    if (!this.newTemplateName) {
      alert('Please enter a template name.');
      return;
    }

    const newTemplate = { templateName: this.newTemplateName };
    this.http.post('https://localhost:8080/api/addTemplate', newTemplate).subscribe(
      () => {
        alert('Template created successfully!');
        this.loadTemplates(); // Reload templates to include the new one
      },
      error => console.error('Error creating template:', error)
    );
  }

}
