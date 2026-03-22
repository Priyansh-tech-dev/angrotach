import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getUsers() {
    return this.http.get<any[]>(this.apiUrl + '/api/admin/users');
  }

  getCrops() {
    return this.http.get<any[]>(this.apiUrl + '/api/admin/crops');
  }

  getAiLogs() {
    return this.http.get<any[]>(this.apiUrl + '/api/admin/aiqueries');
  }

  getWeatherLogs() {
    return this.http.get<any[]>(this.apiUrl + '/api/admin/weatherlogs');
  }

  blockUser(id: string, blocked: boolean) {
    return this.http.patch<any>(`${this.apiUrl}/api/admin/users/${id}/block`, { blocked });
  }

  deleteCrop(id: string) {
    return this.http.delete<any>(`${this.apiUrl}/api/admin/crops/${id}`);
  }
}
