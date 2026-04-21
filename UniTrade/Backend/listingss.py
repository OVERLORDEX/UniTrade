from django.contrib.auth.models import User
from api.models import Listing, Category

category_names = [
    "Electronics",
    "Books & Study Materials",
    "Clothes & Shoes",
    "Furniture",
    "Home & Dorm Items",
    "Accessories",
    "Beauty & Personal Care",
    "Sports & Hobby",
    "Bicycles & Transport",
    "Food & Snacks",
    "Services",
    "Other",
]

categories = {}
for name in category_names:
    cat, _ = Category.objects.get_or_create(name=name)
    categories[name] = cat

seller, _ = User.objects.get_or_create(username="TestUser123")

listings_data = [
    {
        "title": "iPhone 14 Pro",
        "description": "Great condition, no scratches. All accessories included.",
        "price": 150000.0,
        "condition": "Used",
        "status": "Available",
        "category": categories["Electronics"],
        "location": "Almaty",
        "is_active": True,
    },
    {
        "title": "Samsung Galaxy S23",
        "description": "Used for 6 months, battery in good shape. Box included.",
        "price": 120000.0,
        "condition": "Used",
        "status": "Available",
        "category": categories["Electronics"],
        "location": "Campus",
        "is_active": True,
    },
    {
        "title": "MacBook Air M2",
        "description": "2023 model, 8GB RAM, 256GB SSD. Excellent condition.",
        "price": 350000.0,
        "condition": "Used",
        "status": "Available",
        "category": categories["Electronics"],
        "location": "Almaty",
        "is_active": True,
    },
    {
        "title": "Python Crash Course",
        "description": "By Eric Matthes. Like new, no markings or highlights.",
        "price": 5000.0,
        "condition": "Used",
        "status": "Available",
        "category": categories["Books & Study Materials"],
        "location": "Campus",
        "is_active": True,
    },
    {
        "title": "Math Textbook Set",
        "description": "1st and 2nd year math textbooks. Set of 5 books.",
        "price": 8000.0,
        "condition": "Used",
        "status": "Available",
        "category": categories["Books & Study Materials"],
        "location": "Campus",
        "is_active": True,
    },
    {
        "title": "Nike Air Max 270",
        "description": "Size 42, worn twice. Almost new condition.",
        "price": 25000.0,
        "condition": "Used",
        "status": "Available",
        "category": categories["Clothes & Shoes"],
        "location": "Campus",
        "is_active": True,
    },
    {
        "title": "Adidas Winter Jacket",
        "description": "Size L, black. Warm and perfect for winter.",
        "price": 18000.0,
        "condition": "Used",
        "status": "Available",
        "category": categories["Clothes & Shoes"],
        "location": "Almaty",
        "is_active": True,
    },
    {
        "title": "IKEA Desk",
        "description": "White, 120x60 cm. Good condition, no scratches.",
        "price": 30000.0,
        "condition": "Used",
        "status": "Available",
        "category": categories["Furniture"],
        "location": "Almaty",
        "is_active": True,
    },
    {
        "title": "Office Chair",
        "description": "Adjustable height, backrest included. Comfortable for long sitting.",
        "price": 22000.0,
        "condition": "Used",
        "status": "Available",
        "category": categories["Furniture"],
        "location": "Almaty",
        "is_active": True,
    },
    {
        "title": "Desk Lamp",
        "description": "LED lamp with adjustable brightness. Perfect for dorm use.",
        "price": 4500.0,
        "condition": "Used",
        "status": "Available",
        "category": categories["Home & Dorm Items"],
        "location": "Campus",
        "is_active": True,
    },
    {
        "title": "Sony WH-1000XM4 Headphones",
        "description": "Noise-cancelling, wireless. All accessories and box included.",
        "price": 65000.0,
        "condition": "Used",
        "status": "Available",
        "category": categories["Accessories"],
        "location": "Campus",
        "is_active": True,
    },
    {
        "title": "Football Adidas Ball",
        "description": "Standard size 5. Lightly used.",
        "price": 7000.0,
        "condition": "Used",
        "status": "Available",
        "category": categories["Sports & Hobby"],
        "location": "Campus",
        "is_active": True,
    },
    {
        "title": "Trek Mountain Bike 21-speed",
        "description": "Good condition. New brakes installed.",
        "price": 85000.0,
        "condition": "Used",
        "status": "Available",
        "category": categories["Bicycles & Transport"],
        "location": "Almaty",
        "is_active": True,
    },
    {
        "title": "English Tutoring",
        "description": "IELTS preparation. 3 years of experience. Online or on campus.",
        "price": 5000.0,
        "condition": "New",
        "status": "Available",
        "category": categories["Services"],
        "location": "Campus",
        "is_active": True,
    },
    {
        "title": "iPad 9th Generation",
        "description": "64GB, WiFi. Screen protector on, no case. Works perfectly.",
        "price": 95000.0,
        "condition": "Used",
        "status": "Available",
        "category": categories["Electronics"],
        "location": "Almaty",
        "is_active": True,
    },
]

created = 0
for data in listings_data:
    listing = Listing.objects.create(seller=seller, **data)
    created += 1
    print(f"[{created}] {listing.title} — {listing.price}")

print(f"\nTotal {created} listings created successfully!")
