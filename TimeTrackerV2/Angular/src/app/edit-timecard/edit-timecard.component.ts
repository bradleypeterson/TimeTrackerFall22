import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
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

  constructor(
    private formBuilder: UntypedFormBuilder,
    private http: HttpClient,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.timeslotID = this.activatedRoute.snapshot.params['id']; // get project id from URL
    this.getTimeCardInfo();
  }

  getTimeCardInfo(): void {
    this.http.get<any>(`https://localhost:8080/api/TimeCardInfo/${this.timeslotID}`, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
        next: data => {
            this.errMsg = "";
            this.timecard = data;
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
  });

  onSubmit(): void {
    let payload = {
      studentName: this.editTimecardForm.value['studentName'],
      timeIn: this.editTimecardForm.value['timeIn'],
      timeOut: this.editTimecardForm.value['timeOut'],
      timeslotID: this.timeslotID,
    }

    this.http.post<any>(`https://localhost:8080/api/editTimeCard`, payload, {headers: new HttpHeaders({"Access-Control-Allow-Headers": "Content-Type"})}).subscribe({
      next: data => {
        this.errMsg = "";
        this.router.navigate(['/project/' + this.timecard.projectID]);
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });
  }
}
