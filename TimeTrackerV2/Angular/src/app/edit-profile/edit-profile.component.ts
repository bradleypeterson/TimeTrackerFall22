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
  public profile: any;

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

    this.editProfileForm.controls['pronouns'].setValue(this.profile.pronouns);
    this.editProfileForm.controls['bio'].setValue(this.profile.bio);
    this.editProfileForm.controls['contact'].setValue(this.profile.contact);
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

    this.http.post<any>('http://localhost:8080/api/editProfile/', payload, {headers: new HttpHeaders({"Access-Control-Allow-Headers": "Content-Type"})}).subscribe({
      next: data => {
        this.errMsg = "";
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
        this.profile = data;
        if (this.profile) {
          localStorage.setItem("user", JSON.stringify(this.profile));
        }
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });
  }

}