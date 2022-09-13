import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Router} from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  public pageTitle = 'TimeTrackerV2 | Register'
  public errMsg = '';

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router,
  ) {}

  ngOnInit(): void {
  }

  registrationForm = this.formBuilder.group({
    username: '',
    firstName: '',
    lastName: '',
    password: '',
    repeatPassword: '',
  });

  onSubmit(): void {
    let payload = {
      username: this.registrationForm.value['username'],
      firstName: this.registrationForm.value['firstName'],
      lastName: this.registrationForm.value['lastName'],
      password: this.registrationForm.value['password'],
      repeatPassword: this.registrationForm.value['repeatPassword'],
    }

    this.http.post<any>('http://localhost:8080/register/', payload, {headers: new HttpHeaders({"Access-Control-Allow-Headers": "Content-Type"})}).subscribe({
      next: data => {
        this.errMsg = "";
        this.router.navigate(['./']);
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });
  }

}
