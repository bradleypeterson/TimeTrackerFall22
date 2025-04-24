import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { environment } from '../../environments/environment';
import { ActivatedRoute, Router } from '@angular/router';

interface Question{
  questionID: number;
  questionText: string;
  questionType: string;
  templateID: number;
  evaluatorID: number
}

@Component({
    selector: 'app-evals', templateUrl: './eval.component.html',
    styleUrls: ['./eval.component.css'],
    standalone: false
})

export class EvalComponent implements OnInit {
  eval: Question[] = [];
  evalForm: FormGroup;
  evalID : number = 0;
  public projectID: number;
  selectedTemplateQuestions: Question[] = [];
  currentUser: any;
  evaluateeID: any;
  unanswered: number[] = []
  userName: string | undefined;
  // courseName: string | undefined;
  projectName: string | undefined;
  numQuestions: number = 0;

  constructor(private http: HttpClient, private formBuilder: FormBuilder, private router: Router,) {
    this.evalForm = this.formBuilder.group({});

    //console.log(`State received: ${JSON.stringify(this.router.getCurrentNavigation()?.extras.state)}`);
    this.projectID = this.router.getCurrentNavigation()?.extras.state?.projectID;
  }

  ngOnInit() {
    this.getCurrentUser();
    this.fetchEval(this.projectID);
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

sortEval(data: any) {
  let q = data

  this.numQuestions = q.length
  const formControls: { [key: string]: FormControl } = {};

  this.projectName = q[0].projectName
  this.evalID = q[0].evalID

  q.forEach((q: any) => {
    formControls['response_' + q.questionID] = new FormControl('');
    this.eval.push({
      questionID: q.questionID,
      questionText: q.questionText,
      questionType: q.questionType,
      templateID: q.templateID,
      evaluatorID: q.evaluatorID,
    });
  });
  this.evalForm = new FormGroup(formControls);
  console.log(this.eval)

  }

  fetchEval(projectID: number) {
    this.http
    .get(
      `${environment.apiURL}/api/getAssignedEvals/${this.evaluateeID}/${this.projectID}`,
      {
        headers: new HttpHeaders({
          'Access-Control-Allow-Headers': 'Content-Type',
        }),
      }
    )
    .subscribe({
      next: (data) => {
        if (data && Object.keys(data).length === 0) {
          // if there is not data go home
          this.router.navigate(['/dashboard']);
        } else {
          // Sort data if there is an eval
          this.sortEval(data);
        }
      },
      error: (err) => {
        this.ShowMessage(err.error.message);
      },
    });
  }

  evalCompleted(){
    let completed = {
      evalID: this.evalID
    }

    this.http.post<any>(`${environment.apiURL}/api/evalCompleted`, completed, {
      headers: new HttpHeaders({
        'Access-Control-Allow-Headers': 'Content-Type',
      }),
    })
    .subscribe({
      next: (data) => {
        console.log('Evaluation completed:', data);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.ShowMessage(err.error.message);
      },
    });
  }

  SubmitResponses() {
    const form = document.getElementById('evalForm') as HTMLFormElement;

    if (!form.checkValidity()) {
      alert('Please fill out the form correctly.');
      return;
    }
  
    this.eval.forEach((q: any) => {
      let i=0
      let responseinfo = {}

      const responseControl = this.evalForm.get('response_'+q.questionID);
      //console.log(responseControl?.value);
      
      if(!responseControl?.value){
        this.unanswered.push(q.questionID)
        i++;
      }
      else{
        this.unanswered.splice(i)
      }

      if(this.unanswered.length <= 0){
        if(typeof responseControl?.value == 'number'){
          responseinfo = {
            evalID: this.evalID,
            userID: this.currentUser.userID,
            questionID: q.questionID,
            rating: responseControl?.value,
            response: null
          };
        }
        else{
          responseinfo = {
            evalID: this.evalID,
            userID: this.currentUser.userID,
            questionID: q.questionID,
            rating: null,
            response: responseControl?.value
          };
        }
        //console.log(responseinfo)
        
        this.http.post<any>(`${environment.apiURL}/api/submitResponses`, responseinfo, {
          headers: new HttpHeaders({
            'Access-Control-Allow-Headers': 'Content-Type',
          }),
        })
        .subscribe({
          next: (data) => {
            console.log('Response recorded:', data);
            //this.router.navigate(['/dashboard']);
            
          },
          error: (err) => {
            this.ShowMessage(err.error.message);
          },
        });
        
      }
      //console.log(responseinfo)

    });
    
    if(this.unanswered.length > 0){
      let alert_msg = "Please answer:\n"
      this.unanswered.forEach( (q) => {
        alert_msg = alert_msg + ("Question "+q+"\n")
      });
      alert(alert_msg)
      return
    }

    this.evalCompleted()
    

  }

  ShowMessage(message: string) {
    alert(message);
  }
}
