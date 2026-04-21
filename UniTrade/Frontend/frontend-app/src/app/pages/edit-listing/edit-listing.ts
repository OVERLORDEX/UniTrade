import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ListingService } from '../../services/listing';
import { Category } from '../../models/category';

@Component({
  selector: 'app-edit-listing',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './edit-listing.html',
  styleUrl: './edit-listing.css'
})
export class EditListingComponent implements OnInit {
  id!: number;

  title = '';
  description = '';
  price: number | null = null;
  condition = 'used';
  status = 'available';
  category_id = '';
  location = '';

  categories: Category[] = [];

  selectedImage: File | null = null;
  imagePreview: string | null = null;
  currentImageUrl: string | null = null;

  titleError = '';
  descriptionError = '';
  priceError = '';
  categoryError = '';
  errorMessage = '';
  isLoading = false;
  isPageLoading = true;

  phone = '';
  telegram = '';
  whatsapp = '';
  contact_email = '';
  dormitory = '';
  room = '';

  constructor(
    private route: ActivatedRoute,
    private listingService: ListingService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadCategories();
    this.loadListing();
    this.loadProfile();
  }

  loadCategories(): void {
    this.listingService.getCategories().subscribe({
      next: (data) => {
        console.log('EDIT CATEGORIES DATA:', data);
        this.categories = data || [];
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log('EDIT CATEGORIES ERROR:', error);
        this.errorMessage = 'Failed to load categories';
        this.cdr.detectChanges();
      }
    });
  }

  loadListing(): void {
    this.isPageLoading = true;
    this.errorMessage = '';

    this.listingService.getListingById(this.id).subscribe({
      next: (listing: any) => {
        console.log('EDIT LISTING DATA:', listing);

        this.title = listing.title || '';
        this.description = listing.description || '';
        this.price = listing.price ?? null;
        this.condition = listing.condition || 'used';
        this.status = listing.status || 'available';
        this.category_id = String(listing.category?.id || '');
        this.location = listing.location || '';

        if (listing.image) {
          this.currentImageUrl = listing.image.startsWith('http')
            ? listing.image
            : `http://127.0.0.1:8000${listing.image}`;
        } else {
          this.currentImageUrl = null;
        }

        this.isPageLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log('EDIT LISTING ERROR:', error);
        this.errorMessage = 'Failed to load listing';
        this.isPageLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadProfile(): void {
    this.listingService.getProfile().subscribe({
      next: (profile: any) => {
        console.log('EDIT PROFILE DATA:', profile);
        this.phone = profile.phone || '';
        this.telegram = profile.telegram || '';
        this.whatsapp = profile.whatsapp || '';
        this.contact_email = profile.contact_email || '';
        this.dormitory = profile.dormitory || '';
        this.room = profile.room || '';
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.log('EDIT PROFILE LOAD ERROR:', error);
      }
    });
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.selectedImage = input.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(this.selectedImage);
    }
  }

  validateTitle(): void {
    if (!this.title.trim()) {
      this.titleError = 'Title is required';
    } else if (this.title.trim().length < 3) {
      this.titleError = 'Title must be at least 3 characters';
    } else {
      this.titleError = '';
    }
  }

  validateDescription(): void {
    if (!this.description.trim()) {
      this.descriptionError = 'Description is required';
    } else if (this.description.trim().length < 10) {
      this.descriptionError = 'Description must be at least 10 characters';
    } else {
      this.descriptionError = '';
    }
  }

  validatePrice(): void {
    if (this.price === null || this.price === undefined) {
      this.priceError = 'Price is required';
    } else if (this.price <= 0) {
      this.priceError = 'Price must be greater than 0';
    } else {
      this.priceError = '';
    }
  }

  validateCategory(): void {
    if (!this.category_id) {
      this.categoryError = 'Category is required';
    } else {
      this.categoryError = '';
    }
  }

  validateForm(): boolean {
    this.validateTitle();
    this.validateDescription();
    this.validatePrice();
    this.validateCategory();

    return !this.titleError && !this.descriptionError && !this.priceError && !this.categoryError;
  }

  onUpdate(): void {
    this.errorMessage = '';

    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;

    const profileData = {
      phone: this.phone,
      telegram: this.telegram,
      whatsapp: this.whatsapp,
      contact_email: this.contact_email,
      dormitory: this.dormitory,
      room: this.room
    };

    this.listingService.updateProfile(profileData).subscribe({
      next: () => {
        this.updateListingRequest();
      },
      error: (error) => {
        console.log('EDIT PROFILE UPDATE ERROR:', error);
        this.errorMessage = 'Failed to save contact information';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  updateListingRequest(): void {
    const formData = new FormData();
    formData.append('title', this.title.trim());
    formData.append('description', this.description.trim());
    formData.append('price', String(this.price));
    formData.append('condition', this.condition);
    formData.append('status', this.status);
    formData.append('category_id', this.category_id);
    formData.append('location', this.location.trim());
    formData.append('is_active', 'true');

    if (this.selectedImage) {
      formData.append('image', this.selectedImage);
    }

    this.listingService.updateListing(this.id, formData).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/my-listings']);
      },
      error: (error) => {
        console.log('EDIT UPDATE ERROR:', error);
        this.isLoading = false;

        if (error.error?.error) {
          this.errorMessage = error.error.error;
        } else {
          this.errorMessage = 'Failed to update listing';
        }

        this.cdr.detectChanges();
      }
    });
  }
}