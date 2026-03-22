import { Component, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

interface ChatMsg {
  from: 'user' | 'bot';
  text: string;
  image?: string | null;
}

@Component({
  selector: 'ai-page',
  template: `
  <section class="ai-section">
    <div class="section-header">
        <span>AI Chatbot</span>
        <h2>Kisan Sahayak – 24x7 Support</h2>
    </div>

    <div class="chat-container">
        <!-- New Tab Header -->
        <div class="mode-tabs">
          <button [class.active]="mode==='chat'" (click)="mode='chat'"> <i class="fas fa-comments"></i> Chat</button>
          <button [class.active]="mode==='advisor'" (click)="mode='advisor'"> <i class="fas fa-chart-line"></i> Sell Advisor</button>
        </div>

        <div class="chat-header">
            <div class="chat-header-info">
                <div class="bot-avatar"><i class="fas" [class.fa-robot]="mode==='chat'" [class.fa-calendar-check]="mode==='advisor'"></i></div>
                <div>
                    <div style="font-weight:600;" *ngIf="mode==='chat'">Kisan Sahayak</div>
                    <div style="font-weight:600;" *ngIf="mode==='advisor'">Sell-Timing Advisor</div>
                    <div class="small" *ngIf="mode==='chat'">Ask anything about crops, fertilizers or pests</div>
                    <div class="small" *ngIf="mode==='advisor'">AI analyzes demand, weather & season</div>
                </div>
            </div>
            

            <select [(ngModel)]="language" style="margin-right: 10px; padding: 5px; border-radius: 4px;">
              <option value="english">English</option>
              <option value="gujarati">Gujarati</option>
            </select>

            <span class="badge" *ngIf="auth.isLoggedIn(); else loginBadge">
              {{ auth.currentUser?.role | uppercase }} logged in
            </span>
            <ng-template #loginBadge>
              <span class="badge">Login to start</span>
            </ng-template>
        </div>
        
        <!-- CHAT MODE -->
        <ng-container *ngIf="mode==='chat'">
          <div class="chat-box" #scrollMe>
              <div *ngFor="let m of messages" class="msg" [ngClass]="m.from === 'user' ? 'user-msg' : 'bot-msg'">
                  <div *ngIf="m.image" class="msg-image-container">
                    <img [src]="m.image" class="msg-image" alt="Uploaded">
                  </div>
                  <div [innerHTML]="formatMsg(m.text)" *ngIf="m.text"></div>
              </div>
          </div>
          
          <div class="chat-input-area">
              <!-- Image Preview -->
              <div *ngIf="imagePreview" class="image-preview-bar">
                <div class="preview-item">
                  <img [src]="imagePreview">
                  <button class="btn-remove-img" (click)="removeImage()"><i class="fas fa-times"></i></button>
                </div>
              </div>

              <div class="input-row">
                <button class="btn-icon" (click)="fileInput.click()" [disabled]="loading" title="Upload Image">
                    <i class="fas fa-camera"></i>
                </button>
                <input #fileInput type="file" accept="image/*" (change)="onFileSelected($event)" hidden>
                
                <input [(ngModel)]="input" [disabled]="!auth.isLoggedIn() || loading" maxlength="500"
                    (keyup.enter)="send()"
                    placeholder="Type your question here..." />
                
                <button class="btn-send" (click)="send()" [disabled]="loading">
                  <i class="fas" [class.fa-paper-plane]="!loading" [class.fa-spinner]="loading" [class.fa-spin]="loading"></i>
                </button>
              </div>
          </div>
        </ng-container>

        <!-- ADVISOR MODE -->
        <div class="advisor-panel" *ngIf="mode==='advisor'">
          <div class="advisor-form" *ngIf="!advisorResult">
             <label>Crop Name</label>
             <input type="text" [(ngModel)]="advisorCrop" placeholder="e.g. Wheat, Tomato, Onion">
             
             <label>Location (Mandatory for Weather)</label>
             <input type="text" [(ngModel)]="advisorLocation" placeholder="e.g. Rajkot, Nashik">
             
             <button class="btn-advisor" (click)="getAdvice()" [disabled]="loading || !advisorCrop">
               <span *ngIf="!loading">Get AI Advice</span>
               <span *ngIf="loading"><i class="fas fa-spinner fa-spin"></i> Analyzing Market...</span>
             </button>
          </div>

          <div class="advisor-result" *ngIf="advisorResult">
             <h3><i class="fas fa-check-circle"></i> Best Selling Strategy</h3>
             <div class="result-content" [innerHTML]="formatMsg(advisorResult)"></div>
             <button class="btn-reset" (click)="advisorResult=null">Analyze Another Crop</button>
          </div>
        </div>

    </div>
  </section>
  `,
  styles: [`
    .mode-tabs {
      display: flex;
      border-bottom: 1px solid #ddd;
    }
    .mode-tabs button {
      flex: 1;
      padding: 15px;
      background: #f8f9fa;
      border: none;
      cursor: pointer;
      font-weight: 500;
      color: #666;
      border-bottom: 3px solid transparent;
      outline: none;
      transition: all 0.3s;
    }
    .mode-tabs button.active {
      background: white;
      color: #00b894;
      border-bottom-color: #00b894;
      font-weight: 600;
    }
    .advisor-panel {
      padding: 30px;
      min-height: 400px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .advisor-form {
      max-width: 400px;
      margin: 0 auto;
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    .advisor-form label {
      font-weight: 500;
      color: #2d3436;
      font-size: 0.9rem;
    }
    .advisor-form input {
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 1rem;
    }
    .btn-advisor {
      margin-top: 10px;
      padding: 14px;
      background: linear-gradient(135deg, #00b894 0%, #0984e3 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: transform 0.2s;
    }
    .btn-advisor:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0, 184, 148, 0.3); }
    .btn-advisor:disabled { opacity: 0.7; cursor: not-allowed; }

    .advisor-result {
      background: #f0fff4;
      border: 1px solid #b2f2bb;
      border-radius: 12px;
      padding: 25px;
    }
    .advisor-result h3 { color: #2d3436; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
    .advisor-result h3 i { color: #00b894; }
    .result-content { line-height: 1.6; color: #2d3436; }
    .btn-reset {
      margin-top: 20px;
      background: transparent;
      border: 1px solid #00b894;
      color: #00b894;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
    }
    .btn-reset:hover { background: #00b894; color: white; }

    .msg-image-container {
      margin-bottom: 5px;
    }
    .msg-image {
      max-width: 200px;
      max-height: 200px;
      border-radius: 8px;
      border: 2px solid rgba(255,255,255,0.2);
    }
    .chat-input-area {
      display: flex;
      flex-direction: column;
      gap: 0;
      padding: 0; 
      background: white; 
      border-top: 1px solid #eee;
    }
    .image-preview-bar {
      padding: 10px;
      background: #f8f9fa;
      border-bottom: 1px solid #eaeaea;
      display: flex;
      gap: 10px;
    }
    .preview-item {
      position: relative;
      width: 60px;
      height: 60px;
      border-radius: 6px;
      overflow: hidden;
      border: 1px solid #ccc;
    }
    .preview-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .btn-remove-img {
      position: absolute;
      top: 0; 
      right: 0;
      background: rgba(0,0,0,0.6);
      color: white;
      border: none;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 10px;
    }
    .input-row {
      display: flex;
      align-items: center;
      padding: 10px;
      gap: 10px;
    }
    .input-row input {
      flex: 1;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 20px;
      outline: none;
    }
    .btn-icon {
      background: #f1f2f6;
      border: none;
      color: #2d3436;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-icon:hover { background: #e1e2e6; color: #00b894; }
  `]
})
export class AiComponent implements AfterViewChecked {
  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;

  mode: 'chat' | 'advisor' = 'chat';

  // Chat vars
  input = '';
  language = 'gujarati';
  messages: ChatMsg[] = [
    { from: 'bot', text: 'Namaste! I am Kisan Sahayak. Login as farmer or buyer and ask your first question.' }
  ];

  // Advisor vars
  advisorCrop = '';
  advisorLocation = '';
  advisorResult: string | null = null;
  loading = false;

  selectedFile: File | null = null;
  imagePreview: string | null = null;

  constructor(public auth: AuthService, private api: ApiService, private toast: ToastService) { }

  ngAfterViewChecked() {
    if (this.mode === 'chat') {
      this.scrollToBottom();
    }
  }

  scrollToBottom(): void {
    try {
      if (this.myScrollContainer) {
        this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
      }
    } catch (err) { }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        this.toast.show('Image too large (max 5MB)', 'error');
        return;
      }
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.selectedFile = null;
    this.imagePreview = null;
  }

  formatMsg(text: string): string {
    if (!text) return '';

    // Bold: **text**
    let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Italic: *text* (careful with list items)
    // We'll handle list items first to avoid confusion if possible, or just be specific

    const lines = html.split('\n');
    let output = '';
    let inList = false;

    for (let line of lines) {
      let trimmed = line.trim();

      // Check for bullet points
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        if (!inList) {
          output += '<ul>';
          inList = true;
        }
        // Remove the bullet and wrap in li
        output += `<li>${trimmed.substring(2)}</li>`;
      } else {
        if (inList) {
          output += '</ul>';
          inList = false;
        }
        // Add line break for non-list items, but avoid excessive breaks
        if (trimmed.length > 0) {
          output += `<div>${trimmed}</div>`;
        }
      }
    }

    if (inList) output += '</ul>';

    return output;
  }

  send() {
    const text = this.input.trim();
    if (!text && !this.selectedFile) return;

    if (!this.auth.isLoggedIn()) {
      this.toast.show('Please login first.', 'error');
      return;
    }
    if (text.length > 500) {
      this.toast.show('Message too long (max 500 chars).', 'error');
      return;
    }

    const startMsg: ChatMsg = { from: 'user', text };
    if (this.imagePreview) {
      startMsg.image = this.imagePreview;
    }
    this.messages.push(startMsg);

    const currentImage = this.selectedFile || undefined; // Capture ref
    this.input = '';
    this.removeImage();
    this.loading = true;

    this.api.aiChat(text, this.language, currentImage).subscribe({
      next: res => {
        this.messages.push({ from: 'bot', text: res.reply || 'Sorry, I could not understand.', image: null });
        this.loading = false;
      },
      error: (err) => {
        console.error('AI Chat Error:', err);
        const errorMsg = err.error?.message || err.message || 'Error contacting AI service.';
        this.messages.push({ from: 'bot', text: `Error: ${errorMsg}`, image: null });
        this.loading = false;
      }
    });
  }

  getAdvice() {
    if (!this.auth.isLoggedIn()) {
      this.toast.show('Please login first.', 'error');
      return;
    }
    if (!this.advisorCrop) {
      this.toast.show('Please enter crop name.', 'error');
      return;
    }

    this.loading = true;
    this.api.getSellTimingAdvice(this.advisorCrop, this.advisorLocation, this.language).subscribe({
      next: (res) => {
        this.advisorResult = res.advice;
        this.loading = false;
      },
      error: (err) => {
        this.toast.show('Error getting advice.', 'error');
        this.loading = false;
      }
    });
  }
}
