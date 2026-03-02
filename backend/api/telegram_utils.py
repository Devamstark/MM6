import logging
from django.conf import settings
import requests

logger = logging.getLogger(__name__)

def send_telegram_message(message: str):
    token = getattr(settings, 'TELEGRAM_BOT_TOKEN', '')
    chat_id = getattr(settings, 'TELEGRAM_ADMIN_ID', '')
    
    if not token or not chat_id:
        logger.warning("Telegram Bot Token or Admin ID not configured.")
        return False
        
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {
        "chat_id": chat_id,
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
