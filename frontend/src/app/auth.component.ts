import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

@Component({
  selector: 'auth-page',
  template: `
  <section class="auth-page-container">
    <div class="auth-card">
      

      <!-- Login View -->
      <div class="view-container" *ngIf="activeTab === 'login'">
        <div class="header-text">
          <h3>Welcome Back</h3>
          <p>Please enter your details to sign in.</p>
        </div>

        <form (ngSubmit)="doLogin()">
          <div class="form-group">
            <label>Phone Number</label>
            <input type="text" [(ngModel)]="loginPhone" name="loginPhone" placeholder="Enter your phone number" required>
          </div>
          
          <div class="form-group">
            <label>Password</label>
            <div class="password-wrapper">
              <input [type]="showLoginPass ? 'text' : 'password'" [(ngModel)]="loginPassword" name="loginPassword" placeholder="••••••••" required>
              <i class="fa-solid" [class.fa-eye]="!showLoginPass" [class.fa-eye-slash]="showLoginPass" (click)="showLoginPass = !showLoginPass"></i>
            </div>
          </div>

          <div class="form-options">
            <label class="remember-me">
              <input type="checkbox" [(ngModel)]="rememberMe" name="rememberMe">
              <span>Remember me</span>
            </label>
            <a href="javascript:void(0)" class="forgot-link" (click)="activeTab = 'forgot-password'">Forgot Password?</a>
          </div>

          <button type="submit" class="btn-primary">Log In</button>
        </form>
         <br>
        <p class="switch-view">
          Don't have an account? <a href="javascript:void(0)" (click)="activeTab = 'register'">Sign up</a>
        </p>
      </div>

      <!-- Registration View -->
      <div class="view-container" *ngIf="activeTab === 'register'">
        <div class="header-text">
          <h3>Create an Account</h3>
          <p>Join us to get started.</p>
        </div>

        <form (ngSubmit)="doRegister()">
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" [(ngModel)]="regName" name="regName" placeholder="e.g. John Doe" required>
          </div>
          
          <div class="form-group">
            <label>Phone Number</label>
            <input type="text" [(ngModel)]="regPhone" name="regPhone" placeholder="Enter your phone number" required>
          </div>

          <div class="form-row">
            <div class="form-group half">
              <label>Role</label>
              <select [(ngModel)]="regRole" name="regRole">
                <option value="farmer">Farmer</option>
                <option value="buyer">Buyer</option>
              </select>
            </div>
            <div class="form-group half">
              <label>District</label>
              <select [(ngModel)]="regDistrict" name="regDistrict" required>
                <option value="" disabled selected>Select District</option>
                <option *ngFor="let dist of gujaratDistricts" [value]="dist">{{ dist }}</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Password</label>
            <div class="password-wrapper">
              <input [type]="showRegPass ? 'text' : 'password'" [(ngModel)]="regPassword" name="regPassword" (input)="checkPasswordStrength()" placeholder="••••••••" required>
              <i class="fa-solid" [class.fa-eye]="!showRegPass" [class.fa-eye-slash]="showRegPass" (click)="showRegPass = !showRegPass"></i>
            </div>
            <div class="password-strength" *ngIf="regPassword">
              <div class="strength-bar" [ngClass]="strengthClass"></div>
              <span class="strength-text">{{ strengthText }}</span>
            </div>
          </div>
          
          <div class="form-group">
            <label>Confirm Password</label>
            <input [type]="showRegPass ? 'text' : 'password'" [(ngModel)]="regConfirmPassword" name="regConfirmPassword" placeholder="••••••••" required>
          </div>

          <div class="form-options">
            <label class="remember-me">
              <input type="checkbox" [(ngModel)]="acceptTerms" name="acceptTerms" required>
              <span>I agree to the <a href="javascript:void(0)">Terms & Conditions</a></span>
            </label>
          </div>

          <button type="submit" class="btn-primary">Create Account</button>
        </form>

        <p class="switch-view">
          Already have an account? <a href="javascript:void(0)" (click)="activeTab = 'login'">Log in</a>
        </p>
      </div>

      <!-- Forgot Password View (Step 1) -->
      <div class="view-container" *ngIf="activeTab === 'forgot-password'">
        <div class="header-text">
          <h3>Reset Password</h3>
          <p>Enter your phone number to receive a reset link.</p>
        </div>

        <form (ngSubmit)="doForgotPassword()">
          <div class="form-group">
            <label>Phone Number</label>
            <input type="text" [(ngModel)]="forgotPhone" name="forgotPhone" placeholder="Enter your phone number" required>
          </div>

          <button type="submit" class="btn-primary">Send Reset Link</button>
        </form>

        <p class="switch-view">
          Back to <a href="javascript:void(0)" (click)="activeTab = 'login'">Log in</a>
        </p>
      </div>

      <!-- Forgot Password View (Step 2 - Mocked) -->
      <div class="view-container" *ngIf="activeTab === 'reset-password'">
        <div class="header-text">
          <h3>Set New Password</h3>
          <p>Please enter your new password below.</p>
        </div>

        <form (ngSubmit)="doResetPassword()">
          <div class="form-group">
            <label>New Password</label>
            <input type="password" [(ngModel)]="resetPass" name="resetPass" placeholder="••••••••" required>
          </div>
          <div class="form-group">
            <label>Confirm New Password</label>
            <input type="password" [(ngModel)]="resetConfirmPass" name="resetConfirmPass" placeholder="••••••••" required>
          </div>

          <button type="submit" class="btn-primary">Update Password</button>
        </form>
      </div>

    </div>
  </section>
  `,
  styles: [`
    /* General styles, Inter font, #F9FAFB background */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    .auth-page-container {
      min-height: calc(100vh - 70px);
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #F9FAFB;
      font-family: 'Inter', sans-serif;
      padding: 2rem 1rem;
      box-sizing: border-box;
    }
    
    .auth-card {
      background: #FFFFFF;
      width: 100%;
      max-width: 440px;
      padding: 2.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
      border: 1px solid #E5E7EB;
      /* Animation for transitions */
      animation: fadeIn 0.4s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .brand {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 2rem;
      gap: 12px;
    }

    .logo-box {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #2563EB, #1D4ED8);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 1.2rem;
    }
    .logo-box::before {
      content: 'A';
    }

    .brand h2 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: #111827;
      letter-spacing: -0.025em;
    }

    .header-text {
      text-align: center;
      margin-bottom: 1.5rem;
    }

    .header-text h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.25rem;
      font-weight: 600;
      color: #111827;
    }

    .header-text p {
      margin: 0;
      font-size: 0.875rem;
      color: #6B7280;
    }

    .form-group {
      margin-bottom: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    .form-row {
      display: flex;
      gap: 1rem;
    }

    .form-group.half {
      flex: 1;
    }

    label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
    }

    input, select {
      width: 100%;
      padding: 0.625rem 0.75rem;
      border: 1px solid #D1D5DB;
      border-radius: 8px;
      font-size: 0.875rem;
      color: #111827;
      background-color: #fff;
      transition: all 0.2s ease;
      box-sizing: border-box;
      outline: none;
    }

    input:focus, select:focus {
      border-color: #2563EB;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }
    
    input::placeholder {
      color: #9CA3AF;
    }

    .password-wrapper {
      position: relative;
    }

    .password-wrapper i {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #9CA3AF;
      cursor: pointer;
      font-size: 1rem;
      transition: color 0.2s;
    }
    
    .password-wrapper i:hover {
      color: #4B5563;
    }
    
    .password-strength {
      margin-top: 0.375rem;
      font-size: 0.75rem;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .strength-bar {
      height: 4px;
      border-radius: 2px;
      flex: 1;
      background: #E5E7EB;
      overflow: hidden;
      position: relative;
    }
    
    .strength-bar::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      transition: width 0.3s ease, background-color 0.3s ease;
      width: 0%;
    }
    
    .strength-bar.weak::after { width: 33%; background-color: #EF4444; }
    .strength-bar.medium::after { width: 66%; background-color: #F59E0B; }
    .strength-bar.strong::after { width: 100%; background-color: #10B981; }
    
    .strength-text {
      font-weight: 500;
      min-width: 45px;
    }
    .strength-bar.weak + .strength-text { color: #EF4444; }
    .strength-bar.medium + .strength-text { color: #F59E0B; }
    .strength-bar.strong + .strength-text { color: #10B981; }

    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .remember-me {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
    }

    .remember-me input {
      width: 1rem;
      height: 1rem;
      margin: 0;
      accent-color: #2563EB;
      cursor: pointer;
    }

    .forgot-link, .remember-me a {
      font-size: 0.875rem;
      font-weight: 500;
      color: #2563EB;
      text-decoration: none;
      transition: color 0.2s;
    }
    
    .forgot-link:hover, .remember-me a:hover {
      color: #1D4ED8;
      text-decoration: underline;
    }

    .btn-primary {
      width: 100%;
      background-color: #2563EB;
      color: white;
      border: none;
      padding: 0.75rem;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-primary:hover {
      background-color: #1D4ED8;
      box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);
      transform: translateY(-1px);
    }
    
    .btn-primary:active {
      transform: translateY(0);
    }

    .divider {
      position: relative;
      text-align: center;
      margin: 1.5rem 0;
    }

    .divider::before {
      content: "";
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background-color: #E5E7EB;
      z-index: 1;
    }

    .divider span {
      position: relative;
      z-index: 2;
      background-color: #FFFFFF;
      padding: 0 0.5rem;
      font-size: 0.75rem;
      color: #9CA3AF;
      font-weight: 500;
    }

    .social-login {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .btn-social {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      background: white;
      border: 1px solid #D1D5DB;
      padding: 0.625rem;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      color: #374151;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .btn-social img {
      width: 1.25rem;
      height: 1.25rem;
    }
    
    .btn-social:hover {
      background: #F9FAFB;
      border-color: #D1D5DB;
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    }

    .switch-view {
      text-align: center;
      font-size: 0.875rem;
      color: #6B7280;
      margin: 0;
    }

    .switch-view a {
      color: #2563EB;
      font-weight: 500;
      text-decoration: none;
      transition: color 0.2s;
    }
    
    .switch-view a:hover {
      color: #1D4ED8;
      text-decoration: underline;
    }

    /* Mobile responsiveness */
    @media (max-width: 480px) {
      .auth-card {
        padding: 1.5rem;
        border-radius: 16px;
        box-shadow: none;
        border: none;
        background: transparent;
      }
      .auth-page-container {
        background: white;
        align-items: flex-start;
        padding-top: 2rem;
      }
      .form-row {
        flex-direction: column;
        gap: 0;
      }
      .social-login {
        flex-direction: column;
      }
    }
  `]
})
export class AuthComponent {
  activeTab: 'login' | 'register' | 'forgot-password' | 'reset-password' = 'login';

