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

  constructor(
    private formBuilder: UntypedFormBuilder,
    private http: HttpClient,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    let currentUser = localStorage.getItem('currentUser');
    var userData = currentUser ? JSON.parse(currentUser) : null;
    var userType = userData.type;
    this.userID = userData.userID;

    // set the edit page to the one for the current user
    this.loadProfile();
  }

  editProfileForm = this.formBuilder.group({
    pronouns: '',
    bio: '',
    contact: '',
    userID: '',
  });

  onSubmit(): void {
    let payload = {
      pronouns: this.editProfileForm.value['pronouns'],
      bio: this.editProfileForm.value['bio'],
      contact: this.editProfileForm.value['contact'],
      userID: this.userID,
    }

    console.log("onSubmit reached");

    this.http.post<any>('http://localhost:8080/api/EditProfile', payload, {headers: new HttpHeaders({"Access-Control-Allow-Headers": "Content-Type"})}).subscribe({
      next: data => {
        this.errMsg = "";
        console.log("data posted");
        this.router.navigate(['/dashboard/']);
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });
  }

  loadProfile(): void {
    this.http.get<any>(`http://localhost:8080/api/UserProfile/${this.userID}`, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
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

}