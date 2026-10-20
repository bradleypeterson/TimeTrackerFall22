import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import CryptoES from 'crypto-es';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  public showPassword = false;
  public errMsg = '';
  public successMsg = '';

  checkoutForm = this.formBuilder.group({
    username: '',
    password: '',
  });

  constructor(
    private formBuilder: UntypedFormBuilder,
    private http: HttpClient,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    localStorage.removeItem('currentUser');
    this.successMsg =
      this.router.getCurrentNavigation()?.extras.state?.successMsg ??
      history.state?.successMsg ??
      (this.activatedRoute.snapshot.queryParamMap.get('registration') ===
      'success'
        ? 'Registration successful. Please sign in.'
        : '');

    this.defaultAdminCreated();
  }

  onSubmit(): void {
    if (!this.checkoutForm.valid) {
      this.errMsg = 'Missing required field';
      return;
    }

    const username = this.checkoutForm.value['username'];

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

          const payload = {
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
                this.router.navigate(['./dashboard']);
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