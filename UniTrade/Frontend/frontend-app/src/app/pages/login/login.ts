import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { LanguageService } from '../../services/language';

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
    public langService: LanguageService,
    private cdr: ChangeDetectorRef
  ) {}

  validateUsername(): void {
    this.usernameError = !this.username.trim() ? this.langService.t('usernameRequired') : '';
  }

  validatePassword(): void {
    if (!this.password.trim()) {
      this.passwordError = this.langService.t('passwordRequired');
    } else if (this.password.length < 8) {
      this.passwordError = this.langService.t('passwordMinLength');
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
    if (!this.validateForm()) return;

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
          this.errorMessage = this.langService.t('invalidUsernameOrPassword');
        }
        this.cdr.detectChanges();
      }
    });
  }
}