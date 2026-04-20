import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Listing } from '../models/listing';
import { Category } from '../models/category';
import { Favorite } from '../models/favorite';
import { Profile } from '../models/profile';

@Injectable({
  providedIn: 'root'
})
export class ListingService {
  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories/`);
  }

  getListings(category?: string, search?: string, ordering?: string): Observable<Listing[]> {
    let url = `${this.apiUrl}/listings/`;
    const params: string[] = [];

    if (category) params.push(`category=${category}`);
    if (search) params.push(`search=${search}`);
    if (ordering) params.push(`ordering=${ordering}`);

    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    return this.http.get<Listing[]>(url);
  }

  getListingById(id: number): Observable<Listing> {
    return this.http.get<Listing>(`${this.apiUrl}/listings/${id}/`);
  }

  createListing(data: FormData): Observable<Listing> {
    return this.http.post<Listing>(`${this.apiUrl}/listings/`, data);
  }

  updateListing(id: number, data: FormData): Observable<Listing> {
    return this.http.put<Listing>(`${this.apiUrl}/listings/${id}/`, data);
  }

  deleteListing(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/listings/${id}/`);
  }

  getMyListings(): Observable<Listing[]> {
    return this.http.get<Listing[]>(`${this.apiUrl}/my-listings/`);
  }

  getFavorites(): Observable<Listing[]> {
    return this.http.get<Listing[]>(`${this.apiUrl}/favorites/`);
  }

  addToFavorites(listing_id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/favorites/`, { listing_id });
  }

  removeFromFavorites(listing_id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/favorites/${listing_id}/`);
  }

  getProfile(): Observable<Profile> {
    return this.http.get<Profile>(`${this.apiUrl}/profile/me/`);
  }

  updateProfile(data: any): Observable<Profile> {
    return this.http.patch<Profile>(`${this.apiUrl}/profile/me/`, data);
  }

  getComments(listingId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/listings/${listingId}/comments/`);
  }

  addComment(listingId: number, text: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/listings/${listingId}/comments/`, { text });
  }
}