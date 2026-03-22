import { Component, OnInit } from '@angular/core';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

import { environment } from '../environments/environment';

@Component({
  selector: 'mandi-page',
  template: `
  <section class="mandi">
    <div class="section-header">
        <span>Smart Mandi</span>
        <h2>Digital Marketplace for Crops</h2>
    </div>

    <div class="mandi-top">
        <div class="filters">
            <input type="text" [(ngModel)]="filterName" placeholder="Search crop">
            <select [(ngModel)]="filterDistrict">
                <option value="">All Districts</option>
                <option *ngFor="let d of gujaratDistricts" [value]="d">{{ d }}</option>
            </select>
            <!-- Advanced Filters -->
            <input type="number" [(ngModel)]="minPrice" placeholder="Min ₹" style="width:80px;">
            <input type="number" [(ngModel)]="maxPrice" placeholder="Max ₹" style="width:80px;">
            <select [(ngModel)]="filterQuality" style="width:100px;">
                <option value="">Quality</option>
                <option value="A">Grade A</option>
                <option value="B">Grade B</option>
                <option value="C">Grade C</option>
            </select>

            <button class="btn-main" style="padding:10px 20px;font-size:0.9rem;" (click)="load()">Filter</button>
        </div>
        <div *ngIf="auth.isLoggedIn()">
            <span class="pill">
              <i class="fas fa-user"></i>
              {{ auth.currentUser?.name }} ({{ auth.currentUser?.role }})
            </span>
        </div>
    </div>

    <div class="grid-container">
        <div class="product-card" *ngFor="let crop of crops" [routerLink]="['/crops', crop._id]" style="cursor:pointer;">
            <div class="tag">{{ crop.status === 'available' ? 'Available' : crop.status }}</div>
            <img class="product-img"
                 [src]="crop.imageUrl ? (apiBase + crop.imageUrl) : defaultImage"
                 alt="Crop">
            <div class="product-info">
                <h3>{{ crop.name }} <span class="badge-quality">{{ crop.quality || 'A' }}</span></h3>
                <div class="location"><i class="fas fa-map-marker-alt"></i> {{ crop.location || 'Not specified' }}</div>
                <div class="price-row">
                    <div class="price">₹{{ crop.pricePerKg }}/kg</div>
                    <div class="small">{{ crop.quantity }} kg</div>
                </div>

                <button class="btn-whatsapp" *ngIf="auth.currentUser?.id !== crop.farmerId" (click)="$event.stopPropagation(); contactFarmer(crop)">
                    <i class="fab fa-whatsapp"></i> WhatsApp Farmer
                </button>
            </div>
        </div>
    </div>
    
    <div class="pagination-controls" *ngIf="totalPages > 1" style="margin-top:20px;display:flex;justify-content:center;gap:10px;">
        <button [disabled]="page === 1" (click)="changePage(-1)">Previous</button>
        <span>Page {{ page }} of {{ totalPages }}</span>
        <button [disabled]="page === totalPages" (click)="changePage(1)">Next</button>
    </div>

    <p *ngIf="crops.length === 0" style="margin-top:1.5rem; text-align: center;">
      No crops found matching your criteria.
    </p>
  </section>
  `,
  styles: [`
    .badge-quality { background: #6f42c1; color: #fff; font-size: 0.7rem; padding: 2px 6px; border-radius: 4px; vertical-align: middle; margin-left: 5px; }
  `]
})
export class MandiComponent implements OnInit {
  crops: any[] = [];
  filterName = '';
  filterDistrict = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  filterQuality = '';

  // Pagination
  page = 1;
  limit = 10;
  total = 0;
  totalPages = 0;
  loading = false;

  apiBase = environment.apiUrl;
  defaultImage = 'https://cdn-icons-png.flaticon.com/512/4151/4151796.png';

  gujaratDistricts: string[] = [
    'Ahmedabad', 'Amreli', 'Anand', 'Aravalli', 'Banaskantha',
    'Bharuch', 'Bhavnagar', 'Botad', 'Chhota Udaipur', 'Dahod',
    'Dang', 'Devbhoomi Dwarka', 'Gandhinagar', 'Gir Somnath',
    'Jamnagar', 'Junagadh', 'Kheda', 'Kutch', 'Mahisagar',
    'Mehsana', 'Morbi', 'Narmada', 'Navsari', 'Panchmahal',
    'Patan', 'Porbandar', 'Rajkot', 'Sabarkantha', 'Surat',
    'Surendranagar', 'Tapi', 'Vadodara', 'Valsad'
  ];

  constructor(public auth: AuthService, private api: ApiService, private toast: ToastService) { }

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.api.getMarketplaceCrops(
      this.filterName,
      this.filterDistrict,
      this.minPrice || undefined,
      this.maxPrice || undefined,
      this.filterQuality,
      this.page,
      this.limit
    ).subscribe({
      next: (res: any) => {
        this.crops = res.data;
        this.total = res.total;
        this.totalPages = res.totalPages;
        this.loading = false;
      },
      error: () => {
        this.crops = [];
        this.loading = false;
      }
    });
  }

  changePage(delta: number) {
    this.page += delta;
    this.load();
  }

  contactFarmer(crop: any) {
    if (confirm('You are being redirected to WhatsApp to contact the farmer. Continue?')) {
      const text = encodeURIComponent('I am interested in your crop: ' + crop.name);
      let phone = (crop.farmerPhone || '').toString().replace(/\D/g, '');

      if (phone.length === 10) {
        phone = '91' + phone;
      } else if (phone.length < 10) {
        this.toast.show('Invalid farmer phone number', 'error');
        return;
      }

      const url = `https://wa.me/${phone}?text=${text}`;
      window.open(url, '_blank');
    }
  }
}
