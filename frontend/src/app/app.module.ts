import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AuthGuard } from './auth.guard';

import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar.component';
import { HomeComponent } from './home.component';
import { MandiComponent } from './mandi.component';
import { AiComponent } from './ai.component';
import { WeatherComponent } from './weather.component';
import { MyCropsComponent } from './my-crops.component';
import { CropDetailComponent } from './crop-detail.component';
import { BuyerDashboardComponent } from './buyer-dashboard.component';
import { AuthComponent } from './auth.component';
import { FooterComponent } from './footer.component';
import { SchemesComponent } from './schemes.component';

import { AuthService } from './auth.service';
import { ApiService } from './api.service';
import { AuthInterceptor } from './auth.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    HomeComponent,
    MandiComponent,
    AiComponent,
    WeatherComponent,
    MyCropsComponent,
    CropDetailComponent,
    BuyerDashboardComponent,
    AuthComponent,
    FooterComponent,
    SchemesComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot([
      { path: '', component: HomeComponent },
      { path: 'mandi', component: MandiComponent },
      { path: 'crops/:id', component: CropDetailComponent },
      { path: 'buyer-dashboard', component: BuyerDashboardComponent, canActivate: [AuthGuard] },
      { path: 'my-crops', component: MyCropsComponent, canActivate: [AuthGuard] },
      { path: 'ai', component: AiComponent, canActivate: [AuthGuard] },
      { path: 'weather', component: WeatherComponent, canActivate: [AuthGuard] },
      { path: 'schemes', component: SchemesComponent, canActivate: [AuthGuard] },
      { path: 'auth', component: AuthComponent },
      { path: '**', redirectTo: '' }
    ])
  ],
  providers: [
    AuthService,
    ApiService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
