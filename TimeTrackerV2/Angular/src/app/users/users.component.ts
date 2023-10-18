import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
    selector: 'app-users',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.css']
})

export class UsersComponent implements OnInit {
    users: Array<any> = [];

    constructor(
        private http: HttpClient,
        private router: Router,
    ) { }

    ngOnInit(): void {
        this.loadUsers(this.users);
    }

    public pageTitle = 'TimeTrackerV2 | Users'

    loadUsers(users: Array<object>) {
        this.http.get("http://localhost:8080/api/Users").subscribe((data: any) => {
            for (let i = 0; i < data.length; i++) {
                users.push({
                    name: data[i].firstName + " " + data[i].lastName,
                    username: data[i].username,
                    isActive: data[i].isActive,
                    type: data[i].type
                });
            }
        });
    }

    navToResetPassword(tag: any, body: any) {
        let user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        this.router.navigate(['resetpassword'], { queryParams: user })
    }
}