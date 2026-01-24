from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
import uuid

class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('seller', 'Seller'),
        ('user', 'User'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    bio = models.TextField(blank=True, null=True)
    bonus_points = models.IntegerField(default=0)

    def __str__(self):
        return self.username

class PageContent(models.Model):
    slug = models.SlugField(unique=True)
    title = models.CharField(max_length=200)
    content = models.TextField()
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class Affiliate(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='affiliate_profile')
    referral_code = models.CharField(max_length=20, unique=True)
    earnings = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    clicks = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.referral_code

class Product(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    seller = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='products')
    name = models.CharField(max_length=255)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock_quantity = models.IntegerField(default=0)
    category = models.CharField(max_length=100)
    brand = models.CharField(max_length=100)
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    additional_images = models.JSONField(default=list, blank=True) # List of image URLs
    gender = models.CharField(max_length=20, choices=[('Male', 'Male'), ('Female', 'Female'), ('Unisex', 'Unisex')], default='Unisex')
    subcategory = models.CharField(max_length=100, blank=True, null=True)
    sizes = models.JSONField(default=list, blank=True) # List of sizes e.g. ["S", "M", "L"]
    colors = models.JSONField(default=list, blank=True) # List of colors e.g. ["Red", "Blue"]
    is_featured = models.BooleanField(default=False)
    is_popular = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Order(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    )
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    customer_name = models.CharField(max_length=255)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order {self.id} by {self.user.username}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    quantity = models.IntegerField(default=1)
    price_at_purchase = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"

class Payment(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=50, default='completed')
    payment_method = models.CharField(max_length=50)
    transaction_id = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
