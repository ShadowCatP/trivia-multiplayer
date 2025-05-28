import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  errorMessage: string | null = null;
  loading = false;

  form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  constructor() {
    this.form.valueChanges.subscribe(() => {
      this.errorMessage = null;
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.errorMessage = null;
    this.loading = true;

    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['']);
      },
      error: (err) => {
        this.loading = false;

        if (err.status === 401) {
          this.errorMessage = 'Invalid login or password';
        } else {
          this.errorMessage = 'Login failed. Please try again';
        }
      },
    });
  }
}
