import logging
import json
import html
from django.conf import settings
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from django.utils import timezone
from .models import Product, Order, User
import requests
from .telegram_utils import send_telegram_message, send_telegram_photo
from .ai_concierge import AIConcierge

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
                              "<b>Business Insights:</b>\n" \
                              "• <code>/stats</code> - Today's Sales Summary\n" \
                              "• <code>/recent_orders</code> - View Last 5 Orders\n" \
                              "• <code>/low_stock</code> - Identify Inventory Issues\n\n" \
                              "<b>Product Management:</b>\n" \
                              "• <code>/stock [id] [amount]</code>\n" \
                              "• <code>/price [id] [price]</code>"
                    send_telegram_message(welcome, chat_id=chat_id)
                else:
                    customer_welcome = "👋 <b>Welcome to SmartShop!</b>\n\n" \
                                       "I am your AI shopping assistant. Type what you are looking for (e.g., 'blue dress') or choose a category below:"
                    
                    # Quick Search + Mini App buttons
                    buttons = [
                        [{"text": "👕 Men", "callback_data": "search:Men"}, 
                         {"text": "👗 Women", "callback_data": "search:Women"}],
                        [{"text": "👜 Accessories", "callback_data": "search:Accessories"}],
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
                        [{"text": "👕 Men", "callback_data": "search:Men"}, 
                         {"text": "👗 Women", "callback_data": "search:Women"}],
                        [{"text": "👜 Accessories", "callback_data": "search:Accessories"}],
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
                            # Images must be fetched from the API domain
                            img = f"https://api.smartshop1.us{img}"
                        
                        # 2. Escape EVERYTHING for HTML mode
                        safe_name = html.escape(product.name)
                        safe_desc = html.escape(product.description[:100])
                        caption = f"🏷️ <b>{safe_name}</b>\n💰 Price: <b>${product.price}</b>\n\n{safe_desc}..."
                        
                        # 3. Prepare Links & Buttons
                        p_url = f"https://smartshop1.us/product/{product.slug}"
                        buttons = [[{"text": "🛒 Open SmartShop", "web_app": {"url": p_url}}]]
                        
                        # 4. Attempt Sending - Try Photo first
                        logger.info(f"Sending product card: {safe_name}, Image: {img}")
                        photo_sent = send_telegram_photo(img, caption, chat_id=chat_id, buttons=buttons)
                        
                        if not photo_sent:
                            # 5. Try safe HTML fallback
                            logger.warning(f"send_telegram_photo failed for {safe_name}. Trying text-only...")
                            msg_sent = send_telegram_message(f"{caption}\n\n🔗 <a href='{p_url}'>View Details</a>", chat_id=chat_id)
                            
                            if not msg_sent:
                                # 6. Final Minimal Fallback (No HTML entities except basic)
                                logger.error(f"HTML fallback failed for {safe_name}. Final minimal fallback...")
                                minimal_msg = f"📦 {safe_name} - ${product.price}\nView here: {p_url}"
                                send_telegram_message(minimal_msg, chat_id=chat_id)
                
                return Response(status=status.HTTP_200_OK)

            # --- ADMIN COMMANDS ---
            if not is_admin:
                return Response(status=status.HTTP_200_OK)

            # --- BUSINESS INSIGHTS ---
            
            # Command: /stats
            elif text.startswith('/stats'):
                from django.db.models import Sum
                today = timezone.now().date()
                orders_today = Order.objects.filter(created_at__date=today)
                total_revenue = orders_today.aggregate(Sum('total_amount'))['total_amount__sum'] or 0
                
                msg = f"📊 <b>Daily Sales Report</b>\n" \
                      f"-------------------------\n" \
                      f"📅 <b>Date:</b> {today}\n" \
                      f"💰 <b>Total Revenue:</b> <b>${total_revenue}</b>\n" \
                      f"📦 <b>Orders Today:</b> <code>{orders_today.count()}</code>\n" \
                      f"-------------------------\n" \
                      f"📈 <i>Keep up the great work!</i>"
                send_telegram_message(msg, chat_id=chat_id)

            # Command: /recent_orders
            elif text.startswith('/recent_orders'):
                latest_orders = Order.objects.order_by('-created_at')[:5]
                if not latest_orders:
                    send_telegram_message("📦 No orders found in the system yet.", chat_id=chat_id)
                else:
                    msg = "📋 <b>Last 5 Orders:</b>\n\n"
                    for order in latest_orders:
                        msg += f"• <code>#{str(order.id)[:8]}</code> - <b>${order.total_amount}</b> ({order.customer_name})\n"
                    msg += f"\n🔗 <a href='https://smartshop1.us/ssx/api/order/'>Manage all Orders</a>"
                    send_telegram_message(msg, chat_id=chat_id)

            # Command: /low_stock
            elif text.startswith('/low_stock'):
                low_stock = Product.objects.filter(stock_quantity__lte=5)
                if not low_stock:
                    send_telegram_message("✅ All products have healthy stock levels.", chat_id=chat_id)
                else:
                    msg = "⚠️ <b>Inventory Issues Found:</b>\n\n"
                    for p in low_stock:
                        msg += f"• {p.name} (ID: <code>{str(p.id)[:8]}</code>)\n" \
                               f"  Stock: <code>{p.stock_quantity}</code>\n"
                    msg += f"\n🔗 <a href='https://smartshop1.us/ssx/api/product/'>Restock Now</a>"
                    send_telegram_message(msg, chat_id=chat_id)

            # --- PRODUCT MANAGEMENT ---
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
