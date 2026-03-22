import { Component } from '@angular/core';

@Component({
    selector: 'app-footer',
    template: `
    <footer>
      <div class="footer-content">
          <div class="footer-col about">
              <h3>AgroTech AI</h3>
              <p>Empowering Indian farmers with cutting-edge AI, real-time market access, and direct buyer connections. We bridge the gap between technology and tradition for a sustainable future.</p>
          </div>
          
          <div class="footer-col links">
              <h3>Quick Links</h3>
              <ul>
                  <li><a routerLink="/">Home</a></li>
                  <li><a routerLink="/mandi">Smart Mandi</a></li>
                  <li><a routerLink="/ai">AI Assistant</a></li>
                  <li><a routerLink="/auth">Login / Register</a></li>
                  <li><a routerLink="/weather">Weather Insights</a></li>
              </ul>
          </div>

          <div class="footer-col contact">
              <h3>Contact Us</h3>
              <p><i class="fas fa-map-marker-alt"></i> 123, Green Tech Park, Gujarat, India</p>
              <p><i class="fas fa-envelope"></i> support&#64;agrotech.in</p>
              <p><i class="fas fa-phone-alt"></i> +91 999 888 7777</p>
              <div class="socials">
                  <a href="#"><i class="fab fa-facebook-f"></i></a>
                  <a href="#"><i class="fab fa-twitter"></i></a>
                  <a href="#"><i class="fab fa-instagram"></i></a>
                  <a href="#"><i class="fab fa-youtube"></i></a>
                  <a href="#"><i class="fab fa-linkedin-in"></i></a>
              </div>
          </div>

          <div class="footer-col newsletter">
              <h3>Stay Connected</h3>
              <p>Subscribe to our newsletter for latest updates on crop prices and farming tips.</p>
              <div class="email-box">
                  <input type="email" placeholder="Enter your email" />
                  <button><i class="fas fa-paper-plane"></i></button>
              </div>
          </div>
      </div>

      <div class="footer-bottom">
          <div class="copyright">
              &copy; 2025 <span>AgroTech</span>. All rights reserved.
          </div>
          <div class="legal-links">
               <a href="#">Privacy Policy</a> | <a href="#">Terms of Service</a> | <a href="#">Cookie Policy</a>
          </div>
      </div>
    </footer>
  `,
    styles: [`
   footer {
  background-color: #1a1a1a;
  color: #cfcfcf;
  padding-top: 15px;
  font-family: 'Poppins', sans-serif;
  border-top: 3px solid #00ca65;
}

/* ================== FOOTER CONTENT ================== */
.footer-content {
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 25px;
  padding: 0 15px 15px;
}

.footer-col h3 {
  color: #fff;
  margin-bottom: 12px;
  font-size: 1.05rem;
  font-weight: 500;
}

.footer-col p {
  line-height: 1.5;
  font-size: 0.85rem;
  margin-bottom: 10px;
  color: #aaa;
}

/* ================== LINKS ================== */
.footer-col ul {
  list-style: none;
  padding: 0;
}

.footer-col ul li {
  margin-bottom: 6px;
}

.footer-col ul li a {
  color: #aaa;
  text-decoration: none;
  font-size: 0.85rem;
  transition: color 0.2s ease;
}

.footer-col ul li a:hover {
  color: #00ca65;
}

/* ================== CONTACT ================== */
.contact p i {
  color: #00ca65;
  width: 18px;
  margin-right: 4px;
}

/* ================== SOCIAL ICONS ================== */
.socials {
  margin-top: 10px;
  display: flex;
  gap: 10px;
}

.socials a {
  width: 32px;
  height: 32px;
  background: #2a2a2a;
  color: #fff;
  text-align: center;
  line-height: 32px;
  border-radius: 4px;
  font-size: 0.85rem;
  transition: background 0.2s ease;
}

.socials a:hover {
  background: #00ca65;
}

/* ================== NEWSLETTER ================== */
.email-box {
  display: flex;
  background: #2b2b2b;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 10px;
}

.email-box input {
  flex: 1;
  background: transparent;
  border: none;
  padding: 8px 10px;
  color: #fff;
  font-size: 0.85rem;
  outline: none;
}

.email-box button {
  background: #00ca65;
  border: none;
  color: #fff;
  padding: 0 14px;
  font-size: 0.85rem;
  cursor: pointer;
}

.email-box button:hover {
  background: #00a050;
}

/* ================== FOOTER BOTTOM ================== */
.footer-bottom {
  background: #111;
  padding: 10px 15px;
  color: #888;
  font-size: 0.8rem;
  border-top: 1px solid #222;
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1100px;
  margin: 0 auto;
}

.footer-bottom span {
  color: #00ca65;
}

.footer-bottom a {
  color: #888;
  text-decoration: none;
  margin-left: 10px;
}

.footer-bottom a:hover {
  color: #00ca65;
}

/* ================== RESPONSIVE ================== */
@media (max-width: 768px) {
  .footer-content {
    gap: 15px;
  }

  .footer-bottom {
    flex-direction: column;
    gap: 6px;
    text-align: center;
  }
}

  `]
})
export class FooterComponent { }
