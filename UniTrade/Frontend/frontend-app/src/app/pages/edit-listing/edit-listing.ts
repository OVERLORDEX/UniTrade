import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ListingService } from '../../services/listing';
import { Category } from '../../models/category';

@Component({
  selector: 'app-edit-listing',
  standalone: true,
  imports: [FormsModule],
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
  category_id: any = '';
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
  isPageLoading = false;

  constructor(
    private route: ActivatedRoute,
    private listingService: ListingService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.isPageLoading = true;

    this.loadCategories();
    this.loadListing();
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

  loadListing(): void {
    this.listingService.getListingById(this.id).subscribe({
      next: (listing: any) => {
        this.title = listing.title;
        this.description = listing.description;
        this.price = listing.price;
        this.condition = listing.condition;
        this.status = listing.status;
        this.category_id = listing.category?.id ? String(listing.category.id) : '';
        this.location = listing.location || '';

        if (listing.image) {
          this.currentImageUrl = listing.image.startsWith('http')
            ? listing.image
            : `http://127.0.0.1:8000${listing.image}`;
        }

        this.isPageLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load listing';
        this.isPageLoading = false;
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

  onUpdate(): void {
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

    this.listingService.updateListing(this.id, formData).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/my-listings']);
      },
      error: (error) => {
        this.isLoading = false;
        if (error.error?.error) {
          this.errorMessage = error.error.error;
        } else {
          this.errorMessage = 'Failed to update listing';
        }
      }
    });
  }
}