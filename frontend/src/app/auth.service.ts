import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';

import { environment } from '../environments/environment';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: 'farmer' | 'buyer' | 'admin';
  district?: string;
}

@Injectable()
export class AuthService {
  private tokenKey = 'agrotechToken';
  private userKey = 'agrotechUser';
  currentUser: User | null = null;
  isLoggedIn$ = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {
    const token = localStorage.getItem(this.tokenKey);
    const userStr = localStorage.getItem(this.userKey);
    if (token && userStr) {
      try {
        this.currentUser = JSON.parse(userStr);
        this.isLoggedIn$.next(true);
      } catch {
        this.currentUser = null;
      }
    }
  }

  login(phone: string, password: string) {
    return this.http.post<any>(environment.apiUrl + '/api/auth/login', { phone, password }).pipe(
      tap(res => {
        if (res.user.role === 'admin') {
          throw new Error('Admins should log in via the Admin Portal.');
        }
        localStorage.setItem(this.tokenKey, res.token);
        localStorage.setItem(this.userKey, JSON.stringify(res.user));
        this.currentUser = res.user;
        this.isLoggedIn$.next(true);
      })
    );
  }

  register(payload: any) {
    return this.http.post(environment.apiUrl + '/api/auth/register', payload);
  }

  forgotPassword(phone: string) {
    return this.http.post(environment.apiUrl + '/api/auth/forgot-password', { phone });
  }

  resetPassword(phone: string, newPassword: string) {
    return this.http.post(environment.apiUrl + '/api/auth/reset-password', { phone, newPassword });
  }


  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUser = null;
    this.isLoggedIn$.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    if (this.isTokenExpired(token)) {
      this.logout();
      return false;
    }
    return true;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payloadBase64 = token.split('.')[1];
      if (!payloadBase64) return true;
      const decodedJson = atob(payloadBase64);
      const payload = JSON.parse(decodedJson);
      if (!payload.exp) return false; // No expiry set?
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (e) {
      return true;
    }
  }
}
