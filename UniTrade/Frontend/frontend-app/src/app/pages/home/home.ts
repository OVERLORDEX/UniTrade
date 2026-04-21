import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  previewItems = [
    {
      title: 'MacBook Air M1',
      category: 'Electronics',
      condition: 'Good condition',
      price: '320000 ₸',
      image: 'Macbook.jpg'
    },
    {
      title: 'Manga Books Set',
      category: 'Books & Study Materials',
      condition: 'Used',
      price: '12000 ₸',
      image: 'books.jpg'
    },
    {
      title: 'Table Lamp',
      category: 'Home & Dorm Items',
      condition: 'New',
      price: '8500 ₸',
      image: 'lamp.jpg'
    }
  ];

  currentIndex = 0;
  intervalId: any;

  ngOnInit(): void {
    this.intervalId = setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.previewItems.length;
    }, 3000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  get currentItem() {
    return this.previewItems[this.currentIndex];
  }
}