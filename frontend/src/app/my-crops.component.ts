import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

import { environment } from '../environments/environment';

@Component({
    selector: 'my-crops-page',
    template: `
  <section class="my-crops">
    <div class="section-header">
        <span>Farmer Dashboard</span>
        <h2>My Crop Listings</h2>
    </div>

    <div class="controls">
        <button class="btn-main" (click)="showAdd = !showAdd">
            {{ showAdd ? 'Close Form' : '+ Add New Crop' }}
        </button>
    </div>

    <!-- Add Crop Form -->
    <div *ngIf="showAdd" class="form-card">
      <h3>Add New Crop</h3>
      <div class="form-group">
        <label>Crop Name</label>
        <select [(ngModel)]="newCrop.name">
            <option value="">Select Crop</option>
            <option *ngFor="let c of cropOptions" [value]="c">{{ c }}</option>
        </select>
      </div>
      <div class="row">
        <div class="form-group half">
            <label>Price (₹/kg)</label>
            <input type="number" [(ngModel)]="newCrop.pricePerKg" />
        </div>
        <div class="form-group half">
            <label>Quantity (kg)</label>
            <input type="number" [(ngModel)]="newCrop.quantity" />
        </div>
      </div>
      <div class="row">
          <div class="form-group half">
            <label>District / Location</label>
            <select [(ngModel)]="newCrop.location">
                <option value="">Select District</option>
                <option *ngFor="let d of gujaratDistricts" [value]="d">{{ d }}</option>
            </select>
          </div>
          <div class="form-group half">
            <label>Quality Grade</label>
            <select [(ngModel)]="newCrop.quality">
                <option value="A">Grade A (Best)</option>
                <option value="B">Grade B (Medium)</option>
                <option value="C">Grade C (Standard)</option>
            </select>
          </div>
      </div>
      <div class="form-group">
        <label>Description (Optional)</label>
        <textarea [(ngModel)]="newCrop.description" rows="2"></textarea>
      </div>
      <div class="form-group">
        <label>Image</label>
        <input type="file" (change)="onImageSelected($event)" accept="image/*">
        <img *ngIf="previewImage" [src]="previewImage" class="img-preview">
      </div>
      <button class="btn-main" (click)="addCrop()">Save Crop</button>
    </div>

    <!-- Crops List -->
    <div class="crop-list">
        <div class="crop-row header" *ngIf="crops.length > 0">
            <div>Image</div>
            <div>Name</div>
            <div>Price/Qty</div>
            <div>Status</div>
            <div>Actions</div>
        </div>

        <div class="crop-row" *ngFor="let crop of crops">
            <div class="img-col">
                <img [src]="crop.imageUrl ? (apiBase + crop.imageUrl) : defaultImage" alt="Crop">
            </div>
            <div class="info-col">
                <strong>{{ crop.name }}</strong>
                <div class="small">{{ crop.location }}</div>
            </div>
            <div class="price-col">
                <div>₹{{ crop.pricePerKg }}/kg</div>
                <div class="small">{{ crop.quantity }} kg</div>
            </div>
            <div class="status-col">
                <select [(ngModel)]="crop.status" (change)="updateStatus(crop)"
                    [class]="'status-badge ' + crop.status">
                    <option value="available">Available</option>
                    <option value="reserved">Reserved</option>
                    <option value="sold">Sold</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>
            <div class="action-col">
                <ng-container *ngIf="crop.status === 'reserved'">
                    <button class="btn-icon confirm" (click)="confirmDeal(crop)" title="Confirm Deal">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn-icon reject" (click)="rejectDeal(crop)" title="Reject Deal">
                        <i class="fas fa-times"></i>
                    </button>
                </ng-container>
                <button class="btn-icon delete" (click)="deleteCrop(crop)" title="Delete" *ngIf="crop.status !== 'reserved'">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>

        <p *ngIf="crops.length === 0 && !loading" style="text-align:center;margin-top:20px;color:#666;">
            You haven't listed any crops yet.
        </p>
    </div>
  </section>
  `,
    styles: [`
    .my-crops { padding: 80px 20px; max-width: 1000px; margin: 0 auto; }
    .section-header { text-align: center; margin-bottom: 30px; }
    .section-header h2 { font-size: 2rem; color: #2c3e50; }
    .controls { display: flex; justify-content: flex-end; margin-bottom: 20px; }
    
    .form-card { background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-bottom: 30px; }
    .form-group { margin-bottom: 15px; }
    .form-group label { display: block; font-weight: 500; margin-bottom: 5px; color: #555; }
    .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 6px; }
    .row { display: flex; gap: 15px; }
    .half { flex: 1; }
    .img-preview { width: 100px; height: 100px; object-fit: cover; margin-top: 10px; border-radius: 6px; }

    .crop-list { display: flex; flex-direction: column; gap: 10px; }
    .crop-row { display: grid; grid-template-columns: 80px 2fr 1.5fr 1.5fr 80px; align-items: center; background: #fff; padding: 15px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); gap: 15px; }
    .crop-row.header { background: #f8f9fa; font-weight: bold; color: #666; box-shadow: none; border-bottom: 2px solid #eee; }
    .img-col img { width: 60px; height: 60px; border-radius: 8px; object-fit: cover; }
    .small { font-size: 0.85rem; color: #888; }
    
    .status-badge { padding: 6px 12px; border-radius: 20px; border: none; font-size: 0.9rem; cursor: pointer; font-weight: 500; outline: none; }
    .status-badge.available { background: #d4edda; color: #155724; }
    .status-badge.reserved { background: #fff3cd; color: #856404; }
    .status-badge.sold { background: #cce5ff; color: #004085; }
    .status-badge.cancelled { background: #f8d7da; color: #721c24; }

    .btn-icon { background: none; border: none; font-size: 1.1rem; cursor: pointer; padding: 8px; transition: 0.2s; border-radius: 50%; }
    .btn-icon.delete { color: #dc3545; }
    .btn-icon.delete:hover { background: #f8d7da; }
  `]
})
export class MyCropsComponent implements OnInit, OnDestroy {
    crops: any[] = [];
    loading = false;
    showAdd = false;
    apiBase = environment.apiUrl;
    defaultImage = 'https://cdn-icons-png.flaticon.com/512/4151/4151796.png';
    private intervalId: any;

