import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  UntypedFormBuilder,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-edit-timecard',
  templateUrl: './edit-timecard.component.html',
  styleUrls: ['./edit-timecard.component.css'],
})
export class EditTimecardComponent implements OnInit {
  public errMsg = '';
  public timeslotID: any;
  public timecard: any;
  public projectID: any;
  public firstName: any;
  public lastName: any;
  public currentUser: any;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private http: HttpClient,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    const tempUser = localStorage.getItem('currentUser');
    if (tempUser) {
      this.currentUser = JSON.parse(tempUser);
    }

    // This will grab values from the state variable of the navigate function we defined inside the users.ts component in the function navToResetPassword().  This solution was found here https://stackoverflow.com/a/54365098
    console.log(
      `State received: ${JSON.stringify(
        this.router.getCurrentNavigation()?.extras.state
      )}`
    ); // For debugging only
    this.timeslotID =
      this.router.getCurrentNavigation()?.extras.state?.timeslotID;
    this.projectID =
      this.router.getCurrentNavigation()?.extras.state?.projectID;
    this.firstName =
      this.router.getCurrentNavigation()?.extras.state?.firstName;
    this.lastName = this.router.getCurrentNavigation()?.extras.state?.lastName;
  }

  ngOnInit(): void {
    //this.timeslotID = this.activatedRoute.snapshot.params['id']; // get project id from URL
    this.getTimeCardInfo();
  }

  private formatLocalDateTime(value: string | number): string {
    const date = new Date(Number(value));

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const pad = (n: number) => String(n).padStart(2, '0');

    return (
      `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
        date.getDate()
      )}` +
      `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
        date.getSeconds()
      )}` +
      `.${String(date.getMilliseconds()).padStart(3, '0')}`
    );
  }

  getTimeCardInfo(): void {
    this.http
      .get<any>(`${environment.apiURL}/api/TimeCardInfo/${this.timeslotID}`, {
        headers: new HttpHeaders({
          'Access-Control-Allow-Headers': 'Content-Type',
        }),
      })
      .subscribe({
        next: (data) => {
          this.errMsg = '';
          this.timecard = data[0];
          //this.projectID = this.timecard.projectID;
          if (this.timecard) {
            this.editTimecardForm.controls['studentName'].setValue(
              this.timecard.studentName
            );
            this.editTimecardForm.controls['timeIn'].setValue(
              this.formatLocalDateTime(this.timecard.timeIn)
            );

            this.editTimecardForm.controls['timeOut'].setValue(
              this.formatLocalDateTime(this.timecard.timeOut)
            );

            this.editTimecardForm.controls['description'].setValue(
              this.timecard.description ?? ''
            );
          }
        },
        error: (error) => {
          this.errMsg = error['error']['message'];
        },
      });
  }

  editTimecardForm = this.formBuilder.group(
    {
      studentName: '',
      timeIn: '',
      timeOut: '',
      timeslotID: '',
      description: '',
    },
    {
      validators: [this.CreateDateRangeValidator()],
    }
  );

  // This function is used to make sure that the starting date is always before the ending date.  Source https://blog.angular-university.io/angular-custom-validators/#:~:text=our%20previous%20article.-,Form%2Dlevel%20(multi%2Dfield)%20Validators,-Besides%20being%20able
  CreateDateRangeValidator(): ValidatorFn {
    // The AbstractControl replaces the FormGroup because apparently the above source uses a different typescript version than this project.  It seems to be caused by a bug in the TypeScript version.  Fix source https://stackoverflow.com/a/63306484
    return (form: AbstractControl): ValidationErrors | null => {
      // The '!' at the end is the "non-null assertion operator", this tell the TypeScript compiler that a value is not null or undefined, even if its type suggests that it might be
      const start: string = form.get('timeIn')!.value;
      const end: string = form.get('timeOut')!.value;

      if (start && end) {
        const dateStart = new Date(start);
        const dateEnd = new Date(end);
        const isRangeValid = dateEnd.getTime() - dateStart.getTime() > 0;

        return isRangeValid ? null : { dateRange: true };
      }

      return null;
    };
  }

  onSubmit(): void {
    this.errMsg = '';

    if (
      !this.editTimecardForm.value['timeIn'] ||
      !this.editTimecardForm.value['timeOut']
    ) {
      this.errMsg = 'Please enter both Time In and Time Out.';
      return;
    }

    const startTime = new Date(this.editTimecardForm.value['timeIn']).getTime();

    const endTime = new Date(this.editTimecardForm.value['timeOut']).getTime();

    if (!Number.isFinite(startTime) || !Number.isFinite(endTime)) {
      this.errMsg = 'Please enter valid Time In and Time Out values.';
      return;
    }

    if (endTime <= startTime) {
      this.errMsg = 'Time Out must be later than Time In.';
      return;
    }

    const payload = {
      timeIn: startTime,
      timeOut: endTime,
      timeslotID: this.timeslotID,
      description: this.editTimecardForm.value['description'],
    };

    this.http
      .post<any>(`${environment.apiURL}/api/editTimeCard`, payload, {
        headers: new HttpHeaders({
          'Access-Control-Allow-Headers': 'Content-Type',
        }),
      })
      .subscribe({
        next: (data) => {
          this.errMsg = '';
          this.NavigateBackToProject();
        },
        error: (error) => {
          this.errMsg = error['error']['message'];
        },
      });
  }

  NavigateBackToProject() {
    let state = { projectID: this.projectID };
    // navigate to the component that is attached to the url inside the [] and pass some information to that page by using the code described here https://stackoverflow.com/a/54365098
    this.router.navigate(['/project'], { state });
  }
}
