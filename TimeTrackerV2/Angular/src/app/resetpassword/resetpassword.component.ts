import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import CryptoES from 'crypto-es';

@Component({
    selector: 'app-resetpassword',
    templateUrl: './resetpassword.component.html',
    styleUrls: ['./resetpassword.component.css']
})
export class ResetpasswordComponent implements OnInit {
    userID!: number;
    resetForm!: UntypedFormGroup;
    errorMessage: string = "";

    constructor(
        private activeRoute: ActivatedRoute,
        private location: Location,
        private http: HttpClient,
        private router: Router,
    ) {
        // This will grab values from the state variable of the navigate function we defined inside the users.ts component in the function navToResetPassword().  This solution was found here https://stackoverflow.com/a/54365098
        console.log(JSON.stringify(this.router.getCurrentNavigation()?.extras.state));
        this.userID = this.router.getCurrentNavigation()?.extras.state?.userID;
    }

    ngOnInit(): void {
        this.resetForm = new UntypedFormGroup({
            newPswd: new UntypedFormControl(null),
            confirm: new UntypedFormControl(null)
        });
    }

    onSubmit() {
        // If th reset form is not valid
        if (!this.resetForm.valid) {
            this.errorMessage = "A password field has not been supplied";
            return;
        }
        this.errorMessage = "";

        let pass1 = this.resetForm.get("newPswd")!.value;
        let pass2 = this.resetForm.get("confirm")!.value;

        // if the two passwords don't match
        if(pass1 !== pass2)
        {
            this.errorMessage = "Your passwords do not match";
            return;
        }
        this.errorMessage = "";

        const salt = CryptoES.lib.WordArray.random(16).toString();  //Creates a salt value that is 16*2 (default encoder for toString() is hexadecimal) values long (this is because hex uses 1/2 of the byte while a character uses the full byte)
        const hashedPassword = CryptoES.PBKDF2(pass1, salt, { keySize: 512/32, iterations: 1000 }).toString();

        // Make a body variable for the http.put request so we can update the users password
        let requestBody = {
            password: hashedPassword,
            salt: salt
        };

        this.http.put(`https://localhost:8080/api/resetPassword/${this.userID}`, requestBody).subscribe((res: any) => {
            this.ShowMessage(res.message);
            this.NavigateBackToProfile();
        },
        err => {
            this.ShowMessage(err.error.message);
        });
    }

    NavigateBackToProfile() {
        let state = {userID: this.userID};
        // navigate to the component that is attached to the url inside the [] and pass some information to that page by using the code described here https://stackoverflow.com/a/54365098
        this.router.navigate(['/profile'], { state });
    }

    // Open an alert window with the supplied message
    ShowMessage(message: string) {
        alert(message);
    }
}
