import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import CryptoES from 'crypto-es';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  public errMsg = '';

  checkoutForm = this.formBuilder.group({
    username: '',
    password: '',
  });

  constructor(
    private formBuilder: UntypedFormBuilder,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    localStorage.removeItem('currentUser');
    // if (!localStorage.getItem('foo')) {
    //     localStorage.setItem('foo', 'no reload');
    //     location.reload();
    // }
    // else {
    //     localStorage.removeItem('foo');
    // }
    this.defaultAdminCreated();
  }

  onSubmit(): void {
    if (!this.checkoutForm.valid) {
      this.errMsg = 'Missing required field';
      return;
    }
    this.defaultAdminCreated();
  }

  onSubmit(): void {

    if (!this.checkoutForm.valid) {
      this.errMsg = 'Missing required field';
      return;
    }
    //console.log("Username: " + this.checkoutForm.value['username'] + " | Password: " + this.checkoutForm.value['password']);

    let username = this.checkoutForm.value['username'];

    this.http
      .get<any>(`${environment.apiURL}/api/saltForUser/${username}`)
      .subscribe({
        next: (data) => {
          this.errMsg = '';
          const salt = data;
          const hashedPassword = CryptoES.PBKDF2(
            this.checkoutForm.value['password'],
            salt,
            { keySize: 512 / 32, iterations: 1000 }
          ).toString();

          let payload = {
            username: username,
            password: hashedPassword,
          };


          this.http
            .post<any>(`${environment.apiURL}/api/login/`, payload)
            .subscribe({
              next: (data) => {
                this.errMsg = '';
                localStorage.setItem(
                  'currentUser',
                  JSON.stringify(data['user'])
                );
                
                localStorage.setItem('userType', data['user']['type']);
                
                this.router.navigate(['./dashboard']); // ROUTED TO DASHBOARD
              },
              error: (error) => {
                this.errMsg = error['error']['message'];
              },
            });
        },
        error: (error) => {
          this.errMsg = error['error']['message'];
        },
      });
  }

  defaultAdminCreated(): void {
    this.http
      .get<any>(`${environment.apiURL}/api/defaultAdminCreated`)
      .subscribe({
        next: (defaultAdminCreated) => {
          this.errMsg = '';
          if (defaultAdminCreated) {
            console.log('Displaying default admin account created message');
            alert(
              'The default admin account has been created or enabled because there are no registered or enabled admins.'
            );
          }
        },
        error: (error) => {
          console.log(error);
          this.errMsg = error['error']['message'];
        },
      });
  }
}
