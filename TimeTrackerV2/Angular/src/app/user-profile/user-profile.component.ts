import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import CryptoES from 'crypto-es'; //used for dummy data insertion line 88
import { environment } from '../../environments/environment';


@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent {
  public userProfile: any[] = [];
  public viewingUserID: any;  // The userID of the profile we want to view
  public errMsg = '';

  public instructor: boolean = false;
  public student: boolean = false;
  public admin: boolean = false;
  public dummyGen: boolean = false;
  public currentUserID: any;  // The userID of the current user
  public sameUser: boolean = false;

  public currentUser: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    const tempUser = localStorage.getItem('currentUser');
    if (tempUser) {
      this.currentUser = JSON.parse(tempUser);
    }

    // This will grab values from the state variable of the navigate function we defined while navigating to this page.  This solution was found here https://stackoverflow.com/a/54365098
    console.log(`State received: ${JSON.stringify(this.router.getCurrentNavigation()?.extras.state)}`);  // For debugging only
    this.viewingUserID = this.router.getCurrentNavigation()?.extras.state?.userID;
  }

  ngOnInit(): void {

    // get user type
    var userType = this.currentUser.type;
    this.currentUserID = this.currentUser.userID;
    if (userType === 'instructor') {
      this.instructor = true;
    } else if (userType === 'student') {
      this.student = true;
    } else if (userType === 'admin'){
      this.admin = true;
    }
    if(this.viewingUserID == this.currentUserID){
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
          this.userProfile = Array.isArray(data) ? data : [data];
          if (this.userProfile) {
            localStorage.setItem(
              'userProfile',
              JSON.stringify(this.userProfile)
            );
          }
        },
        error: (error) => {
          ('Error reached');
          this.errMsg = error['error']['message'];
        },
      });
  }

  GenerateDummyData(): void{
    if(this.dummyGen==false){

      //fill an array with crypto-es passwords and salts. 
      let data: string[][] = new Array(32).fill(null).map(() => []);
      const adminsalt = CryptoES.lib.WordArray.random(16).toString(); 
      const adminPassword = CryptoES.PBKDF2('admin2', adminsalt, { keySize: 512/32, iterations: 1000 }).toString();
      data[0][0]=adminPassword;
      data[0][1]=adminsalt;

      for(let i = 1; i< data.length; i++){
        const salt = CryptoES.lib.WordArray.random(16).toString(); 
        const hashedPassword = CryptoES.PBKDF2('ChangeMe123', salt, { keySize: 512/32, iterations: 1000 }).toString();
        data[i][0]=hashedPassword;
        data[i][1]=salt;
      }

      console.log("profile.component.ts: Generating Dummy Data...")
      this.http
      .post<any>(`${environment.apiURL}/api/bulk_register/`, data).subscribe({
        error: (error) => {
          this.errMsg = error['error']['message'];
        },
      });
      this.dummyGen=true;
    }else{
      console.log("profile.component.ts: Dummy Data has already been generated.")
    }
    
  }

    NavToEditProfile() {
        let state = {userID: this.viewingUserID};
        console.log(`Navigate to the \"resetpassword\" component with the the following states ${JSON.stringify(state)}`);
        //let user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        this.router.navigate(['/edit-profile'], { state });
    }

    NavToResetPassword() {
        let state = {userID: this.viewingUserID};
        console.log(`Navigate to the \"resetpassword\" component with the the following states ${JSON.stringify(state)}`);
        //let user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        this.router.navigate(['/resetpassword'], { state });
    }

        // Normally, we would want to have the argument be of type 'object' instead of 'any'. However if the type is 'object', we get an error saying "Property 'propertyName' doesn't exist on type 'object'"
        DeleteAccount() {
            // Syntax for the below code was found here https://stackoverflow.com/questions/9334636/how-to-create-a-dialog-with-ok-and-cancel-options
            const response = confirm(`WARNING:  Deleting an account is irreversible.\n\nIf you continue with this process, the account will be deleted.\nDo you wish to continue?`);
            // The user wants to delete the user
            if (response) {
                // Make a body variable for the http.delete request so we can safely delete user instead of passing the variable in the URL.  https://stackoverflow.com/a/40857437
                let requestBody = {
                    userID: this.viewingUserID
                };

                // This http delete request will delete the account attached to the user with the userID as specified in the body of the request, it will then remove the user from the local list of users so that the UI and the DB match.
                // This code is also formatted so that it will handle any 500 status codes the server sends here and it will display the message to the user.  Source for this code format with some alterations https://stackoverflow.com/a/52610468
                this.http
                  .delete(`${environment.apiURL}/api/deleteAccount`, {
                    body: requestBody,
                  })
                  .subscribe(
                    (res: any) => {
                      // Notify the user that the user has been deleted
                      this.ShowMessage(res.message);

                      // If the user owns the account, then redirect them back to the login page
                      if (this.sameUser) {
                        this.router.navigate(['']); // We don't flush the current user from local storage here, because this is done inside the login component
                      } else {
                        this.router.navigate(['/users']);
                      }
                    },
                    (err) => {
                      this.ShowMessage(err.error.message);
                    }
                  );
            }
            // The user doesn't want to delete the user (for debugging only)
            /*else {
                console.log("User not deleted");
            }*/
        }


    //#region Helper functions
    // Open an alert window with the supplied message
    ShowMessage(message: string) {
        alert(message);
    }
    //#endregion
}
