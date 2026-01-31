from rest_framework import viewsets, permissions, status, filters, parsers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
import django_filters
from django.contrib.auth import get_user_model
from django.utils import timezone
import random
from datetime import timedelta
from .models import Product, Order, OrderItem, Payment, PageContent, Affiliate, PasswordResetToken
from .serializers import ProductSerializer, OrderSerializer, UserSerializer, PaymentSerializer, PageContentSerializer, AffiliateSerializer

User = get_user_model()

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        role = request.data.get('role', 'user')
        name = request.data.get('name', '')

        if not email or not password:
            return Response({'error': 'Email and Password are required'}, status=status.HTTP_400_BAD_REQUEST)

        # Use email as username if username not provided
        if not username:
            username = email

        if User.objects.filter(username=username).exists():
            return Response({'error': 'User already exists'}, status=status.HTTP_400_BAD_REQUEST)

        first_name = ""
        last_name = ""
        if name:
            parts = name.split(' ', 1)
            first_name = parts[0]
            last_name = parts[1] if len(parts) > 1 else ""

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            role='user' # Force role to be user for public registration
        )
        
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)



class ProductFilter(django_filters.FilterSet):
    min_price = django_filters.NumberFilter(field_name="price", lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr='lte')
    # ordering is handled by OrderingFilter backend, but we can verify it here

    on_sale = django_filters.BooleanFilter(method='filter_on_sale')

    class Meta:
        model = Product
        fields = ['category', 'subcategory', 'brand', 'seller', 'is_featured', 'is_popular']

    def filter_on_sale(self, queryset, name, value):
        if value:
            return queryset.filter(discount_percentage__gt=0)
        return queryset


class CategoryViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]

    def list(self, request):
        items = Product.objects.values('category', 'subcategory').distinct()
        data = {}
        for item in items:
            cat = item['category']
            sub = item['subcategory']
            if cat:
                if cat not in data:
                    data[cat] = []
                if sub and sub not in data[cat]:
                    data[cat].append(sub)
        return Response(data)

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = (parsers.MultiPartParser, parsers.FormParser)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'created_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        # Explicitly apply manual overrides if needed, BUT
        # with filterset_class defined properly above, min_price/max_price should work automatically.
        # The issue might be that previous implementations mixed get_queryset with filter_backends.
        # By strictly using django-filters (ProductFilter class), we ensure clean logic.
        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        if user.role not in ['admin', 'seller']:
            # In a real app we might raise PermissionDenied, but here we just won't save or raise error
            # Better to use proper Permission classes, but this is a quick fix
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only sellers and admins can create products.")
        
        # Allow admins to create products (assign to themselves or handle normally)
        serializer.save(seller=user)

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Order.objects.all()
        # Sellers see orders containing their products (complex logic, simplified here to 'see all' or 'see own')
        # For simplicity in this stage: Users see their own orders.
        return Order.objects.filter(user=user)

    def create(self, request, *args, **kwargs):
        # Custom creation logic to handle items transactionally
        # Expects: { items: [{id, quantity, price}...], total_amount: 100, shipping_address: {...} }
        data = request.data
        if not data.get('items'):
            return Response({"error": "No items provided"}, status=status.HTTP_400_BAD_REQUEST)

        order = Order.objects.create(
            user=request.user,
            customer_name=data.get('customerName') or request.user.get_full_name(),
            total_amount=data.get('totalPrice'),
            status='pending'
        )

        for item in data.get('items'):
            OrderItem.objects.create(
                order=order,
                product_id=item['id'],
                quantity=item['quantity'],
                price_at_purchase=item['price']
            )

        serializer = self.get_serializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [permissions.IsAuthenticated]

class PageContentViewSet(viewsets.ModelViewSet):
    queryset = PageContent.objects.all()
    serializer_class = PageContentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'slug'

class AffiliateViewSet(viewsets.ModelViewSet):
    serializer_class = AffiliateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Affiliate.objects.all()
        return Affiliate.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return User.objects.all()
        return User.objects.filter(id=user.id)

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Mock aggregation for dashboard
        total_revenue = 0 # Calculate from orders
        total_orders = Order.objects.count()
        total_products = Product.objects.count()
        total_users = User.objects.count()
        
        return Response({
            "totalRevenue": total_revenue,
            "totalOrders": total_orders,
            "totalProducts": total_products,
            "totalUsers": total_users
        })

class RequestPasswordResetView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # For security, don't reveal that the user doesn't exist
            return Response({'message': 'If an account exists, a reset code has been sent.'}, status=status.HTTP_200_OK)

        if user.role == 'admin':
             return Response({'error': 'Password reset is not allowed for admin accounts.'}, status=status.HTTP_403_FORBIDDEN)

        # Generate 6-digit code
        code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        
        # Save token
        # Invalidate old tokens for this user
        PasswordResetToken.objects.filter(user=user).delete()
        
        PasswordResetToken.objects.create(
            user=user,
            token=code,
            expires_at=timezone.now() + timedelta(minutes=15)
        )
        
        # Send Email (Mocking for now as per usual local dev without SMTP)
        print(f"PASSWORD RESET CODE FOR {email}: {code}")
        
        return Response({'message': 'Reset code sent successfully'}, status=status.HTTP_200_OK)

class VerifyResetCodeView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('code')
        
        if not email or not code:
            return Response({'error': 'Email and code are required'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            user = User.objects.get(email=email)
            token = PasswordResetToken.objects.get(user=user, token=code)
            
            if not token.is_valid():
                token.delete()
                return Response({'error': 'Code has expired'}, status=status.HTTP_400_BAD_REQUEST)
                
            return Response({'message': 'Code verified'}, status=status.HTTP_200_OK)
            
        except (User.DoesNotExist, PasswordResetToken.DoesNotExist):
            return Response({'error': 'Invalid code or email'}, status=status.HTTP_400_BAD_REQUEST)

class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('code')
        new_password = request.data.get('new_password')
        
        if not email or not code or not new_password:
            return Response({'error': 'Email, code, and new password are required'}, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            user = User.objects.get(email=email)
            if user.role == 'admin':
                return Response({'error': 'Password reset is not allowed for admin accounts.'}, status=status.HTTP_403_FORBIDDEN)

            token = PasswordResetToken.objects.get(user=user, token=code)
            
            if not token.is_valid():
                token.delete()
                return Response({'error': 'Code has expired'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Reset Password
            user.set_password(new_password)
            user.save()
            
            # Delete token
            token.delete()
            
            return Response({'message': 'Password reset successfully'}, status=status.HTTP_200_OK)
            
        except (User.DoesNotExist, PasswordResetToken.DoesNotExist):
            return Response({'error': 'Invalid code or email'}, status=status.HTTP_400_BAD_REQUEST)
