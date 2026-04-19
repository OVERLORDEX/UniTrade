from django.urls import path
from .views import (
    register_view,
    login_view,
    logout_view,
    CategoryListAPIView,
    ListingListCreateAPIView,
    ListingDetailAPIView,
    MyListingsAPIView,
    ProfileAPIView,
    FavoriteListCreateAPIView,
    FavoriteDeleteAPIView,
    CommentListCreateAPIView,
)

urlpatterns = [
    path('register/', register_view),
    path('login/', login_view),
    path('logout/', logout_view),

    path('categories/', CategoryListAPIView.as_view()),

    path('listings/', ListingListCreateAPIView.as_view()),
    path('listings/<int:pk>/', ListingDetailAPIView.as_view()),
    path('my-listings/', MyListingsAPIView.as_view()),

    path('profile/', ProfileAPIView.as_view()),

    path('favorites/', FavoriteListCreateAPIView.as_view()),
    path('favorites/<int:listing_id>/', FavoriteDeleteAPIView.as_view()),

    path('listings/<int:listing_id>/comments/', CommentListCreateAPIView.as_view()),
]