from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.utils import timezone
import datetime
import uuid
from django.core.validators import MinValueValidator
from django.utils.text import slugify

class PasswordResetToken(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='password_reset_tokens')
    token = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    def is_valid(self):
        return self.expires_at > timezone.now()

class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('seller', 'Seller'),
        ('blogger', 'Blogger'),
        ('user', 'User'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    bio = models.TextField(blank=True, null=True)
    bonus_points = models.IntegerField(default=0)
    profile_picture = models.TextField(blank=True, null=True) # Storing Base64 string for database persistence
    referral_earnings = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def __str__(self):
        return self.username


class ReferralSignup(models.Model):
    """Records each new user who signed up via a referral link."""
    referrer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='referred_users')
    referred_user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='referred_by')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.referred_user.username} referred by {self.referrer.username}"

class Address(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='addresses')
    full_name = models.CharField(max_length=255)
    street = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    is_default = models.BooleanField(default=False)
    type = models.CharField(max_length=20, default='shipping') # 'shipping' or 'billing'
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.is_default:
            # Set other addresses of this user to not default
            Address.objects.filter(user=self.user, is_default=True).exclude(id=self.id).update(is_default=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.full_name}, {self.city}"

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
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock_quantity = models.IntegerField(default=0, validators=[MinValueValidator(0)])
    category = models.CharField(max_length=100)
    brand = models.CharField(max_length=100)
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    additional_images = models.JSONField(default=list, blank=True) # List of image URLs
    gender = models.CharField(max_length=20, choices=[('Male', 'Male'), ('Female', 'Female'), ('Unisex', 'Unisex')], default='Unisex')
    subcategory = models.CharField(max_length=100, blank=True, null=True)
    sizes = models.JSONField(default=list, blank=True) # List of sizes e.g. ["S", "M", "L"]
    colors = models.JSONField(default=list, blank=True) # List of colors e.g. ["Red", "Blue"]
    variants = models.JSONField(default=list, blank=True) # List of variants e.g. [{size: "M", color: "Red", stock: 5}]
    is_featured = models.BooleanField(default=False)
    is_popular = models.BooleanField(default=False)
    image_fit = models.CharField(max_length=10, choices=[('cover', 'Cover'), ('contain', 'Contain')], default='cover')
    
    # Discount fields
    discount_percentage = models.IntegerField(default=0)
    sale_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Cost of Goods Sold (Internal use only)
    cogs = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, default=0.00)
    marketing_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, default=0.00)
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, default=0.00)
    
    # Flash Sale fields
    flash_sale_start = models.DateTimeField(null=True, blank=True)
    flash_sale_end = models.DateTimeField(null=True, blank=True)
    
    display_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['display_order', '-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
            # Ensure slug is unique
            original_slug = self.slug
            counter = 1
            while Product.objects.filter(slug=self.slug).exists():
                self.slug = f"{original_slug}-{counter}"
                counter += 1

        if self.discount_percentage > 0:
             # Calculate sale price
             discount_amount = (self.price * self.discount_percentage) / 100
             self.sale_price = self.price - discount_amount
        else:
             self.sale_price = None
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

class Wishlist(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='wishlist')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='wishlisted_by')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'product')

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
    coupon_code = models.CharField(max_length=50, blank=True, null=True)

    # Add shipping address snapshot to Order (optional but good practice)
    shipping_address = models.TextField(blank=True, null=True)
    earnings_applied = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def __str__(self):
        return f"Order {self.id} by {self.user.username}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    quantity = models.IntegerField(default=1)
    price_at_purchase = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        if self.product:
            return f"{self.quantity} x {self.product.name}"
        return f"{self.quantity} x Unknown Product"

class Payment(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=50, default='completed')
    payment_method = models.CharField(max_length=50)
    transaction_id = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

class Review(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    rating = models.IntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('product', 'user') # One review per product per user

    def __str__(self):
        return f"Review by {self.user.username} on {self.product.name}"

class ContactMessage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    email = models.EmailField()
    subject = models.CharField(max_length=255, blank=True, null=True)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.name} - {self.subject or 'No Subject'}"

class Coupon(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=50, unique=True)
    discount_type = models.CharField(max_length=20, choices=[('percentage', 'Percentage'), ('fixed', 'Fixed Amount')], default='percentage')
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    min_purchase = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    is_active = models.BooleanField(default=True)
    start_date = models.DateTimeField(default=timezone.now)
    end_date = models.DateTimeField(null=True, blank=True)
    usage_limit = models.IntegerField(null=True, blank=True)
    used_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.code


