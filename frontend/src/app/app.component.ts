import { Component } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-root',
  template: `
    <navbar></navbar>
    
    <div class="toast-container">
      <div *ngFor="let t of toasts" class="toast" [class.success]="t.type==='success'" [class.error]="t.type==='error'">
        {{ t.text }}
      </div>
    </div>

    <main>
      <router-outlet></router-outlet>
    </main>
    <app-footer></app-footer>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; min-height: 100vh; }
    main { padding-top: 75px; flex: 1; width: 100%; box-sizing: border-box; }
  `]
})
export class AppComponent {
  toasts: any[] = [];
  constructor(private toastService: ToastService) {
    this.toastService.toasts$.subscribe(t => this.toasts = t);
  }
}
