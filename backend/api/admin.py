from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Product, Order, OrderItem, Payment, BlogPost, NewsletterSubscriber

# Register User Custom Admin
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'role', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_active')
    fieldsets = UserAdmin.fieldsets + (
        ('Custom Fields', {'fields': ('role', 'bio', 'profile_picture', 'bonus_points')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Custom Fields', {'fields': ('role',)}),
    )

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'stock_quantity', 'category', 'seller')
    search_fields = ('name', 'description')
    list_filter = ('category', 'created_at')

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'total_amount', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    inlines = [OrderItemInline]

@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'amount', 'status', 'created_at')

@admin.register(BlogPost)
class BlogPostAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'category', 'is_published', 'is_featured', 'views', 'created_at')
    list_filter = ('category', 'is_published', 'is_featured', 'created_at')
    search_fields = ('title', 'excerpt', 'content')
    prepopulated_fields = {'slug': ('title',)}
    readonly_fields = ('views', 'reading_time', 'published_at', 'created_at', 'updated_at')
    list_editable = ('is_published', 'is_featured')
    raw_id_fields = ('author',)
    fieldsets = (
        ('Content', {'fields': ('title', 'slug', 'excerpt', 'content', 'cover_image')}),
        ('Metadata', {'fields': ('author', 'category', 'tags')}),
        ('Publishing', {'fields': ('is_published', 'is_featured', 'published_at')}),
        ('Stats', {'fields': ('views', 'reading_time', 'created_at', 'updated_at')}),
    )
@admin.register(NewsletterSubscriber)
class NewsletterSubscriberAdmin(admin.ModelAdmin):
    list_display = ('email', 'subscribed_at', 'is_active')
    list_filter = ('is_active', 'subscribed_at')
    search_fields = ('email',)
