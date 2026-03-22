import { Component } from '@angular/core';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

@Component({
  selector: 'admin-root',
  template: `
    <ng-container *ngIf="auth.isLoggedIn(); else loginScreen">
      <navbar></navbar>
      
      <div class="toast-container">
        <div *ngFor="let t of toasts" class="toast" [class.success]="t.type==='success'" [class.error]="t.type==='error'">
          {{ t.text }}
        </div>
      </div>

      <div class="main-wrapper">
        <router-outlet></router-outlet>
      </div>
    </ng-container>
    <ng-template #loginScreen>
      <app-login></app-login>
    </ng-template>
  `
})
export class AdminAppComponent {
  toasts: any[] = [];
  constructor(public auth: AuthService, private toastService: ToastService) {
    this.toastService.toasts$.subscribe(t => this.toasts = t);
  }
}
