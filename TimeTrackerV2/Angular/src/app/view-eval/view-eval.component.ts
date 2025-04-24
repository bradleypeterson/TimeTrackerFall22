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

@Component({
  selector: 'app-view-eval',
  templateUrl: './view-eval.component.html',
  styleUrls: ['./view-eval.component.css']
})
export class ViewEvalComponent implements OnInit {
  selectedTemplateQuestions: Question[] = [];
  templates: EvalTemplate[] = [];
  templateID: string = '';
  
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadTemplates();
  }

  public pageTitle = 'TimeTrackerV2 | View Eval'

    loadTemplates() {
      this.http
        .get<EvalTemplate[]>(
          `${environment.apiURL}/api/eval/${this.templateID}`
        )
        .subscribe(
          (data) => {
            this.templates = data;
            console.log('Fetched Templates:', data);
          },
          (error) => console.error('Error fetching templates:', error)
        );
    }

}


