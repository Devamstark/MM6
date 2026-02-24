from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Product, Order, OrderItem, Payment, PageContent, Affiliate, Review, 
    Wishlist, ContactMessage, Address, Coupon, HeroBanner, HomePageSection, 
    BlogPost, NewsletterSubscriber
)

User = get_user_model()

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ['id', 'full_name', 'street', 'city', 'state', 'postal_code', 'country', 'phone', 'is_default', 'type']
        read_only_fields = ('user', 'created_at')

class UserSerializer(serializers.ModelSerializer):
    addresses = AddressSerializer(many=True, read_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'bio', 'bonus_points', 'profile_picture', 'date_joined', 'last_login', 'addresses', 'referral_earnings', 'is_active')
        read_only_fields = ('id', 'date_joined', 'bonus_points', 'last_login', 'referral_earnings')

class PageContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PageContent
        fields = '__all__'

class AffiliateSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.username')
    
    class Meta:
        model = Affiliate
        fields = '__all__'
        read_only_fields = ('user', 'earnings', 'clicks', 'created_at')

class ProductSerializer(serializers.ModelSerializer):
    # 'image' is for uploads (write-only) and not sent back in responses.
    image = serializers.ImageField(write_only=True, required=False, allow_null=True)
    # 'image_url' is for responses (read-only).
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'price', 'category', 'subcategory', 'brand',
            'image', 'image_url', 'additional_images', 'stock_quantity', 'gender', 'sizes', 'colors',
            'is_featured', 'is_popular', 'image_fit', 'variants', 'seller', 'created_at',
            'discount_percentage', 'sale_price',
            'cogs', 'marketing_cost', 'shipping_cost',
            'flash_sale_start', 'flash_sale_end'
        ]
        read_only_fields = ('seller', 'created_at', 'sale_price', 'additional_images')

    def get_image_url(self, instance):
        if instance.image and hasattr(instance.image, 'url'):
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(instance.image.url)
            return instance.image.url
        return 'https://via.placeholder.com/400x400?text=No+Image'

    def update(self, instance, validated_data):
        if 'image' in validated_data and validated_data['image'] is None:
            validated_data.pop('image')
        
        return super().update(instance, validated_data)

class OrderItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = OrderItem
        fields = ('id', 'product', 'product_id', 'quantity', 'price_at_purchase')

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ('id', 'user', 'customer_name', 'total_amount', 'status', 'created_at', 'items', 'coupon_code')
        read_only_fields = ('user', 'created_at')

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'

class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Review
        fields = ['id', 'product', 'user', 'user_name', 'rating', 'comment', 'created_at']
        read_only_fields = ('user', 'created_at')

class WishlistSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = Wishlist
        fields = ['id', 'user', 'product', 'product_id', 'created_at']
        read_only_fields = ('user', 'created_at')

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = '__all__'
        read_only_fields = ('id', 'created_at')

class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = '__all__'


class HeroBannerSerializer(serializers.ModelSerializer):
    class Meta:
        model = HeroBanner
        fields = '__all__'


class HomePageSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = HomePageSection
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'used_count')


class BlogPostSerializer(serializers.ModelSerializer):
    author = serializers.ReadOnlyField(source='author.get_full_name')
    author_id = serializers.ReadOnlyField(source='author.id')
    author_username = serializers.ReadOnlyField(source='author.username')

    class Meta:
        model = BlogPost
        fields = [
            'id', 'title', 'slug', 'excerpt', 'content', 'cover_image',
            'author', 'author_id', 'author_username', 'category', 'tags',
            'is_published', 'is_featured', 'published_at',
            'views', 'reading_time', 'created_at', 'updated_at',
        ]
        read_only_fields = ('id', 'slug', 'author', 'author_id', 'author_username',
                            'published_at', 'views', 'reading_time', 'created_at', 'updated_at')


class NewsletterSubscriberSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsletterSubscriber
        fields = ['id', 'email', 'subscribed_at', 'is_active']
        read_only_fields = ('id', 'subscribed_at')
