import { Component } from '@angular/core';
import { AuthService } from './auth.service';

@Component({
  selector: 'navbar',
  template: `
  <header class="fade-in">
    <div class="logo">
      <i class="fas fa-leaf"></i> AgroTech Admin
    </div>
    <nav>
      <ul>
        <li><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}"><i class="fas fa-chart-pie" style="margin-right:6px"></i>Dashboard</a></li>
        <li><a routerLink="/users" routerLinkActive="active"><i class="fas fa-users" style="margin-right:6px"></i>Users</a></li>
        <li><a routerLink="/crops" routerLinkActive="active"><i class="fas fa-seedling" style="margin-right:6px"></i>Crops</a></li>
        <li><a routerLink="/ai-logs" routerLinkActive="active"><i class="fas fa-robot" style="margin-right:6px"></i>AI Logs</a></li>
        <li><a routerLink="/weather-logs" routerLinkActive="active"><i class="fas fa-cloud-sun-rain" style="margin-right:6px"></i>Weather Logs</a></li>
        <li>
          <span class="pill">
            <i class="fas fa-user-shield"></i>
            {{ auth.currentUser?.name }} ({{ auth.currentUser?.role }})
          </span>
        </li>
        <li>
          <button class="btn-nav" (click)="logout()">
            <i class="fas fa-sign-out-alt"></i> Logout
          </button>
        </li>
      </ul>
    </nav>
  </header>
  `
})
export class NavbarComponent {
  constructor(public auth: AuthService) { }
  logout() { this.auth.logout(); }
}
