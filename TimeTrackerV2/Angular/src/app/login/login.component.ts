import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public errMsg = '';

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router,
    ) {}

  ngOnInit(): void {
  }
  checkoutForm = this.formBuilder.group({
    username: '',
    password: ''
  });

  onSubmit(): void {
    console.log("Username: "+this.checkoutForm.value['username'] + " | Password: " + this.checkoutForm.value['password']);

    let payload = {
      username: this.checkoutForm.value['username'],
      password: this.checkoutForm.value['password'],
    }

    this.http.post<any>('http://localhost:8080/login/', payload, {headers: new HttpHeaders({"Access-Control-Allow-Headers": "Content-Type"})}).subscribe({
      next: data => {
        this.errMsg = "";
        localStorage.setItem('currentUser', JSON.stringify(data['user']));
        this.router.navigate(['./dashboard']);
      },
      error: error => {
        this.errMsg = error['error']['message'];
      }
    });
  }
}
