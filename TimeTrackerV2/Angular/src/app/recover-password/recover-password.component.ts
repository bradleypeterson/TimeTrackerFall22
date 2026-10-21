import { Component } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import CryptoES from 'crypto-es';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-recover-password',
  standalone: false,
  templateUrl: './recover-password.component.html',
})
export class RecoverPasswordComponent {
  message = '';
  busy = false;
  completed = false;

  form = this.formBuilder.group({
    password: ['', Validators.required],
    confirmPassword: ['', Validators.required],
  });

  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  onSubmit(): void {
    if (this.busy || this.completed) return;
    this.message = '';

    const token = this.route.snapshot.queryParamMap.get('token');
    const { password, confirmPassword } = this.form.value;

    if (!token || !/^[a-f0-9]{64}$/.test(token)) {
      this.message = 'Invalid reset link. Request a new link.';
      return;
    }

    if (this.form.invalid || typeof password !== 'string') {
      this.message = 'Enter and confirm your new password.';
      return;
    }

    if (password !== confirmPassword) {
      this.message = 'Passwords do not match.';
      return;
    }

    const salt = CryptoES.lib.WordArray.random(16).toString();
    const hashedPassword = CryptoES.PBKDF2(password, salt, {
      keySize: 512 / 32,
      iterations: 1000,
    }).toString();

    this.busy = true;

    this.http.post<{ message: string }>(
      `${environment.apiURL}/api/recovery/reset-password`,
      { token, password: hashedPassword, salt }
    ).subscribe({
      next: (data) => {
        this.busy = false;
        this.completed = true;
        this.form.reset();
        this.message = data.message;
      },
      error: (error) => {
        this.busy = false;
        this.message =
          error.error?.message || 'Unable to reset your password.';
      },
    });
  }
}
