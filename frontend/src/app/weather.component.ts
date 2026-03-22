import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

@Component({
  selector: 'weather-page',
  template: `
  <section class="weather-section">
    <div class="section-header">
        <span>Weather Advisory</span>
        <h2>Field-ready Climate Guidance</h2>
    </div>

    <div class="weather-container">
      
      <div *ngIf="alerts.length > 0" class="alerts-container">
        <h3><i class="fas fa-exclamation-triangle"></i> Active Risk Alerts</h3>
        <div *ngFor="let alert of alerts" class="alert-box" [class.critical]="alert.type==='critical'" [class.warning]="alert.type==='warning'">
            <div class="alert-title">{{ alert.title }}</div>
            <div class="alert-msg">{{ alert.message }}</div>
        </div>
      </div>

      <div class="weather-card current-card">
          <div class="weather-top">
              <div>
                  <h3>{{ location }}</h3>
                  <div class="small">Live Forecast</div>
              </div>
              <button class="btn-sm" (click)="loadWeather()">
                  <i class="fas fa-sync-alt"></i> Refresh
              </button>
          </div>
          
          <div class="main-temp">
              <span class="temp-big">{{ temperatureText }}</span>
              <span class="condition">{{ advice | slice:0:20 }}...</span>
          </div>

          <div class="weather-params">
              <div class="param-box">
                  <span class="label">Humidity</span>
                  <span class="val">{{ humidityText }}</span>
              </div>
              <div class="param-box">
                  <span class="label">Wind</span>
                  <span class="val">{{ windText }}</span>
              </div>
              <div class="param-box">
                  <span class="label">Rain Risk</span>
                  <span class="val">{{ rainText }}</span>
              </div>
          </div>

          <div class="advice-box">
              <h4><i class="fas fa-seedling"></i> Field Advice</h4>
              <p>{{ advice }}</p>
          </div>
      </div>

    </div>
  </section>
  `,
  styles: [`
    .weather-container {
      max-width: 600px;
      margin: 0 auto;
    }

    .weather-card {
      background: white;
      padding: 30px;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.04);
      margin-bottom: 20px;
    }

    .alerts-container { margin-bottom: 20px; }
    .alert-box { padding: 12px; border-radius: 8px; margin-bottom: 10px; border-left: 4px solid #ccc; font-size: 0.9rem; }
    .alert-box.critical { background: #fee; border-left-color: #e74c3c; color: #c0392b; }
    .alert-box.warning { background: #fff3e0; border-left-color: #f39c12; color: #e67e22; }
    .alert-title { font-weight: 700; display: block; margin-bottom: 2px; }

    .weather-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .weather-top h3 { margin: 0; font-size: 1.4rem; color: #333; }
    .small { font-size: 0.9rem; color: #777; }
    .btn-sm { padding: 6px 15px; border: 1px solid #eee; background: white; border-radius: 20px; cursor: pointer; font-size: 0.85rem; color: #555; }
    .btn-sm:hover { background: #f9f9f9; }

    .main-temp { text-align: center; margin: 20px 0 30px 0; }
    .temp-big { font-size: 4rem; font-weight: 800; color: #2c3e50; display: block; line-height: 1; }
    .condition { font-size: 1.1rem; color: #7f8c8d; font-weight: 500; }

    .weather-params { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 25px; }
    .param-box { background: #f8f9fa; padding: 15px; border-radius: 12px; text-align: center; }
    .param-box .label { display: block; font-size: 0.75rem; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px; }
    .param-box .val { font-size: 1.2rem; font-weight: 700; color: #333; }

    .advice-box { background: #e8f5e9; padding: 20px; border-radius: 12px; border: 1px solid #c8e6c9; }
    .advice-box h4 { margin: 0 0 10px 0; color: #2e7d32; font-size: 1.1rem; }
    .advice-box p { margin: 0; font-size: 0.95rem; color: #333; line-height: 1.5; }
  `]
})
export class WeatherComponent implements OnInit {
  location = 'Weather (Demo)';
  temperatureText = '–';
  humidityText = '–';
  windText = '–';
  rainText = '–';
  advice = '';
  alerts: any[] = [];

  constructor(private api: ApiService, public auth: AuthService, private router: Router) { }

  ngOnInit() {
    // Restrict access: Only Farmers allowed
    if (this.auth.isLoggedIn() && this.auth.currentUser?.role !== 'farmer') {
      alert('Access denied: Farmers only');
      this.router.navigate(['/']);
    } else {
      this.loadWeather();
    }
  }

  loadWeather() {
    if (!this.auth.isLoggedIn()) {
      alert('Login required.');
      return;
    }

    const fetchFromBackend = (lat?: number, lon?: number) => {
      this.api.getWeather(lat, lon).subscribe({
        next: data => {
          this.location = data.location || 'Your farm location';
          this.temperatureText = data.temperature + '°C';
          this.humidityText = data.humidity + '%';
          this.windText = data.windSpeed + ' km/h';
          this.rainText = data.rainChance + '%';
          this.advice = data.advice;
          this.alerts = data.alerts || [];
        },
        error: () => {
          this.advice = 'Error fetching weather from backend.';
        }
      });
    };

    if (navigator && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          fetchFromBackend(lat, lon);
        },
        () => {
          fetchFromBackend();
        }
      );
    } else {
      fetchFromBackend();
    }
  }

}
