from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import (
    ProductViewSet, OrderViewSet, UserViewSet, DashboardStatsView, PaymentViewSet,
    RegisterView, PageContentViewSet, AffiliateViewSet, CategoryViewSet,
    RequestPasswordResetView, VerifyResetCodeView, ResetPasswordView, ReviewViewSet, BulkProductUploadView,
    SubmitInquiryView, WishlistViewSet, ContactMessageViewSet, AddressViewSet, CouponViewSet,
    HeroBannerViewSet, HomePageSectionViewSet, BlogPostViewSet, NewsletterSubscriberViewSet,
    MarketingCampaignViewSet, BlogImageView, HealthCheckView, CartViewSet, StockReservationViewSet,
    AuditLogViewSet, SecureTokenObtainPairView, BlockedIPsView
)
from .payment_views import CreatePaymentIntentView, StripeWebhookView
from .telegram_auth import TelegramLoginView
from .telegram_bot import TelegramWebhookView

from rest_framework.routers import SimpleRouter
from django.conf import settings

# SECURITY: SimpleRouter omits the public /api/ index that DefaultRouter exposes.
# DefaultRouter would advertise every endpoint to unauthenticated visitors.
router = SimpleRouter()
router.register(r'products', ProductViewSet)
router.register(r'orders', OrderViewSet, basename='orders')
router.register(r'payments', PaymentViewSet)
router.register(r'users', UserViewSet, basename='user')
router.register(r'pages', PageContentViewSet)
router.register(r'affiliates', AffiliateViewSet, basename='affiliate')
router.register(r'categories', CategoryViewSet, basename='categories')
router.register(r'reviews', ReviewViewSet)
router.register(r'wishlist', WishlistViewSet, basename='wishlist')
router.register(r'contact-messages', ContactMessageViewSet, basename='contact-messages')
router.register(r'addresses', AddressViewSet, basename='addresses')
router.register(r'coupons', CouponViewSet, basename='coupons')
router.register(r'hero-banners', HeroBannerViewSet, basename='hero-banners')
router.register(r'home-sections', HomePageSectionViewSet, basename='home-sections')
router.register(r'blog', BlogPostViewSet, basename='blog')
router.register(r'newsletter', NewsletterSubscriberViewSet, basename='newsletter')
router.register(r'marketing-campaigns', MarketingCampaignViewSet, basename='marketing-campaigns')
router.register(r'carts', CartViewSet, basename='carts')
router.register(r'reservations', StockReservationViewSet, basename='reservations')
router.register(r'audit-logs', AuditLogViewSet, basename='audit-logs')

urlpatterns = [
    path('payments/create-payment-intent/', CreatePaymentIntentView.as_view(), name='create_payment_intent'),
    path('payments/webhook/', StripeWebhookView.as_view(), name='stripe_webhook'),
    path('blog/upload-image/', BlogImageView.as_view(), name='blog-upload-image'),
    path('', include(router.urls)),
    path('auth/login/', SecureTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('products/bulk_upload/', BulkProductUploadView.as_view(), name='product-bulk-upload'),
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/password-reset/request/', RequestPasswordResetView.as_view(), name='password_reset_request'),
    path('auth/password-reset/verify/', VerifyResetCodeView.as_view(), name='password_reset_verify'),
    path('auth/password-reset/confirm/', ResetPasswordView.as_view(), name='password_reset_confirm'),
    path('inquiries/', SubmitInquiryView.as_view(), name='submit_inquiry'),
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard_stats'),
    path('auth/telegram/', TelegramLoginView.as_view(), name='auth_telegram'),
    path('webhooks/telegram/', TelegramWebhookView.as_view(), name='telegram_webhook'),
    path('health/', HealthCheckView.as_view(), name='health_check'),
    path('blocked-ips/', BlockedIPsView.as_view(), name='blocked-ips-list'),
    path('blocked-ips/unblock/', BlockedIPsView.as_view(), name='blocked-ips-unblock'),
]
