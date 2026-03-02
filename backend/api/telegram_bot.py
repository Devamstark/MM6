import logging
import json
from django.conf import settings
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from .models import Product
from .telegram_utils import send_telegram_message

logger = logging.getLogger(__name__)

from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

@method_decorator(csrf_exempt, name='dispatch')
class TelegramWebhookView(APIView):
    authentication_classes = [] # Allow Telegram to post without session/JWT
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            data = request.data
            logger.info(f"Telegram Webhook Received Data: {json.dumps(data)}")
            
            message = data.get('message', {})
            text = message.get('text', '')
            chat_id = str(message.get('chat', {}).get('id', '')).strip()
            admin_id = str(getattr(settings, 'TELEGRAM_ADMIN_ID', '')).strip()

            logger.info(f"Message from {chat_id}, checking against Admin ID: {admin_id}")

            # Basic Security: Only respond to the configured Admin ID
            if chat_id != admin_id:
                logger.warning(f"Unauthorized bot access Attempt from ID: {chat_id}")
                return Response({'status': 'unauthorized'}, status=status.HTTP_200_OK)

            if not text:
                return Response(status=status.HTTP_200_OK)

            # Command: /start
            if text.startswith('/start'):
                welcome = "🚀 *SmartShop Admin Bot Active*\n\n" \
                          "Available Commands:\n" \
                          "• `/stock [id] [amount]` - e.g. `/stock 105 50` or `/stock 105 +10`\n" \
                          "• `/price [id] [price]` - e.g. `/price 201 24.99`"
                send_telegram_message(welcome)

            # Command: /stock [id] [amount]
            elif text.startswith('/stock'):
                try:
                    parts = text.split()
                    if len(parts) != 3:
                        send_telegram_message("❌ Usage: `/stock [id] [amount]`")
                        return Response(status=status.HTTP_200_OK)

                    prod_id = parts[1]
                    amount_str = parts[2]

                    # Find product (Support short IDs if needed, but here we use UUID)
                    product = Product.objects.get(id=prod_id)
                    
                    if amount_str.startswith('+') or amount_str.startswith('-'):
                        product.stock_quantity += int(amount_str)
                    else:
                        product.stock_quantity = int(amount_str)
                    
                    product.save(update_fields=['stock_quantity'])
                    send_telegram_message(f"✅ *Stock Updated*\n\n*Product:* {product.name}\n*New Stock:* `{product.stock_quantity}`")
                except Product.DoesNotExist:
                    send_telegram_message("❌ Product ID not found.")
                except Exception as e:
                    send_telegram_message(f"❌ Error updating stock: {str(e)}")

            # Command: /price [id] [price]
            elif text.startswith('/price'):
                try:
                    parts = text.split()
                    if len(parts) != 3:
                        send_telegram_message("❌ Usage: `/price [id] [price]`")
                        return Response(status=status.HTTP_200_OK)

                    prod_id = parts[1]
                    new_price = parts[2]

                    product = Product.objects.get(id=prod_id)
                    product.price = float(new_price)
                    product.save(update_fields=['price'])
                    
                    send_telegram_message(f"✅ *Price Updated*\n\n*Product:* {product.name}\n*New Price:* `${product.price}`")
                except Product.DoesNotExist:
                    send_telegram_message("❌ Product ID not found.")
                except Exception as e:
                    send_telegram_message(f"❌ Error updating price: {str(e)}")

            return Response(status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Telegram Webhook Error: {str(e)}")
            return Response(status=status.HTTP_200_OK) # Always return 200 to Telegram
