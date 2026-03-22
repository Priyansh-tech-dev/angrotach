import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private http: HttpClient) { }

  getMarketplaceCrops(name?: string, district?: string, minPrice?: number, maxPrice?: number, quality?: string, page: number = 1, limit: number = 10) {
    let params = new HttpParams();
    if (name) params = params.set('name', name);
    if (district) params = params.set('district', district);
    if (minPrice) params = params.set('minPrice', minPrice);
    if (maxPrice) params = params.set('maxPrice', maxPrice);
    if (quality) params = params.set('quality', quality);

    params = params.set('page', page);
    params = params.set('limit', limit);
    return this.http.get<any>(environment.apiUrl + '/api/marketplace/crops', { params });
  }

  getCropById(id: string) {
    return this.http.get<any>(environment.apiUrl + `/api/marketplace/crops/${id}`);
  }

  addCropWithImage(formData: FormData) {
    return this.http.post(environment.apiUrl + '/api/farmer/crops', formData);
  }

  getMyCrops() {
    return this.http.get<any[]>(environment.apiUrl + '/api/farmer/crops');
  }

  updateCropStatus(id: string, status: string) {
    return this.http.patch<any>(`${environment.apiUrl}/api/farmer/crops/${id}`, { status });
  }

  aiChat(message: string, language: string, image?: File) {
    if (image) {
      const formData = new FormData();
      formData.append('message', message);
      formData.append('language', language);
      formData.append('image', image);
      return this.http.post<any>(environment.apiUrl + '/api/ai/chat', formData);
    }
    return this.http.post<any>(environment.apiUrl + '/api/ai/chat', { message, language });
  }

  aiDiseaseText(symptoms: string) {
    return this.http.post<any>(environment.apiUrl + '/api/ai/disease-text', { symptoms });
  }

  getSellTimingAdvice(crop: string, location: string, language: string) {
    return this.http.post<any>(environment.apiUrl + '/api/ai/sell-timing', { crop, location, language });
  }

  checkSchemes(crop: string, location: string) {
    return this.http.post<any[]>(environment.apiUrl + '/api/schemes/check', { crop, location });
  }

  bookCrop(id: string) {
    return this.http.post(environment.apiUrl + `/api/marketplace/crops/${id}/book`, {});
  }

  confirmDeal(id: string) {
    return this.http.post(environment.apiUrl + `/api/farmer/crops/${id}/confirm`, {});
  }

  rejectDeal(id: string) {
    return this.http.post(environment.apiUrl + `/api/farmer/crops/${id}/reject`, {});
  }

  addFavorite(cropId: string) {
    return this.http.post(environment.apiUrl + `/api/favorites/${cropId}`, {});
  }

  removeFavorite(cropId: string) {
    return this.http.delete(environment.apiUrl + `/api/favorites/${cropId}`);
  }

  getFavorites() {
    return this.http.get<any[]>(environment.apiUrl + '/api/favorites');
  }

  addReview(targetId: string, rating: number, comment: string) {
    return this.http.post<any>(environment.apiUrl + '/api/reviews', { targetId, rating, comment });
  }

  getReviews(userId: string) {
    return this.http.get<any[]>(environment.apiUrl + `/api/reviews/${userId}`);
  }

  getWeather(lat?: number, lon?: number) {
    let params = new HttpParams();
    if (lat) params = params.set('lat', lat);
    if (lon) params = params.set('lon', lon);
    return this.http.get<any>(environment.apiUrl + '/api/weather/realtime', { params });
  }

  deleteCrop(id: string) {
    return this.http.delete(environment.apiUrl + `/api/farmer/crops/${id}`);
  }
}
