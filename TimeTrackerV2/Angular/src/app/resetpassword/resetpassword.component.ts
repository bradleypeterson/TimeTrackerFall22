import { Component, OnInit } from '@angular/core';
import {
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import CryptoES from 'crypto-es';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-resetpassword',
  templateUrl: './resetpassword.component.html',
  styleUrls: ['./resetpassword.component.css'],
})
export class ResetpasswordComponent implements OnInit {
  userID: number;
  resetForm!: UntypedFormGroup;
  errorMessage = '';
  busy = false;
  isAdmin = false;
  username = '';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Identify the profile being edited.
    // history.state also preserves the target when refreshing this page.
    const state = this.router.getCurrentNavigation()?.extras.state;
    this.userID = Number(
      state?.['userID'] ?? history.state?.userID
    );

    // The saved role controls the form's appearance only.
    // The backend independently checks the authenticated user's permissions.
    const user = JSON.parse(
      localStorage.getItem('currentUser') || '{}'
    );

    this.isAdmin = user.type === 'admin';
    this.username = user.username || '';
  }

  ngOnInit(): void {
    // Non-admin users must confirm their current password.
    // Admins can reset passwords through their verified admin session.
    this.resetForm = new UntypedFormGroup({
      currentPassword: new UntypedFormControl(
        '',
        this.isAdmin ? [] : [Validators.required]
      ),
      newPswd: new UntypedFormControl('', Validators.required),
      confirm: new UntypedFormControl('', Validators.required),
    });
  }

  onSubmit(): void {
    // Prevent duplicate requests while a password change is processing.
    if (this.busy) return;

    this.errorMessage = '';

    // Do not send a request without a valid target account.
    if (!Number.isSafeInteger(this.userID) || this.userID <= 0) {
      this.errorMessage =
        'Open Reset Password from the user’s profile.';
      return;
    }

    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      this.errorMessage = 'Complete all password fields.';
      return;
    }

    const { currentPassword, newPswd, confirm } =
      this.resetForm.value;

    // Catch typing mistakes before generating a hash or sending a request.
    if (newPswd !== confirm) {
      this.errorMessage = 'Your new passwords do not match.';
      return;
    }

    this.busy = true;

    const savePassword = (currentHash?: string) => {
      // Generate a fresh salt for the new password.
      // Keep the hashing settings compatible with the existing login flow.
      const salt = CryptoES.lib.WordArray.random(16).toString();
      const password = CryptoES.PBKDF2(newPswd, salt, {
        keySize: 512 / 32,
        iterations: 1000,
      }).toString();

      this.http.put<{ message: string }>(
        `${environment.apiURL}/api/resetPassword/${this.userID}`,
        {
          password,
          salt,
          currentPassword: currentHash,
        },
        // Send the session cookie so the backend can identify the requester.
        { withCredentials: true }
      ).subscribe({
        next: (data) => {
          this.busy = false;
          this.resetForm.reset();
          alert(data.message);
          this.NavigateBackToProfile();
        },
        error: (error) => this.handleError(error),
      });
    };

    // Admins skip current-password confirmation in the UI.
    // Changing localStorage cannot bypass the backend's admin permission check.
    if (this.isAdmin) {
      savePassword();
      return;
    }

    // Confirm the current password using its existing salt.
    // The new password receives a separate, newly generated salt.
    this.http.get<string>(
      `${environment.apiURL}/api/saltForUser/${encodeURIComponent(this.username)}`
    ).subscribe({
      next: (salt) => {
        const currentHash = CryptoES.PBKDF2(
          currentPassword,
          salt,
          {
            keySize: 512 / 32,
            iterations: 1000,
          }
        ).toString();

        savePassword(currentHash);
      },
      error: (error) => this.handleError(error),
    });
  }

  private handleError(error: any): void {
    // Allow another attempt, clear the current password, and show the error.
    this.busy = false;
    this.resetForm.controls['currentPassword'].reset('');
    this.errorMessage =
      error.error?.message || 'Unable to change the password.';
  }

  NavigateBackToProfile(): void {
    // Return to the same profile after saving or cancelling.
    this.router.navigate(['/profile'], {
      state: { userID: this.userID },
    });
  }
}