class HeroBanner(models.Model):
    """Homepage hero banner management"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    subtitle = models.CharField(max_length=500, blank=True)
    description = models.TextField(blank=True)
    image = models.TextField(blank=True, null=True)  # Base64 or URL
    background_color = models.CharField(max_length=7, default='#f6f6f6')  # Hex color
    cta_text = models.CharField(max_length=100, blank=True)
    cta_link = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)
    display_order = models.IntegerField(default=0)
    image_fit = models.CharField(max_length=20, default='cover', choices=[
        ('cover', 'Cover (Fill)'),
        ('contain', 'Contain (Fit)'),
        ('fill', 'Fill (Stretch)'),
        ('none', 'None (Original Size)'),
    ])
    image_position = models.CharField(max_length=20, default='center', choices=[
        ('center', 'Center'),
        ('top', 'Top'),
        ('bottom', 'Bottom'),
        ('left', 'Left'),
        ('right', 'Right'),
        ('top left', 'Top Left'),
        ('top right', 'Top Right'),
        ('bottom left', 'Bottom Left'),
        ('bottom right', 'Bottom Right'),
    ])
    content_scale = models.IntegerField(default=100) # Percentage scaling (75-150)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['display_order', '-created_at']

    def __str__(self):
        return self.title


class HomePageSection(models.Model):
    """Manage homepage sections (featured collections, promotional banners, etc.)"""
    SECTION_TYPE_CHOICES = [
        ('featured_collection', 'Featured Collection'),
        ('promotional_banner', 'Promotional Banner'),
        ('category_showcase', 'Category Showcase'),
        ('testimonial', 'Testimonial'),
        ('brand_logo', 'Brand Logo'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    section_type = models.CharField(max_length=50, choices=SECTION_TYPE_CHOICES)
    description = models.TextField(blank=True)
    image = models.TextField(blank=True, null=True)  # Main section image
    images = models.TextField(blank=True, null=True)  # JSON array of image URLs
    link = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)
    display_order = models.IntegerField(default=0)
    metadata = models.TextField(blank=True, null=True)  # JSON for extra data
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['display_order', '-created_at']

    def __str__(self):
        return f"{self.section_type} - {self.title}"


class BlogPost(models.Model):
    """Fashion blog posts written by bloggers and admins."""
    CATEGORY_CHOICES = [
        ('Style', 'Style'),
        ('Trends', 'Trends'),
        ('Care', 'Care'),
        ('News', 'News'),
        ('Lookbook', 'Lookbook'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    excerpt = models.TextField()
    content = models.TextField(blank=True)
    cover_image = models.URLField(max_length=500, blank=True)
    author = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='blog_posts'
    )
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='Style')
    tags = models.JSONField(default=list, blank=True)
    is_published = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True)
    views = models.IntegerField(default=0)
    reading_time = models.IntegerField(default=3)  # estimated minutes
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        # Auto-generate slug
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug
            counter = 1
            while BlogPost.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug

        was_published = False
        if self.pk:
            old_instance = BlogPost.objects.filter(pk=self.pk).first()
            if old_instance:
                was_published = old_instance.is_published

        if self.is_published and not self.published_at:
            self.published_at = timezone.now()

        # Estimate reading time (~200 words/min)
        word_count = len(self.content.split())
        self.reading_time = max(1, round(word_count / 200))

        super().save(*args, **kwargs)

        # Send newsletter if newly published
        if self.is_published and not was_published:
            self.send_newsletter_notification()

    def send_newsletter_notification(self):
        """Sends an email to all active newsletter subscribers."""
        from django.core.mail import send_mail
        from django.template.loader import render_to_string
        from django.utils.html import strip_tags
        
        subscribers = NewsletterSubscriber.objects.filter(is_active=True)
        recipient_list = [s.email for s in subscribers]
        
        if not recipient_list:
            return

        subject = f"New Blog Post: {self.title}"
        # We can create a simple HTML template or just plain text
        html_message = f"""
            <h2>{self.title}</h2>
            <p>{self.excerpt}</p>
            <p><a href="https://smartshop1.us/blog/{self.slug}">Read more here</a></p>
            <br>
            <hr>
            <p><small>You are receiving this because you signed up for the SmartShop newsletter.</small></p>
        """
        plain_message = strip_tags(html_message)
        
        try:
            send_mail(
                subject,
                plain_message,
                settings.DEFAULT_FROM_EMAIL,
                recipient_list,
                html_message=html_message,
                fail_silently=True
            )
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"Failed to send newsletter: {str(e)}")

    def __str__(self):
        return self.title


class NewsletterSubscriber(models.Model):
    """Stores emails for the newsletter system."""
    email = models.EmailField(unique=True)
    subscribed_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.email

class MarketingCampaign(models.Model):
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('scheduled', 'Scheduled'),
        ('sending', 'Sending'),
        ('sent', 'Sent'),
        ('paused', 'Paused'),
        ('failed', 'Failed'),
    )
    AUDIENCE_CHOICES = (
        ('all_users', 'All Users'),
        ('ordered_once', 'Ordered At Least Once'),
        ('never_ordered', 'Never Ordered'),
        ('recent_signups', 'Recent Signups'),
        ('abandoned_cart', 'Abandoned Cart'),
        ('manual', 'Manual Selection'),
    )
    CAMPAIGN_TYPE_CHOICES = (
        ('promotional', 'Promotional'),
        ('abandoned_cart', 'Abandoned Cart'),
        ('re_engagement', 'Re-engagement'),
        ('thank_you', 'First Purchase Thank You'),
        ('upsell', 'Post-purchase Upsell'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    subject = models.CharField(max_length=255)
    preheader = models.CharField(max_length=255, blank=True, default='')
    message = models.TextField()  # HTML content
    plain_text = models.TextField(blank=True, default='')  # Plain text fallback
    banner_image_url = models.URLField(max_length=500, blank=True, default='')
    cta_text = models.CharField(max_length=100, blank=True, default='')
    cta_url = models.URLField(max_length=500, blank=True, default='')
    discount_code = models.CharField(max_length=50, blank=True, default='')
    discount_type = models.CharField(max_length=20, choices=[('percentage', 'Percentage'), ('fixed', 'Fixed Amount')], default='percentage', blank=True)
    discount_value = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    discount_min_purchase = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, blank=True)
    discount_usage_limit = models.IntegerField(null=True, blank=True)
    discount_expiry_days = models.IntegerField(default=7, help_text='Coupon expires X days after campaign send')
    coupon = models.ForeignKey('Coupon', on_delete=models.SET_NULL, null=True, blank=True, related_name='campaigns')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    campaign_type = models.CharField(max_length=30, choices=CAMPAIGN_TYPE_CHOICES, default='promotional')
    audience_type = models.CharField(max_length=30, choices=AUDIENCE_CHOICES, default='all_users')
    audience_days = models.IntegerField(default=30, help_text='For recent_signups: users registered within X days')
    manual_user_ids = models.JSONField(default=list, blank=True, help_text='List of user IDs for manual selection')
    scheduled_date = models.DateTimeField(null=True, blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    total_recipients = models.IntegerField(default=0)
    emails_sent = models.IntegerField(default=0)
    emails_failed = models.IntegerField(default=0)
    emails_opened = models.IntegerField(default=0)
    emails_clicked = models.IntegerField(default=0)
    batch_size = models.IntegerField(default=200)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='campaigns_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['campaign_type']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return self.name

    @property
    def delivery_rate(self):
        if self.total_recipients == 0:
            return 0
        return round((self.emails_sent / self.total_recipients) * 100, 1)

    @property
    def open_rate(self):
        if self.emails_sent == 0:
            return 0
        return round((self.emails_opened / self.emails_sent) * 100, 1)

    @property
    def click_rate(self):
        if self.emails_sent == 0:
            return 0
        return round((self.emails_clicked / self.emails_sent) * 100, 1)


class CampaignRecipient(models.Model):
    """Snapshot of recipients at send time."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(MarketingCampaign, on_delete=models.CASCADE, related_name='recipients')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='campaign_recipients')
    email = models.EmailField()
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('campaign', 'user')
        indexes = [
            models.Index(fields=['campaign', 'user']),
        ]

    def __str__(self):
        return f"{self.email} - {self.campaign.name}"


