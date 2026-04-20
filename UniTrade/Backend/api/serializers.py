from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework import serializers
from .models import Category, Profile, Listing, Favorite, Comment


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
        fields = ['id', 'user', 'phone', 'dormitory', 'room', 'avatar_url', 'avatar', 'bio', 'telegram_username', 'university_id']


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
    seller_contacts = serializers.SerializerMethodField()
    is_favorited = serializers.SerializerMethodField()
    image = serializers.ImageField(required=False, allow_null=True)

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
            'seller_contacts',
            'is_favorited',
        ]
        read_only_fields = ['seller', 'views_count', 'created_at', 'updated_at', 'seller_contacts', 'is_favorited']

    def get_favorites_count(self, obj):
        return obj.favorites.count()

    def get_seller_contacts(self, obj):
        profile = getattr(obj.seller, 'profile', None)
        if not profile:
            return None
        
        phone = profile.phone
        whatsapp_link = ""
        if phone:
            import urllib.parse
            encoded_title = urllib.parse.quote(f"Привет, я по поводу объявления {obj.title}")
            clean_phone = ''.join(filter(str.isdigit, phone))
            whatsapp_link = f"https://wa.me/{clean_phone}?text={encoded_title}"

        return {
            'phone': phone,
            'whatsapp_link': whatsapp_link,
            'telegram_username': profile.telegram_username,
            'email': obj.seller.email,
        }

    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            from .models import Favorite
            return Favorite.objects.filter(listing=obj, user=request.user).exists()
        return False

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