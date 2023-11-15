import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormGroup, UntypedFormControl } from '@angular/forms';

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.css']
})

export class UsersComponent implements OnInit {
    users: Array<any> = [];
    filteredUsers: Array<any> = [];
    searchForm = new FormGroup({
        name: new UntypedFormControl(''),
        active: new UntypedFormControl(''),
        type: new UntypedFormControl('')
    });

    constructor(
        private http: HttpClient,
        private router: Router,
    ) { }

    ngOnInit(): void {
        this.loadUsers(this.users);
    }

    public pageTitle = 'TimeTrackerV2 | Users'

    filterUsers() {
        // Grab the inputs from the form so they are in an easy to access variable
        const name = this.searchForm.controls.name.value
        const active = this.searchForm.controls.active.value;
        const type = this.searchForm.controls.type.value;

        // This function will filter all every user in the variable "this.users" for any combination of the three input fields.  Source for this code with some modifications https://www.geeksforgeeks.org/how-to-filter-multiple-values-in-angularjs/#:~:text=Filter%20multiple%20values%20using%20a%20Custom%20Filter%20Function
        this.filteredUsers = this.users.filter((user) => {
            // The below Match conditions are read as follows, if the field is not supplied OR the field's data matches the current user, then it is considered a match.  This is filtered this way so that if they don't supply the field, it will exclude it from the filtering
            const nameMatch = !name || user.name.toLowerCase().includes(name.toLowerCase());
            const activeMatch = !active || user.isActive == (active === 'true' ? 1 : 0);  // This filter condition is formatted this way because the UI and the logic uses true/false for boolean while the DB uses 1/0 for booleans.
            const typeMatch = !type || user.type === type;

            return nameMatch && activeMatch && typeMatch;  // If all three of these conditions are true, then the variable "user" is included inside the array "this.filteredUsers".
        });
    }

    loadUsers(users: Array<object>) {
        this.http.get("https://localhost:8080/api/Users").subscribe((data: any) => {
            /*for (let i = 0; i < data.length; i++) {
                users.push({
                    userID: data[i].userID,
                    name: data[i].firstName + " " + data[i].lastName,
                    username: data[i].username,
                    isActive: data[i].isActive,
                    type: data[i].type
                });
            }*/
            this.users = data;
            this.filteredUsers = data;
        });
    }

    ViewProfile(userID: number) {
        let state = {userID: userID};
        // navigate to the component that is attached to the url inside the [] and pass some information to that page by using the code described here https://stackoverflow.com/a/54365098
        this.router.navigate(['/profile'], { state });
    }

    SaveUserChanges(userData: any)
    {
        let payload = userData;

        this.http.post<any>("https://localhost:8080/api/UpdateUserInfo", payload, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
            next: res => {
                // Notify the user that the user has been deleted
                this.ShowMessage(res.message);
            },
            error: err => {
                this.ShowMessage(err.error.message);
            }
        });
    }
    
    navToResetPassword(studentID: number, username: string) {
        let state = {studentID: studentID, username: username};
        console.log(`Navigate to the \"resetpassword\" component with the the following states ${JSON.stringify(state)}`);
        //let user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        this.router.navigate(['/resetpassword'], { state });
    }

    // Normally, we would want to have the argument be of type 'object' instead of 'any'. However if the type is 'object', we get an error saying "Property 'propertyName' doesn't exist on type 'object'"
    DeleteUser(userInfo: any) {
        // Syntax for the below code was found here https://stackoverflow.com/questions/9334636/how-to-create-a-dialog-with-ok-and-cancel-options
        const response = confirm(`WARNING:  Deleting the user "${userInfo.name}" is irreversible.\n\nIf you continue with this process, the user will be deleted.\nDo you wish to continue?`);
        // The user wants to delete the user
        if (response) {
            // Make a body variable for the http.delete request so we can safely delete user instead of passing the variable in the URL.  https://stackoverflow.com/a/40857437
            let requestBody = {
                userID: userInfo.userID
            };

            // This http delete request will delete the account attached to the user with the userID as specified in the body of the request, it will then remove the user from the local list of users so that the UI and the DB match.
            // This code is also formatted so that it will handle any 500 status codes the server sends here and it will display the message to the user.  Source for this code format with some alterations https://stackoverflow.com/a/52610468
            this.http.delete("https://localhost:8080/api/deleteAccount", { body: requestBody }).subscribe((res: any) => {
                // This set of code will have the UI automatically updated because the content's of the variable "users" has been changed https://www.tutorialspoint.com/how-to-delete-a-row-from-table-using-angularjs
                let index: number = this.users.indexOf(userInfo);
                this.users.splice(index, 1);
                // Now it will notify the user that the user has been deleted
                this.ShowMessage(res.message);
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

    // Open an alert window with the supplied message
    ShowMessage(message: string) {
        alert(message);
    }
}