class EmailDeliveryLog(models.Model):
    """Log each individual email delivery status."""
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('sent', 'Sent'),
        ('failed', 'Failed'),
        ('opened', 'Opened'),
        ('clicked', 'Clicked'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(MarketingCampaign, on_delete=models.CASCADE, related_name='delivery_logs')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='email_logs')
    email = models.EmailField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    sent_at = models.DateTimeField(null=True, blank=True)
    opened_at = models.DateTimeField(null=True, blank=True)
    clicked_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True, default='')
    retry_count = models.IntegerField(default=0)

    class Meta:
        ordering = ['-sent_at']
        indexes = [
            models.Index(fields=['campaign', 'status']),
            models.Index(fields=['user']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"{self.email} - {self.status}"


class EmailClickLog(models.Model):
    """Track individual link clicks from emails."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(MarketingCampaign, on_delete=models.CASCADE, related_name='click_logs')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='email_clicks')
    email = models.EmailField()
    url = models.URLField(max_length=2000)
    clicked_at = models.DateTimeField(auto_now_add=True)
    user_agent = models.CharField(max_length=500, blank=True, default='')
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    converted = models.BooleanField(default=False)  # True if user made a purchase
    converted_at = models.DateTimeField(null=True, blank=True)
    conversion_value = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    class Meta:
        ordering = ['-clicked_at']
        indexes = [
            models.Index(fields=['campaign', 'clicked_at']),
            models.Index(fields=['user']),
            models.Index(fields=['converted']),
        ]

    def __str__(self):
        return f"{self.email} clicked {self.url}"


class EmailConversion(models.Model):
    """Track conversions (purchases) from email campaigns."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    campaign = models.ForeignKey(MarketingCampaign, on_delete=models.CASCADE, related_name='conversions')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    order = models.OneToOneField('Order', on_delete=models.CASCADE, null=True, blank=True)
    click_log = models.ForeignKey(EmailClickLog, on_delete=models.SET_NULL, null=True, blank=True)
    conversion_value = models.DecimalField(max_digits=10, decimal_places=2)
    converted_at = models.DateTimeField(auto_now_add=True)
    time_to_convert = models.IntegerField(null=True, blank=True, help_text='Seconds from click to conversion')

    class Meta:
        ordering = ['-converted_at']
        indexes = [
            models.Index(fields=['campaign', 'converted_at']),
            models.Index(fields=['user']),
        ]

    def __str__(self):
        return f"{self.user.email} - ${self.conversion_value} from {self.campaign.name}"
