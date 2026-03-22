import { Component, OnInit } from '@angular/core';
import { ApiService } from './api.service';

@Component({
  selector: 'admin-dashboard',
  template: `
  <div class="fade-in">
  
    <!-- System Status Overview -->
    <div class="glass-card" style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; border-left: 4px solid var(--primary-dark);">
      <div>
        <h2 style="margin: 0; font-size: 1.5rem;">System Status: <span style="color: var(--primary-dark);">Healthy</span></h2>
        <p class="small" style="margin-top: 5px; color: var(--text-gray);">All services are operational. Last checked: Just now.</p>
      </div>
      <div>
        <i class="fas fa-check-circle" style="color: var(--primary-dark); font-size: 2.5rem;"></i>
      </div>
    </div>

    <!-- Quick Actions -->
    <div style="display: flex; gap: 15px; margin-bottom: 30px; flex-wrap: wrap;">
      <button class="btn-premium" routerLink="/users">
        <i class="fas fa-users" style="margin-right: 8px;"></i> Manage Users
      </button>
      <button class="btn-premium" style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);" routerLink="/crops">
        <i class="fas fa-seedling" style="margin-right: 8px;"></i> View Crops
      </button>
      <button class="btn-premium" style="background: white; color: var(--dark); border: 1px solid var(--glass-border); box-shadow: 0 4px 10px rgba(0,0,0,0.05);" routerLink="/ai-logs">
        <i class="fas fa-robot" style="margin-right: 8px;"></i> Inspect AI
      </button>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid">
      <div class="stat-box">
        <i class="fas fa-users stat-icon"></i>
        <div class="stat-label">Total Users</div>
        <div class="stat-value">{{ usersCount }}</div>
      </div>
      <div class="stat-box">
        <i class="fas fa-seedling stat-icon"></i>
        <div class="stat-label">Total Crops</div>
        <div class="stat-value">{{ cropsCount }}</div>
      </div>
      <div class="stat-box">
        <i class="fas fa-robot stat-icon"></i>
        <div class="stat-label">AI Queries Logged</div>
        <div class="stat-value">{{ aiCount }}</div>
      </div>
      <div class="stat-box">
        <i class="fas fa-cloud-sun-rain stat-icon"></i>
        <div class="stat-label">Weather Logs</div>
        <div class="stat-value">{{ weatherCount }}</div>
      </div>
    </div>
    
    <!-- AI Logs -->
    <div class="glass-card table-container">
      <h2 style="margin-bottom: 20px;"><i class="fas fa-history" style="color: var(--primary); margin-right: 10px;"></i>Recent AI Queries</h2>
      <div *ngIf="aiLogs.length > 0; else noAi">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Question</th>
              <th>Reply (short)</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let q of aiLogs | slice:0:5">
              <td style="font-weight: 500;">
                <i class="fas fa-user-circle" style="color: var(--text-gray); margin-right: 8px;"></i>
                {{ q.userId?.name || 'Unknown' }}
              </td>
              <td>{{ q.question }}</td>
              <td style="color: var(--text-gray);">{{ (q.reply || '').slice(0,60) }}...</td>
              <td><span class="pill">{{ q.createdAt | date:'short' }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
      <ng-template #noAi>
        <p class="small" style="padding: 20px 0; text-align: center; font-size: 1rem;">No AI logs yet.</p>
      </ng-template>
    </div>
  </div>
  `
})
export class DashboardComponent implements OnInit {
  usersCount = 0;
  cropsCount = 0;
  aiCount = 0;
  weatherCount = 0;
  aiLogs: any[] = [];

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.api.getUsers().subscribe(u => this.usersCount = u.length);
    this.api.getCrops().subscribe(c => this.cropsCount = c.length);
    this.api.getAiLogs().subscribe(a => {
      this.aiLogs = a;
      this.aiCount = a.length;
    });
    this.api.getWeatherLogs().subscribe(w => this.weatherCount = w.length);
  }
}
