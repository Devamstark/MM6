import logging
from django.conf import settings
import requests

logger = logging.getLogger(__name__)

def send_telegram_message(message: str, chat_id=None):
    token = getattr(settings, 'TELEGRAM_BOT_TOKEN', '')
    admin_id = getattr(settings, 'TELEGRAM_ADMIN_ID', '')
    
    if not token:
        logger.error("Telegram Bot Token not configured.")
        return False

    # Default to Admin ID if no specific chat_id provided
    target_chat_id = chat_id or admin_id
    
    if not target_chat_id:
        logger.error("No target chat_id or Admin ID for Telegram message.")
        return False
        
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {
        "chat_id": target_chat_id,
        "text": message,
        "parse_mode": "Markdown"
    }
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        logger.info(f"Telegram API Response Status: {response.status_code}")
        logger.info(f"Telegram API Response Text: {response.text}")
        response.raise_for_status()
        return True
    except Exception as e:
        logger.error(f"Failed to send Telegram message: {str(e)}")
        return False
