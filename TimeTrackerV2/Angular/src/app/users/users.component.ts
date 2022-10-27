import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  public users = [];

  constructor(
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.loadUsers(this.users);
  }

  public pageTitle = 'TimeTrackerV2 | Users'

  loadUsers(users: Array<String>) {
    this.http.get("http://localhost:8080/Users").subscribe((data: any) =>{ 
    for(let i = 0; i < data.length; i++) {
      users.push(data[i].username);
    }
  });
  }

}
