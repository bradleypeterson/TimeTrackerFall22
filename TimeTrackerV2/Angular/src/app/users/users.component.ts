import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { concat } from 'rxjs';

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.css']
})

export class UsersComponent implements OnInit {
    public users = [];

    constructor(
        private http: HttpClient,
        private router: Router,
    ) { }

    ngOnInit(): void {
        this.loadUsers(this.users);
    }

    public pageTitle = 'TimeTrackerV2 | Users'

    loadUsers(users: Array<Object>) {
        this.http.get("http://localhost:8080/api/Users").subscribe((data: any) => {
            for (let i = 0; i < data.length; i++) {
                let user: Object = data[i];

                /*users.push({
                    name: user.firstName + " " + user.lastName,
                    username: user.username
                });*/
            }
        });
    }

    navToResetPassword(tag: any, body: any) {
        let user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        this.router.navigate(['resetpassword'], { queryParams: user })
    }
}