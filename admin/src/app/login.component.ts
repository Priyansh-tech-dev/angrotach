import { Component } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  template: `
  <div class="auth-page fade-in">
    <div class="auth-card">
      <div class="auth-header">
        <i class="fas fa-shield-alt"></i>
        <h2>Admin Portal</h2>
        <p class="subtitle">Secure access for AgroTech administrators</p>
      </div>
      
      <form (ngSubmit)="doLogin()">
        <div class="input-group">
          <i class="fas fa-user icon-prefix"></i>
          <input type="text" class="input-premium" [(ngModel)]="userid" name="userid" placeholder="Admin ID" required [disabled]="isLoading">
        </div>
        
        <div class="input-group">
          <i class="fas fa-lock icon-prefix"></i>
          <input [type]="showPassword ? 'text' : 'password'" class="input-premium" [(ngModel)]="password" name="password" placeholder="Password" required [disabled]="isLoading">
          <i class="fas toggle-password" [class.fa-eye]="!showPassword" [class.fa-eye-slash]="showPassword" (click)="togglePassword()"></i>
        </div>
        
        <button class="btn-premium btn-block" type="submit" [disabled]="isLoading">
          <span *ngIf="isLoading" class="spinner"></span>
          {{ isLoading ? 'Authenticating...' : 'Sign In' }}
        </button>
      </form>
      <div style="text-align: center; margin-top: 25px;">
        <p class="small">Demo: admin-agro / Admin&#64;2026</p>
      </div>
    </div>
  </div>
  `
})
export class LoginComponent {
  userid = '';
  password = '';
  showPassword = false;
  isLoading = false;

  constructor(private auth: AuthService, private router: Router) { }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  doLogin() {
    if (!this.userid.trim()) {
      alert('Please enter a valid Admin ID.');
      return;
    }

    this.isLoading = true;
    this.auth.login(this.userid, this.password).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/']);
      },
      error: err => {
        this.isLoading = false;
        alert(err.error?.message || err.message || 'Login failed');
      }
    });
  }
}
