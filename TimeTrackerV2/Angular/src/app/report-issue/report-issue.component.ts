import { Component, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-report-issue',
  templateUrl: './report-issue.component.html',
  styleUrls: ['./report-issue.component.css'],
})
export class ReportIssueComponent implements OnInit {
  public errMsg = '';
  public currentUser: any;
  userID: string = '';
  public fillingForm: any;
  public loggedIn: any;

  constructor(
      private formBuilder: UntypedFormBuilder,
      private http: HttpClient,
      private router: Router,
      private activatedRoute: ActivatedRoute,
  ) {
        const tempUser = localStorage.getItem('currentUser');
        if (tempUser) {
          this.currentUser = JSON.parse(tempUser);
          this.loggedIn = true;
        } else {
          this.currentUser = null;
          this.loggedIn = false;
        }

      // This will grab values from the state variable of the navigate function we defined inside the users.ts component in the function navToResetPassword().  This solution was found here https://stackoverflow.com/a/54365098
      console.log(`State received: ${JSON.stringify(this.router.getCurrentNavigation()?.extras.state)}`);  // For debugging only
  }

  issueReportForm = this.formBuilder.group({
      bugDescription: '',
      inputName: '',
  }, {
      validators: [this.CreateFilledOutValidator()]
  });

  date: Date = new Date();

  CreateFilledOutValidator(): ValidatorFn {
    return (form: AbstractControl): ValidationErrors | null => {
      const description: string = form.get("bugDescription")?.value;
      const name: string = form.get("inputName")!.value;

      return (description && name) ? null : { fieldsCheck: true }
    }
  }

  ngOnInit(): void {
      this.fillingForm = true;
      if(this.loggedIn) {
        this.issueReportForm.controls.inputName.setValue(
          this.currentUser.firstName + " " + this.currentUser.lastName);
      }
  }

  onSubmit(): void {
    // checking if the form is valid
    if (!this.issueReportForm.valid) {
        return;
        
    }
    let payload = {
        //This line will check if there is a current user and add null to the payload if not
        userID: this.currentUser?.userID ?? null,
        description: this.issueReportForm.value['bugDescription'],
        name: this.issueReportForm.value['inputName'],
        creationDate: this.date,
        lastUpdateDate: this.date,
    }

    this.http
      .post<any>(`${environment.apiURL}/api/CreateBugReport`, payload, {
        headers: new HttpHeaders({
          'Access-Control-Allow-Headers': 'Content-Type',
        }),
      })
      .subscribe({
        next: (data) => {
          this.errMsg = '';
          this.fillingForm = false;
        },
        error: (error) => {
          this.errMsg = error['error']['message'];
        },
      });
  }
}