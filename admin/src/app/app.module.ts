import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AdminAppComponent } from './app.component';
import { NavbarComponent } from './navbar.component';
import { LoginComponent } from './login.component';
import { DashboardComponent } from './dashboard.component';
import { UsersComponent } from './users.component';
import { CropsComponent } from './crops.component';
import { AiLogsComponent } from './ai-logs.component';
import { WeatherLogsComponent } from './weather-logs.component';

import { AuthService } from './auth.service';
import { ApiService } from './api.service';
import { AuthInterceptor } from './auth.interceptor';

@NgModule({
  declarations: [
    AdminAppComponent,
    NavbarComponent,
    LoginComponent,
    DashboardComponent,
    UsersComponent,
    CropsComponent,
    AiLogsComponent,
    WeatherLogsComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    RouterModule.forRoot([
      { path: 'login', component: LoginComponent },
      { path: '', component: DashboardComponent },
      { path: 'users', component: UsersComponent },
      { path: 'crops', component: CropsComponent },
      { path: 'ai-logs', component: AiLogsComponent },
      { path: 'weather-logs', component: WeatherLogsComponent },
      { path: '**', redirectTo: '' }
    ])
  ],
  providers: [
    AuthService,
    ApiService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AdminAppComponent]
})
export class AdminAppModule {}
