from rest_framework import viewsets, permissions, status, filters, parsers
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
from django.contrib.auth import get_user_model
from .models import Product, Order, OrderItem, Payment, PageContent, Affiliate
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
            role=role
        )
        
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    parser_classes = (parsers.MultiPartParser, parsers.FormParser)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'brand', 'seller', 'is_featured', 'is_popular']
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'created_at']

    def perform_create(self, serializer):
        # Allow admins to create products (assign to themselves or handle normally)
        serializer.save(seller=self.request.user)

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
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

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
