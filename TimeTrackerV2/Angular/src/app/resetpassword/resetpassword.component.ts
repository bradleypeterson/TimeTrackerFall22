import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common'

@Component({
  selector: 'app-resetpassword',
  templateUrl: './resetpassword.component.html',
  styleUrls: ['./resetpassword.component.css']
})
export class ResetpasswordComponent implements OnInit {

  data!: any;
  resetForm!: UntypedFormGroup;

  constructor(private activeRoute: ActivatedRoute, private location: Location) { }

  ngOnInit(): void {

    this.activeRoute.queryParams.subscribe({
      next: (data: any) => {
        this.data = data
      }
    })

    this.resetForm = new UntypedFormGroup({

      username: new UntypedFormControl(this.data.username),
      newPswd: new UntypedFormControl(null),
      confirm: new UntypedFormControl(null)
    })

  }

  onSubmit() {
  }
  changedPass() {
    alert('Password has been changed');
    this.location.back()
  }

}


