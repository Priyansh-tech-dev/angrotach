import { Component, OnInit } from '@angular/core';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'buyer-dashboard',
  template: `
  <section class="buyer-dash">
    <div class="dash-banner">
      <div class="banner-content">
        <h2>Welcome back, {{ auth.currentUser?.name }}!</h2>
        <p>Explore fresh crops and connect with farmers in {{ auth.currentUser?.district || 'your area' }}.</p>
      </div>
    </div>

    <div class="dashboard-grid">
      <!-- Quick Stats / Actions (Optional placeholder for future expansion) -->
      
      <!-- Favorites Section -->
      <div class="section-block">
        <div class="section-header">
           <h3><i class="fas fa-heart"></i> Your Saved Crops</h3>
           <a routerLink="/marketplace" class="btn-link">Browse Marketplace <i class="fas fa-arrow-right"></i></a>
        </div>
        
        <div class="grid-container" *ngIf="favorites.length > 0; else noFavs">
          <div class="crop-card" *ngFor="let crop of favorites" [routerLink]="['/crops', crop._id]">
             <div class="card-img">
               <img [src]="crop.imageUrl ? (apiBase + crop.imageUrl) : defaultImage" alt="{{crop.name}}">
               <span class="badge" [class.reserved]="crop.status==='reserved'">{{ crop.status | titlecase }}</span>
             </div>
             <div class="card-body">
               <h4>{{ crop.name }}</h4>
               <p class="farmer"><i class="fas fa-user-circle"></i> {{ crop.farmerName }}</p>
               <div class="price-tag">₹{{ crop.pricePerKg }}/kg</div>
             </div>
          </div>
        </div>
        <ng-template #noFavs>
          <div class="empty-state">
             <i class="far fa-heart"></i>
             <p>You haven't saved any crops yet.</p>
             <button routerLink="/marketplace" class="btn-primary">Explore Crops</button>
          </div>
        </ng-template>
      </div>

      <!-- Nearby Farmers Section -->
      <div class="section-block">
         <h3><i class="fas fa-map-marker-alt"></i> Farmers in {{ auth.currentUser?.district || 'Your District' }}</h3>
         <div class="farmers-list" *ngIf="false; else noFarmers">
             <!-- Placeholder for future farmer list integration -->
         </div>
         <ng-template #noFarmers>
            <div class="empty-card">
              <p>We are currently onboarding farmers in this district. Check back soon!</p>
            </div>
         </ng-template>
      </div>
    </div>
  </section>
  `,
  styles: [`
    .buyer-dash {
      padding: 30px 5%;
      min-height: 80vh;
      animation: fadeIn 0.5s ease;
    }

    .dash-banner {
      background: linear-gradient(135deg, #0984e3, #6c5ce7);
      padding: 40px;
      border-radius: 20px;
      color: white;
      margin-bottom: 40px;
      box-shadow: 0 10px 20px rgba(9, 132, 227, 0.3);
    }

    .banner-content h2 { margin: 0 0 10px; font-size: 2rem; }
    .banner-content p { margin: 0; opacity: 0.9; font-size: 1.1rem; }

    .section-block { margin-bottom: 50px; }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 25px;
      padding-bottom: 10px;
      border-bottom: 2px solid #f1f2f6;
    }

    .section-header h3 {
      font-size: 1.5rem;
      color: #2d3436;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .section-header h3 i { color: #e74c3c; }

    .btn-link {
       color: #0984e3;
       text-decoration: none;
       font-weight: 600;
       transition: 0.2s;
    }
    .btn-link:hover { color: #00b894; }

    .grid-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 25px;
    }

    .crop-card {
      background: white;
      border-radius: 15px;
      overflow: hidden;
      box-shadow: 0 5px 15px rgba(0,0,0,0.05);
      transition: all 0.3s ease;
      cursor: pointer;
      border: 1px solid #f1f2f6;
    }

    .crop-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 30px rgba(0,0,0,0.1);
    }

    .card-img {
      height: 160px;
      position: relative;
      background: #eee;
    }

    .card-img img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .badge {
      position: absolute;
      top: 10px;
      right: 10px;
      background: rgba(0,0,0,0.6);
      color: white;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 0.75rem;
      backdrop-filter: blur(4px);
    }
    .badge.reserved {
      background: rgba(255, 159, 67, 0.9);
      color: white;
    }

    .card-body { padding: 15px; }
    .card-body h4 { margin: 0 0 5px; font-size: 1.1rem; color: #2d3436; }
    .farmer { font-size: 0.9rem; color: #636e72; margin-bottom: 10px; }
    
    .price-tag {
      font-size: 1.2rem;
      font-weight: 700;
      color: #00b894;
    }

    .empty-state {
      text-align: center;
      padding: 50px;
      background: #fff;
      border-radius: 15px;
      border: 2px dashed #dfe6e9;
    }

    .empty-state i { font-size: 3rem; color: #dfe6e9; margin-bottom: 20px; }
    .empty-state p { color: #636e72; margin-bottom: 20px; font-size: 1.1rem; }

    .btn-primary {
      background: #0984e3;
      color: white;
      border: none;
      padding: 10px 25px;
      border-radius: 50px;
      font-weight: 600;
      cursor: pointer;
      transition: 0.3s;
    }
    .btn-primary:hover { background: #74b9ff; transform: translateY(-2px); }

    .empty-card {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 10px;
      color: #636e72;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class BuyerDashboardComponent implements OnInit {
  favorites: any[] = [];
  apiBase = environment.apiUrl;
  defaultImage = 'https://cdn-icons-png.flaticon.com/512/4151/4151796.png';

  constructor(public auth: AuthService, private api: ApiService) { }

  ngOnInit() {
    this.loadFavorites();
  }

  loadFavorites() {
    this.api.getFavorites().subscribe({
      next: (data) => this.favorites = data,
      error: () => this.favorites = []
    });
  }
}
