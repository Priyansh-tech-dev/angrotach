import { Component, OnInit } from '@angular/core';
import { ApiService } from './api.service';

@Component({
  selector: 'admin-ai-logs',
  template: `
  <div class="card">
    <h2>AI Query Logs</h2>
    <p class="small">Last 200 AI chatbot conversations.</p>
    <table *ngIf="logs.length > 0; else noLogs">
      <thead>
        <tr>
          <th>User</th>
          <th>Question</th>
          <th>Reply</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let q of logs">
          <td>{{ q.userId?.name || 'Unknown' }}</td>
          <td>{{ q.question }}</td>
          <td>{{ q.reply }}</td>
          <td>{{ q.createdAt | date:'short' }}</td>
        </tr>
      </tbody>
    </table>
    <ng-template #noLogs>
      <p class="small">No AI logs yet.</p>
    </ng-template>
  </div>
  `
})
export class AiLogsComponent implements OnInit {
  logs: any[] = [];
  constructor(private api: ApiService) {}
  ngOnInit() {
    this.api.getAiLogs().subscribe(l => this.logs = l);
  }
}
