from rest_framework import viewsets, permissions, status, filters, parsers
from django.db.models import Sum
from django.db.models.functions import ExtractMonth
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend
import django_filters
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.conf import settings
import random
from decimal import Decimal
from datetime import timedelta
from .models import (
    Product, Order, OrderItem, Payment, User, PasswordResetToken, PageContent,
    Affiliate, Review, Wishlist, ContactMessage, Address, Coupon,
    HeroBanner, HomePageSection, BlogPost, NewsletterSubscriber,
    MarketingCampaign, EmailDeliveryLog, CampaignRecipient,
    EmailClickLog, EmailConversion
)
from .serializers import (
    ProductSerializer, OrderSerializer, UserSerializer, PaymentSerializer,
    PageContentSerializer, AffiliateSerializer, ReviewSerializer, WishlistSerializer,
    ContactMessageSerializer, AddressSerializer, CouponSerializer,
    HeroBannerSerializer, HomePageSectionSerializer, BlogPostSerializer,
    NewsletterSubscriberSerializer, MarketingCampaignSerializer,
    EmailDeliveryLogSerializer, CampaignRecipientSerializer,
    EmailClickLogSerializer, EmailConversionSerializer, CampaignConversionAnalyticsSerializer
)

# ...

class SubmitInquiryView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ContactMessageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Inquiry received and saved.'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class WishlistViewSet(viewsets.ModelViewSet):
    serializer_class = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Wishlist.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        product_id = serializer.validated_data.get('product_id')
        product = Product.objects.get(id=product_id)
        
        # Check if already in wishlist
        if Wishlist.objects.filter(user=self.request.user, product=product).exists():
            from rest_framework.exceptions import ValidationError
            raise ValidationError("Product already in wishlist")
            
        serializer.save(user=self.request.user, product=product)

    @action(detail=False, methods=['post'])
    def toggle(self, request):
        product_id = request.data.get('product_id')
        if not product_id:
            return Response({'error': 'Product ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
             return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
        
        wishlist_item = Wishlist.objects.filter(user=request.user, product=product).first()
        if wishlist_item:
            wishlist_item.delete()
            return Response({'status': 'removed', 'in_wishlist': False})
        else:
            Wishlist.objects.create(user=request.user, product=product)
            return Response({'status': 'added', 'in_wishlist': True})

User = get_user_model()

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        from django.db import transaction
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        role = request.data.get('role', 'user')
        name = request.data.get('name', '')
        ref_code = request.data.get('ref_code', '').strip()

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

        with transaction.atomic():
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name,
                last_name=last_name,
                role='user'  # Force role to be user for public registration
            )

            # --- Referral Bonus ---
            if ref_code:
                try:
                    affiliate = Affiliate.objects.select_related('user').get(referral_code=ref_code)
                    referrer = affiliate.user
                    # Guard: cannot self-refer, and each new user can only be referred once
                    if referrer != user and not ReferralSignup.objects.filter(referred_user=user).exists():
                        # Credit referrer $1
                        referrer.referral_earnings = referrer.referral_earnings + Decimal('1.00')
                        referrer.save(update_fields=['referral_earnings'])
                        # Record the signup so we never double-credit
                        ReferralSignup.objects.create(referrer=referrer, referred_user=user)
                except Affiliate.DoesNotExist:
                    pass  # Invalid code – silently ignore

        # Send Welcome Email via Celery
        try:
            from .tasks import send_welcome_email
            send_welcome_email.delay(user.id)
        except Exception as e:
            import logging
            logging.getLogger(__name__).error(f"Failed to queue welcome email: {str(e)}")

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
    parser_classes = (parsers.JSONParser, parsers.MultiPartParser, parsers.FormParser)
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = ProductFilter
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'created_at', 'display_order']

    def get_object(self):
        queryset = self.filter_queryset(self.get_queryset())
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        lookup_value = self.kwargs[lookup_url_kwarg]
        
        try:
            # Try UUID first
            import uuid
            uuid.UUID(lookup_value)
            filter_kwargs = {'pk': lookup_value}
        except (ValueError, TypeError):
            # Fallback to slug
            filter_kwargs = {'slug': lookup_value}
            
        from django.shortcuts import get_object_or_404
        obj = get_object_or_404(queryset, **filter_kwargs)
        self.check_object_permissions(self.request, obj)
        return obj

    def get_queryset(self):
        queryset = super().get_queryset()
        # Explicitly apply manual overrides if needed, BUT
        # with filterset_class defined properly above, min_price/max_price should work automatically.
        # The issue might be that previous implementations mixed get_queryset with filter_backends.
        # By strictly using django-filters (ProductFilter class), we ensure clean logic.
        return queryset

    @action(detail=False, methods=['get'])
    def search(self, request):
        query = request.query_params.get('q', '')
        if not query:
             return Response([])
        
        from django.db.models import Q
        # Search name, description, category, brand
        products = Product.objects.filter(
            Q(name__icontains=query) | 
            Q(description__icontains=query) | 
            Q(category__icontains=query) |
            Q(brand__icontains=query)
        ).distinct()[:20] # Limit results
        
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def suggestions(self, request):
        query = request.query_params.get('q', '')
        if not query:
            return Response({"categories": [], "products": []})
        
        # Categories matching the query
        cats = Product.objects.filter(category__icontains=query).values_list('category', flat=True).distinct()[:3]
        
        # Products matching the query (rich results)
        products = Product.objects.filter(
            Q(name__icontains=query) | 
            Q(brand__icontains=query)
        ).distinct()[:5]
        
        product_serializer = self.get_serializer(products, many=True)
        
        return Response({
            "categories": list(cats),
            "products": product_serializer.data
        })

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            import traceback
            print(traceback.format_exc())
            return Response({
                "error": str(e),
                "type": type(e).__name__,
                "trace": traceback.format_exc()
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def perform_create(self, serializer):
        user = self.request.user
        if user.role not in ['admin', 'seller']:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only sellers and admins can create products.")
        
        instance = serializer.save(seller=user)
        self.handle_additional_images(instance)

    def perform_update(self, serializer):
        # If 'image' is present in validated_data and is None, it's because
        # an empty value was sent for the image field. We want to prevent this
        # from clearing the existing image. We do this by removing the 'image'
        # key from the serializer's internal validated data dictionary before saving.
        if 'image' in serializer.validated_data and serializer.validated_data['image'] is None:
            # Accessing _validated_data is not ideal, but it's a reliable way
            # to modify the data before save() is called.
            if 'image' in serializer._validated_data:
                 del serializer._validated_data['image']

        instance = serializer.save()
        self.handle_additional_images(instance)

    def handle_additional_images(self, instance):
        # Correctly get new files from 'additional_images_files' field
        files = self.request.FILES.getlist('additional_images_files')
        # Get existing image URLs from 'additional_images' field
        existing_images = [img for img in self.request.data.getlist('additional_images') if img and isinstance(img, str)]

        from django.core.files.storage import default_storage
        import uuid
        import os

        new_urls = []
        for f in files:
            ext = os.path.splitext(f.name)[1]
            filename = f"products/{uuid.uuid4()}{ext}"
            saved_path = default_storage.save(filename, f)
            # Create an absolute URL for the image
            url = self.request.build_absolute_uri(default_storage.url(saved_path))
            new_urls.append(url)

        # If new files are uploaded, existing_images from the form should be used.
        # If no new files are uploaded and 'additional_images' is not in the form,
        # we should not wipe the existing images in the database.
        if files or 'additional_images' in self.request.data:
            instance.additional_images = existing_images + new_urls
        
        # Save the instance only if there are changes.
        if files or 'additional_images' in self.request.data:
            instance.save()

    @action(detail=False, methods=['post'], url_path='reorder')
    def reorder(self, request):
        """
        Expects a list of objects with 'id' and 'display_order'.
        Example: [{id: 1, display_order: 0}, {id: 2, display_order: 1}]
        """
        items = request.data.get('items', [])
        for item in items:
            try:
                obj = Product.objects.get(id=item['id'])
                obj.display_order = item['display_order']
                obj.save(update_fields=['display_order'])
            except Product.DoesNotExist:
                continue
        return Response({'status': 'reordered'})

    @action(detail=True, methods=['post'])
    def publish(self, request, pk=None):
        """Publishes a product."""
        instance = self.get_object()
        # Add permission check if needed, e.g., only seller/admin can publish their own product
        if request.user != instance.seller and request.user.role != 'admin':
            return Response({'error': 'You do not have permission to publish this product.'}, status=status.HTTP_403_FORBIDDEN)
        
        instance.is_published = True
        instance.save(update_fields=['is_published'])
        return Response({'status': 'published'})


class NewsletterSubscriberViewSet(viewsets.ModelViewSet):
    queryset = NewsletterSubscriber.objects.all()
    serializer_class = NewsletterSubscriberSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        email = request.data.get('email')
        if email and NewsletterSubscriber.objects.filter(email=email).exists():
            return Response({'message': 'You are already subscribed!'}, status=status.HTTP_200_OK)
        
        response = super().create(request, *args, **kwargs)

        # Send Newsletter Welcome Email via Celery
        if response.status_code == status.HTTP_201_CREATED:
            try:
                from .tasks import send_newsletter_welcome_email
                send_newsletter_welcome_email.delay(email)
            except Exception as e:
                import logging
                logging.getLogger(__name__).error(f"Failed to queue newsletter email for {email}: {str(e)}")
        return response

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAdminUser()]
        return [permissions.AllowAny()]

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
        # Expects: { items: [{id, quantity, price}...], total_amount: 100, shipping_address: {...}, use_earnings: bool }
        data = request.data
        if not data.get('items'):
            return Response({"error": "No items provided"}, status=status.HTTP_400_BAD_REQUEST)

        from django.db import transaction
        EARNINGS_MINIMUM = Decimal('10.00')  # Minimum balance required to redeem
        try:
            with transaction.atomic():
                user = request.user
                raw_total = Decimal(str(data.get('totalPrice', 0)))
                earnings_applied = Decimal('0.00')

                # --- Apply referral earnings as a discount ---
                use_earnings = data.get('use_earnings', False)
                if use_earnings and user.referral_earnings >= EARNINGS_MINIMUM:
                    # Apply up to the full balance, but never more than the order total
                    earnings_applied = min(user.referral_earnings, raw_total)
                    raw_total = raw_total - earnings_applied
                    # Deduct from user's balance
                    user.referral_earnings = user.referral_earnings - earnings_applied
                    user.save(update_fields=['referral_earnings'])

                order = Order.objects.create(
                    user=user,
                    customer_name=data.get('customerName') or user.get_full_name(),
                    total_amount=raw_total,
                    status='pending',
                    coupon_code=data.get('couponCode'),
                    shipping_address=data.get('shipping_address') or ''
                )

                for item in data.get('items'):
                    product = Product.objects.select_for_update().get(id=item['id'])

                    quantity = int(item['quantity'])
                    if product.stock_quantity < quantity:
                        raise ValueError(f"Insufficient stock for {product.name}. Available: {product.stock_quantity}")

                    # Decrement stock
                    product.stock_quantity -= quantity
                    product.save(update_fields=['stock_quantity'])

                    OrderItem.objects.create(
                        order=order,
                        product=product,
                        quantity=quantity,
                        price_at_purchase=item['price']
                    )

                serializer = self.get_serializer(order)
                response_data = serializer.data
                response_data['earnings_applied'] = str(earnings_applied)

                # --- Trigger Order Confirmation Email ---
                try:
                    from .tasks import send_order_confirmation_email
                    send_order_confirmation_email.delay(order.id)
                except Exception as e:
                    import logging
                    logging.getLogger(__name__).error(f"Failed to queue order confirmation email: {str(e)}")

                return Response(response_data, status=status.HTTP_201_CREATED)
        except Product.DoesNotExist:
            return Response({"error": "One or more products not found"}, status=status.HTTP_404_NOT_FOUND)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], url_path='my_orders')
    def my_orders(self, request):
        orders = Order.objects.filter(user=request.user).order_by('-created_at')
        serializer = self.get_serializer(orders, many=True)
        return Response(serializer.data)

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
    queryset = Affiliate.objects.all()
    serializer_class = AffiliateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Affiliate.objects.all()
        return Affiliate.objects.filter(user=user)

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.get_queryset()
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def create(self, request, *args, **kwargs):
        # Check if user already has an affiliate profile
        if Affiliate.objects.filter(user=request.user).exists():
            return Response(
                {"error": "You already have an affiliate profile."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'patch', 'delete', 'head', 'options']

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return User.objects.all()
        return User.objects.filter(id=user.id)

    def destroy(self, request, *args, **kwargs):
        """Admin-only: delete a user account."""
        if request.user.role != 'admin':
            return Response({'error': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)
        instance = self.get_object()
        if instance.id == request.user.id:
            return Response({'error': 'You cannot delete your own account.'}, status=status.HTTP_400_BAD_REQUEST)
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    @action(detail=False, methods=['delete'])
    def delete_self(self, request):
        """GDPR: Allow a user to delete their own account."""
        user = request.user
        if user.role == 'admin':
             return Response({'error': 'Admins cannot delete themselves via this endpoint.'}, status=status.HTTP_400_BAD_REQUEST)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'])
    def export_data(self, request):
        """GDPR: Allow a user to download their data."""
        from .serializers import OrderSerializer, AddressSerializer, ReviewSerializer
        from .models import Order, Address, Review
        
        user = request.user
        data = {
            'profile': UserSerializer(user).data,
            'addresses': AddressSerializer(Address.objects.filter(user=user), many=True).data,
            'orders': OrderSerializer(Order.objects.filter(user=user), many=True).data,
            'reviews': ReviewSerializer(Review.objects.filter(user=user), many=True).data,
        }
        return Response(data)

    def partial_update(self, request, *args, **kwargs):
        """Allow users to update their own profile, and admins to update any user."""
        instance = self.get_object()
        # Only admin can change role
        if 'role' in request.data and request.user.role != 'admin':
            return Response({'error': 'Only admins can change roles.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'], url_path='set_role')
    def set_role(self, request, pk=None):
        """Admin-only: instantly set a user's role."""
        if request.user.role != 'admin':
            return Response({'error': 'Admin access required.'}, status=status.HTTP_403_FORBIDDEN)
        user = self.get_object()
        new_role = request.data.get('role')
        valid_roles = [r[0] for r in user.ROLE_CHOICES]
        if new_role not in valid_roles:
            return Response({'error': f'Invalid role. Choose from: {valid_roles}'}, status=status.HTTP_400_BAD_REQUEST)
        user.role = new_role
        user.save(update_fields=['role'])
        return Response({'id': str(user.id), 'username': user.username, 'role': user.role})

    @action(detail=False, methods=['get'], url_path='my_earnings')
    def my_earnings(self, request):
        """Returns the current referral earnings balance and eligibility."""
        EARNINGS_MINIMUM = Decimal('10.00')
        earnings = request.user.referral_earnings
        return Response({
            'referral_earnings': str(earnings),
            'can_redeem': earnings >= EARNINGS_MINIMUM,
            'minimum_to_redeem': str(EARNINGS_MINIMUM),
        })

class DashboardStatsView(APIView):
    # SECURITY: Only admins should see platform-wide revenue and user counts
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({'error': 'Admin access required.'}, status=403)
        try:
            # Calculate real data for dashboard
            total_revenue_data = Order.objects.aggregate(total=Sum('total_amount'))
            total_revenue = float(total_revenue_data['total'] or 0)

            total_orders = Order.objects.count()
            total_products = Product.objects.count()
            total_users = User.objects.count()

            # Monthly Trend (Last 12 months)
            monthly_trend = [0] * 12
            try:
                sales_by_month = Order.objects.annotate(
                    month=ExtractMonth('created_at')
                ).values('month').annotate(revenue=Sum('total_amount'))

                for entry in sales_by_month:
                    month_idx = (entry.get('month') or 1) - 1
                    if 0 <= month_idx < 12:
                        monthly_trend[month_idx] = float(entry.get('revenue') or 0)
            except Exception:
                pass  # Monthly trend is non-critical; fall back to zeros

            return Response({
                "totalRevenue": total_revenue,
                "totalOrders": total_orders,
                "totalProducts": total_products,
                "totalUsers": total_users,
                "monthlyTrend": monthly_trend
            })
        except Exception as e:
            import traceback
            import logging
            logging.getLogger(__name__).error('DashboardStatsView error: %s', traceback.format_exc())
            # Return zeros instead of 500 so frontend doesn't crash
            return Response({
                "totalRevenue": 0,
                "totalOrders": 0,
                "totalProducts": 0,
                "totalUsers": 0,
                "monthlyTrend": [0] * 12
            }, status=200)

class RequestPasswordResetView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
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
            
            # Send password reset email via Celery
            try:
                from .tasks import send_password_reset_email
                send_password_reset_email.delay(user.id, code)
            except Exception as e:
                import logging
                logging.getLogger(__name__).error(f"Failed to queue password reset email: {str(e)}")

            return Response({'message': 'If an account exists, a reset code has been sent.'}, status=status.HTTP_200_OK)
        except Exception as e:
            import traceback
            import logging
            logging.getLogger(__name__).error(f"Password Reset Request Crash: {traceback.format_exc()}")
            return Response({'error': 'Internal Server Error'}, status=500)

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

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['product']

    def perform_create(self, serializer):
        user = self.request.user
        product = serializer.validated_data['product']

        # Verify if user has purchased this product and order is delivered
        # Note: 'items' is the related name for OrderItem -> Order (not User -> OrderItem directly).
        # User -> Orders -> Items -> Product
        has_purchased = OrderItem.objects.filter(
            order__user=user,
            order__status='delivered',
            product=product
        ).exists()

        # For MVP flexibility, we might also allow 'shipped' or even just 'purchased' regardless of status
        # but 'delivered' is safer for "Verified Buyer".
        # However, for testing WITHOUT a full logistics flow, we might relax this to just strict purchase.
        # Let's check if there is ANY order with this item.
        has_ordered = OrderItem.objects.filter(
            order__user=user,
            product=product
        ).exists()

        if not has_ordered:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only review products you have purchased.")

        serializer.save(user=user)  # single save — bug fix: was called twice

    @action(detail=False, methods=['get'], url_path='my_reviews', permission_classes=[permissions.IsAuthenticated])
    def my_reviews(self, request):
        reviews = Review.objects.filter(user=request.user).order_by('-created_at')
        serializer = self.get_serializer(reviews, many=True)
        return Response(serializer.data)

class BulkProductUploadView(APIView):
    parser_classes = (parsers.MultiPartParser,)
    # SECURITY: Only admins and sellers may bulk-upload products
    permission_classes = [permissions.IsAuthenticated]

    def check_permissions(self, request):
        super().check_permissions(request)
        if request.user.role not in ('admin', 'seller'):
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Only admins and sellers can bulk-upload products.')

    def post(self, request):
        if 'file' not in request.FILES:
            return Response({'error': 'No file provided. Please upload a ZIP file.'}, status=status.HTTP_400_BAD_REQUEST)

        zip_file = request.FILES['file']
        if not zip_file.name.endswith('.zip'):
             return Response({'error': 'File must be a .zip file.'}, status=status.HTTP_400_BAD_REQUEST)

        import zipfile
        import csv
        import io
        from django.core.files.base import ContentFile

        try:
            with zipfile.ZipFile(zip_file, 'r') as z:
                # Find CSV file
                csv_filename = None
                for name in z.namelist():
                    if name.endswith('.csv') and not name.startswith('__MACOSX'):
                        csv_filename = name
                        break
                
                if not csv_filename:
                    return Response({'error': 'No CSV file found in the ZIP archive.'}, status=status.HTTP_400_BAD_REQUEST)

                # Read CSV
                with z.open(csv_filename) as csv_file:
                    decoded_file = io.TextIOWrapper(csv_file, encoding='utf-8')
                    reader = csv.DictReader(decoded_file)
                    
                    products_created = 0
                    errors = []

                    for row in reader:
                        try:
                            # Basic validation
                            if not row.get('name') or not row.get('price'):
                                continue

                            product_data = {
                                'name': row.get('name'),
                                'description': row.get('description', ''),
                                'price': row.get('price'),
                                'stock_quantity': row.get('stock', 0),
                                'category': row.get('category', 'Uncategorized'),
                                'subcategory': row.get('subcategory', ''),
                                'brand': row.get('brand', 'Generic'),
                                'seller': request.user,
                                'gender': row.get('gender', 'Unisex'),
                                'is_featured': row.get('is_featured', 'false').lower() == 'true',
                                'is_popular': row.get('is_popular', 'false').lower() == 'true'
                            }

                            product = Product.objects.create(**product_data)

                            # Handle Image
                            image_name = row.get('image_filename')
                            if image_name:
                                image_name = image_name.strip()
                                # Try to find the file in the zip
                                image_path_in_zip = None
                                for z_name in z.namelist():
                                    if z_name.endswith(image_name) and not z_name.startswith('__MACOSX'):
                                        image_path_in_zip = z_name
                                        break
                                
                                if image_path_in_zip:
                                    img_data = z.read(image_path_in_zip)
                                    product.image.save(image_name, ContentFile(img_data), save=True)

                            products_created += 1

                        except Exception as e:
                            errors.append(f"Error processing row {row.get('name', 'unknown')}: {str(e)}")

                    return Response({
                        'message': f'Successfully uploaded {products_created} products.',
                        'errors': errors
                    }, status=status.HTTP_201_CREATED)

        except zipfile.BadZipFile:
            return Response({'error': 'Invalid ZIP file.'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ContactMessageViewSet(viewsets.ModelViewSet):
    queryset = ContactMessage.objects.all().order_by('-created_at')
    serializer_class = ContactMessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only admins should see contact messages
        if self.request.user.role == 'admin':
            return super().get_queryset()
        return ContactMessage.objects.none()

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        message = self.get_object()
        return Response({'status': 'message marked as read'})

class AddressViewSet(viewsets.ModelViewSet):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class CouponViewSet(viewsets.ModelViewSet):
    queryset = Coupon.objects.all().order_by('-created_at')
    serializer_class = CouponSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only admins can manage coupons
        if self.request.user.role == 'admin':
            return super().get_queryset()
        return Coupon.objects.none()

    @action(detail=False, methods=['post'])
    def validate(self, request):
        """Validate a coupon code and calculate discount"""
        from decimal import Decimal
        from rest_framework.response import Response
        from rest_framework import status

        code = request.data.get('code', '').strip().upper()
        cart_total = Decimal(str(request.data.get('cart_total', 0)))

        if not code:
            return Response(
                {'error': 'Coupon code is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            coupon = Coupon.objects.get(code=code)
        except Coupon.DoesNotExist:
            return Response(
                {'error': 'Invalid coupon code'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if coupon is active
        if not coupon.is_active:
            return Response(
                {'error': 'This coupon has been deactivated'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check date range
        from django.utils import timezone
        now = timezone.now()
        if coupon.start_date and now < coupon.start_date:
            return Response(
                {'error': 'This coupon is not yet active'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if coupon.end_date and now > coupon.end_date:
            return Response(
                {'error': 'This coupon has expired'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check minimum purchase
        if cart_total < coupon.min_purchase:
            return Response(
                {'error': f'Minimum purchase of ${coupon.min_purchase} required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check usage limit
        if coupon.usage_limit and coupon.used_count >= coupon.usage_limit:
            return Response(
                {'error': 'This coupon has reached its usage limit'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Calculate discount
        if coupon.discount_type == 'percentage':
            discount = cart_total * (coupon.discount_value / Decimal('100'))
        else:
            discount = min(coupon.discount_value, cart_total)  # Don't exceed cart total

        return Response({
            'message': 'Coupon applied successfully',
            'discount': str(discount),
            'coupon': {
                'code': coupon.code,
                'discount_type': coupon.discount_type,
                'discount_value': str(coupon.discount_value),
            }
        })


class HeroBannerViewSet(viewsets.ModelViewSet):
    queryset = HeroBanner.objects.all().order_by('display_order', '-created_at')
    serializer_class = HeroBannerSerializer

    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.role == 'admin':
            return super().get_queryset()
        # Public can see only active banners
        return HeroBanner.objects.filter(is_active=True)

    def get_permissions(self):
        # Allow public to list/retrieve, require admin for create/update/delete
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]


class HomePageSectionViewSet(viewsets.ModelViewSet):
    queryset = HomePageSection.objects.all().order_by('display_order', '-created_at')
    serializer_class = HomePageSectionSerializer

    def get_queryset(self):
        if self.request.user.is_authenticated and self.request.user.role == 'admin':
            return super().get_queryset()
        # Public can see only active sections
        return HomePageSection.objects.filter(is_active=True)

    def get_permissions(self):
        # Allow public to list/retrieve, require admin for create/update/delete
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]


# ── Blog ────────────────────────────────────────────────────────────────────

class IsBloggerOrAdmin(permissions.BasePermission):
    """Public can read. Bloggers/admins can write."""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role in ('blogger', 'admin')

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if request.user.role == 'admin':
            return True
        return obj.author == request.user


class BlogPostViewSet(viewsets.ModelViewSet):
    serializer_class = BlogPostSerializer
    permission_classes = [IsBloggerOrAdmin]
    lookup_field = 'slug'
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'is_published', 'is_featured']
    search_fields = ['title', 'excerpt', 'content', 'tags']
    ordering_fields = ['created_at', 'published_at', 'views']

    def get_queryset(self):
        # Admins see all posts; bloggers see their own drafts + all published;
        # public sees only published.
        user = self.request.user
        if user.is_authenticated and user.role == 'admin':
            return BlogPost.objects.all()
        if user.is_authenticated and user.role == 'blogger':
            from django.db.models import Q
            return BlogPost.objects.filter(Q(is_published=True) | Q(author=user))
        # Filter by author id if requested (bloggers browse own posts)
        author_id = self.request.query_params.get('author')
        if author_id:
            return BlogPost.objects.filter(is_published=True, author__id=author_id)
        return BlogPost.objects.filter(is_published=True)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        """Increment view count on each retrieve."""
        instance = self.get_object()
        instance.views += 1
        instance.save(update_fields=['views'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'], url_path='publish')
    def publish(self, request, slug=None):
        """Toggle publish status. Blogger can only publish own posts; admin can do anything."""
        post = self.get_object()
        publish = request.data.get('is_published', not post.is_published)
        post.is_published = publish
        post.save(update_fields=['is_published', 'published_at'])
        return Response({'is_published': post.is_published})

class MarketingCampaignViewSet(viewsets.ModelViewSet):
    queryset = MarketingCampaign.objects.all().order_by('-created_at')
    serializer_class = MarketingCampaignSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'admin':
            qs = super().get_queryset()
            # Filtering
            status_filter = self.request.query_params.get('status')
            campaign_type = self.request.query_params.get('campaign_type')
            if status_filter:
                qs = qs.filter(status=status_filter)
            if campaign_type:
                qs = qs.filter(campaign_type=campaign_type)
            return qs
        return MarketingCampaign.objects.none()

    def perform_create(self, serializer):
        campaign = serializer.save(created_by=self.request.user)
        # Auto-create coupon if discount_code is provided
        self._create_or_update_coupon(campaign)

    def perform_update(self, serializer):
        campaign = serializer.save()
        # Update coupon if discount_code changed
        self._create_or_update_coupon(campaign)

    def perform_destroy(self, instance):
        # Safeguard: Don't delete while sending to avoid race conditions and task crashes
        if instance.status == 'sending':
            from rest_framework.exceptions import ValidationError
            raise ValidationError("Cannot delete a campaign that is currently sending. Please pause it first.")

        # Optimize deletion of potentially large amounts of related data
        # Explicit queryset deletes are often more efficient than instance-level cascade for many children
        instance.delivery_logs.all().delete()
        instance.recipients.all().delete()
        instance.click_logs.all().delete()
        instance.conversions.all().delete()

        # Delete associated coupon if it's not used by other campaigns
        if instance.coupon:
            # If this is the last campaign using this coupon, delete it
            if instance.coupon.campaigns.count() <= 1:
                instance.coupon.delete()
        
        instance.delete()

    def _create_or_update_coupon(self, campaign):
        """Auto-create or update coupon when campaign has discount_code."""
        from decimal import Decimal
        from django.utils import timezone
        from datetime import timedelta

        if not campaign.discount_code or not campaign.discount_value:
            return  # No coupon to create

        # Calculate expiry date based on campaign
        expiry_date = None
        if campaign.sent_at:
            expiry_date = campaign.sent_at + timedelta(days=campaign.discount_expiry_days)
        elif campaign.scheduled_date:
            expiry_date = campaign.scheduled_date + timedelta(days=campaign.discount_expiry_days)

        # Check if coupon already exists for this campaign
        if campaign.coupon:
            # Update existing coupon
            campaign.coupon.discount_type = campaign.discount_type or 'percentage'
            campaign.coupon.discount_value = Decimal(str(campaign.discount_value))
            campaign.coupon.min_purchase = Decimal(str(campaign.discount_min_purchase or 0))
            campaign.coupon.usage_limit = campaign.discount_usage_limit
            campaign.coupon.end_date = expiry_date
            campaign.coupon.save()
        else:
            # Create new coupon if code doesn't exist
            if not Coupon.objects.filter(code=campaign.discount_code).exists():
                coupon = Coupon.objects.create(
                    code=campaign.discount_code,
                    discount_type=campaign.discount_type or 'percentage',
                    discount_value=Decimal(str(campaign.discount_value)),
                    min_purchase=Decimal(str(campaign.discount_min_purchase or 0)),
                    usage_limit=campaign.discount_usage_limit,
                    end_date=expiry_date,
                    is_active=True
                )
                campaign.coupon = coupon
                campaign.save(update_fields=['coupon'])

    @action(detail=True, methods=['post'], url_path='send')
    def send_campaign(self, request, pk=None):
        if request.user.role != 'admin':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("Only admins can send campaigns.")

        campaign = self.get_object()

        if campaign.status in ('sent', 'sending'):
            return Response({'error': f'Campaign is already {campaign.status}.'}, status=status.HTTP_400_BAD_REQUEST)

        from .tasks import send_marketing_campaign

        send_now = request.data.get('send_now', True)

        if send_now or not campaign.scheduled_date:
            # Set sent_at and update coupon expiry
            campaign.sent_at = timezone.now()
            campaign.status = 'sending'
            campaign.save(update_fields=['sent_at', 'status'])

            # Update coupon expiry based on sent_at
            if campaign.coupon:
                from datetime import timedelta
                campaign.coupon.end_date = timezone.now() + timedelta(days=campaign.discount_expiry_days)
                campaign.coupon.save()

            send_marketing_campaign.delay(str(campaign.id))
            return Response({'status': 'Campaign sending initiated'})
        else:
            if campaign.scheduled_date > timezone.now():
                campaign.status = 'scheduled'
                campaign.save(update_fields=['status'])
                send_marketing_campaign.apply_async(args=[str(campaign.id)], eta=campaign.scheduled_date)
                return Response({'status': 'Campaign scheduled successfully'})
            else:
                return Response({'error': 'Scheduled date must be in the future.'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='pause')
    def pause_campaign(self, request, pk=None):
        if request.user.role != 'admin':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied()
        campaign = self.get_object()
        if campaign.status in ('sending', 'scheduled'):
            campaign.status = 'paused'
            campaign.save(update_fields=['status'])
            return Response({'status': 'Campaign paused'})
        return Response({'error': 'Campaign cannot be paused from this state.'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='resume')
    def resume_campaign(self, request, pk=None):
        if request.user.role != 'admin':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied()
        campaign = self.get_object()
        if campaign.status == 'paused':
            from .tasks import send_marketing_campaign
            campaign.status = 'sending'
            campaign.save(update_fields=['status'])
            send_marketing_campaign.delay(str(campaign.id))
            return Response({'status': 'Campaign resumed'})
        return Response({'error': 'Only paused campaigns can be resumed.'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], url_path='duplicate')
    def duplicate_campaign(self, request, pk=None):
        if request.user.role != 'admin':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied()
        campaign = self.get_object()
        new_campaign = MarketingCampaign.objects.create(
            name=f"{campaign.name} (Copy)",
            subject=campaign.subject,
            preheader=campaign.preheader,
            message=campaign.message,
            plain_text=campaign.plain_text,
            banner_image_url=campaign.banner_image_url,
            cta_text=campaign.cta_text,
            cta_url=campaign.cta_url,
            discount_code=campaign.discount_code,
            campaign_type=campaign.campaign_type,
            audience_type=campaign.audience_type,
            audience_days=campaign.audience_days,
            manual_user_ids=campaign.manual_user_ids,
            batch_size=campaign.batch_size,
            created_by=request.user,
        )
        serializer = self.get_serializer(new_campaign)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'], url_path='logs')
    def delivery_logs(self, request, pk=None):
        """Get delivery logs for a specific campaign."""
        if request.user.role != 'admin':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied()
        campaign = self.get_object()
        logs = EmailDeliveryLog.objects.filter(campaign=campaign).select_related('user')
        log_status = request.query_params.get('log_status')
        if log_status:
            logs = logs.filter(status=log_status)
        serializer = EmailDeliveryLogSerializer(logs[:500], many=True)
        # Also return summary
        from django.db.models import Count
        summary = logs.values('status').annotate(count=Count('id'))
        return Response({
            'logs': serializer.data,
            'summary': {item['status']: item['count'] for item in summary},
            'total': logs.count(),
        })

    @action(detail=False, methods=['get'], url_path='audience-preview')
    def audience_preview(self, request):
        """Preview audience count based on targeting criteria."""
        if request.user.role != 'admin':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied()
        from .tasks import _resolve_audience

        # Create a temporary mock campaign object for audience resolution
        class MockCampaign:
            pass
        mock = MockCampaign()
        mock.audience_type = request.query_params.get('audience_type', 'all_users')
        mock.audience_days = int(request.query_params.get('audience_days', 30))
        manual_ids = request.query_params.get('manual_user_ids', '')
        mock.manual_user_ids = manual_ids.split(',') if manual_ids else []

        users = _resolve_audience(mock)
        count = users.count()
        sample_users = users[:10].values('id', 'username', 'email', 'date_joined')

        return Response({
            'count': count,
            'sample': list(sample_users),
        })

    @action(detail=False, methods=['get'], url_path='calendar')
    def calendar(self, request):
        """Get campaigns for calendar view."""
        if request.user.role != 'admin':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied()

        from datetime import datetime, timedelta
        from django.utils import timezone

        # Get date range from query params
        year = int(request.query_params.get('year', timezone.now().year))
        month = int(request.query_params.get('month', timezone.now().month))

        # Calculate month start and end with proper time boundaries
        # month_start is first day of month at 00:00:00
        month_start = timezone.make_aware(datetime(year, month, 1))
        
        # month_end is first day of NEXT month at 00:00:00, then subtract 1 second
        if month == 12:
            next_month_start = timezone.make_aware(datetime(year + 1, 1, 1))
        else:
            next_month_start = timezone.make_aware(datetime(year, month + 1, 1))
        
        month_end = next_month_start - timedelta(seconds=1)

        # Get all campaigns in this month
        campaigns = MarketingCampaign.objects.filter(
            created_at__range=(month_start, month_end)
        ).order_by('created_at')

        calendar_data = []
        for campaign in campaigns:
            calendar_data.append({
                'id': str(campaign.id),
                'title': campaign.name,
                'start': campaign.scheduled_date or campaign.created_at,
                'end': campaign.sent_at or campaign.scheduled_date,
                'status': campaign.status,
                'campaign_type': campaign.campaign_type,
                'emails_sent': campaign.emails_sent,
                'delivery_rate': campaign.delivery_rate,
                'subject': campaign.subject,
            })

        return Response({
            'year': year,
            'month': month,
            'campaigns': calendar_data,
            'total_campaigns': len(calendar_data),
            'by_status': {
                'draft': len([c for c in calendar_data if c['status'] == 'draft']),
                'scheduled': len([c for c in calendar_data if c['status'] == 'scheduled']),
                'sent': len([c for c in calendar_data if c['status'] == 'sent']),
            }
        })

    @action(detail=False, methods=['get'], url_path='analytics')
    def analytics(self, request):
        """Enterprise marketing analytics dashboard."""
        if request.user.role != 'admin':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied()

        from django.db.models import Count, Sum, Avg, Q
        from django.db.models.functions import TruncDate
        from .models import EmailConversion

        campaigns = MarketingCampaign.objects.all()
        total_campaigns = campaigns.count()
        total_sent = campaigns.filter(status='sent').count()
        total_emails_sent = campaigns.aggregate(s=Sum('emails_sent'))['s'] or 0
        total_emails_failed = campaigns.aggregate(s=Sum('emails_failed'))['s'] or 0
        total_opens = campaigns.aggregate(s=Sum('emails_opened'))['s'] or 0
        total_clicks = campaigns.aggregate(s=Sum('emails_clicked'))['s'] or 0
        total_recipients = campaigns.aggregate(s=Sum('total_recipients'))['s'] or 0

        avg_delivery_rate = round((total_emails_sent / total_recipients * 100), 1) if total_recipients > 0 else 0
        avg_open_rate = round((total_opens / total_emails_sent * 100), 1) if total_emails_sent > 0 else 0
        avg_click_rate = round((total_clicks / total_emails_sent * 100), 1) if total_emails_sent > 0 else 0

        # Global conversion stats
        total_conversions = EmailConversion.objects.count()
        total_revenue = EmailConversion.objects.aggregate(s=Sum('conversion_value'))['s'] or 0

        # Active users count (with role=user)
        active_users = User.objects.filter(role='user', is_active=True).count()

        # Last campaign
        last_campaign = campaigns.order_by('-created_at').first()
        last_campaign_data = None
        if last_campaign:
            last_campaign_data = {
                'id': str(last_campaign.id),
                'name': last_campaign.name,
                'status': last_campaign.status,
                'sent_at': last_campaign.sent_at,
                'emails_sent': last_campaign.emails_sent,
            }

        # Daily Trend (Last 30 days)
        from django.utils import timezone
        thirty_days_ago = timezone.now() - timedelta(days=30)
        daily_trends = EmailConversion.objects.filter(converted_at__gte=thirty_days_ago) \
            .annotate(day=TruncDate('converted_at')) \
            .values('day') \
            .annotate(conversions=Count('id'), revenue=Sum('conversion_value')) \
            .order_by('day')

        # Campaign stats by status
        status_breakdown = dict(campaigns.values_list('status').annotate(c=Count('id')).values_list('status', 'c'))

        # Campaign stats by type
        type_breakdown = dict(campaigns.values_list('campaign_type').annotate(c=Count('id')).values_list('campaign_type', 'c'))

        return Response({
            'total_campaigns': total_campaigns,
            'total_sent_campaigns': total_sent,
            'total_emails_sent': total_emails_sent,
            'total_emails_failed': total_emails_failed,
            'total_opens': total_opens,
            'total_clicks': total_clicks,
            'total_recipients': total_recipients,
            'avg_delivery_rate': avg_delivery_rate,
            'avg_open_rate': avg_open_rate,
            'avg_click_rate': avg_click_rate,
            'total_conversions': total_conversions,
            'total_revenue': str(total_revenue),
            'daily_trends': list(daily_trends),
            'active_users': active_users,
            'last_campaign': last_campaign_data,
            'status_breakdown': status_breakdown,
            'type_breakdown': type_breakdown,
        })

    @action(detail=True, methods=['get'], url_path='conversion-analytics')
    def conversion_analytics(self, request, pk=None):
        """Get real-time conversion analytics for a campaign."""
        if request.user.role != 'admin':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied()

        from django.db.models import Count, Sum, Avg, Q, F

        campaign = self.get_object()

        # Email delivery stats
        delivery_logs = EmailDeliveryLog.objects.filter(campaign=campaign)
        total_sent = delivery_logs.filter(status='sent').count()
        total_delivered = total_sent
        total_opens = delivery_logs.filter(status__in=['sent', 'opened', 'clicked']).filter(opened_at__isnull=False).count()

        # Click tracking
        click_logs = EmailClickLog.objects.filter(campaign=campaign)
        unique_clicks = click_logs.values('user').distinct().count()
        total_link_clicks = click_logs.count()

        # Click-through rate
        click_through_rate = round((unique_clicks / total_sent * 100), 2) if total_sent > 0 else 0

        # Conversion stats
        conversions = EmailConversion.objects.filter(campaign=campaign)
        total_conversions = conversions.count()
        total_revenue = conversions.aggregate(Sum('conversion_value'))['conversion_value__sum'] or Decimal('0')

        # Conversion rate (from clicks)
        conversion_rate = round((total_conversions / unique_clicks * 100), 2) if unique_clicks > 0 else 0

        # Revenue metrics
        revenue_per_email = round((total_revenue / total_sent), 2) if total_sent > 0 else Decimal('0')
        avg_order_value = round((total_revenue / total_conversions), 2) if total_conversions > 0 else Decimal('0')

        # Top performing links
        top_links = click_logs.values('url').annotate(
            clicks=Count('id'),
            conversions=Count('id', filter=Q(converted=True)),
            revenue=Sum('conversion_value', filter=Q(converted=True))
        ).order_by('-clicks')[:10]

        # Recent conversions
        recent_conversions = conversions.select_related('user', 'order').order_by('-converted_at')[:20]

        data = {
            'campaign_id': str(campaign.id),
            'campaign_name': campaign.name,
            'total_sent': total_sent,
            'total_delivered': total_delivered,
            'total_opens': total_opens,
            'total_clicks': total_link_clicks,
            'unique_clicks': unique_clicks,
            'total_link_clicks': total_link_clicks,
            'click_through_rate': click_through_rate,
            'total_conversions': total_conversions,
            'conversion_rate': conversion_rate,
            'total_revenue': str(total_revenue),
            'revenue_per_email': str(revenue_per_email),
            'avg_order_value': str(avg_order_value),
            'top_links': list(top_links),
            'recent_conversions': EmailConversionSerializer(recent_conversions, many=True).data,
        }

        return Response(data)

    @action(detail=True, methods=['post'], url_path='track-click')
    def track_click(self, request, pk=None):
        """Track link click from email."""
        from django.utils import timezone

        campaign = self.get_object()
        user_id = request.data.get('user_id')
        email = request.data.get('email')
        url = request.data.get('url')
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        ip_address = request.META.get('REMOTE_ADDR')

        if not user_id or not email or not url:
            return Response({'error': 'Missing required fields'}, status=400)

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=400)

        # Create click log
        click_log = EmailClickLog.objects.create(
            campaign=campaign,
            user=user,
            email=email,
            url=url,
            user_agent=user_agent,
            ip_address=ip_address,
        )

        # Update campaign click count
        campaign.emails_clicked += 1
        campaign.save(update_fields=['emails_clicked'])

        # Update delivery log
        delivery_log = EmailDeliveryLog.objects.filter(
            campaign=campaign,
            user=user
        ).first()
        if delivery_log and delivery_log.status not in ['clicked', 'opened']:
            delivery_log.status = 'clicked'
            delivery_log.clicked_at = timezone.now()
            delivery_log.save()

        return Response({
            'status': 'tracked',
            'click_id': str(click_log.id),
        })

    @action(detail=True, methods=['post'], url_path='track-conversion')
    def track_conversion(self, request, pk=None):
        """Track conversion (purchase) from email campaign."""
        from django.utils import timezone

        campaign = self.get_object()
        user_id = request.data.get('user_id')
        order_id = request.data.get('order_id')
        conversion_value = request.data.get('conversion_value', 0)
        click_id = request.data.get('click_id')

        if not user_id or not conversion_value:
            return Response({'error': 'Missing required fields'}, status=400)

        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=400)

        # Find the click log if click_id provided
        click_log = None
        if click_id:
            try:
                click_log = EmailClickLog.objects.get(id=click_id)
            except EmailClickLog.DoesNotExist:
                pass

        # Calculate time to convert
        time_to_convert = None
        if click_log and click_log.clicked_at:
            time_to_convert = int((timezone.now() - click_log.clicked_at).total_seconds())

        # Create conversion
        conversion = EmailConversion.objects.create(
            campaign=campaign,
            user=user,
            conversion_value=conversion_value,
            click_log=click_log,
            time_to_convert=time_to_convert,
        )

        # Link order if provided
        if order_id:
            try:
                from .models import Order
                order = Order.objects.get(id=order_id)
                conversion.order = order
                conversion.save()
            except Order.DoesNotExist:
                pass

        # Mark click log as converted
        if click_log:
            click_log.converted = True
            click_log.converted_at = timezone.now()
            click_log.conversion_value = conversion_value
            click_log.save()

        return Response({
            'status': 'conversion_tracked',
            'conversion_id': str(conversion.id),
            'conversion_value': str(conversion_value),
        })

    @action(detail=False, methods=['get'], url_path='users-list')
    def users_list(self, request):
        """Get list of users for manual audience selection."""
        if request.user.role != 'admin':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied()
        users = User.objects.filter(role='user', is_active=True).values('id', 'username', 'email', 'first_name', 'last_name')
        return Response(list(users[:500]))
