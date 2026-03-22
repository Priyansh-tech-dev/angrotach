import { Component, OnInit } from '@angular/core';
import { ApiService } from './api.service';
import { ToastService } from './toast.service';

@Component({
  selector: 'admin-users',
  template: `
  <div class="card">
    <h2>Users</h2>
    <p class="small">List of farmers, buyers and admins.</p>
    <table *ngIf="users.length > 0; else noUsers">
      <thead>
        <tr>
          <th>Name</th>
          <th>Phone</th>
          <th>Role</th>
          <th>District</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let u of users">
          <td>{{ u.name }}</td>
          <td>{{ u.phone }}</td>
          <td><span class="badge">{{ u.role }}</span></td>
          <td>{{ u.district || '-' }}</td>
          <td>
            <button class="btn-sm" [class.btn-danger]="!u.blocked" [class.btn-success]="u.blocked"
              (click)="toggleBlock(u)">
              {{ u.blocked ? 'Unblock' : 'Block' }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <ng-template #noUsers>
      <p class="small">No users found.</p>
    </ng-template>
  </div>
  `
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  constructor(private api: ApiService, private toast: ToastService) { }
  ngOnInit() {
    this.api.getUsers().subscribe(u => this.users = u);
  }

  toggleBlock(user: any) {
    const action = user.blocked ? 'Unblock' : 'Block';
    if (!confirm(`${action} user ${user.name}?`)) return;

    this.api.blockUser(user._id, !user.blocked).subscribe({
      next: (res) => {
        user.blocked = res.blocked;
        this.toast.show(`User ${user.name} is now ${user.blocked ? 'blocked' : 'active'}`, 'success');
      },
      error: () => this.toast.show('Failed to update user status', 'error')
    });
  }
}
