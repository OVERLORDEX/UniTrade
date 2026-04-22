from django.urls import path
from .views import (
    register_view,
    login_view,
    logout_view,
    CategoryListAPIView,
    ListingListAPIView,
    ListingDetailAPIView,
    CreateListingAPIView,
    EditListingAPIView,
    DeleteListingAPIView,
    MyListingsAPIView,
    FavoriteListAPIView,
    AddFavoriteAPIView,
    RemoveFavoriteAPIView,
    CommentListAPIView,
    AddCommentAPIView,
    AddRatingAPIView,
    ProfileMeAPIView,
)

urlpatterns = [
    path('register/', register_view),
    path('login/', login_view),
    path('logout/', logout_view),

    path('categories/', CategoryListAPIView.as_view()),

    path('listings/', ListingListAPIView.as_view()),
    path('listings/create/', CreateListingAPIView.as_view()),
    path('listings/<int:pk>/', ListingDetailAPIView.as_view()),
    path('listings/<int:pk>/edit/', EditListingAPIView.as_view()),
    path('listings/<int:pk>/delete/', DeleteListingAPIView.as_view()),

    path('my-listings/', MyListingsAPIView.as_view()),

    path('favorites/', FavoriteListAPIView.as_view()),
    path('favorites/add/', AddFavoriteAPIView.as_view()),
    path('favorites/remove/', RemoveFavoriteAPIView.as_view()),

    path('listings/<int:pk>/comments/', CommentListAPIView.as_view()),
    path('listings/<int:pk>/comments/add/', AddCommentAPIView.as_view()),

    path('ratings/add/', AddRatingAPIView.as_view()),

    path('profile/me/', ProfileMeAPIView.as_view()),
]