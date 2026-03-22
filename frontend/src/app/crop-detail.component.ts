import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

import { environment } from '../environments/environment';

@Component({
    selector: 'crop-detail-page',
    template: `
  <section class="crop-detail-section" *ngIf="crop">
    <div class="breadcrumb">
        <a routerLink="/mandi">Smart Mandi</a> &gt; <span>{{ crop.name }}</span>
    </div>

    <div class="detail-card">
        <div class="img-container">
            <img [src]="crop.imageUrl ? (apiBase + crop.imageUrl) : defaultImage" alt="Crop Image">
        </div>
        <div class="info-container">
            <h1>{{ crop.name }} <span class="badge-quality">{{ crop.quality || 'A' }}</span></h1>
            <div class="price">₹{{ crop.pricePerKg }} / kg</div>
            
            <div class="detail-row">
                <i class="fas fa-map-marker-alt"></i> 
                <strong>Location:</strong> {{ crop.location || 'Not specified' }}
            </div>
            <div class="detail-row">
                <i class="fas fa-weight-hanging"></i> 
                <strong>Quantity:</strong> {{ crop.quantity }} kg
            </div>
            <div class="detail-row">
                <i class="fas fa-user-tag"></i> 
                <strong>Farmer:</strong> {{ crop.farmerName || 'Unknown' }}
            </div>

            <div class="description" *ngIf="crop.description">
                <h3>Description</h3>
                <p>{{ crop.description }}</p>
            </div>

            <div class="actions">
                <button class="btn-main contact" *ngIf="auth.currentUser?.id !== crop.farmerId" (click)="contactFarmer()">
                    <i class="fab fa-whatsapp"></i> Chat with Farmer
                </button>
                
                <div *ngIf="auth.currentUser?.role === 'buyer'" style="margin-top:10px;display:flex;gap:10px;">
                    <ng-container *ngIf="crop.status === 'available'">
                        <button class="btn-main" style="background: #2ecc71" (click)="bookDeal()">
                            Book Deal
                        </button>
                    </ng-container>
                    
                    <ng-container *ngIf="crop.status === 'reserved'">
                        <button class="btn-main" disabled style="background: #ff9f43; cursor: not-allowed">
                            {{ crop.reservedBy === auth.currentUser?.id ? 'Reserved by You' : 'Reserved' }}
                        </button>
                    </ng-container>

                    <ng-container *ngIf="crop.status === 'sold'">
                         <button class="btn-main" disabled style="background: #ccc; cursor: not-allowed">
                            Sold Out
                        </button>
                    </ng-container>
                     <ng-container *ngIf="crop.status === 'cancelled'">
                         <button class="btn-main" disabled style="background: #e74c3c; cursor: not-allowed">
                            Cancelled
                        </button>
                    </ng-container>

                    <button class="btn-icon big-heart" (click)="toggleFavorite()" [class.active]="isFavorite">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>

                <div *ngIf="auth.currentUser?.id === crop.farmerId" class="owner-msg">
                    You listed this crop. Status: <strong>{{ crop.status }}</strong>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Reviews Section -->
    <div class="reviews-section" *ngIf="crop">
        <h3>Farmer Reviews</h3>
        
        <div class="rating-summary">
            <span class="avg-rating">{{ avgRating.toFixed(1) }} <i class="fas fa-star text-warning"></i></span>
            <span class="count">({{ reviews.length }} reviews)</span>
        </div>

        <div class="review-form" *ngIf="auth.isLoggedIn() && auth.currentUser?.id !== crop.farmerId && auth.currentUser?.role === 'buyer'">
            <h4>Write a Review</h4>
            <div class="stars">
                <i *ngFor="let s of [1,2,3,4,5]" class="fas fa-star" 
                   [class.filled]="newReview.rating >= s"
                   (click)="newReview.rating = s"></i>
            </div>
            <textarea [(ngModel)]="newReview.comment" placeholder="Share your experience..."></textarea>
            <button class="btn-main" (click)="submitReview()">Submit Review</button>
        </div>

        <div class="review-list">
            <div class="review-item" *ngFor="let review of reviews">
                <div class="review-header">
                    <strong>{{ review.reviewer?.name || 'User' }}</strong>
                    <span class="stars-display">
                        <i *ngFor="let s of [1,2,3,4,5]" class="fas fa-star" [class.filled]="review.rating >= s"></i>
                    </span>
                    <span class="date">{{ review.createdAt | date }}</span>
                </div>
                <p>{{ review.comment }}</p>
            </div>
            <p *ngIf="reviews.length === 0" class="no-reviews">No reviews for this farmer yet.</p>
        </div>
    </div>

  </section>

  <div *ngIf="!crop && !loading" class="not-found">
      <h2>Crop not found</h2>
      <button class="btn-main" routerLink="/mandi">Back to Mandi</button>
  </div>
  <div *ngIf="loading" class="loading">Loading details...</div>
  `,
    styles: [`
    .crop-detail-section { padding: 40px 20px; max-width: 1000px; margin: 0 auto; }
    .breadcrumb { margin-bottom: 20px; color: #666; font-size: 0.95rem; }
    .breadcrumb a { color: #2ecc71; text-decoration: none; }
    
    .detail-card { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; background: #fff; padding: 40px; border-radius: 16px; box-shadow: 0 5px 20px rgba(0,0,0,0.08); margin-bottom: 40px; }
    
    .img-container img { width: 100%; height: 400px; object-fit: cover; border-radius: 12px; }
    
    .info-container h1 { font-size: 2.2rem; margin-bottom: 10px; color: #2c3e50; }
    .price { font-size: 1.8rem; font-weight: bold; color: #27ae60; margin-bottom: 20px; }
    
    .detail-row { display: flex; align-items: center; gap: 10px; font-size: 1.1rem; margin-bottom: 12px; color: #555; }
    .detail-row i { color: #2ecc71; width: 25px; }
    
    .description { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
    .description h3 { font-size: 1.2rem; margin-bottom: 10px; color: #444; }
    .description p { line-height: 1.6; color: #666; }
    
    .badge-quality { background: #6f42c1; color: #fff; font-size: 1rem; padding: 4px 10px; border-radius: 6px; vertical-align: middle; margin-left: 10px; }
    
    .actions { margin-top: 30px; }
    .btn-main.contact { background: #25D366; width: 100%; text-align: center; font-size: 1.1rem; }
    .btn-main.contact:hover { background: #20bd5a; }
    
    .btn-icon.big-heart { background: #fff; border: 2px solid #e74c3c; color: #e74c3c; font-size: 1.5rem; width: 50px; height: 50px; border-radius: 50%; cursor: pointer; transition: 0.3s; display:flex; align-items:center; justify-content:center;}
    .btn-icon.big-heart.active { background: #e74c3c; color: #fff; }
    
    .owner-msg { padding: 15px; background: #f8f9fa; border: 1px solid #ddd; border-radius: 8px; text-align: center; color: #777; }

    .not-found, .loading { text-align: center; padding: 50px; }
    
    /* Reviews */
    .reviews-section { background: #fff; padding: 30px; border-radius: 16px; box-shadow: 0 5px 20px rgba(0,0,0,0.08); }
    .reviews-section h3 { margin-bottom: 20px; color: #333; }
    .rating-summary { font-size: 1.2rem; margin-bottom: 20px; }
    .avg-rating { font-weight: bold; font-size: 1.5rem; margin-right: 10px; }
    .text-warning { color: #f1c40f; }
    
    .review-form { background: #f9f9f9; padding: 20px; border-radius: 10px; margin-bottom: 30px; }
    .review-form h4 { margin-bottom: 15px; }
    .stars { margin-bottom: 15px; font-size: 1.2rem; cursor: pointer; }
    .stars i { color: #ddd; margin-right: 5px; }
    .stars i.filled { color: #f1c40f; }
    .review-form textarea { width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #ddd; height: 80px; margin-bottom: 10px; }
    
    .review-item { border-bottom: 1px solid #eee; padding: 15px 0; }
    .review-item:last-child { border-bottom: none; }
    .review-header { display: flex; align-items: center; gap: 10px; margin-bottom: 5px; }
    .review-header strong { font-size: 1.05rem; }
    .stars-display { font-size: 0.9rem; color: #f1c40f; }
    .stars-display i { margin-right: 2px; }
    .stars-display i:not(.filled) { color: #eee; }
    .date { color: #999; font-size: 0.85rem; margin-left: auto; }
    .no-reviews { text-align: center; color: #777; font-style: italic; margin-top: 20px; }

    @media (max-width: 768px) {
        .detail-card { grid-template-columns: 1fr; }
        .img-container img { height: 300px; }
    }
  `]
})
export class CropDetailComponent implements OnInit {
    crop: any = null;
    loading = true;
    apiBase = environment.apiUrl;
    defaultImage = 'https://cdn-icons-png.flaticon.com/512/4151/4151796.png';
    isFavorite = false;

