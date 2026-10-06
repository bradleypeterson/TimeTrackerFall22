import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  userType!: string;
  instructor: boolean = false;
  student: boolean = false;
  admin: boolean = false;
  nullType: boolean = false;
  name: string = '';
  userID: string = '';
  isNavbarExpanded = false;

  constructor (
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.loadCurrentUser();
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.loadCurrentUser());
  }

  loadCurrentUser(): void {
    const currentUser = localStorage.getItem('currentUser');
    const userData = currentUser ? JSON.parse(currentUser) : null;

    this.userType = userData?.type;
    this.userID = userData?.userID;
    this.instructor = false;
    this.student = false;
    this.admin = false;
    this.nullType = false;
    this.name = '';

    if (this.userType === 'admin') {
      this.admin = true;
      this.name = userData.firstName + ' ' + userData.lastName;
    }
    else if (this.userType === 'instructor') {
      this.instructor = true;
      this.name = userData.firstName + ' ' + userData.lastName;
    } else if (this.userType === 'student') {
      this.student = true;
      this.name = userData.firstName + ' ' + userData.lastName;
    } else {
      this.nullType = true;
    }
  }
  title = 'TimeTrackerV2';

  // Used for dropdown for View Profile and Logout
  onUserOptionChange(event: Event) {
    const selectedOption = (event.target as HTMLSelectElement).value;
  
    if (selectedOption === 'viewProfile') {
      this.ViewProfile();
    } else if (selectedOption === '#') {
      localStorage.removeItem('currentUser');
      this.router.navigate(['/']);
    }

    (event.target as HTMLSelectElement).selectedIndex = 0;
  }
  
  ViewProfile() {
    let state = {userID: this.userID};
    // navigate to the component that is attached to the url inside the [] and pass some information to that page by using the code described here https://stackoverflow.com/a/54365098
    // this navigation method allows you to view someone else's profile and then instantly navigate to your profile by pressing the "Profile" link in the navigation bar.
    // however, the only issue with this implementation is that it replaces the other user profile from this history.  I.E. if you go back a page from viewing your profile, you are taken to the page that you were at before viewing the other user’s profile.
    this.router.navigateByUrl('/', {skipLocationChange: true}).then(() => this.router.navigate(['/profile'], { state }));
  }
}
