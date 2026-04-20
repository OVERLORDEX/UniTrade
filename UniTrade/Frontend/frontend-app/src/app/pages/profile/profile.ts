import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ListingService } from '../../services/listing';
import { Profile } from '../../models/profile';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileComponent implements OnInit {
  profile: Profile | null = null;
  isLoading = true;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  editData = {
    phone: '',
    dormitory: '',
    room: '',
    bio: '',
    telegram_username: '',
    university_id: ''
  };

  constructor(private listingService: ListingService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.listingService.getProfile().subscribe({
      next: (data) => {
        this.profile = data;
        this.editData = {
          phone: data.phone || '',
          dormitory: data.dormitory || '',
          room: data.room || '',
          bio: data.bio || '',
          telegram_username: data.telegram_username || '',
          university_id: data.university_id || ''
        };
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load profile';
        this.isLoading = false;
      }
    });
  }

  saveProfile(): void {
    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.listingService.updateProfile(this.editData).subscribe({
      next: (data) => {
        this.profile = data;
        this.successMessage = 'Profile updated successfully';
        this.isSaving = false;
      },
      error: () => {
        this.errorMessage = 'Failed to update profile';
        this.isSaving = false;
      }
    });
  }
}
