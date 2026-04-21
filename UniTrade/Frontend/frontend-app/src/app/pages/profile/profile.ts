import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ListingService } from '../../services/listing';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileComponent implements OnInit {
  phone = '';
  telegram = '';
  whatsapp = '';
  contact_email = '';
  dormitory = '';
  room = '';
  first_name = '';
  last_name = '';
  birth_year: number | null = null;
  avatar: File | null = null;
  avatarPreview: string | null = null;

  old_password = '';
  new_password = '';

  message = '';
  errorMessage = '';
  isLoading = false;

  constructor(private listingService: ListingService) {}

  ngOnInit(): void {
    this.loadProfile();
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
        this.first_name = profile.first_name || '';
        this.last_name = profile.last_name || '';
        this.birth_year = profile.birth_year ?? null;
        this.avatarPreview = profile.avatar
          ? (profile.avatar.startsWith('http') ? profile.avatar : `http://127.0.0.1:8000${profile.avatar}`)
          : null;
      },
      error: () => {
        this.errorMessage = 'Failed to load profile';
      }
    });
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.avatar = input.files[0];

      const reader = new FileReader();
      reader.onload = () => {
        this.avatarPreview = reader.result as string;
      };
      reader.readAsDataURL(this.avatar);
    }
  }

  saveProfile(): void {
    this.isLoading = true;
    this.message = '';
    this.errorMessage = '';

    const formData = new FormData();
    formData.append('phone', this.phone);
    formData.append('telegram', this.telegram);
    formData.append('whatsapp', this.whatsapp);
    formData.append('contact_email', this.contact_email);
    formData.append('dormitory', this.dormitory);
    formData.append('room', this.room);
    formData.append('first_name', this.first_name);
    formData.append('last_name', this.last_name);
    formData.append('birth_year', this.birth_year ? String(this.birth_year) : '');

    if (this.avatar) {
      formData.append('avatar', this.avatar);
    }

    this.listingService.updateProfile(formData).subscribe({
      next: () => {
        this.isLoading = false;
        this.message = 'Profile updated successfully';
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Failed to update profile';
      }
    });
  }

  changePassword(): void {
    this.message = '';
    this.errorMessage = '';

    this.listingService.changePassword({
      old_password: this.old_password,
      new_password: this.new_password
    }).subscribe({
      next: () => {
        this.message = 'Password changed successfully';
        this.old_password = '';
        this.new_password = '';
      },
      error: (error) => {
        this.errorMessage = error.error?.error || 'Failed to change password';
      }
    });
  }
}