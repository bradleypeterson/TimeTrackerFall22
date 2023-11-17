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
  public sameUser: boolean = false;

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

    // This will grab values from the state variable of the navigate function we defined while navigating to this page.  This solution was found here https://stackoverflow.com/a/54365098
    console.log(`State received: ${JSON.stringify(this.router.getCurrentNavigation()?.extras.state)}`);  // For debugging only
    this.profileID = this.router.getCurrentNavigation()?.extras.state?.userID;
  }

  ngOnInit(): void {

    // get user type
    var userType = this.currentUser.type;
    this.userID = this.currentUser.userID;
    if (userType === 'instructor') {
      this.instructor = true;
    } else if (userType === 'student') {
      this.student = true;
    }

    if(this.profileID == this.userID){
      this.sameUser = true;
    }

    this.loadProfile();

  }

  loadProfile(): void {
    this.http.get<any>(`https://localhost:8080/api/UserProfile/${this.profileID}`, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
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
}
