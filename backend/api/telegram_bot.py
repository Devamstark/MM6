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
            import os
            logger.info(f"Available Env Vars: {list(os.environ.keys())}")
            data = request.data
            logger.info(f"Telegram Webhook Received Data: {json.dumps(data)}")
            
            message = data.get('message', {})
            text = message.get('text', '')
            chat_id = str(message.get('chat', {}).get('id', '')).strip()
            admin_id = str(getattr(settings, 'TELEGRAM_ADMIN_ID', '')).strip()

            is_admin = (chat_id == admin_id)
            logger.info(f"Message from {chat_id}, Admin Level: {is_admin}")

            # Command: /start
            if text.startswith('/start'):
                if is_admin:
                    welcome = "🚀 *Welcome Back, Admin!*\n\n" \
                              "You have full control over SmartShop here.\n\n" \
                              "Available Commands:\n" \
                              "• `/stock [id] [amount]` - Update inventory\n" \
                              "• `/price [id] [price]` - Change prices"
                    send_telegram_message(welcome, chat_id=chat_id)
                else:
                    customer_welcome = "👋 *Welcome to SmartShop!*\n\n" \
                                       "We're excited to have you here. Shop the latest fashion, accessories, and more directly from Telegram.\n\n" \
                                       "👇 *Click the button below to start shopping!*"
                    # We can use a direct link for now, 
                    # or I can enhance send_telegram_message with buttons next
                    send_telegram_message(customer_welcome, chat_id=chat_id)
                return Response(status=status.HTTP_200_OK)

            # --- CUSTOMER COMMANDS END HERE ---
            # All following commands require Admin access
            if not is_admin:
                return Response(status=status.HTTP_200_OK)

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
