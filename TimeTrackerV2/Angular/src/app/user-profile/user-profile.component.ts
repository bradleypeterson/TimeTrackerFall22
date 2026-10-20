import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import CryptoES from 'crypto-es';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
})
export class UserProfileComponent {
  public userProfile: any;
  public viewingUserID: any;
  public errMsg = '';
  public successMsg = '';

  public instructor: boolean = false;
  public student: boolean = false;
  public admin: boolean = false;
  public dummyGen: boolean = false;
  public currentUserID: any;
  public sameUser: boolean = false;
  public currentUser: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    const tempUser = localStorage.getItem('currentUser');
    if (tempUser) {
      this.currentUser = JSON.parse(tempUser);
    }

    console.log(
      `State received: ${JSON.stringify(
        this.router.getCurrentNavigation()?.extras.state
      )}`
    );

    this.viewingUserID =
      this.router.getCurrentNavigation()?.extras.state?.userID;

    this.successMsg =
      this.router.getCurrentNavigation()?.extras.state?.successMsg ??
      history.state?.successMsg ??
      '';
  }

  ngOnInit(): void {
    const userType = this.currentUser.type;
    this.currentUserID = this.currentUser.userID;

    if (userType === 'instructor') {
      this.instructor = true;
    } else if (userType === 'student') {
      this.student = true;
    } else if (userType === 'admin') {
      this.admin = true;
    }

    if (this.viewingUserID == this.currentUserID) {
      this.sameUser = true;
    }

    this.loadProfile();
  }

  loadProfile(): void {
    this.http
      .get<any>(`${environment.apiURL}/api/UserProfile/${this.viewingUserID}`, {
        headers: new HttpHeaders({
          'Access-Control-Allow-Headers': 'Content-Type',
        }),
      })
      .subscribe({
        next: (data) => {
          this.errMsg = '';
          this.userProfile = data;

          if (this.userProfile) {
            localStorage.setItem(
              'userProfile',
              JSON.stringify(this.userProfile)
            );
          }
        },
        error: (error) => {
          this.errMsg = error['error']['message'];
        },
      });
  }

  GenerateDummyData(): void {
    if (this.currentUser?.type !== 'admin') {
      this.errMsg = 'Only administrators can generate test data.';
      return;
    }

    if (this.dummyGen == false) {
      const data: string[][] = new Array(32).fill(null).map(() => []);
      const adminsalt = CryptoES.lib.WordArray.random(16).toString();
      const adminPassword = CryptoES.PBKDF2('admin2', adminsalt, {
        keySize: 512 / 32,
        iterations: 1000,
      }).toString();

      data[0][0] = adminPassword;
      data[0][1] = adminsalt;

      for (let i = 1; i < data.length; i++) {
        const salt = CryptoES.lib.WordArray.random(16).toString();
        const hashedPassword = CryptoES.PBKDF2('ChangeMe123', salt, {
          keySize: 512 / 32,
          iterations: 1000,
        }).toString();

        data[i][0] = hashedPassword;
        data[i][1] = salt;
      }

      console.log('profile.component.ts: Generating Dummy Data...');
      this.http
        .post<any>(`${environment.apiURL}/api/bulk_register/`, data)
        .subscribe({
          error: (error) => {
            this.errMsg = error['error']['message'];
          },
        });

      this.dummyGen = true;
    } else {
      console.log(
        'profile.component.ts: Dummy Data has already been generated.'
      );
    }
  }

  NavToEditProfile() {
    const state = { userID: this.viewingUserID };

    console.log(
      `Navigate to the "edit-profile" component with the following states ${JSON.stringify(
        state
      )}`
    );

    this.router.navigate(['/edit-profile'], { state });
  }

  NavToResetPassword() {
    const state = { userID: this.viewingUserID };

    console.log(
      `Navigate to the "resetpassword" component with the following states ${JSON.stringify(
        state
      )}`
    );

    this.router.navigate(['/resetpassword'], { state });
  }

  DeleteAccount() {
    const response = confirm(
      `WARNING:  Deleting an account is irreversible.\n\nIf you continue with this process, the account will be deleted.\nDo you wish to continue?`
    );

    if (response) {
      const currentUser = localStorage.getItem('currentUser');
      let userID = 0;

      if (currentUser) {
        const user = JSON.parse(currentUser);
        userID = user.userID;
      } else {
        console.log('No user found in localStorage');
      }

      const requestBody = {
        userID: this.viewingUserID,
        currentUserID: userID,
      };

      this.http
        .delete(`${environment.apiURL}/api/deleteAccount`, {
          body: requestBody,
        })
        .subscribe(
          (res: any) => {
            this.ShowMessage(res.message);

            if (this.sameUser) {
              this.router.navigate(['']);
            } else {
              this.router.navigate(['/users']);
            }
          },
          (err) => {
            this.ShowMessage(err.error.message);
          }
        );
    }
  }

  ShowMessage(message: string) {
    alert(message);
  }
}