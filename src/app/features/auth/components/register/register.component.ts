import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  onSubmit() {
    this.auth.register(this.form.getRawValue()).subscribe({
      next: (res) => {
        console.log('Response', res);
      },
    });
  }
}
