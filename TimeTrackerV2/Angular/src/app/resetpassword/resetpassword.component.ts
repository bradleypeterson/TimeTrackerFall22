import { Component, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

@Component({
    selector: 'app-resetpassword',
    templateUrl: './resetpassword.component.html',
    styleUrls: ['./resetpassword.component.css']
})
export class ResetpasswordComponent implements OnInit {
    sID!: number;
    sUsername!: string;
    resetForm!: UntypedFormGroup;
    formValid: boolean = true;

    // This function is used to make sure that the two passwords are the same.  Modified code from here https://blog.angular-university.io/angular-custom-validators/#:~:text=our%20previous%20article.-,Form%2Dlevel%20(multi%2Dfield)%20Validators,-Besides%20being%20able
    CreatePasswordValidator(): ValidatorFn {
        // The AbstractControl replaces the FormGroup because apparently the above source uses a different typescript version than this project.  It seems to be caused by a bug in the TypeScript version.  Fix source https://stackoverflow.com/a/63306484
        return (form: AbstractControl): ValidationErrors | null => {
            // The '!' at the end is the "non-null assertion operator", this tell the TypeScript compiler that a value is not null or undefined, even if its type suggests that it might be
            const pass1: string = form.get("newPswd")!.value;
            const pass2: string = form.get("confirm")!.value;

            if (pass1 && pass2) {
                const isValid = (pass1 === pass2);

                return isValid ? null : { passwordMisMatch: true };
            }

            return null;
        }
    }

    constructor(
        private activeRoute: ActivatedRoute,
        private location: Location,
        private router: Router,
    ) {
        // This will grab the userID and username values from the state of the navigate function we defined inside the users.ts component in the function navToResetPassword().  This solution was found here https://stackoverflow.com/a/54365098
        console.log(JSON.stringify(this.router.getCurrentNavigation()?.extras.state));
        this.sID = this.router.getCurrentNavigation()?.extras.state?.studentID;
        this.sUsername = this.router.getCurrentNavigation()?.extras.state?.username;
    }

    ngOnInit(): void {
        this.resetForm = new UntypedFormGroup({
            username: new UntypedFormControl(this.sUsername),
            newPswd: new UntypedFormControl(null),
            confirm: new UntypedFormControl(null)
        }, {
            validators: [this.CreatePasswordValidator()]
        });
    }

    onSubmit() {
        let pass1 = this.resetForm.get("newPswd")!.value;
        let pass2 = this.resetForm.get("confirm")!.value;

        console.log(`${pass1} !== ${pass2}:  ${pass1 !== pass2}`)

        if(pass1 !== pass2)
        {
            this.formValid = false;
            console.log("Passwords don't match")
            return;
        }
        else
        {
            this.formValid = true;
            console.log("Passwords match")
        }
    }
    changedPass() {
        //alert('Password has been changed');
        //this.location.back()
    }
}
