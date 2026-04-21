import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface AuthResponse {
  message: string;
  access: string;
  refresh: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8000/api';
  private platformId = inject(PLATFORM_ID);

  constructor(private http: HttpClient) {}

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  register(data: { username: string; email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register/`, data);
  }

  login(data: { username: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login/`, data);
  }

  logout(): Observable<any> {
    const refresh = this.isBrowser() ? sessionStorage.getItem('refresh') : null;
    return this.http.post(`${this.apiUrl}/logout/`, { refresh });
  }

  saveTokens(access: string, refresh: string): void {
    if (!this.isBrowser()) return;
    sessionStorage.setItem('access', access);
    sessionStorage.setItem('refresh', refresh);
  }

  clearTokens(): void {
    if (!this.isBrowser()) return;
    sessionStorage.removeItem('access');
    sessionStorage.removeItem('refresh');
  }

  getAccessToken(): string | null {
    if (!this.isBrowser()) return null;
    return sessionStorage.getItem('access');
  }

  getRefreshToken(): string | null {
    if (!this.isBrowser()) return null;
    return sessionStorage.getItem('refresh');
  }

  isAuthenticated(): boolean {
    if (!this.isBrowser()) return false;
    return !!sessionStorage.getItem('access');
  }
}