    reviews: any[] = [];
    avgRating = 0;
    newReview = { rating: 5, comment: '' };

    constructor(
        private route: ActivatedRoute,
        private api: ApiService,
        public auth: AuthService,
        private toast: ToastService
    ) { }

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.api.getCropById(id).subscribe({
                next: (data) => {
                    this.crop = data;
                    this.checkFavorite(id);
                    this.loadReviews(data.farmerId);
                    this.loading = false;
                },
                error: () => {
                    this.loading = false;
                }
            });
        } else {
            this.loading = false;
        }
    }

    checkFavorite(cropId: string) {
        if (!this.auth.isLoggedIn() || this.auth.currentUser?.role !== 'buyer') return;
        this.api.getFavorites().subscribe(favs => {
            this.isFavorite = favs.some(c => c._id === cropId);
        });
    }

    loadReviews(userId: string) {
        this.api.getReviews(userId).subscribe({
            next: (data) => {
                this.reviews = data;
                if (data.length > 0) {
                    this.avgRating = data.reduce((acc, r) => acc + r.rating, 0) / data.length;
                }
            }
        });
    }

    submitReview() {
        if (!this.newReview.comment) {
            this.toast.show('Please enter a comment', 'error');
            return;
        }
        this.api.addReview(this.crop.farmerId, this.newReview.rating, this.newReview.comment).subscribe({
            next: (review) => {
                this.toast.show('Review submitted!', 'success');
                this.reviews.unshift(review); // Add to top
                // Recalculate avg
                const total = this.reviews.reduce((acc, r) => acc + r.rating, 0);
                this.avgRating = total / this.reviews.length;
                this.newReview = { rating: 5, comment: '' };
            },
            error: () => this.toast.show('Failed to submit review', 'error')
        });
    }

    toggleFavorite() {
        if (!this.auth.isLoggedIn()) {
            this.toast.show('Login to save favorites', 'error');
            return;
        }
        if (this.isFavorite) {
            this.api.removeFavorite(this.crop._id).subscribe(() => {
                this.isFavorite = false;
                this.toast.show('Removed from favorites', 'success');
            });
        } else {
            this.api.addFavorite(this.crop._id).subscribe(() => {
                this.isFavorite = true;
                this.toast.show('Added to favorites', 'success');
            });
        }
    }

    bookDeal() {
        if (!confirm(`Are you sure you want to book this crop? \n\nThis will mark it as Reserved and notify the farmer.`)) return;

        this.api.bookCrop(this.crop._id).subscribe({
            next: () => {
                this.crop.status = 'reserved';
                this.crop.reservedBy = this.auth.currentUser?.id;
                this.toast.show('Deal booked successfully! Farmer notified.', 'success');
            },
            error: (err) => this.toast.show(err.error?.message || 'Booking failed', 'error')
        });
    }

    contactFarmer() {
        if (!this.crop) return;
        if (confirm('Redirect to WhatsApp?')) {
            const text = encodeURIComponent('I am interested in your crop: ' + this.crop.name);
            let phone = (this.crop.farmerPhone || '').toString().replace(/\D/g, '');

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
