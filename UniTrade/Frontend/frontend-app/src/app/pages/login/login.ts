import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  username = '';
  password = '';

  usernameError = '';
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
    } else {
      this.usernameError = '';
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
    this.validatePassword();

    return !this.usernameError && !this.passwordError;
  }

  onLogin(): void {
    this.errorMessage = '';

    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;

    this.authService.login({
      username: this.username.trim(),
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

        if (error.error?.non_field_errors) {
          this.errorMessage = error.error.non_field_errors[0];
        } else if (error.error?.detail) {
          this.errorMessage = error.error.detail;
        } else {
          this.errorMessage = 'Invalid username or password';
        }
        this.cdr.detectChanges();
      }
    });
  }
}