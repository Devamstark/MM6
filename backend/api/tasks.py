import logging
from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.utils import timezone
from .models import Order, Product, User, NewsletterSubscriber, Affiliate, BlogPost, MarketingCampaign, EmailDeliveryLog, CampaignRecipient
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
            subject=subject,
            message=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.DEFAULT_FROM_EMAIL],
            bcc=recipient_list,
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

@shared_task
def send_marketing_campaign(campaign_id):
    """Enterprise-grade campaign sending with batching, logging and retry."""
    try:
        campaign = MarketingCampaign.objects.get(id=campaign_id)
        if campaign.status not in ('draft', 'scheduled', 'sending'):
            return f"Campaign {campaign_id} not in sendable state: {campaign.status}"

        campaign.status = 'sending'
        campaign.save(update_fields=['status'])

        # Resolve audience
        users = _resolve_audience(campaign)

        if not users.exists():
            campaign.status = 'sent'
            campaign.total_recipients = 0
            campaign.save(update_fields=['status', 'total_recipients'])
            return "No valid recipients found."

        # Snapshot recipients using bulk_create
        recipients_to_create = []
        for user in users:
            if user.email:
                recipients_to_create.append(CampaignRecipient(campaign=campaign, user=user, email=user.email))
        
        CampaignRecipient.objects.bulk_create(recipients_to_create, ignore_conflicts=True)
        recipient_count = CampaignRecipient.objects.filter(campaign=campaign).count()

        campaign.total_recipients = recipient_count
        campaign.save(update_fields=['total_recipients'])

        # Create delivery logs for all recipients using bulk_create
        recipients = CampaignRecipient.objects.filter(campaign=campaign)
        logs_to_create = []
        for recipient in recipients:
            logs_to_create.append(EmailDeliveryLog(campaign=campaign, user=recipient.user, email=recipient.email, status='pending'))
        
        EmailDeliveryLog.objects.bulk_create(logs_to_create, ignore_conflicts=True)

        # Send in batches
        batch_size = campaign.batch_size or 200
        pending_logs = EmailDeliveryLog.objects.filter(campaign=campaign, status='pending')
        total = pending_logs.count()

        for i in range(0, total, batch_size):
            batch = list(pending_logs[i:i + batch_size])
            _send_batch.delay(campaign.id, [str(log.id) for log in batch])

        return f"Campaign {campaign_id}: dispatched {total} emails in batches of {batch_size}."

    except MarketingCampaign.DoesNotExist:
        logger.error(f"Campaign {campaign_id} not found.")
    except Exception as e:
        logger.error(f"Campaign {campaign_id} failed: {str(e)}")
        try:
            campaign = MarketingCampaign.objects.get(id=campaign_id)
            campaign.status = 'failed'
            campaign.save(update_fields=['status'])
        except Exception:
            pass


