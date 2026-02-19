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
    SubmitInquiryView, WishlistViewSet, ContactMessageViewSet, AddressViewSet
)

from rest_framework.routers import SimpleRouter, DefaultRouter
from django.conf import settings

router = DefaultRouter()
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

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('products/bulk_upload/', BulkProductUploadView.as_view(), name='product-bulk-upload'),
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/password-reset/request/', RequestPasswordResetView.as_view(), name='password_reset_request'),
    path('auth/password-reset/verify/', VerifyResetCodeView.as_view(), name='password_reset_verify'),
    path('auth/password-reset/confirm/', ResetPasswordView.as_view(), name='password_reset_confirm'),
    path('inquiries/', SubmitInquiryView.as_view(), name='submit_inquiry'),
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard_stats'),
]
