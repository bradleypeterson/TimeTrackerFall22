import { Component } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-forgot-password',
  standalone: false,
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent {
  message = '';
  busy = false;

  form = this.fb.group({
    username: ['', Validators.required],
  });

  constructor(
    private fb: UntypedFormBuilder,
    private http: HttpClient
  ) {}

  submit(): void {
    if (this.busy) return;

    const username = this.form.value.username;

    if (typeof username !== 'string' || !username.trim()) {
      this.message = 'Enter your username.';
      return;
    }

    this.busy = true;
    this.message = '';

    this.http.post<{ message: string }>(
      `${environment.apiURL}/api/recovery/request-reset`,
      { username }
    ).subscribe({
      next: (data) => {
        this.busy = false;
        this.message = data.message;
      },
      error: (error) => {
        this.busy = false;
        this.message =
          error.error?.message || 'Unable to request a reset link.';
      },
    });
  }
}
