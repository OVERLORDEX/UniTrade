from django.contrib import admin
from .models import Category, Profile, Listing, Favorite, Comment

admin.site.register(Category)
admin.site.register(Profile)
admin.site.register(Listing)
admin.site.register(Favorite)
admin.site.register(Comment)