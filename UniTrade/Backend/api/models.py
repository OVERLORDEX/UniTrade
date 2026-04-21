from django.db import models
from django.contrib.auth.models import User


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone = models.CharField(max_length=20, blank=True)
    dormitory = models.CharField(max_length=100, blank=True)
    room = models.CharField(max_length=20, blank=True)
    avatar_url = models.URLField(blank=True)
    telegram = models.CharField(max_length=100, blank=True)
    whatsapp = models.CharField(max_length=20, blank=True)
    contact_email = models.EmailField(blank=True)
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    birth_year = models.PositiveIntegerField(blank=True, null=True)
    avatar = models.ImageField(upload_to='profile_avatars/', blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} Profile"


class Listing(models.Model):
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('reserved', 'Reserved'),
        ('sold', 'Sold'),
    ]

    CONDITION_CHOICES = [
        ('new', 'New'),
        ('used', 'Used'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    price = models.FloatField()
    image = models.ImageField(upload_to='listing_images/', blank=True, null=True)
    condition = models.CharField(max_length=20, choices=CONDITION_CHOICES, default='used')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='listings')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='listings')
    location = models.CharField(max_length=100, blank=True)   # dormitory/building/campus
    is_active = models.BooleanField(default=True)
    views_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='favorites')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'listing')

    def __str__(self):
        return f"{self.user.username} -> {self.listing.title}"


class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='comments')
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username}: {self.text[:30]}"
    
class Rating(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ratings')
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name='ratings')
    score = models.PositiveSmallIntegerField()

    class Meta:
        unique_together = ('user', 'listing')

    def __str__(self):
        return f"{self.user.username} rated {self.listing.title}: {self.score}"