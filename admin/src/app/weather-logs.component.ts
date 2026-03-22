import { Component, OnInit } from '@angular/core';
import { ApiService } from './api.service';

@Component({
  selector: 'admin-weather-logs',
  template: `
  <div class="card">
    <h2>Weather Logs</h2>
    <p class="small">Last 200 advisory generations.</p>
    <table *ngIf="logs.length > 0; else noLogs">
      <thead>
        <tr>
          <th>User</th>
          <th>Location</th>
          <th>Temp</th>
          <th>Humidity</th>
          <th>Rain %</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let w of logs">
          <td>{{ w.userId?.name || 'Unknown' }}</td>
          <td>{{ w.location }}</td>
          <td>{{ w.temperature }}°C</td>
          <td>{{ w.humidity }}%</td>
          <td>{{ w.rainChance }}%</td>
          <td>{{ w.createdAt | date:'short' }}</td>
        </tr>
      </tbody>
    </table>
    <ng-template #noLogs>
      <p class="small">No weather logs yet.</p>
    </ng-template>
  </div>
  `
})
export class WeatherLogsComponent implements OnInit {
  logs: any[] = [];
  constructor(private api: ApiService) {}
  ngOnInit() {
    this.api.getWeatherLogs().subscribe(l => this.logs = l);
  }
}
