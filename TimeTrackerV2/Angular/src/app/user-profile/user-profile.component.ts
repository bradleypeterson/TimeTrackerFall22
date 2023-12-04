import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent {
  public userProfile: any;
  public viewingUserID: any;  // The userID of the profile we want to view
  public errMsg = '';

  public instructor: boolean = false;
  public student: boolean = false;
  public admin: boolean = false;
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
    this.http.get<any>(`https://localhost:8080/api/UserProfile/${this.viewingUserID}`, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
      next: data => {
        this.errMsg = "";
        this.userProfile = data;
        if (this.userProfile) {
          localStorage.setItem("userProfile", JSON.stringify(this.userProfile));
        }
      },
      error: error => {
        ("Error reached");
        this.errMsg = error['error']['message'];
      }
    });
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
                this.http.delete("https://localhost:8080/api/deleteAccount", { body: requestBody }).subscribe((res: any) => {    
                    // Notify the user that the user has been deleted
                    this.ShowMessage(res.message);

                    // If the user owns the account, then redirect them back to the login page
                    if(this.sameUser) {
                        this.router.navigate(['']);  // We don't flush the current user from local storage here, because this is done inside the login component 
                    }
                    else {
                        this.router.navigate(['/users']);
                    }
                },
                err => {
                    this.ShowMessage(err.error.message);
                });
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
