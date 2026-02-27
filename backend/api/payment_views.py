import stripe
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Product
from decimal import Decimal

stripe.api_key = settings.STRIPE_SECRET_KEY

class CreatePaymentIntentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            data = request.data
            items = data.get('items', [])
            coupon_code = data.get('couponCode')
            use_earnings = data.get('useEarnings', False)
            
            if not items:
                return Response({'error': 'No items in cart'}, status=status.HTTP_400_BAD_REQUEST)

            # Calculate total amount server-side
            total_amount = Decimal('0.00')
            for item in items:
                try:
                    product = Product.objects.get(id=item['id'])
                    price = product.sale_price if product.sale_price else product.price
                    total_amount += price * int(item.get('quantity', 1))
                except Product.DoesNotExist:
                    return Response({'error': f'Product {item["id"]} not found'}, status=status.HTTP_404_NOT_FOUND)

            # Handle Coupon
            if coupon_code:
                try:
                    from .models import Coupon
                    coupon = Coupon.objects.get(code=coupon_code.upper(), is_active=True)
                    if total_amount >= coupon.min_purchase:
                        if coupon.discount_type == 'percentage':
                            total_amount -= total_amount * (coupon.discount_value / Decimal('100'))
                        else:
                            total_amount -= min(coupon.discount_value, total_amount)
                except Coupon.DoesNotExist:
                    pass

            # Handle Earnings
            if use_earnings:
                EARNINGS_MINIMUM = Decimal('10.00')
                user = request.user
                if user.referral_earnings >= EARNINGS_MINIMUM:
                    earnings_applied = min(user.referral_earnings, total_amount)
                    total_amount -= earnings_applied

            # Stripe expects amount in cents
            amount_cents = int(total_amount * 100)

            if amount_cents <= 0:
                # Stripe doesn't handle $0 payments. In a real app, you might bypass Stripe here.
                # For now, we'll set a minimum of 50 cents if there's any total, or return error.
                if total_amount > 0:
                    amount_cents = 50 
                else:
                     return Response({'error': 'Total amount must be greater than zero'}, status=status.HTTP_400_BAD_REQUEST)

            # Create a PaymentIntent
            intent = stripe.PaymentIntent.create(
                amount=amount_cents,
                currency='usd',
                automatic_payment_methods={
                    'enabled': True,
                },
                metadata={
                    'user_id': str(request.user.id),
                    'customer_email': request.user.email
                }
            )

            return Response({
                'clientSecret': intent.client_secret,
                'totalAmount': float(total_amount)
            })

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class StripeWebhookView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        endpoint_secret = settings.STRIPE_WEBHOOK_SECRET

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, endpoint_secret
            )
        except ValueError as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        except stripe.error.SignatureVerificationError as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        # Handle the event
        if event['type'] == 'payment_intent.succeeded':
            payment_intent = event['data']['object']
            # Here you would handle post-payment logic like creating the order items
            # and updating stock if you haven't done it yet.
            print(f"PaymentIntent was successful: {payment_intent['id']}")
        
        return Response(status=status.HTTP_200_OK)
