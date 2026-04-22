from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Category, Profile, Listing, Favorite, Comment, Rating
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    CategorySerializer,
    ListingSerializer,
    ProfileSerializer,
    FavoriteSerializer,
    CommentSerializer,
    RatingSerializer,
    ChangePasswordSerializer,
)


# ---------------- FBV ----------------

@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        Profile.objects.get_or_create(user=user)

        refresh = RefreshToken.for_user(user)
        return Response({
            'message': 'User registered successfully.',
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)

        return Response({
            'message': 'Login successful.',
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_200_OK)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    try:
        refresh_token = request.data.get('refresh')
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'message': 'Logout successful.'}, status=status.HTTP_205_RESET_CONTENT)
    except Exception:
        return Response({'error': 'Invalid refresh token.'}, status=status.HTTP_400_BAD_REQUEST)


# ---------------- CBV ----------------

class CategoryListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        categories = Category.objects.all()
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data)


class ListingListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        listings = Listing.objects.filter(is_active=True).select_related('seller', 'category')

        category_id = request.GET.get('category')
        search = request.GET.get('search')
        ordering = request.GET.get('ordering')

        if category_id:
            listings = listings.filter(category_id=category_id)

        if search:
            listings = listings.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )

        if ordering == 'price_asc':
            listings = listings.order_by('price')
        elif ordering == 'price_desc':
            listings = listings.order_by('-price')
        else:
            listings = listings.order_by('-created_at')

        serializer = ListingSerializer(listings, many=True, context={'request': request})
        return Response(serializer.data)


class ListingDetailAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        try:
            listing = Listing.objects.select_related('seller', 'category').get(pk=pk)
        except Listing.DoesNotExist:
            return Response({'error': 'Listing not found.'}, status=status.HTTP_404_NOT_FOUND)

        listing.views_count += 1
        listing.save(update_fields=['views_count'])

        serializer = ListingSerializer(listing, context={'request': request})
        return Response(serializer.data)


class CreateListingAPIView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = ListingSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            listing = serializer.save()
            return Response(
                ListingSerializer(listing, context={'request': request}).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EditListingAPIView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def patch(self, request, pk):
        try:
            listing = Listing.objects.get(pk=pk)
        except Listing.DoesNotExist:
            return Response({'error': 'Listing not found.'}, status=status.HTTP_404_NOT_FOUND)

        if listing.seller != request.user:
            return Response({'error': 'You can edit only your own listing.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = ListingSerializer(
            listing,
            data=request.data,
            partial=True,
            context={'request': request}
        )

        if serializer.is_valid():
            listing = serializer.save()
            return Response(ListingSerializer(listing, context={'request': request}).data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DeleteListingAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            listing = Listing.objects.get(pk=pk)
        except Listing.DoesNotExist:
            return Response({'error': 'Listing not found.'}, status=status.HTTP_404_NOT_FOUND)

        if listing.seller != request.user:
            return Response({'error': 'You can delete only your own listing.'}, status=status.HTTP_403_FORBIDDEN)

        listing.delete()
        return Response({'message': 'Listing deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)


class MyListingsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        listings = Listing.objects.filter(seller=request.user).order_by('-created_at')
        serializer = ListingSerializer(listings, many=True, context={'request': request})
        return Response(serializer.data)


class FavoriteListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        favorites = Favorite.objects.filter(user=request.user).select_related(
            'listing', 'listing__seller', 'listing__category'
        ).order_by('-created_at')

        serializer = FavoriteSerializer(favorites, many=True, context={'request': request})
        return Response(serializer.data)


class AddFavoriteAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        listing_id = request.data.get('listing_id')

        if not listing_id:
            return Response({'error': 'listing_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            listing = Listing.objects.get(id=listing_id)
        except Listing.DoesNotExist:
            return Response({'error': 'Listing not found.'}, status=status.HTTP_404_NOT_FOUND)

        favorite, created = Favorite.objects.get_or_create(
            user=request.user,
            listing=listing
        )

        serializer = FavoriteSerializer(favorite, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class RemoveFavoriteAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        listing_id = request.data.get('listing_id')

        if not listing_id:
            return Response({'error': 'listing_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            favorite = Favorite.objects.get(user=request.user, listing_id=listing_id)
        except Favorite.DoesNotExist:
            return Response({'error': 'Favorite not found.'}, status=status.HTTP_404_NOT_FOUND)

        favorite.delete()
        return Response({'message': 'Removed from favorites.'}, status=status.HTTP_204_NO_CONTENT)


class CommentListAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk):
        comments = Comment.objects.filter(listing_id=pk).select_related('user').order_by('-created_at')
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)


class AddCommentAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        text = request.data.get('text', '').strip()

        if not text:
            return Response({'error': 'Text is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            listing = Listing.objects.get(pk=pk)
        except Listing.DoesNotExist:
            return Response({'error': 'Listing not found.'}, status=status.HTTP_404_NOT_FOUND)

        comment = Comment.objects.create(
            user=request.user,
            listing=listing,
            text=text
        )

        serializer = CommentSerializer(comment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AddRatingAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        listing_id = request.data.get('listing_id')
        score = request.data.get('score')

        if not listing_id:
            return Response({'error': 'listing_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        if score is None:
            return Response({'error': 'score is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            score = int(score)
        except (TypeError, ValueError):
            return Response({'error': 'score must be a number.'}, status=status.HTTP_400_BAD_REQUEST)

        if score < 1 or score > 5:
            return Response({'error': 'score must be between 1 and 5.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            listing = Listing.objects.get(id=listing_id)
        except Listing.DoesNotExist:
            return Response({'error': 'Listing not found.'}, status=status.HTTP_404_NOT_FOUND)

        rating, created = Rating.objects.update_or_create(
            user=request.user,
            listing=listing,
            defaults={'score': score}
        )

        serializer = RatingSerializer(rating)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class ProfileMeAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, created = Profile.objects.get_or_create(user=request.user)
        serializer = ProfileSerializer(profile)
        return Response(serializer.data)

    def patch(self, request):
        profile, created = Profile.objects.get_or_create(user=request.user)
        serializer = ProfileSerializer(profile, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)

        if serializer.is_valid():
            user = request.user

            if not user.check_password(serializer.validated_data['old_password']):
                return Response(
                    {'error': 'Old password is incorrect.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            user.set_password(serializer.validated_data['new_password'])
            user.save()

            return Response(
                {'message': 'Password changed successfully.'},
                status=status.HTTP_200_OK
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)