import logging
from django.conf import settings
import requests
import json

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
        "parse_mode": "HTML"
    }
    
    try:
        response = requests.post(url, json=payload, timeout=10)
        response.raise_for_status()
        return True
    except Exception as e:
        logger.error(f"Failed to send Telegram message: {str(e)}")
        return False

def send_telegram_photo(photo_url: str, caption: str, chat_id=None, buttons=None):
    """
    Sends a photo with a caption and optional inline buttons.
    """
    token = getattr(settings, 'TELEGRAM_BOT_TOKEN', '')
    if not token or not chat_id:
        return False

    url = f"https://api.telegram.org/bot{token}/sendPhoto"
    payload = {
        "chat_id": chat_id,
        "photo": photo_url,
        "caption": caption,
        "parse_mode": "HTML"
    }

    if buttons:
        payload["reply_markup"] = json.dumps({
            "inline_keyboard": buttons
        })

    try:
        response = requests.post(url, json=payload, timeout=10)
        return response.ok
    except Exception:
        return False
