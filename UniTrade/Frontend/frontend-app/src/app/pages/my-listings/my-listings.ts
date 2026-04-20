import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ListingService } from '../../services/listing';
import { Listing } from '../../models/listing';

@Component({
  selector: 'app-my-listings',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './my-listings.html',
  styleUrl: './my-listings.css'
})
export class MyListingsComponent implements OnInit {
  listings: Listing[] = [];
  errorMessage = '';
  isLoading = true;

  constructor(private listingService: ListingService) {}

  ngOnInit(): void {
    this.loadMyListings();
  }

  loadMyListings(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.listingService.getMyListings().subscribe({
      next: (data) => {
        this.listings = data;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load your listings';
        this.isLoading = false;
      }
    });
  }

  deleteListing(id: number): void {
    if (!confirm('Are you sure you want to delete this listing?')) return;

    this.listingService.deleteListing(id).subscribe({
      next: () => {
        this.loadMyListings();
      },
      error: () => {
        this.errorMessage = 'Failed to delete listing';
      }
    });
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
}