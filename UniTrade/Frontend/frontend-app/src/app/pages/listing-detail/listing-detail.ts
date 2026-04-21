import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ListingService } from '../../services/listing';
import { Listing } from '../../models/listing';

@Component({
  selector: 'app-listing-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './listing-detail.html',
  styleUrl: './listing-detail.css'
})
export class ListingDetailComponent implements OnInit {
  listing: Listing | null = null;
  comments: any[] = [];
  commentText = '';
  errorMessage = '';
  isLoading = true;
  selectedRating = 0;

  constructor(
    private route: ActivatedRoute,
    private listingService: ListingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadListing(id);
    this.loadComments(id);
  }

  loadListing(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.listingService.getListingById(id).subscribe({
      next: (data) => {
        console.log('DETAIL DATA:', data);
        this.listing = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log('DETAIL ERROR:', error);
        this.errorMessage = 'Failed to load listing';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadComments(id: number): void {
    this.listingService.getComments(id).subscribe({
      next: (data) => {
        console.log('COMMENTS DATA:', data);
        this.comments = data || [];
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log('COMMENTS ERROR:', error);
      }
    });
  }

  addToFavorites(): void {
    if (!this.listing) return;

    this.listingService.addToFavorites(this.listing.id).subscribe({
      next: () => {
        alert('Added to favorites');
      },
      error: () => {
        alert('You need to log in first');
      }
    });
  }

  addComment(): void {
    if (!this.commentText.trim() || !this.listing) return;

    this.listingService.addComment(this.listing.id, this.commentText).subscribe({
      next: () => {
        this.commentText = '';
        this.loadComments(this.listing!.id);
      },
      error: () => {
        this.errorMessage = 'Failed to add comment';
        this.cdr.detectChanges();
      }
    });
  }

  rateListing(score: number): void {
  if (!this.listing) return;

  this.listingService.rateListing(this.listing.id, score).subscribe({
    next: () => {
      this.loadListing(this.listing!.id);
    },
    error: () => {
      alert('You need to log in first');
    }
  });
  }

  getImageUrl(listing: any): string {
    if (listing?.image) {
      if (listing.image.startsWith('http')) {
        return listing.image;
      }
      return `http://127.0.0.1:8000${listing.image}`;
    }
    return 'https://via.placeholder.com/700x500?text=UniTrade';
  }
}