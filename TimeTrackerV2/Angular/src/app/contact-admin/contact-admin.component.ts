import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-contact-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './contact-admin.component.html',
})
export class ContactAdminComponent {
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder).nonNullable;
  readonly supportEmail = '';
  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    username: ['', Validators.maxLength(200)],
    replyEmail: ['', [Validators.required, Validators.email, Validators.maxLength(254)]],
    description: ['', [Validators.required, Validators.maxLength(2000)]],
  });
  busy = false;
  sent = false;
  error = '';

  submit(): void {
    if (this.busy || this.sent) return;
    for (const field of Object.values(this.form.controls)) {
      field.setValue(field.value.trim());
    }
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.error = 'Enter your name, a valid reply email, and a short description.';
      return;
    }

    this.busy = true;
    this.error = '';
    this.http.post(`${environment.apiURL}/api/account-help`, this.form.getRawValue()).subscribe({
      next: () => {
        this.busy = false;
        this.sent = true;
        this.form.reset();
      },
      error: (response) => {
        this.busy = false;
        this.error = response.error?.message || 'Could not submit your request. Please try again.';
      },
    });
  }
}
