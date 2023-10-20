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
  public profileID: any;
  public errMsg = '';

  public instructor: boolean = false;
  public student: boolean = false;
  public userID: string = '';

  public currentUser: any;

  constructor(
    private http: HttpClient,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    const tempUser = localStorage.getItem('currentUser');
    if (!tempUser) {
      this.router.navigate(["/Login"]);
      return;
    }
    this.currentUser = JSON.parse(tempUser);
  }

  ngOnInit(): void {

    // get user type
    let currentUser = localStorage.getItem('currentUser');
    var userData = currentUser ? JSON.parse(currentUser) : null;
    var userType = userData.type;
    this.userID = userData.userID;
    if (userType === 'instructor') {
      this.instructor = true;
    } else if (userType === 'student') {
      this.student = true;
    }

    this.profileID = this.activatedRoute.snapshot.params['id']; // get profile id from URL

    this.loadProfile();

  }

  loadProfile(): void {
    this.http.get<any>(`http://localhost:8080/api/UserProfile/${this.profileID}`, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
      next: data => {
        console.log("Data returned");
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
}
