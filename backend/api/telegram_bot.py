import logging
import json
from django.conf import settings
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from .models import Product
import requests
from .telegram_utils import send_telegram_message, send_telegram_photo
from .ai_concierge import AIConcierge
from seed_products import seed_demo_products # Import the seed script

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
            callback_query = data.get('callback_query', {})
            
            if callback_query:
                # Handle button clicks
                chat_id = str(callback_query.get('message', {}).get('chat', {}).get('id', '')).strip()
                text = callback_query.get('data', '').replace('search:', '') # 'search:men fashion' -> 'men fashion'
                
                # Acknowledge the callback
                requests.post(f"https://api.telegram.org/bot{getattr(settings, 'TELEGRAM_BOT_TOKEN', '')}/answerCallbackQuery", 
                              json={"callback_query_id": callback_query.get('id')})
            else:
                text = message.get('text', '')
                chat_id = str(message.get('chat', {}).get('id', '')).strip()
            admin_id = str(getattr(settings, 'TELEGRAM_ADMIN_ID', '')).strip()

            is_admin = (chat_id == admin_id)
            logger.info(f"Message from {chat_id}, Admin Level: {is_admin}")

            # Command: /start
            if text.startswith('/start'):
                # Bot App URL (from your bot name)
                bot_url = "https://t.me/cloudmart_shop_bot/smartshop" # Update with your actual bot username
                
                if is_admin:
                    welcome = "🚀 <b>Welcome Back, Admin!</b>\n\n" \
                              "You have full control over SmartShop here.\n\n" \
                              "Available Admin Commands:\n" \
                              "• <code>/clear_demo</code> - Remove all demo products\n" \
                              "• <code>/seed</code> - Add Demo Products (Test only)\n" \
                              "• <code>/stock [id] [amount]</code>\n" \
                              "• <code>/price [id] [price]</code>"
                    send_telegram_message(welcome, chat_id=chat_id)
                else:
                    customer_welcome = "👋 <b>Welcome to SmartShop!</b>\n\n" \
                                       "I am your AI shopping assistant. Type what you are looking for (e.g., 'blue dress') or choose a category below:"
                    
                    # Quick Search + Mini App buttons
                    buttons = [
                        [{"text": "👕 Men's Fashion", "callback_data": "search:men fashion"}, 
                         {"text": "👗 Women's Fashion", "callback_data": "search:women fashion"}],
                        [{"text": "🔌 Electronics", "callback_data": "search:electronics"}],
                        [{"text": "🛍️ Open SmartShop App", "web_app": {"url": "https://smartshop1.us/"}}]
                    ]
                    
                    payload = {
                        "chat_id": chat_id,
                        "text": customer_welcome,
                        "parse_mode": "HTML",
                        "reply_markup": json.dumps({"inline_keyboard": buttons})
                    }
                    requests.post(f"https://api.telegram.org/bot{getattr(settings, 'TELEGRAM_BOT_TOKEN', '')}/sendMessage", json=payload)
                return Response(status=status.HTTP_200_OK)

            # AI CONCIERGE SEARCH (If non-command text)
            if not text.startswith('/'):
                message_text, products = AIConcierge.format_response(text)
                
                if not products:
                    # Offer quick buttons if nothing found
                    buttons = [
                        [{"text": "👕 Men's Fashion", "callback_data": "search:men fashion"}, 
                         {"text": "👗 Women's Fashion", "callback_data": "search:women fashion"}],
                        [{"text": "🔌 Electronics", "callback_data": "search:electronics"}],
                        [{"text": "🛍️ Open Store", "web_app": {"url": "https://smartshop1.us/"}}]
                    ]
                    # We need to send as a normal message for callback buttons
                    payload = {
                        "chat_id": chat_id,
                        "text": message_text,
                        "parse_mode": "HTML",
                        "reply_markup": json.dumps({"inline_keyboard": buttons})
                    }
                    requests.post(f"https://api.telegram.org/bot{getattr(settings, 'TELEGRAM_BOT_TOKEN', '')}/sendMessage", json=payload)
                else:
                    send_telegram_message(message_text, chat_id=chat_id)
                    for product in products:
                        # 1. Prepare valid Image
                        img = product.image.url if product.image else "https://via.placeholder.com/300"
                        if not img.startswith('http'):
                            base_url = "https://smartshop1.us"
                            img = f"{base_url}{img}"
                        
                        # 2. Escape HTML special chars 
                        p_name = product.name.replace('<', '&lt;').replace('>', '&gt;')
                        p_desc = product.description.replace('<', '&lt;').replace('>', '&gt;')
                        
                        caption = f"🏷️ <b>{p_name}</b>\n💰 Price: <b>${product.price}</b>\n\n{p_desc[:100]}..."
                        
                        # 3. Prepare Buttons
                        p_url = f"https://smartshop1.us/product/{product.slug}"
                        buttons = [[{"text": "🛒 Buy Now", "web_app": {"url": p_url}}]]
                        
                        # 4. Try sending photo, fallback to text if fail
                        photo_sent = send_telegram_photo(img, caption, chat_id=chat_id, buttons=buttons)
                        if not photo_sent:
                            send_telegram_message(f"{caption}\n\n🔗 <a href='{p_url}'>View Product</a>", chat_id=chat_id)
                
                return Response(status=status.HTTP_200_OK)

            # --- ADMIN COMMANDS ---
            if not is_admin:
                return Response(status=status.HTTP_200_OK)

            # Command: /clear_demo
            elif text.startswith('/clear_demo'):
                try:
                    demo_slugs = ['mens-casual-black-tshirt', 'classic-white-sneakers-shoes', 'womens-floral-dress', 'ss-wireless-headphones']
                    deleted_count, _ = Product.objects.filter(slug__in=demo_slugs).delete()
                    send_telegram_message(f"🗑️ *Demo Data Cleared!*\nRemoved `{deleted_count}` demo products from your live database.")
                except Exception as e:
                    send_telegram_message(f"❌ Error clearing demo data: {str(e)}")

            # Command: /seed
            elif text.startswith('/seed'):
                try:
                    seed_demo_products()
                    send_telegram_message("✅ <b>Database Seeded Successfully!</b>\nDemo products are now live in your shop.")
                except Exception as e:
                    send_telegram_message(f"❌ Error seeding database: {str(e)}")

            # Command: /stock [id] [amount]
            elif text.startswith('/stock'):
                try:
                    parts = text.split()
                    if len(parts) != 3:
                        send_telegram_message("❌ Usage: <code>/stock [id] [amount]</code>")
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
                    send_telegram_message(f"✅ <b>Stock Updated</b>\n\n<b>Product:</b> {product.name}\n<b>New Stock:</b> <code>{product.stock_quantity}</code>")
                except Product.DoesNotExist:
                    send_telegram_message("❌ Product ID not found.")
                except Exception as e:
                    send_telegram_message(f"❌ Error updating stock: {str(e)}")

            # Command: /price [id] [price]
            elif text.startswith('/price'):
                try:
                    parts = text.split()
                    if len(parts) != 3:
                        send_telegram_message("❌ Usage: <code>/price [id] [price]</code>")
                        return Response(status=status.HTTP_200_OK)

                    prod_id = parts[1]
                    new_price = parts[2]

                    product = Product.objects.get(id=prod_id)
                    product.price = float(new_price)
                    product.save(update_fields=['price'])
                    
                    send_telegram_message(f"✅ <b>Price Updated</b>\n\n<b>Product:</b> {product.name}\n<b>New Price:</b> <b>${product.price}</b>")
                except Product.DoesNotExist:
                    send_telegram_message("❌ Product ID not found.")
                except Exception as e:
                    send_telegram_message(f"❌ Error updating price: {str(e)}")

            return Response(status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Telegram Webhook Error: {str(e)}")
            return Response(status=status.HTTP_200_OK) # Always return 200 to Telegram
