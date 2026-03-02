from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    User, TelegramUser, Product, ProductVariant, ProductImage, Order, OrderItem, Payment, BlogPost,
    NewsletterSubscriber, MarketingCampaign, EmailDeliveryLog,
    CampaignRecipient, EmailClickLog, EmailConversion
)

@admin.register(TelegramUser)
class TelegramUserAdmin(admin.ModelAdmin):
    list_display = ('telegram_id', 'username', 'user', 'created_at')
    search_fields = ('telegram_id', 'username', 'user__username', 'user__email')
    readonly_fields = ('created_at', 'updated_at')

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

class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'stock_quantity', 'category', 'seller')
    search_fields = ('name', 'description')
    list_filter = ('category', 'created_at')
    inlines = [ProductVariantInline, ProductImageInline]

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

# Marketing Admin
class EmailDeliveryLogInline(admin.TabularInline):
    model = EmailDeliveryLog
    extra = 0
    readonly_fields = ('user', 'email', 'status', 'sent_at', 'opened_at', 'clicked_at', 'error_message')
    can_delete = False
    verbose_name = 'Email Delivery Log'
    verbose_name_plural = 'Email Delivery Logs'

@admin.register(MarketingCampaign)
class MarketingCampaignAdmin(admin.ModelAdmin):
    list_display = ('name', 'status', 'campaign_type', 'total_recipients', 'emails_sent', 'delivery_rate', 'created_at')
    list_filter = ('status', 'campaign_type', 'created_at')
    search_fields = ('name', 'subject')
    readonly_fields = ('id', 'created_at', 'updated_at', 'sent_at', 'total_recipients', 'emails_sent', 'emails_failed', 'emails_opened', 'emails_clicked', 'delivery_rate', 'open_rate', 'click_rate')
    fieldsets = (
        ('Basic Info', {'fields': ('id', 'name', 'subject', 'preheader', 'status', 'campaign_type')}),
        ('Content', {'fields': ('message', 'plain_text', 'banner_image_url', 'cta_text', 'cta_url')}),
        ('Discount', {'fields': ('discount_code', 'discount_type', 'discount_value', 'discount_min_purchase', 'discount_usage_limit', 'discount_expiry_days', 'coupon')}),
        ('Audience', {'fields': ('audience_type', 'audience_days', 'manual_user_ids')}),
        ('Scheduling', {'fields': ('scheduled_date', 'sent_at')}),
        ('Statistics', {'fields': ('total_recipients', 'emails_sent', 'emails_failed', 'emails_opened', 'emails_clicked', 'delivery_rate', 'open_rate', 'click_rate')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )
    inlines = [EmailDeliveryLogInline]

    def has_delete_permission(self, request, obj=None):
        # Prevent deletion of sent campaigns
        if obj and obj.status == 'sent':
            return False
        return True

    def get_readonly_fields(self, request, obj=None):
        if obj:  # Editing existing object
            return self.readonly_fields + ('status', 'campaign_type', 'audience_type')
        return self.readonly_fields

@admin.register(EmailDeliveryLog)
class EmailDeliveryLogAdmin(admin.ModelAdmin):
    list_display = ('campaign', 'user', 'email', 'status', 'sent_at', 'retry_count')
    list_filter = ('status', 'campaign', 'sent_at')
    search_fields = ('email', 'user__email', 'campaign__name')
    readonly_fields = ('id', 'campaign', 'user', 'email', 'status', 'sent_at', 'opened_at', 'clicked_at', 'error_message', 'retry_count')
    can_delete = False

    def has_delete_permission(self, request, obj=None):
        return False  # Never allow deletion of delivery logs

    def has_add_permission(self, request):
        return False  # Logs are created automatically

    def has_change_permission(self, request, obj=None):
        return False  # Logs are read-only

@admin.register(CampaignRecipient)
class CampaignRecipientAdmin(admin.ModelAdmin):
    list_display = ('campaign', 'user', 'email')
    list_filter = ('campaign',)
    search_fields = ('email', 'user__email', 'campaign__name')

@admin.register(EmailClickLog)
class EmailClickLogAdmin(admin.ModelAdmin):
    list_display = ('campaign', 'user', 'email', 'url', 'clicked_at')
    list_filter = ('campaign', 'clicked_at')
    search_fields = ('email', 'url', 'campaign__name')

@admin.register(EmailConversion)
class EmailConversionAdmin(admin.ModelAdmin):
    list_display = ('campaign', 'user', 'conversion_value', 'converted_at', 'time_to_convert')
    list_filter = ('campaign', 'converted_at')
    search_fields = ('user__email', 'campaign__name')
    readonly_fields = ('id', 'campaign', 'user', 'click_log', 'conversion_value', 'converted_at', 'time_to_convert', 'order')
