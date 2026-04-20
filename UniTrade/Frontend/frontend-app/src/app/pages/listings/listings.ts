import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ListingService } from '../../services/listing';
import { Listing } from '../../models/listing';
import { Category } from '../../models/category';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-listings',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './listings.html',
  styleUrl: './listings.css'
})
export class ListingsComponent implements OnInit {
  listings: Listing[] = [];
  categories: Category[] = [];

  selectedCategory = '';
  searchText = '';
  ordering = '';

  errorMessage = '';
  isLoading = true;

  constructor(
    private listingService: ListingService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.selectedCategory = params['category'];
      }
      this.loadCategories();
      this.loadListings();
    });
  }

  loadCategories(): void {
    this.listingService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: () => {
        this.errorMessage = 'Failed to load categories';
      }
    });
  }

  loadListings(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.listingService.getListings(
      this.selectedCategory,
      this.searchText,
      this.ordering
    ).subscribe({
      next: (data) => {
        this.listings = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load listings';
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.loadListings();
  }

  clearFilters(): void {
    this.selectedCategory = '';
    this.searchText = '';
    this.ordering = '';
    this.loadListings();
  }

  getImageUrl(listing: any): string {
    if (listing.image) {
      if (listing.image.startsWith('http')) {
        return listing.image;
      }
      return `http://127.0.0.1:8000${listing.image}`;
    }
    return 'https://via.placeholder.com/400x280?text=UniTrade';
  }

  toggleFavorite(listing: Listing, event: Event): void {
    event.stopPropagation();
    event.preventDefault();

    if (listing.is_favorited) {
      this.listingService.removeFromFavorites(listing.id).subscribe({
        next: () => {
          listing.is_favorited = false;
        },
        error: () => {
          alert('Failed to remove from favorites. Please log in.');
        }
      });
    } else {
      this.listingService.addToFavorites(listing.id).subscribe({
        next: () => {
          listing.is_favorited = true;
        },
        error: () => {
          alert('You need to log in to add to favorites');
        }
      });
    }
  }
}