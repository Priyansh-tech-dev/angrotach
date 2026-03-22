import { Component } from '@angular/core';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

@Component({
    selector: 'schemes-page',
    template: `
  <section class="schemes-section">
    <div class="section-header">
        <span>Government Support</span>
        <h2>Schemes & Insurance Advisor</h2>
        <p>Find financial protection and subsidies for your crops.</p>
    </div>

    <div class="search-card">
        <div class="form-group">
            <label>Crop Name</label>
            <select [(ngModel)]="crop">
                <option value="" disabled selected>Select Crop</option>
                <option *ngFor="let c of commonCrops" [value]="c">{{ c }}</option>
            </select>
        </div>
        <div class="form-group">
            <label>District (Gujarat)</label>
            <select [(ngModel)]="location">
                <option value="" disabled selected>Select District</option>
                <option *ngFor="let district of gujaratDistricts" [value]="district + ', Gujarat'">{{ district }}</option>
            </select>
        </div>
        <button class="btn-check" (click)="checkSchemes()" [disabled]="loading || !crop || !location">
            <span *ngIf="!loading">Check Eligibility</span>
            <span *ngIf="loading"><i class="fas fa-spinner fa-spin"></i> Finding Schemes...</span>
        </button>
    </div>

    <div class="results-grid" *ngIf="schemes.length > 0">
        <div class="scheme-card" *ngFor="let s of schemes">
            <div class="scheme-icon"><i class="fas fa-landmark"></i></div>
            <h3>{{ s.name }}</h3>
            <div class="scheme-detail">
                <strong>Coverage:</strong> {{ s.coverage }}
            </div>
            <div class="scheme-detail">
                <strong>Benefits:</strong> {{ s.benefits }}
            </div>
            <a [href]="s.applyLink" target="_blank" class="btn-apply">View Details <i class="fas fa-external-link-alt"></i></a>
        </div>
    </div>
    
    <div class="no-results" *ngIf="schemes.length === 0 && !loading && searched">
        <p>No specific schemes found or AI could not process. Please try different keywords.</p>
    </div>

  </section>
  `,
    styles: [`
    .schemes-section {
        padding: 40px 5%;
        background: #f8f9fa;
        min-height: 90vh;
    }
    .section-header {
        text-align: center;
        margin-bottom: 40px;
    }
    .section-header span {
        color: #00b894;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1px;
        font-size: 0.9rem;
    }
    .section-header h2 {
        font-size: 2.2rem;
        color: #2d3436;
        margin: 10px 0;
    }
    .search-card {
        background: white;
        padding: 30px;
        border-radius: 16px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.05);
        max-width: 600px;
        margin: 0 auto 50px;
        display: flex;
        flex-direction: column;
        gap: 20px;
    }
    .form-group label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: #2d3436;
    }
    .form-group input, .form-group select {
        width: 100%;
        padding: 12px 15px;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 1rem;
        outline: none;
        transition: border-color 0.3s;
        background: white;
    }
    .form-group input:focus, .form-group select:focus {
        border-color: #00b894;
    }
    .btn-check {
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
    .btn-check:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0, 184, 148, 0.3); }
    .btn-check:disabled { opacity: 0.7; cursor: not-allowed; }

    .results-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 25px;
        max-width: 1000px;
        margin: 0 auto;
    }
    .scheme-card {
        background: white;
        border-radius: 12px;
        padding: 25px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.05);
        border-top: 4px solid #00b894;
        transition: transform 0.3s;
    }
    .scheme-card:hover { transform: translateY(-5px); }
    .scheme-icon {
        font-size: 2rem;
        color: #00b894;
        margin-bottom: 15px;
    }
    .scheme-card h3 {
        color: #2d3436;
        margin-bottom: 15px;
        font-size: 1.2rem;
    }
    .scheme-detail {
        margin-bottom: 10px;
        color: #636e72;
        font-size: 0.95rem;
        line-height: 1.5;
    }
    .scheme-detail strong { color: #2d3436; }
    .btn-apply {
        display: inline-block;
        margin-top: 15px;
        color: #0984e3;
        font-weight: 600;
        text-decoration: none;
        font-size: 0.95rem;
    }
    .btn-apply:hover { text-decoration: underline; }
    .no-results { text-align: center; color: #666; margin-top: 20px; }
  `]
})
export class SchemesComponent {
    crop = '';
    location = '';
    loading = false;
    schemes: any[] = [];
    searched = false;

    commonCrops = [
        "Wheat", "Rice", "Cotton", "Groundnut", "Sugarcane", "Bajra", "Jowar",
        "Maize", "Castor", "Tobacco", "Cumin", "Fennel", "Mango", "Banana"
    ];

    gujaratDistricts = [
        "Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch", "Bhavnagar",
        "Botad", "Chhota Udaipur", "Dahod", "Dang", "Devbhoomi Dwarka", "Gandhinagar",
        "Gir Somnath", "Jamnagar", "Junagadh", "Kheda", "Kutch", "Mahisagar", "Mehsana",
        "Morbi", "Narmada", "Navsari", "Panchmahal", "Patan", "Porbandar", "Rajkot",
        "Sabarkantha", "Surat", "Surendranagar", "Tapi", "Vadodara", "Valsad"
    ];

    constructor(private api: ApiService, private toast: ToastService, public auth: AuthService) { }

    checkSchemes() {
        if (!this.auth.isLoggedIn()) {
            this.toast.show('Please login first', 'error');
            return;
        }
        this.loading = true;
        this.schemes = [];
        this.searched = true;

        this.api.checkSchemes(this.crop, this.location).subscribe({
            next: (res) => {
                this.schemes = res;
                this.loading = false;
            },
            error: () => {
                this.toast.show('Failed to fetch schemes', 'error');
                this.loading = false;
            }
        });
    }
}
