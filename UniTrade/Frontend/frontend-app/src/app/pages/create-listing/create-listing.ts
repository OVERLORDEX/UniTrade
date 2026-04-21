import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ListingService } from '../../services/listing';
import { Category } from '../../models/category';

@Component({
  selector: 'app-create-listing',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './create-listing.html',
  styleUrl: './create-listing.css'
})
export class CreateListingComponent implements OnInit {
  title = '';
  description = '';
  price: number | null = null;
  condition = 'used';
  status = 'available';
  category_id = '';
  location = '';

  selectedImage: File | null = null;
  imagePreview: string | null = null;

  categories: Category[] = [];

  titleError = '';
  descriptionError = '';
  priceError = '';
  categoryError = '';
  errorMessage = '';
  isLoading = false;

  phone = '';
  telegram = '';
  whatsapp = '';
  contact_email = '';
  dormitory = '';
  room = '';

  constructor(
    private listingService: ListingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadProfile();
  }

  loadCategories(): void {
    this.listingService.getCategories().subscribe({
      next: (data) => {
        this.categories = data || [];
      },
      error: () => {
        this.errorMessage = 'Failed to load categories';
      }
    });
  }

  loadProfile(): void {
    this.listingService.getProfile().subscribe({
      next: (profile: any) => {
        this.phone = profile.phone || '';
        this.telegram = profile.telegram || '';
        this.whatsapp = profile.whatsapp || '';
        this.contact_email = profile.contact_email || '';
        this.dormitory = profile.dormitory || '';
        this.room = profile.room || '';
      },
      error: (error) => {
        console.log('PROFILE LOAD ERROR:', error);
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

  onCreate(): void {
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
        this.createListingRequest();
      },
      error: (error) => {
        console.log('PROFILE UPDATE ERROR:', error);
        this.errorMessage = 'Failed to save contact information';
        this.isLoading = false;
      }
    });
  }

  createListingRequest(): void {
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

    this.listingService.createListing(formData).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/my-listings']);
      },
      error: (error) => {
        console.log('CREATE LISTING ERROR:', error);
        this.isLoading = false;
        if (error.error?.error) {
          this.errorMessage = error.error.error;
        } else {
          this.errorMessage = 'Failed to create listing';
        }
      }
    });
  }
}