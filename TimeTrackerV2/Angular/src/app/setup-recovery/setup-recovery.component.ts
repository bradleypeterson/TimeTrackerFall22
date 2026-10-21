import { Component } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import CryptoES from 'crypto-es';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-setup-recovery',
  standalone: false,
  templateUrl: './setup-recovery.component.html',
})
export class SetupRecoveryComponent {
  message = '';
  busy = false;
  adminMode = false;
  targetUserID: number | null = null;

  form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
  });

  constructor(
    private fb: UntypedFormBuilder,
    private http: HttpClient,
    private route: ActivatedRoute
  ) {
    const target = this.route.snapshot.queryParamMap.get('userID');

    if (target !== null) {
      this.adminMode = true;
      this.targetUserID = Number(target);

      this.form.controls['username'].disable();
      this.form.controls['password'].disable();
    }
  }

  submit(): void {
    if (this.busy) return;
    this.message = '';

    if (this.form.invalid) {
      this.message = this.adminMode
        ? 'Enter a valid recovery email.'
        : 'Enter your username, current password, and recovery email.';
      return;
    }

    const email = String(this.form.value.email || '').trim();

    if (
      this.adminMode &&
      (!Number.isSafeInteger(this.targetUserID) || this.targetUserID! <= 0)
    ) {
      this.message = 'Open setup from the user’s profile.';
      return;
    }

    this.busy = true;

    if (this.adminMode) {
      this.sendRequest({ userID: this.targetUserID, email });
      return;
    }

    const username = this.form.value.username;
    const password = this.form.value.password;

    this.http.get<string>(
      `${environment.apiURL}/api/saltForUser/${encodeURIComponent(username)}`
    ).subscribe({
      next: (salt) => {
        const hashedPassword = CryptoES.PBKDF2(password, salt, {
          keySize: 512 / 32,
          iterations: 1000,
        }).toString();

        this.sendRequest({ username, password: hashedPassword, email });
      },
      error: (error) => this.handleError(error),
    });
  }

  private sendRequest(payload: object): void {
    this.http.post<{ message: string }>(
      `${environment.apiURL}/api/recovery/request-verification`,
      payload,
      { withCredentials: true }
    ).subscribe({
      next: (data) => {
        this.busy = false;
        this.form.controls['password'].reset('');
        this.message = data.message;
      },
      error: (error) => this.handleError(error),
    });
  }

  private handleError(error: any): void {
    this.busy = false;
    this.form.controls['password'].reset('');
    this.message =
      error.error?.message || 'Unable to send the verification email.';
  }
}
