import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  username = '';
  email = '';
  password = '';

  usernameError = '';
  emailError = '';
  passwordError = '';
  errorMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  validateUsername(): void {
    if (!this.username.trim()) {
      this.usernameError = 'Username is required';
    } else if (this.username.trim().length < 3) {
      this.usernameError = 'Username must be at least 3 characters';
    } else {
      this.usernameError = '';
    }
  }

  validateEmail(): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!this.email.trim()) {
      this.emailError = 'Email is required';
    } else if (!emailRegex.test(this.email)) {
      this.emailError = 'Enter a valid email address';
    } else {
      this.emailError = '';
    }
  }

  validatePassword(): void {
    if (!this.password.trim()) {
      this.passwordError = 'Password is required';
    } else if (this.password.length < 8) {
      this.passwordError = 'Password must be at least 8 characters';
    } else {
      this.passwordError = '';
    }
  }

  validateForm(): boolean {
    this.validateUsername();
    this.validateEmail();
    this.validatePassword();

    return !this.usernameError && !this.emailError && !this.passwordError;
  }

  onRegister(): void {
    this.errorMessage = '';

    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;

    this.authService.register({
      username: this.username.trim(),
      email: this.email.trim(),
      password: this.password
    }).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.authService.saveTokens(response.access, response.refresh);
        this.cdr.detectChanges();
        this.router.navigate(['/listings']);
      },
      error: (error) => {
        this.isLoading = false;

        if (error.error?.username) {
          this.errorMessage = error.error.username[0];
        } else if (error.error?.email) {
          this.errorMessage = error.error.email[0];
        } else if (error.error?.password) {
          this.errorMessage = error.error.password[0];
        } else if (error.error?.detail) {
          this.errorMessage = error.error.detail;
        } else {
          this.errorMessage = 'Registration failed. Please check your data.';
        }
        this.cdr.detectChanges();
      }
    });
  }
}