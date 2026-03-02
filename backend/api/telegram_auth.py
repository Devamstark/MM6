import hashlib
import hmac
import json
from django.conf import settings
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserSerializer

User = get_user_model()

def verify_telegram_data(init_data: str):
    """
    Verifies the data received from the Telegram Mini App.
    See: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
    """
    token = getattr(settings, 'TELEGRAM_BOT_TOKEN', '')
    if not token:
        return False, "Bot token not configured"

    try:
        # 1. Parse string into dict
        from urllib.parse import parse_qs
        parsed_data = parse_qs(init_data)
        
        # 2. Extract hash and data_check_string
        received_hash = parsed_data.pop('hash', [None])[0]
        if not received_hash:
            return False, "Hash missing"

        # Sort keys and join into string
        data_check_string = "\n".join([f"{k}={v[0]}" for k, v in sorted(parsed_data.items())])

        # 3. Calculate secret key
        secret_key = hmac.new(b"WebAppData", token.encode(), hashlib.sha256).digest()

        # 4. Calculate HMAC-SHA256
        calculated_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()

        if calculated_hash == received_hash:
            # Success - return the user data
            user_json = parsed_data.get('user', [None])[0]
            if user_json:
                return True, json.loads(user_json)
            return True, None
        
        return False, "Invalid hash"
    except Exception as e:
        return False, str(e)

class TelegramLoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        init_data = request.data.get('initData')
        if not init_data:
            return Response({'error': 'initData is required'}, status=status.HTTP_400_BAD_REQUEST)

        is_valid, tg_user = verify_telegram_data(init_data)
        if not is_valid:
            return Response({'error': f'Validation failed: {tg_user}'}, status=status.HTTP_401_UNAUTHORIZED)

        if not tg_user:
            return Response({'error': 'User data missing in initData'}, status=status.HTTP_400_BAD_REQUEST)

        tg_id = str(tg_user.get('id'))
        first_name = tg_user.get('first_name', '')
        last_name = tg_user.get('last_name', '')
        username = tg_user.get('username') or f"tg_{tg_id}"

        # Try to find user by username (matching our auto-username pattern)
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'first_name': first_name,
                'last_name': last_name,
                'role': 'user',
                'is_active': True
            }
        )

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'is_new': created
        })
