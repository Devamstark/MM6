from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Product, Order, OrderItem, Payment, PageContent, Affiliate

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'bio', 'bonus_points', 'date_joined')
        read_only_fields = ('id', 'date_joined', 'bonus_points')

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
    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ('seller', 'created_at', 'updated_at')

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
