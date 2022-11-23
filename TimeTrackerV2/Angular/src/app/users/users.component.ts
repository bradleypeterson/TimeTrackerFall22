import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  public errMsg = '';
  
  users: any = [];

  constructor(
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  public pageTitle = 'TimeTrackerV2 | Users'

  loadUsers(): void {
    this.http.get<any>('http://localhost:8080/Users/', {headers: new HttpHeaders({"Access-Control-Allow-Headers": "Content-Type"})}).subscribe({
      next: data => {
        this.errMsg = "";
        console.log(data);
        this.users=data;
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });
  }

}
