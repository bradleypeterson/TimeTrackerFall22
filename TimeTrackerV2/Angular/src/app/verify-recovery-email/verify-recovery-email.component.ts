import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-verify-recovery-email',
  standalone: false,
  templateUrl: './verify-recovery-email.component.html',
})
export class VerifyRecoveryEmailComponent {
  message = '';
  busy = false;
  verified = false;

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  verify(): void {
    if (this.busy || this.verified) return;

    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.message = 'The verification link is missing its token.';
      return;
    }

    this.busy = true;
    this.message = '';

    this.http.post<{ message: string }>(
      `${environment.apiURL}/api/recovery/verify-email`,
      { token }
    ).subscribe({
      next: (data) => {
        this.busy = false;
        this.verified = true;
        this.message = data.message;
      },
      error: (error) => {
        this.busy = false;
        this.message =
          error.error?.message || 'Unable to verify your email.';
      },
    });
  }
}
