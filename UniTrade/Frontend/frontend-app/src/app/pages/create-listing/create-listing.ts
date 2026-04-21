import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ListingService } from '../../services/listing';
import { Category } from '../../models/category';

@Component({
  selector: 'app-create-listing',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './create-listing.html',
  styleUrl: './create-listing.css'
})
export class CreateListingComponent implements OnInit {
  title = '';
  description = '';
  price: number | null = null;
  condition = 'used';
  status = 'available';
  category_id: any = '';
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

  constructor(
    private listingService: ListingService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.listingService.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Failed to load categories';
        this.cdr.detectChanges();
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

  onCreate(): void {
    this.errorMessage = '';

    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;

    const formData = new FormData();
    formData.append('title', this.title.trim());
    formData.append('description', this.description.trim());
    formData.append('price', String(this.price));
    formData.append('condition', this.condition);
    formData.append('status', this.status);
    formData.append('category_id', String(this.category_id));
    formData.append('location', this.location.trim());
    formData.append('is_active', 'true');

    if (this.selectedImage) {
      formData.append('image', this.selectedImage);
    }

    this.listingService.createListing(formData).subscribe({
      next: () => {
        this.isLoading = false;
        this.cdr.detectChanges();
        this.router.navigate(['/my-listings']);
      },
      error: (error) => {
        this.isLoading = false;
        if (error.error?.error) {
          this.errorMessage = error.error.error;
        } else {
          this.errorMessage = 'Failed to create listing';
        }
        this.cdr.detectChanges();
      }
    });
  }
}