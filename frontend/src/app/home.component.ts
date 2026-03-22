import { Component } from '@angular/core';

@Component({
  selector: 'home-page',
  template: `
  <section class="hero">
    <div>
      <h1>AI Powered Farmer Support Portal</h1>
      <p>Smart Mandi marketplace, AI chatbot, disease diagnosis, and GPS-based weather in one farmer-friendly platform.</p>
      <a routerLink="/mandi" class="btn-main">Explore Smart Mandi</a>
    </div>
  </section>

  <section class="features">
    <div class="feature-card">
        <div class="icon-bg"><i class="fas fa-store"></i></div>
        <h3>Smart Mandi</h3>
        <p>Farmers list crops with transparent pricing. Buyers contact farmers directly via phone or WhatsApp.</p>
    </div>
    <div class="feature-card">
        <div class="icon-bg"><i class="fas fa-robot"></i></div>
        <h3>Kisan Sahayak AI</h3>
        <p>Ask doubts on crops, fertilizers, irrigation and get instant, farmer-friendly guidance in local language.</p>
    </div>
    <div class="feature-card">
        <div class="icon-bg"><i class="fas fa-cloud-sun-rain"></i></div>
        <h3>Smart Weather</h3>
        <p>GPS-based weather with simple advice on pesticide spray, irrigation and disease risk.</p>
    </div>
  </section>
  `
})
export class HomeComponent {}
