import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'navbar',
  template: `
  <header>
    <div class="container">
      <div class="logo">
        <i class="fas fa-seedling"></i> AgroTech
      </div>
      
      <button class="menu-toggle" (click)="toggleMenu()" [class.active]="isMenuOpen">
        <span></span>
        <span></span>
        <span></span>
      </button>

      <nav [class.open]="isMenuOpen">
        <ul>
          <li><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" (click)="closeMenu()">Home</a></li>
          
          <ng-container *ngIf="auth.currentUser?.role !== 'farmer'">
             <li><a routerLink="/mandi" routerLinkActive="active" (click)="closeMenu()">Smart Mandi</a></li>
          </ng-container>

          <li><a routerLink="/ai" routerLinkActive="active" (click)="closeMenu()">AI Assistant</a></li>

          <ng-container *ngIf="auth.currentUser?.role === 'farmer'">
             <li><a routerLink="/my-crops" routerLinkActive="active" (click)="closeMenu()">My Crops</a></li>
             <li><a routerLink="/weather" routerLinkActive="active" (click)="closeMenu()">Weather</a></li>
             <li><a routerLink="/schemes" routerLinkActive="active" (click)="closeMenu()">Schemes</a></li>
          </ng-container>

          <ng-container *ngIf="auth.currentUser?.role === 'buyer'">
             <li><a routerLink="/buyer-dashboard" routerLinkActive="active" (click)="closeMenu()">Dashboard</a></li>
          </ng-container>

          <!-- Auth Buttons -->
          <li *ngIf="!auth.isLoggedIn()" class="auth-item">
            <button class="btn-nav" routerLink="/auth" (click)="closeMenu()">Login / Register</button>
          </li>

          <li *ngIf="auth.isLoggedIn()" class="auth-item user-profile">
            <span class="pill">
              <i class="fas fa-user"></i>
              <span>{{ auth.currentUser?.name }}</span>
              <span class="role-badge">{{ auth.currentUser?.role }}</span>
            </span>
            <button class="btn-outline" (click)="logout()">Logout</button>
          </li>
        </ul>
      </nav>
      
      <!-- Backdrop for mobile -->
      <div class="backdrop" *ngIf="isMenuOpen" (click)="closeMenu()"></div>
    </div>
  </header>
  `,
  styles: [`
    header {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      z-index: 1000;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
      border-bottom: 1px solid rgba(0,0,0,0.05);
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
      height: 70px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .logo {
      font-size: 1.5rem;
      font-weight: 800;
      color: #2d3436;
      display: flex;
      align-items: center;
      gap: 10px;
      z-index: 1001;
    }
    
    .logo i { color: #00b894; }

    nav ul {
      display: flex;
      list-style: none;
      gap: 30px;
      align-items: center;
      margin: 0;
      padding: 0;
    }

    nav a {
      text-decoration: none;
      color: #2d3436;
      font-weight: 500;
      font-size: 0.95rem;
      transition: color 0.3s;
      position: relative;
    }

    nav a:hover, nav a.active {
      color: #00b894;
    }

    nav a.active::after {
      content: '';
      position: absolute;
      bottom: -4px;
      left: 0;
      width: 100%;
      height: 2px;
      background: #00b894;
    }

    .btn-nav {
      background: linear-gradient(135deg, #00b894 0%, #0984e3 100%);
      color: white;
      padding: 8px 20px;
      border-radius: 50px;
      border: none;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(0, 184, 148, 0.3);
      transition: transform 0.2s;
    }
    
    .btn-nav:hover { transform: translateY(-2px); }

    .btn-outline {
      background: transparent;
      border: 1px solid #e74c3c;
      color: #e74c3c;
      padding: 6px 15px;
      border-radius: 50px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
      margin-left: 10px;
    }

    .btn-outline:hover {
      background: #e74c3c;
      color: white;
    }

    .pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #f1f2f6;
      padding: 6px 12px;
      border-radius: 50px;
      font-size: 0.9rem;
      color: #2d3436;
    }

    .role-badge {
      background: #00b894;
      color: white;
      font-size: 0.7rem;
      padding: 2px 6px;
      border-radius: 10px;
      text-transform: uppercase;
    }

    /* Mobile Menu Toggle */
    .menu-toggle {
      display: none;
      flex-direction: column;
      gap: 5px;
      background: none;
      border: none;
      cursor: pointer;
      z-index: 1002;
    }

    .menu-toggle span {
      display: block;
      width: 25px;
      height: 3px;
      background: #2d3436;
      border-radius: 2px;
      transition: 0.3s;
    }

    /* Mobile Menu Styles */
    @media (max-width: 768px) {
      .menu-toggle { display: flex; }

      .menu-toggle.active span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
      .menu-toggle.active span:nth-child(2) { opacity: 0; }
      .menu-toggle.active span:nth-child(3) { transform: rotate(-45deg) translate(5px, -6px); }

      nav {
        position: fixed;
        top: 0;
        right: -100%;
        width: 70%;
        height: 100vh;
        background: white;
        padding-top: 80px;
        transition: 0.3s ease-in-out;
        box-shadow: -5px 0 15px rgba(0,0,0,0.1);
        z-index: 1000;
        display: flex;
        flex-direction: column;
      }

      nav.open { right: 0; }

      nav ul {
        flex-direction: column;
        width: 100%;
        gap: 0;
      }

      nav li {
        width: 100%;
        border-bottom: 1px solid #f1f2f6;
      }

      nav a {
        display: block;
        padding: 15px 25px;
        font-size: 1.1rem;
      }

      nav a.active::after { display: none; }
      nav a.active { background: #f0fff4; border-left: 4px solid #00b894; }

      .auth-item {
        margin-top: auto;
        padding: 20px;
        border: none;
        display: flex;
        flex-direction: column;
        gap: 15px;
        align-items: center;
      }
      
      .pill { width: 100%; justify-content: center; }

      .backdrop {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100vh;
        background: rgba(0,0,0,0.5);
        z-index: 999;
      }
    }
  `]
})
export class NavbarComponent {
  isMenuOpen = false;

  constructor(public auth: AuthService, private router: Router) { }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  logout() {
    this.closeMenu();
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