  loginPhone = '';
  loginPassword = '';
  rememberMe = false;

  regName = '';
  regPhone = '';
  regDistrict = '';
  regPassword = '';
  regConfirmPassword = '';
  regRole: 'farmer' | 'buyer' = 'farmer';
  acceptTerms = false;

  forgotPhone = '';
  resetPass = '';
  resetConfirmPass = '';

  // Password visibility
  showLoginPass = false;
  showRegPass = false;

  // Password strength
  strengthClass = '';
  strengthText = '';

  gujaratDistricts = [
    'Ahmedabad', 'Amreli', 'Anand', 'Aravalli', 'Banaskantha', 'Bharuch', 'Bhavnagar', 'Botad',
    'Chhota Udaipur', 'Dahod', 'Dang', 'Devbhoomi Dwarka', 'Gandhinagar', 'Gir Somnath', 'Jamnagar',
    'Junagadh', 'Kheda', 'Kutch', 'Mahisagar', 'Mehsana', 'Morbi', 'Narmada', 'Navsari',
    'Panchmahal', 'Patan', 'Porbandar', 'Rajkot', 'Sabarkantha', 'Surat', 'Surendranagar',
    'Tapi', 'Vadodara', 'Valsad'
  ];

  constructor(private auth: AuthService, private router: Router, private toast: ToastService) { }