@shared_task
def _send_batch(campaign_id, log_ids):
    """Send a batch of emails for a campaign."""
    try:
        campaign = MarketingCampaign.objects.get(id=campaign_id)

        # Build SmartShop branded email template
        base_url = 'https://smartshop1.us'

        # Build CTA button section if cta_text exists
        cta_section = ''
        if campaign.cta_text:
            cta_section = f'''
            <tr>
                <td align="center" style="padding: 0 32px 40px;">
                    <a href="{{{{CTA_URL}}}}" style="display: inline-block; background-color: #4F46E5; color: #ffffff; padding: 16px 40px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px; letter-spacing: 0.02em;">
                        {campaign.cta_text or 'Shop Now'}
                    </a>
                </td>
            </tr>
            '''

        # Build discount code section if exists
        discount_section = ''
        if campaign.discount_code:
            discount_section = f'''
            <tr>
                <td align="center" style="padding: 0 32px 32px;">
                    <table cellpadding="0" cellspacing="0">
                        <tr>
                            <td style="border: 2px dashed #4F46E5; border-radius: 8px; padding: 16px 32px; background-color: #EEF2FF;">
                                <p style="margin: 0; font-size: 12px; color: #6B7280; font-weight: 600; text-transform: uppercase;">Use Code</p>
                                <p style="margin: 8px 0 0 0; font-size: 24px; font-weight: 900; color: #4F46E5; letter-spacing: 0.05em;">{campaign.discount_code}</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
            '''

        # Start with branded header
        html_message = f'''<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>{campaign.subject}</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 0;">
                <tr>
                    <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                            <!-- Header with Logo -->
                            <tr>
                                <td style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); padding: 32px 24px; text-align: center;">
                                    <h1 style="margin: 0; font-size: 28px; font-weight: 900; letter-spacing: 0.1em; color: #ffffff;">SMARTSHOP</h1>
                                    <p style="margin: 8px 0 0 0; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.8); letter-spacing: 0.05em;">EST. 2026</p>
                                </td>
                            </tr>
                            <!-- Main Content -->
                            <tr>
                                <td style="padding: 40px 32px;">
                                    {campaign.message}
                                </td>
                            </tr>
                            {cta_section}
                            {discount_section}
                            <!-- Footer -->
                            <tr>
                                <td style="background-color: #1F2937; padding: 32px 24px; text-align: center;">
                                    <p style="margin: 0 0 16px 0; font-size: 14px; font-weight: 700; color: #ffffff; letter-spacing: 0.05em;">SMARTSHOP</p>
                                    <p style="margin: 0 0 24px 0; font-size: 12px; color: #9CA3AF; line-height: 1.6;">
                                        You are receiving this email because you are a registered user of SmartShop.<br>
                                        We respect your privacy and will never share your information.
                                    </p>
                                    <table width="100%" cellpadding="0" cellspacing="0">
                                        <tr>
                                            <td align="center" style="padding: 12px 0; border-top: 1px solid #374151;">
                                                <a href="{{{{UNSUBSCRIBE_URL}}}}" style="color: #9CA3AF; font-size: 12px; text-decoration: underline;">Unsubscribe</a>
                                                <span style="color: #4B5563; margin: 0 8px;">|</span>
                                                <a href="{base_url}/profile" style="color: #9CA3AF; font-size: 12px; text-decoration: underline;">Update Preferences</a>
                                                <span style="color: #4B5563; margin: 0 8px;">|</span>
                                                <a href="{base_url}" style="color: #9CA3AF; font-size: 12px; text-decoration: underline;">View in Browser</a>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td align="center" style="padding-top: 16px;">
                                                <p style="margin: 0; font-size: 11px; color: #6B7280;">
                                                    &copy; 2026 SmartShop. All rights reserved.
                                                </p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                        <!-- Mailing Address (CAN-SPAM Compliance) -->
                        <table width="600" cellpadding="0" cellspacing="0">
                            <tr>
                                <td align="center" style="padding: 24px 0; color: #9CA3AF; font-size: 11px;">
                                    SmartShop Inc.<br>
                                    123 Commerce Street<br>
                                    Digital City, DC 12345
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>'''

        # Add tracking to CTA URL
        if campaign.cta_url:
            tracked_url = f"{base_url}/api/campaigns/{campaign.id}/track-click/?user_id={{{{USER_ID}}}}&email={{{{EMAIL}}}}&url={campaign.cta_url}"
            html_message = html_message.replace('{{{{CTA_URL}}}}', tracked_url)
        else:
            html_message = html_message.replace('{{{{CTA_URL}}}}', '#')

        # Add unsubscribe URL
        unsubscribe_url = f"{base_url}/profile?unsubscribe=campaign-{campaign.id}"
        html_message = html_message.replace('{{{{UNSUBSCRIBE_URL}}}}', unsubscribe_url)

        # Replace user-specific placeholders
        from django.utils.html import strip_tags
        text_message = campaign.plain_text or strip_tags(html_message)

        logs = EmailDeliveryLog.objects.filter(id__in=log_ids)
        sent_count = 0
        failed_count = 0

        for log in logs:
            try:
                # Personalize email for each user
                personalized_html = html_message.replace('{{{{USER_ID}}}}', str(log.user.id))
                personalized_html = personalized_html.replace('{{{{EMAIL}}}}', log.email)

                # Try to personalize with user's name if available
                user_name = getattr(log.user, 'first_name', None) or log.email.split('@')[0]
                personalized_html = personalized_html.replace('{{customer_name}}', user_name)
                personalized_text = text_message.replace('{{customer_name}}', user_name)

                send_mail(
                    subject=campaign.subject,
                    message=personalized_text,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[log.email], # CRITICAL: MUST BE A SINGLE ELEMENT LIST
                    html_message=personalized_html,
                    fail_silently=False,
                )
                log.status = 'sent'
                log.sent_at = timezone.now()
                log.save(update_fields=['status', 'sent_at'])
                sent_count += 1
            except Exception as e:
                log.retry_count += 1
                if log.retry_count < 3:
                    log.status = 'pending'  # Will be retried
                    log.error_message = str(e)
                    log.save(update_fields=['status', 'error_message', 'retry_count'])
                else:
                    log.status = 'failed'
                    log.error_message = str(e)
                    log.save(update_fields=['status', 'error_message', 'retry_count'])
                    failed_count += 1

        # Update campaign counters atomically
        from django.db.models import F
        MarketingCampaign.objects.filter(id=campaign_id).update(
            emails_sent=F('emails_sent') + sent_count,
            emails_failed=F('emails_failed') + failed_count,
        )

        # Check if all logs are processed (sent or failed) to mark campaign as done
        campaign.refresh_from_db()
        remaining = EmailDeliveryLog.objects.filter(campaign=campaign, status='pending').count()
        if remaining == 0:
            campaign.status = 'sent'
            campaign.sent_at = timezone.now()
            campaign.save(update_fields=['status', 'sent_at'])

        return f"Batch complete: {sent_count} sent, {failed_count} failed."

    except MarketingCampaign.DoesNotExist:
        logger.error(f"Campaign {campaign_id} not found for batch send.")
    except Exception as e:
        logger.error(f"Batch send failed for campaign {campaign_id}: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())


def _resolve_audience(campaign):
    """Resolve the target audience queryset based on campaign audience_type."""
    base_qs = User.objects.filter(role='user', is_active=True).exclude(email='').exclude(email__isnull=True)

    if campaign.audience_type == 'all_users':
        return base_qs

    elif campaign.audience_type == 'ordered_once':
        user_ids_with_orders = Order.objects.values_list('user_id', flat=True).distinct()
        return base_qs.filter(id__in=user_ids_with_orders)

    elif campaign.audience_type == 'never_ordered':
        user_ids_with_orders = Order.objects.values_list('user_id', flat=True).distinct()
        return base_qs.exclude(id__in=user_ids_with_orders)

    elif campaign.audience_type == 'recent_signups':
        cutoff = timezone.now() - timezone.timedelta(days=campaign.audience_days or 30)
        return base_qs.filter(date_joined__gte=cutoff)

    elif campaign.audience_type == 'abandoned_cart':
        # Users who have never completed an order (proxy for abandoned cart)
        user_ids_with_orders = Order.objects.exclude(status='cancelled').values_list('user_id', flat=True).distinct()
        return base_qs.exclude(id__in=user_ids_with_orders)

    elif campaign.audience_type == 'manual':
        if campaign.manual_user_ids:
            return base_qs.filter(id__in=campaign.manual_user_ids)
        return User.objects.none()

    return base_qs

@shared_task
def prune_old_logs():
    """Periodic task to delete logs and old records (e.g. > 6 months old) to prevent DB bloat."""
    from dateutil.relativedelta import relativedelta
    six_months_ago = timezone.now() - relativedelta(months=6)
    
    deleted_emails = EmailDeliveryLog.objects.filter(sent_at__lt=six_months_ago).delete()
    deleted_clicks = EmailClickLog.objects.filter(clicked_at__lt=six_months_ago).delete()
    
    logger.info(f"Pruned {deleted_emails[0]} old email logs and {deleted_clicks[0]} old click logs.")
    return f"Pruning complete. {deleted_emails[0]} emails, {deleted_clicks[0]} clicks deleted."
