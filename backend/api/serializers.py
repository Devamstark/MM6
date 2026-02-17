from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Product, Order, OrderItem, Payment, PageContent, Affiliate, Review, Wishlist, ContactMessage, Address

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
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'bio', 'bonus_points', 'profile_picture', 'date_joined', 'last_login', 'addresses')
        read_only_fields = ('id', 'date_joined', 'bonus_points', 'last_login')

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
    image_url = serializers.ImageField(source='image', read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price', 'category', 'subcategory', 'brand',
            'image', 'image_url', 'additional_images', 'stock_quantity', 'gender', 'sizes', 'colors',
            'is_featured', 'is_popular', 'variants', 'seller', 'created_at',
            'discount_percentage', 'sale_price',
            'cogs', 'marketing_cost', 'shipping_cost',
            'flash_sale_start', 'flash_sale_end'
        ]
        read_only_fields = ('seller', 'created_at', 'sale_price')

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
        fields = ('id', 'user', 'customer_name', 'total_amount', 'status', 'created_at', 'items')
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