  doLogin() {
    if (!this.loginPhone || !this.loginPassword) {
      this.toast.show('Please enter both phone and password.', 'error');
      return;
    }
    if (!/^\d{10}$/.test(this.loginPhone)) {
      this.toast.show('Please enter a valid 10-digit phone number.', 'error');
      return;
    }
    this.auth.login(this.loginPhone, this.loginPassword).subscribe({
      next: () => {
        this.toast.show('Login successful as ' + (this.auth.currentUser?.role || 'user'), 'success');
        this.router.navigate(['/']);
      },
      error: err => this.toast.show(err.error?.message || 'Login failed', 'error')
    });
  }

  doRegister() {
    if (!this.regName || !this.regPhone || !this.regPassword || !this.regConfirmPassword) {
      this.toast.show('Please fill all required fields.', 'error');
      return;
    }
    if (this.regPassword !== this.regConfirmPassword) {
      this.toast.show('Passwords do not match.', 'error');
      return;
    }
    if (!this.acceptTerms) {
      this.toast.show('You must accept the Terms & Conditions.', 'error');
      return;
    }
    if (!/^\d{10}$/.test(this.regPhone)) {
      this.toast.show('Please enter a valid 10-digit phone number.', 'error');
      return;
    }
    if (this.regPassword.length < 6) {
      this.toast.show('Password should be at least 6 characters.', 'error');
      return;
    }
    if (!/\d/.test(this.regPassword)) {
      this.toast.show('Password must contain at least one number.', 'error');
      return;
    }

    const payload = {
      name: this.regName,
      phone: this.regPhone,
      password: this.regPassword,
      role: this.regRole,
      district: this.regDistrict
    };

    this.auth.register(payload).subscribe({
      next: () => {
        this.toast.show('Registration successful. Now login.', 'success');
        this.activeTab = 'login';
      },
      error: err => this.toast.show(err.error?.message || 'Registration failed', 'error')
    });
  }

