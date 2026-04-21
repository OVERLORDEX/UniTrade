from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework import serializers
from .models import Category, Profile, Listing, Favorite, Comment, Rating
from django.contrib.auth.password_validation import validate_password


# ---------------- serializers.Serializer ----------------

class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(
            username=attrs.get('username'),
            password=attrs.get('password')
        )
        if not user:
            raise serializers.ValidationError("Invalid username or password.")
        attrs['user'] = user
        return attrs


# ---------------- ModelSerializer ----------------

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Profile
        fields = ['id', 'user', 'phone', 'dormitory', 'room', 'avatar_url', 'telegram', 'whatsapp', 'contact_email', 'first_name', 'last_name', 'birth_year', 'avatar',]

class SellerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['phone', 'telegram', 'whatsapp', 'contact_email', 'dormitory', 'room']


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'description']

class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'user', 'listing', 'text', 'created_at']
        read_only_fields = ['user', 'created_at']


class ListingSerializer(serializers.ModelSerializer):
    seller = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    favorites_count = serializers.SerializerMethodField()
    image = serializers.ImageField(required=False, allow_null=True)
    seller_profile = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    ratings_count = serializers.SerializerMethodField()

    class Meta:
        model = Listing
        fields = [
            'id',
            'title',
            'description',
            'price',
            'image',
            'condition',
            'status',
            'seller',
            'category',
            'category_id',
            'location',
            'is_active',
            'views_count',
            'created_at',
            'updated_at',
            'comments',
            'favorites_count',
            'seller_profile',
            'average_rating',
            'ratings_count',
        ]
        read_only_fields = ['seller', 'views_count', 'created_at', 'updated_at']

    def get_favorites_count(self, obj):
        return obj.favorites.count()
    
    def get_seller_profile(self, obj):
        profile = getattr(obj.seller, 'profile', None)
        if profile:
            return {
                'phone': profile.phone,
                'telegram': getattr(profile, 'telegram', ''),
                'whatsapp': getattr(profile, 'whatsapp', ''),
                'contact_email': getattr(profile, 'contact_email', ''),
                'dormitory': profile.dormitory,
                'room': profile.room,
        }
        return None
    
    def get_average_rating(self, obj):
        ratings = obj.ratings.all()
        if not ratings.exists():
            return 0
        return round(sum(r.score for r in ratings) / ratings.count(), 1)

    def get_ratings_count(self, obj):
        return obj.ratings.count()

    def create(self, validated_data):
        category_id = validated_data.pop('category_id')
        category = Category.objects.get(id=category_id)
        validated_data['category'] = category
        validated_data['seller'] = self.context['request'].user
        return Listing.objects.create(**validated_data)

    def update(self, instance, validated_data):
        if 'category_id' in validated_data:
            category_id = validated_data.pop('category_id')
            instance.category = Category.objects.get(id=category_id)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance


class FavoriteSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    listing = ListingSerializer(read_only=True)
    listing_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Favorite
        fields = ['id', 'user', 'listing', 'listing_id', 'created_at']
        read_only_fields = ['user', 'created_at']

    def create(self, validated_data):
        listing_id = validated_data.pop('listing_id')
        listing = Listing.objects.get(id=listing_id)
        favorite, created = Favorite.objects.get_or_create(
            user=self.context['request'].user,
            listing=listing
        )
        return favorite

class RatingSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Rating
        fields = ['id', 'user', 'listing', 'score']
        read_only_fields = ['user']

class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)

    def validate_new_password(self, value):
        validate_password(value)
        return value