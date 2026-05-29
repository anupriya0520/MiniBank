import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth';
import { PopupService } from '../../../../core/services/popup';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent implements OnInit {
  fb = inject(FormBuilder);
  authService = inject(AuthService);
  popupService = inject(PopupService);
  router = inject(Router);

  loginForm!: FormGroup;
  loading = false;
  showPassword = false;

  ngOnInit() {
  if (this.authService.isLoggedIn()) {
    const user = this.authService.getUser();
    if (user?.role === 'Admin') {
  this.router.navigate(['/admin/dashboard']);
} else {
  this.router.navigate(['/dashboard']);
}

  }

  this.loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });
}

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: (res: any) => {
  this.loading = false;
  this.authService.saveSession(res.data);

  if (res.data.role === 'Admin') {
    this.router.navigate(['/admin/dashboard']);
  } else {
    this.router.navigate(['/dashboard']);
  }
},
      error: (err: any) => {
        this.loading = false;
        this.popupService.error(
          'Login Failed',
          err?.error?.message || 'Invalid email or password.'
        );
      }
    });
  }
}