  doForgotPassword() {
    if (!this.forgotPhone || !/^\d{10}$/.test(this.forgotPhone)) {
      this.toast.show('Please enter a valid 10-digit phone number.', 'error');
      return;
    }
    this.auth.forgotPassword(this.forgotPhone).subscribe({
      next: () => {
        this.toast.show('Reset link sent! Redirecting to setup...', 'success');
        setTimeout(() => {
          this.activeTab = 'reset-password';
        }, 1500);
      },
      error: err => this.toast.show(err.error?.message || 'Failed to send reset link', 'error')
    });
  }

  doResetPassword() {
    if (!this.resetPass || !this.resetConfirmPass) {
      this.toast.show('Please enter the new password.', 'error');
      return;
    }
    if (this.resetPass !== this.resetConfirmPass) {
      this.toast.show('Passwords do not match.', 'error');
      return;
    }
    if (this.resetPass.length < 6 || !/\d/.test(this.resetPass)) {
      this.toast.show('Password must be at least 6 chars and contain a number.', 'error');
      return;
    }

    this.auth.resetPassword(this.forgotPhone, this.resetPass).subscribe({
      next: () => {
        this.toast.show('Password updated successfully. Please login.', 'success');
        setTimeout(() => {
          this.activeTab = 'login';
          this.loginPassword = '';
          this.forgotPhone = '';
          this.resetPass = '';
          this.resetConfirmPass = '';
        }, 1500);
      },
      error: err => this.toast.show(err.error?.message || 'Failed to reset password', 'error')
    });
  }

  checkPasswordStrength() {
    const val = this.regPassword;
    if (!val) {
      this.strengthClass = '';
      this.strengthText = '';
      return;
    }
    if (val.length < 6) {
      this.strengthClass = 'weak';
      this.strengthText = 'Weak';
    } else if (val.length >= 6 && /[a-zA-Z]/.test(val) && /\d/.test(val)) {
      if (val.length >= 8 && /[^a-zA-Z0-9]/.test(val)) {
        this.strengthClass = 'strong';
        this.strengthText = 'Strong';
      } else {
        this.strengthClass = 'medium';
        this.strengthText = 'Medium';
      }
    } else {
      this.strengthClass = 'weak';
      this.strengthText = 'Weak';
    }
  }
}
