import { Component, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, ValidationErrors, ValidatorFn } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-edit-timecard',
  templateUrl: './edit-timecard.component.html',
  styleUrls: ['./edit-timecard.component.css']
})
export class EditTimecardComponent implements OnInit {
  public errMsg = '';
  public timeslotID: any;
  public timecard: any;
  public projectID: any;
  public firstName: any;
  public lastName: any;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private http: HttpClient,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) { 
    console.log(JSON.stringify(this.router.getCurrentNavigation()?.extras.state));
    this.timeslotID = this.router.getCurrentNavigation()?.extras.state?.timeslotID;
    this.projectID = this.router.getCurrentNavigation()?.extras.state?.projectID;
    this.firstName = this.router.getCurrentNavigation()?.extras.state?.firstName;
    this.lastName = this.router.getCurrentNavigation()?.extras.state?.lastName;
  }

  ngOnInit(): void {
    //this.timeslotID = this.activatedRoute.snapshot.params['id']; // get project id from URL
    this.getTimeCardInfo();
  }

  getTimeCardInfo(): void {
    this.http.get<any>(`https://localhost:8080/api/TimeCardInfo/${this.timeslotID}`, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
        next: data => {
            this.errMsg = "";
            this.timecard = data;
            //this.projectID = this.timecard.projectID;
            if (this.timecard) {
              this.editTimecardForm.controls['studentName'].setValue(this.timecard.studentName);
              this.editTimecardForm.controls['timeIn'].setValue(this.timecard.timeIn);
              this.editTimecardForm.controls['timeOut'].setValue(this.timecard.timeOut);
            }
        },
        error: error => {
            this.errMsg = error['error']['message'];
        }
    });
  }

  editTimecardForm = this.formBuilder.group({
    studentName: '',
    timeIn: '',
    timeOut: '',
    timeslotID: '',
  }, {
    validators: [this.CreateDateRangeValidator()]
});

// This function is used to make sure that the starting date is always before the ending date.  Source https://blog.angular-university.io/angular-custom-validators/#:~:text=our%20previous%20article.-,Form%2Dlevel%20(multi%2Dfield)%20Validators,-Besides%20being%20able
CreateDateRangeValidator(): ValidatorFn {
    // The AbstractControl replaces the FormGroup because apparently the above source uses a different typescript version than this project.  It seems to be caused by a bug in the TypeScript version.  Fix source https://stackoverflow.com/a/63306484
    return (form: AbstractControl): ValidationErrors | null => {
        // The '!' at the end is the "non-null assertion operator", this tell the TypeScript compiler that a value is not null or undefined, even if its type suggests that it might be
        const start: string = form.get("timeIn")!.value;
        const end: string = form.get("timeOut")!.value;

        if (start && end) {
            const dateStart = new Date(start);
            const dateEnd = new Date(end);
            const isRangeValid = (dateEnd.getTime() - dateStart.getTime() > 0);

            return isRangeValid ? null : { dateRange: true };
        }

        return null;
    }
}

  onSubmit(): void {
    let startTime = new Date(this.editTimecardForm.value['timeIn']).getTime();
    let endTime = new Date(this.editTimecardForm.value['timeOut']).getTime();
    let payload = {
      //studentName: this.editTimecardForm.value['studentName'],
      timeIn: startTime,
      timeOut: endTime,
      timeslotID: this.timeslotID,
    }

    this.http.post<any>(`https://localhost:8080/api/editTimeCard`, payload, {headers: new HttpHeaders({"Access-Control-Allow-Headers": "Content-Type"})}).subscribe({
      next: data => {
        this.errMsg = "";
        this.router.navigate(['/project/' + this.projectID]);
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });
  }
}
