import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ListingService } from '../../services/listing';
import { Favorite } from '../../models/favorite';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './favorites.html',
  styleUrl: './favorites.css'
})
export class FavoritesComponent implements OnInit {
  favorites: Favorite[] = [];
  errorMessage = '';
  isLoading = true;

  constructor(
    private listingService: ListingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.listingService.getFavorites().subscribe({
      next: (data) => {
        console.log('FAVORITES DATA:', data);
        this.favorites = data || [];
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log('FAVORITES ERROR:', error);
        this.errorMessage = 'Failed to load favorites';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  removeFavorite(listingId: number): void {
    this.listingService.removeFromFavorites(listingId).subscribe({
      next: () => {
        this.loadFavorites();
      },
      error: (error) => {
        console.log('REMOVE FAVORITE ERROR:', error);
        this.errorMessage = 'Failed to remove favorite';
        this.cdr.detectChanges();
      }
    });
  }

  getImageUrl(favorite: any): string {
    if (favorite?.listing?.image) {
      if (favorite.listing.image.startsWith('http')) {
        return favorite.listing.image;
      }
      return `http://127.0.0.1:8000${favorite.listing.image}`;
    }
    return 'https://via.placeholder.com/400x280?text=UniTrade';
  }
}