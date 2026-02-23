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
import resend
from django.conf import settings
import random
from decimal import Decimal
from datetime import timedelta
from .models import Product, Order, OrderItem, Payment, PageContent, Affiliate, PasswordResetToken, Review, Wishlist, ContactMessage, Address, ReferralSignup, Coupon, HeroBanner, HomePageSection
from .serializers import ProductSerializer, OrderSerializer, UserSerializer, PaymentSerializer, PageContentSerializer, AffiliateSerializer, ReviewSerializer, WishlistSerializer, ContactMessageSerializer, AddressSerializer, CouponSerializer, HeroBannerSerializer, HomePageSectionSerializer

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
                    coupon_code=data.get('couponCode')
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
                return Response(response_data, status=status.HTTP_201_CREATED)
        except Product.DoesNotExist:
            return Response({"error": "One or more products not found"}, status=status.HTTP_404_NOT_FOUND)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        # Calculate real data for dashboard
        total_revenue_data = Order.objects.aggregate(total=Sum('total_amount'))
        total_revenue = float(total_revenue_data['total'] or 0)
        
        total_orders = Order.objects.count()
        total_products = Product.objects.count()
        total_users = User.objects.count()

        # Monthly Trend (Last 12 months)
        # Using a dictionary to store month-wise revenue
        monthly_trend = [0] * 12
        sales_by_month = Order.objects.annotate(month=ExtractMonth('created_at')).values('month').annotate(revenue=Sum('total_amount'))
        
        for entry in sales_by_month:
            # Month is 1-indexed (Jan=1)
            month_idx = entry['month'] - 1
            if 0 <= month_idx < 12:
                monthly_trend[month_idx] = float(entry['revenue'] or 0)
        
        return Response({
            "totalRevenue": total_revenue,
            "totalOrders": total_orders,
            "totalProducts": total_products,
            "totalUsers": total_users,
            "monthlyTrend": monthly_trend
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
        
        # Send Email (Mocking for now)
        print(f"PASSWORD RESET CODE FOR {email}: {code}")
        # In production without email service, we can't do much.
        # For now, we mock success so the UI doesn't break.
        
        return Response({'message': 'Reset code sent successfully (Check console)'}, status=status.HTTP_200_OK)
        
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

        serializer.save(user=user)

        serializer.save(user=user)

class BulkProductUploadView(APIView):
    parser_classes = (parsers.MultiPartParser,)
    permission_classes = [permissions.IsAuthenticated]

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
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'admin':
            return super().get_queryset()
        # Non-admins see only active banners
        return HeroBanner.objects.filter(is_active=True)


class HomePageSectionViewSet(viewsets.ModelViewSet):
    queryset = HomePageSection.objects.all().order_by('display_order', '-created_at')
    serializer_class = HomePageSectionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.role == 'admin':
            return super().get_queryset()
        # Non-admins see only active sections
        return HomePageSection.objects.filter(is_active=True)
