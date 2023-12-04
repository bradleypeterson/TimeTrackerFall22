import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit {
  public errMsg = '';
  userID: string = '';
  public userProfile: any;
  public profileData: any;

  editProfileForm = this.formBuilder.group({
    pronouns: '',
    bio: '',
    contact: '',
    userID: '',
  });

  constructor(
    private formBuilder: UntypedFormBuilder,
    private http: HttpClient,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    // This will grab values from the state variable of the navigate function we defined inside the users.ts component in the function NavToResetPassword().  This solution was found here https://stackoverflow.com/a/54365098
    console.log(JSON.stringify(this.router.getCurrentNavigation()?.extras.state));
    this.userID = this.router.getCurrentNavigation()?.extras.state?.userID;
  }

  ngOnInit(): void {
    // set the edit page to the one for the current user
    this.loadProfile();
  }

  loadProfile(): void {
    this.http.get<any>(`https://localhost:8080/api/UserProfile/${this.userID}`, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
      next: data => {
        this.errMsg = "";
        this.profileData = data;
        if (this.profileData) {
          localStorage.setItem("userProfile", JSON.stringify(this.profileData));
          let temp = localStorage.getItem('userProfile');
          if(temp){
            const prof = JSON.parse(temp);  
            for(let profile of prof){
              if(Number(this.userID) === Number(profile.userID)){
                this.userProfile = profile;
              }
            }
            this.editProfileForm.controls['pronouns'].setValue(this.userProfile.pronouns);
            this.editProfileForm.controls['bio'].setValue(this.userProfile.bio);
            this.editProfileForm.controls['contact'].setValue(this.userProfile.contact);
          }
        }
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });
  }

  onSubmit(): void {
    let payload = {
      pronouns: this.editProfileForm.value['pronouns'],
      bio: this.editProfileForm.value['bio'],
      contact: this.editProfileForm.value['contact'],
      userID: this.userID,
    }

    console.log("onSubmit reached");

    this.http.post<any>('https://localhost:8080/api/EditProfile', payload, {headers: new HttpHeaders({"Access-Control-Allow-Headers": "Content-Type"})}).subscribe({
      next: data => {
        this.errMsg = "";
        console.log("data posted");
        this.NavigateBackToProfile();
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });
  }

  NavigateBackToProfile() {
    let state = {userID: this.userID};
    // navigate to the component that is attached to the url inside the [] and pass some information to that page by using the code described here https://stackoverflow.com/a/54365098
    this.router.navigate(['/profile'], { state });
  }
}