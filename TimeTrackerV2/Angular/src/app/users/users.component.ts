import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormGroup, UntypedFormControl } from '@angular/forms';
import { environment } from '../../environments/environment';

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.css']
})

export class UsersComponent implements OnInit {
    users: any = [];
    filteredUsers: any = [];
    searchForm = new FormGroup({
        name: new UntypedFormControl(''),
        active: new UntypedFormControl(''),
        approved: new UntypedFormControl(''),
        type: new UntypedFormControl('')
    });
    currentUserID!: number;
    errMsg: string = "";

    constructor(
        private http: HttpClient,
        private router: Router,
    ) { }

    ngOnInit(): void {
        this.loadUsers();
        let currentUser = localStorage.getItem('currentUser');
        var userData = currentUser ? JSON.parse(currentUser) : null;
        this.currentUserID = userData.userID;
    }

    public pageTitle = 'TimeTrackerV2 | Users'

    loadUsers() {
        this.http
          .get<any>(`${environment.apiURL}/api/Users`, {
            headers: new HttpHeaders({
              'Access-Control-Allow-Headers': 'Content-Type',
            }),
          })
          .subscribe({
            next: (data) => {
              // The "data.map((d: any) => {return {...this.ProcessedUser(d)}})" makes a deep copy of the data so we can determine if something has changed for the user and display the "Save Changes" button.  You could also use "JSON.parse(JSON.stringify(data))" but it is less performant as these two things are talked about here https://stackoverflow.com/a/23481096
              this.users = data.map((d: any) => {
                return { ...this.ProcessedUser(d) };
              });
              this.filteredUsers = data.map((d: any) => {
                return { ...this.ProcessedUser(d) };
              });
              // The reason why we have the above code this way is because if there is no filter is supplied that limits the number of users, the variables "users" and "filteredUsers" contain references to each other.  I.E. you delete an item from "users" and it is also deleted from "filteredUsers".
              // However, if a filter is applied that limits the number of users, the variables "users" and "filteredUsers" contain their own copy of the data for some reason.  So we have to have it this way to have unique lists.
              // Source that says objects and arrays are passed by reference, in Javascript but it still applies to TypeScript.  https://stackoverflow.com/questions/35473404/pass-by-value-and-pass-by-reference-in-javascript
            },
            error: (err) => {
              this.errMsg = err.error.message;
            },
          });
    }

    ProcessedUser(user: any) {
        user.isActive = user.isActive == 1 ? true : false;  // Converts the boolean of 1/0 the DB uses to true/false that the client uses
        user.isApproved = user.isApproved == 1 ? true : false;  // Converts the boolean of 1/0 the DB uses to true/false that the client uses
        return user
    }

    filterUsers() {
        // Grab the inputs from the form so they are in an easy to access variable
        const name = this.searchForm.controls.name.value
        const active = this.searchForm.controls.active.value;
        const approved = this.searchForm.controls.approved.value;
        const type = this.searchForm.controls.type.value;

        // This function will filter all every user in the variable "this.users" for any combination of the four input fields.  Source for this code with some modifications https://www.geeksforgeeks.org/how-to-filter-multiple-values-in-angularjs/#:~:text=Filter%20multiple%20values%20using%20a%20Custom%20Filter%20Function
        this.filteredUsers = this.users.filter((user: any) => {
            // The below Match conditions are read as follows, if the field is not supplied OR the field's data matches the current user, then it is considered a match.  This is filtered this way so that if they don't supply the field, it will exclude it from the filtering
            const nameMatch = !name || `${user.firstName} ${user.lastName}`.toLowerCase().includes(name.toLowerCase());
            const activeMatch = !active || user.isActive == (active === 'true' ? 1 : 0);  // This filter condition is formatted this way because the UI and the logic uses true/false for boolean while the DB uses 1/0 for booleans.
            const approvedMatch = !approved || user.isApproved == (approved === 'true' ? 1 : 0);
            const typeMatch = !type || user.type === type;

            return nameMatch && activeMatch && approvedMatch && typeMatch;  // If all four of these conditions are true, then the variable "user" is included inside the array "this.filteredUsers".
        }).map((d: any) => {return {...d}});

        if(this.filteredUsers.length <= 0) {
            this.errMsg = "No users found"
        }
        else {
            this.errMsg = "";
        }
    }

    ViewProfile(userID: number) {
        let state = {userID: userID};
        // navigate to the component that is attached to the url inside the [] and pass some information to that page by using the code described here https://stackoverflow.com/a/54365098
        this.router.navigate(['/profile'], { state });
    }

    UserModified(userInfo: any) {
        let index: number = this.FindIndexOfUserWithID(this.users, userInfo.userID); // Grab the index of the user from the master list
        let user: any = this.users[index];  // Grab the info for said user

        // Stringify the two objects so we can compare them
        const backendUser = JSON.stringify(user);
        const frontendUser = JSON.stringify(userInfo);

        // console.log(`Different:\n${backendUser}\n${frontendUser}\n${backendUser != frontendUser}`);  // For debugging only

        // returns true if they are different and false if they are the same
        return JSON.stringify(user) != JSON.stringify(userInfo)
    }

    SaveUserChanges(userData: any)
    {
        // An extra check statement to prevent altering of the current user's information
        if(userData.userID === this.currentUserID) {
            return;
        }

        let payload = userData;

        this.http
          .post<any>(`${environment.apiURL}/api/UpdateUserInfo`, payload, {
            headers: new HttpHeaders({
              'Access-Control-Allow-Headers': 'Content-Type',
            }),
          })
          .subscribe({
            next: (res) => {
              // How update the master list so that it mirrors the UI's user
              let index = this.FindIndexOfUserWithID(
                this.users,
                userData.userID
              );
              this.users[index] = { ...userData };
              // Notify the user's information has been updated (no longer needed because the Save button is hidden when the user is saved because the master list and the UI match)
              // this.ShowMessage(res.message);
            },
            error: (err) => {
              this.ShowMessage(err.error.message);
            },
          });
    }

    //#region Helper functions
    // Open an alert window with the supplied message
    ShowMessage(message: string) {
        alert(message);
    }

    // This function will find the index of a user in the list supplied that has the ID that is supplied
    FindIndexOfUserWithID(users: any, ID: number) {
        return users.map((currentUser: any) => currentUser.userID).indexOf(ID);  // Return the index of the user inside of "users", it will return -1 if it can't find any user with the ID supplied
    }
    //#endregion
}