    gujaratDistricts: string[] = [
        'Ahmedabad', 'Amreli', 'Anand', 'Aravalli', 'Banaskantha',
        'Bharuch', 'Bhavnagar', 'Botad', 'Chhota Udaipur', 'Dahod',
        'Dang', 'Devbhoomi Dwarka', 'Gandhinagar', 'Gir Somnath',
        'Jamnagar', 'Junagadh', 'Kheda', 'Kutch', 'Mahisagar',
        'Mehsana', 'Morbi', 'Narmada', 'Navsari', 'Panchmahal',
        'Patan', 'Porbandar', 'Rajkot', 'Sabarkantha', 'Surat',
        'Surendranagar', 'Tapi', 'Vadodara', 'Valsad'
    ];

    cropOptions: string[] = [
        'Wheat (Gehu)', 'Rice (Chawal)', 'Cotton (Kapas)', 'Groundnut (Mungfali)',
        'Castor (Erenda)', 'Cumin (Jeera)', 'Sesame (Tal)', 'Bajra (Pearl Millet)',
        'Maize (Makai)', 'Tuver (Pigeon Pea)', 'Chana (Chickpea)', 'Mustard (Raydo)',
        'Sugarcane (Sherdi)', 'Onion (Dungri)', 'Potato (Batata)', 'Tomato (Tameta)',
        'Garlic (Lagan)', 'Mango (Keri)', 'Banana (Kela)', 'Pomegranate (Dadam)'
    ];

    newCrop: any = {
        name: '',
        pricePerKg: null,
        quantity: null,
        location: '',
        description: ''
    };
    selectedImage: File | null = null;
    previewImage: string | null = null;

    constructor(private api: ApiService, private auth: AuthService, private toast: ToastService) { }

    ngOnInit() {
        if (this.auth.currentUser?.role !== 'farmer') {
            this.toast.show('Warning: You are not logged in as a Farmer', 'error');
            return;
        }
        this.loadmyCrops();
        // Auto-refresh every 5 seconds
        this.intervalId = setInterval(() => {
            this.loadmyCrops(true);
        }, 5000);
    }

    ngOnDestroy() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }

    loadmyCrops(background = false) {
        if (!background) this.loading = true;
        this.api.getMyCrops().subscribe({
            next: (data) => {
                this.crops = data;
                this.loading = false;
            },
            error: (err) => {
                console.error('Load crops error:', err);
                this.loading = false;
            }
        });
    }

    onImageSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.selectedImage = file;
            const reader = new FileReader();
            reader.onload = () => this.previewImage = reader.result as string;
            reader.readAsDataURL(file);
        }
    }

    addCrop() {
        if (!this.newCrop.name || !this.newCrop.pricePerKg || !this.newCrop.quantity) {
            this.toast.show('Please fill required fields', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('name', this.newCrop.name);
        formData.append('pricePerKg', this.newCrop.pricePerKg);
        formData.append('quantity', this.newCrop.quantity);
        formData.append('location', this.newCrop.location || '');
        formData.append('description', this.newCrop.description || '');
        formData.append('quality', this.newCrop.quality || 'A');
        if (this.selectedImage) formData.append('image', this.selectedImage);

        this.api.addCropWithImage(formData).subscribe({
            next: () => {
                this.toast.show('Crop added successfully', 'success');
                this.showAdd = false;
                this.resetForm();
                this.loadmyCrops();
            },
            error: (err) => this.toast.show(err.error?.message || 'Failed to add crop', 'error')
        });
    }

    updateStatus(crop: any) {
        this.api.updateCropStatus(crop._id, crop.status).subscribe({
            next: () => this.toast.show('Status updated', 'success'),
            error: () => this.toast.show('Update failed', 'error')
        });
    }

    deleteCrop(crop: any) {
        if (!confirm(`Delete ${crop.name}? This cannot be undone.`)) return;

        this.api.deleteCrop(crop._id).subscribe({
            next: () => {
                this.toast.show('Crop deleted', 'success');
                this.loadmyCrops();
            },
            error: () => this.toast.show('Delete failed', 'error')
        });
    }

    confirmDeal(crop: any) {
        if (!confirm(`Confirm sale of ${crop.name} to the buyer?`)) return;
        this.api.confirmDeal(crop._id).subscribe({
            next: (res: any) => {
                this.toast.show('Deal Confirmed!', 'success');
                this.loadmyCrops();
            },
            error: () => this.toast.show('Failed to confirm', 'error')
        });
    }

    rejectDeal(crop: any) {
        if (!confirm(`Reject deal for ${crop.name}? It will become available again.`)) return;
        this.api.rejectDeal(crop._id).subscribe({
            next: (res: any) => {
                this.toast.show('Deal Rejected', 'info');
                this.loadmyCrops();
            },
            error: () => this.toast.show('Failed to reject', 'error')
        });
    }

    resetForm() {
        this.newCrop = { name: '', pricePerKg: null, quantity: null, location: '', description: '' };
        this.selectedImage = null;
        this.previewImage = null;
    }
}
