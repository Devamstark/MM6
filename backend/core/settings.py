from pathlib import Path
import os
import dj_database_url
from datetime import timedelta
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / '.env')
load_dotenv(BASE_DIR.parent / '.env')

SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-change-me-for-production')

# SECURITY: Default is False. Must explicitly set DEBUG=True in .env for local dev.
DEBUG = os.environ.get('DEBUG', 'False') == 'True'

# SECURITY: Default to strict allowed hosts — no wildcard in production.
ALLOWED_HOSTS = [host for host in os.environ.get('ALLOWED_HOSTS', '').split(',') if host]

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'django_filters',
    'corsheaders',
    'django_celery_results',
    'django_celery_beat',
    'axes',
    'api',
]

AUTHENTICATION_BACKENDS = [
    'axes.backends.AxesStandaloneBackend',
    'django.contrib.auth.backends.ModelBackend',
]

MIDDLEWARE = [
    'django.middleware.cache.UpdateCacheMiddleware',  # MUST BE FIRST
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'axes.middleware.AxesMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'django.middleware.cache.FetchFromCacheMiddleware',   # MUST BE LAST
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'

DATABASES = {
    'default': dj_database_url.config(
        default='sqlite:///db.sqlite3',
        conn_max_age=600
    )
}

# Redis Cache Configuration
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": os.environ.get('REDIS_URL', 'redis://redis:6379/1'),
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        }
    }
}

# Cache timeout set to 60 seconds to ensure fresher data reflection
CACHE_MIDDLEWARE_SECONDS = 60

AUTH_USER_MODEL = 'api.User'

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
# Using default storage for build stability; WhiteNoise Middleware will handle serving
# STATICFILES_STORAGE = 'whitenoise.storage.CompressedStaticFilesStorage'
WHITENOISE_USE_FINDERS = True 

# Media Configuration (Local Storage)
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ),
    'DEFAULT_FILTER_BACKENDS': ['django_filters.rest_framework.DjangoFilterBackend'],
    'DEFAULT_PAGINATION_CLASS': 'api.pagination.StandardResultsSetPagination',
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
    ) if not DEBUG else (
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ),
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
}

# Security & Proxy Handling
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
USE_X_FORWARDED_HOST = True
USE_X_FORWARDED_PORT = True

# CORS and CSRF Settings
CORS_ALLOW_ALL_ORIGINS = DEBUG  # Only allow all in DEBUG mode
CORS_ALLOWED_ORIGINS = [origin for origin in os.environ.get('CORS_ALLOWED_ORIGINS', '').split(',') if origin]
CSRF_TRUSTED_ORIGINS = [origin for origin in os.environ.get('CSRF_TRUSTED_ORIGINS', '').split(',') if origin]

# Security Hardening
if not DEBUG:
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_HSTS_SECONDS = 31536000  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    X_FRAME_OPTIONS = 'DENY'
    SECURE_REFERRER_POLICY = 'same-origin'

# Email Configuration
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.environ.get('EMAIL_HOST', 'us2.smtp.mailhostbox.com')

# Port 587 (TLS) is confirmed reachable from this VPS. Port 465 (SSL) is blocked.
try:
    EMAIL_PORT = int(os.environ.get('EMAIL_PORT', 587))
except (ValueError, TypeError):
    EMAIL_PORT = 587

EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', EMAIL_HOST_USER)
SERVER_EMAIL = os.environ.get('SERVER_EMAIL', EMAIL_HOST_USER)

# Mutually exclusive security settings — auto-detected from port
if EMAIL_PORT == 465:
    EMAIL_USE_TLS = False
    EMAIL_USE_SSL = True
else:
    EMAIL_USE_TLS = True   # 587 uses STARTTLS
    EMAIL_USE_SSL = False

EMAIL_TIMEOUT = 15  # Seconds before giving up on SMTP connection

# Celery Configuration
CELERY_BROKER_URL = os.environ.get('REDIS_URL', 'redis://redis:6379/1')
CELERY_RESULT_BACKEND = 'django-db'
CELERY_CACHE_BACKEND = 'default'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE
CELERY_BEAT_SCHEDULER = 'django_celery_beat.schedulers:DatabaseScheduler'

# Stripe Settings
STRIPE_SECRET_KEY = os.environ.get('STRIPE_SECRET_KEY', '')
STRIPE_PUBLIC_KEY = os.environ.get('STRIPE_PUBLIC_KEY', '')
STRIPE_WEBHOOK_SECRET = os.environ.get('STRIPE_WEBHOOK_SECRET', '')

# 🔭 Observability: Sentry Error Monitoring & Slack Integration
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration
from sentry_sdk.integrations.celery import CeleryIntegration
from sentry_sdk.integrations.redis import RedisIntegration

SENTRY_DSN = os.environ.get('SENTRY_DSN')
if SENTRY_DSN:
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[DjangoIntegration(), CeleryIntegration(), RedisIntegration()],
        traces_sample_rate=0.2,
        send_default_pii=True,
        environment=os.environ.get('ENVIRONMENT', 'production'),
    )

# 🔭 Observability: Structured JSON Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'json': {
            '()': 'pythonjsonlogger.jsonlogger.JsonFormatter',
            'format': '%(asctime)s %(levelname)s %(name)s %(message)s',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'json',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
        },
        'django.db.backends': {
            'handlers': ['console'],
            'level': 'WARNING',  # Set to DEBUG to see all SQL queries in console during Dev
            'propagate': False,
        },
        'api': {
            'handlers': ['console'],
            'level': 'INFO',
        },
    },
}

# Webhooks for Slack Observability
SLACK_ORDERS_WEBHOOK = os.environ.get('SLACK_ORDERS_WEBHOOK', '')
SLACK_SECURITY_WEBHOOK = os.environ.get('SLACK_SECURITY_WEBHOOK', '')

# Axes Security configuration (Login Brute Force)
AXES_FAILURE_LIMIT = 5
AXES_COOLOFF_TIME = timedelta(minutes=30)
AXES_LOCKOUT_PARAMETERS = [["username", "ip_address"]]

# Increased data upload limits for Base64 images in CMS and Products
DATA_UPLOAD_MAX_MEMORY_SIZE = 10485760  # 10MB
FILE_UPLOAD_MAX_MEMORY_SIZE = 10485760  # 10MB

# 🤖 Telegram Bot Configuration
TELEGRAM_BOT_TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN', '')
TELEGRAM_ADMIN_ID = os.environ.get('TELEGRAM_ADMIN_ID', '')

# 🔔 Slack Security Alerts
# Set SLACK_WEBHOOK_URL in Dokploy → Environment Variables
# Get it from: https://api.slack.com/apps → Incoming Webhooks → Copy Webhook URL
SLACK_WEBHOOK_URL = os.environ.get('SLACK_WEBHOOK_URL', '')

