import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ListingService } from '../../services/listing';
import { Listing } from '../../models/listing';

@Component({
  selector: 'app-listing-detail',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './listing-detail.html',
  styleUrl: './listing-detail.css'
})
export class ListingDetailComponent implements OnInit {
  listing: Listing | null = null;
  comments: any[] = [];
  commentText = '';
  errorMessage = '';
  isLoading = true;
  isContactModalOpen = false;

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
        this.comments = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log('COMMENTS ERROR:', error);
      }
    });
  }

  addToFavorites(): void {
    if (!this.listing) return;

    if (this.listing.is_favorited) {
      this.listingService.removeFromFavorites(this.listing.id).subscribe({
        next: () => {
          if (this.listing) this.listing.is_favorited = false;
        },
        error: () => {
          alert('Failed to remove from favorites');
        }
      });
    } else {
      this.listingService.addToFavorites(this.listing.id).subscribe({
        next: () => {
          if (this.listing) this.listing.is_favorited = true;
        },
        error: () => {
          alert('You need to log in first');
        }
      });
    }
  }

  openContactModal(): void {
    if (!this.listing?.seller_contacts) {
      alert("Seller contacts are not available.");
      return;
    }
    this.isContactModalOpen = true;
  }

  closeContactModal(): void {
    this.isContactModalOpen = false;
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
      }
    });
  }

  getImageUrl(listing: any): string {
    if (listing && listing.image) {
      if (listing.image.startsWith('http')) {
        return listing.image;
      }
      return `http://127.0.0.1:8000${listing.image}`;
    }
    return 'https://via.placeholder.com/700x500?text=UniTrade';
  }
}