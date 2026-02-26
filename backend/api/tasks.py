import logging
from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.utils import timezone
from .models import Order, Product, User, NewsletterSubscriber, Affiliate, BlogPost
from decimal import Decimal

logger = logging.getLogger(__name__)

@shared_task
def send_welcome_email(user_id):
    """Sends a visually rich welcome email to a newly registered user."""
    try:
        user = User.objects.get(id=user_id)
        subject = f"Welcome to SmartShop, {user.first_name or user.username}! ✨"
        
        html_content = render_to_string('emails/welcome.html', {
            'user': user,
            'title': subject
        })
        text_content = strip_tags(html_content)
        
        send_mail(
            subject,
            text_content,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            html_message=html_content,
            fail_silently=True,
        )
        return f"Welcome email sent to {user.email}"
    except User.DoesNotExist:
        logger.error(f"User {user_id} not found for welcome email")

@shared_task
def send_newsletter_welcome_email(email):
    """Sends a welcome discount code to a new newsletter subscriber."""
    try:
        subject = "Welcome to SmartShop! 🛍️"
        
        html_content = render_to_string('emails/newsletter_welcome.html', {
            'title': subject
        })
        text_content = strip_tags(html_content)
        
        send_mail(
            subject,
            text_content,
            settings.DEFAULT_FROM_EMAIL,
            [email],
            html_message=html_content,
            fail_silently=True,
        )
        return f"Newsletter welcome email sent to {email}"
    except Exception as e:
        logger.error(f"Newsletter welcome email failed for {email}: {str(e)}")

@shared_task
def send_order_confirmation_email(order_id):
    """Sends a visually rich email confirmation to the customer after a successful order."""
    try:
        order = Order.objects.get(id=order_id)
        subject = f'Order Confirmation - #{order.id}'
        
        # Render HTML content using template
        html_content = render_to_string('emails/order_confirmation.html', {'order': order, 'title': subject})
        text_content = strip_tags(html_content)
        
        send_mail(
            subject,
            text_content,
            settings.DEFAULT_FROM_EMAIL,
            [order.user.email],
            html_message=html_content,
            fail_silently=False,
        )
        return f"Confirmation email sent for Order {order_id}"
    except Order.DoesNotExist:
        logger.error(f"Order {order_id} not found for confirmation email")
    except Exception as e:
        logger.error(f"Error sending confirmation email for order {order_id}: {str(e)}")

@shared_task
def send_password_reset_email(user_id, token):
    """Sends a visually rich password reset token to the user."""
    try:
        user = User.objects.get(id=user_id)
        subject = 'Password Reset Request - SMARTSHOP'
        
        # Render HTML content using template
        html_content = render_to_string('emails/password_reset.html', {
            'user': user, 
            'token': token,
            'title': subject
        })
        text_content = f'Your password reset token is: {token}. It expires in 1 hour.'
        
        send_mail(
            subject,
            text_content,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            html_message=html_content,
            fail_silently=False,
        )
        return f"Password reset email sent to {user.email}"
    except User.DoesNotExist:
        logger.error(f"User {user_id} not found for password reset")


@shared_task
def calculate_affiliate_commissions():
    """Periodic task to calculate and update affiliate earnings based on referred orders."""
    # This is a placeholder logic. You'd typically find orders that haven't been processed for commission yet.
    # For now, let's assume 10% commission on referred users' orders.
    referrals = User.objects.filter(referred_by__isnull=False)
    total_processed = 0
    
    for user in referrals:
        # Example: Get orders from the last 24 hours
        yesterday = timezone.now() - timezone.timedelta(days=1)
        recent_orders = Order.objects.filter(user=user, created_at__gte=yesterday, status='delivered')
        
        if recent_orders.exists():
            referrer = user.referred_by.referrer
            commission = sum(order.total_amount for order in recent_orders) * Decimal('0.10')
            
            # Update referrer earnings
            referrer.referral_earnings += commission
            referrer.save()
            total_processed += 1
            
    return f"Processed commissions for {total_processed} instances"

@shared_task
def send_newsletter(blog_post_id):
    """Sends rich HTML newsletter notifications for a new blog post to all active subscribers."""
    try:
        post = BlogPost.objects.get(id=blog_post_id)
        subscribers = NewsletterSubscriber.objects.filter(is_active=True)
        recipient_list = [s.email for s in subscribers]
        
        if not recipient_list:
            return "No active subscribers found"

        subject = f"SmartShop Trends: {post.title}"
        html_content = render_to_string('emails/newsletter_blog.html', {
            'post': post,
            'title': subject
        })
        text_content = strip_tags(html_content)
        
        send_mail(
            subject,
            text_content,
            settings.DEFAULT_FROM_EMAIL,
            recipient_list,
            html_message=html_content,
            fail_silently=True
        )
        return f"Newsletter sent to {len(recipient_list)} subscribers"
    except BlogPost.DoesNotExist:
        logger.error(f"Blog post {blog_post_id} not found for newsletter")


@shared_task
def check_low_stock():
    """Periodic task to identify products with low stock and notify sellers/admins."""
    LOW_STOCK_THRESHOLD = 5
    low_stock_products = Product.objects.filter(stock_quantity__lte=LOW_STOCK_THRESHOLD)
    
    if low_stock_products.exists():
        product_names = ", ".join([p.name for p in low_stock_products])
        subject = "Low Stock Alert"
        message = f"The following products are low on stock: {product_names}. Please restock soon."
        
        # Send to admin email
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [settings.SERVER_EMAIL],
            fail_silently=True
        )
        return f"Low stock alert sent for {low_stock_products.count()} products"
    return "Stock levels are healthy"

@shared_task
def process_flash_sales():
    """Periodic task to enable/disable flash sales based on current time."""
    now = timezone.now()
    
    # Enable sales that should start
    started = Product.objects.filter(
        flash_sale_start__lte=now,
        flash_sale_end__gt=now,
        discount_percentage=0 # Assuming 0 means not yet in sale for this logic
    ).update(discount_percentage=20) # Example: set to 20%
    
    # Disable sales that have ended
    ended = Product.objects.filter(
        flash_sale_end__lte=now,
        discount_percentage__gt=0
    ).update(discount_percentage=0)
    
    return f"Flash sales updated: {started} started, {ended} ended"

@shared_task
def aggregate_analytics():
    """Periodic task to aggregate daily sales and user activity for dashboard reports."""
    # Placeholder for complex aggregation logic
    today = timezone.now().date()
    daily_orders = Order.objects.filter(created_at__date=today).count()
    daily_revenue = sum(Order.objects.filter(created_at__date=today).values_list('total_amount', flat=True))
    
    # In a real app, you might save this to an AnalyticsSummary model
    logger.info(f"Daily Analytics for {today}: Orders: {daily_orders}, Revenue: {daily_revenue}")
    return f"Analytics aggregated for {today}"
