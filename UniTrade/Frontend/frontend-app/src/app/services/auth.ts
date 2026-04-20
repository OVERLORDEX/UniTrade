import { Injectable } from '@angular/core';
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

  constructor(private http: HttpClient) {}

  register(data: { username: string; email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register/`, data);
  }

  login(data: { username: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login/`, data);
  }

  logout(): Observable<any> {
    const refresh = typeof window !== 'undefined' ? localStorage.getItem('refresh') : null;
    return this.http.post(`${this.apiUrl}/logout/`, { refresh });
  }

  saveTokens(access: string, refresh: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access', access);
      localStorage.setItem('refresh', refresh);
    }
  }

  clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
    }
  }

  isAuthenticated(): boolean {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('access');
    }
    return false;
  }
}