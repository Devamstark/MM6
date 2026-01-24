from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import ProductViewSet, OrderViewSet, UserViewSet, DashboardStatsView, PaymentViewSet, RegisterView, PageContentViewSet, AffiliateViewSet

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'orders', OrderViewSet, basename='orders')
router.register(r'payments', PaymentViewSet)
router.register(r'users', UserViewSet)
router.register(r'pages', PageContentViewSet)
router.register(r'affiliates', AffiliateViewSet, basename='affiliate')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('dashboard/stats/', DashboardStatsView.as_view(), name='dashboard_stats'),
]
