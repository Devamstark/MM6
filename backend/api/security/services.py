"""
Security Service Layer — Centralized Audit Logging
====================================================
This module is the SINGLE entry point for all audit log creation.
Views and other services should NEVER write to AuditLog directly.
Instead, they should call log_audit_event(...) from here.

Architecture:
- get_client_ip():     Proxy-aware IP extraction (Cloudflare → Traefik → REMOTE_ADDR)
- parse_user_agent():  Extracts OS, Browser, Device from raw User-Agent string
- check_ip_anomaly():  Compares current IP against user's known_ips list
- alert_security():    Throttled Slack/Telegram notifications for HIGH+ events
- log_audit_event():   Public API — the ONLY function views should call
"""
import logging
from django.utils import timezone
from django.conf import settings

logger = logging.getLogger('api.security')

# ---------------------------------------------------------------------------
# IP Extraction
# ---------------------------------------------------------------------------

def get_client_ip(request):
    """
    Extract real client IP. Checks proxy headers in priority order:
    Cloudflare (CF-Connecting-IP) → X-Forwarded-For → REMOTE_ADDR
    """
    cf_ip = request.META.get('HTTP_CF_CONNECTING_IP')
    if cf_ip:
        return cf_ip.strip()

    x_forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded:
        return x_forwarded.split(',')[0].strip()

    return request.META.get('REMOTE_ADDR', '')


def get_user_agent(request):
    return request.META.get('HTTP_USER_AGENT', '')


# ---------------------------------------------------------------------------
# Device / OS Parsing
# ---------------------------------------------------------------------------

def parse_user_agent(ua_string):
    """
    Parse a raw User-Agent string into structured device data.
    Returns a dict with keys: os, browser, device_type
    Uses the 'user-agents' library if available, else falls back to heuristics.
    """
    if not ua_string:
        return {'os': None, 'browser': None, 'device_type': None}

    try:
        import user_agents
        ua = user_agents.parse(ua_string)
        os_str = f"{ua.os.family} {ua.os.version_string}".strip()
        browser_str = ua.browser.family
        if ua.is_mobile:
            device_type = 'Mobile'
        elif ua.is_tablet:
            device_type = 'Tablet'
        elif ua.is_pc:
            device_type = 'PC'
        else:
            device_type = 'Bot/Other'
        return {
            'os': os_str[:100],
            'browser': browser_str[:100],
            'device_type': device_type,
        }
    except ImportError:
        # Fallback heuristics if user-agents library is not installed
        ua_lower = ua_string.lower()
        os_str = 'Unknown'
        if 'windows' in ua_lower:
            os_str = 'Windows'
        elif 'mac os' in ua_lower or 'macos' in ua_lower:
            os_str = 'macOS'
        elif 'iphone' in ua_lower or 'ipad' in ua_lower:
            os_str = 'iOS'
        elif 'android' in ua_lower:
            os_str = 'Android'
        elif 'linux' in ua_lower:
            os_str = 'Linux'

        browser = 'Unknown'
        if 'firefox' in ua_lower:
            browser = 'Firefox'
        elif 'edg' in ua_lower:
            browser = 'Edge'
        elif 'chrome' in ua_lower:
            browser = 'Chrome'
        elif 'safari' in ua_lower:
            browser = 'Safari'

        device_type = 'Mobile' if any(k in ua_lower for k in ['iphone', 'android', 'mobile']) else 'PC'
        return {'os': os_str, 'browser': browser, 'device_type': device_type}


# ---------------------------------------------------------------------------
# IP Anomaly Detection
# ---------------------------------------------------------------------------

def check_ip_anomaly(user, current_ip):
    """
    Check if current_ip is a known IP for this user.
    Returns True if the IP is NEW (anomaly detected).
    Always updates user's known_ips list (keep last 5).
    """
    if not current_ip or not user:
        return False

    known_ips = list(user.known_ips or [])
    is_new_ip = current_ip not in known_ips

    # Rotate: add new IP, keep only the last 5 unique IPs
    if current_ip not in known_ips:
        known_ips.append(current_ip)
    known_ips = known_ips[-5:]  # Keep last 5

    user.known_ips = known_ips
    user.save(update_fields=['known_ips'])

    return is_new_ip


# ---------------------------------------------------------------------------
# Alert Throttling (prevent fatigue)
# ---------------------------------------------------------------------------

_alert_cache = {}  # In-memory simple throttle: {cache_key: last_alert_time}

def _should_send_alert(cache_key, throttle_minutes=5):
    """Returns True if enough time has passed since last alert for this key."""
    now = timezone.now()
    last = _alert_cache.get(cache_key)
    if last is None or (now - last).total_seconds() > throttle_minutes * 60:
        _alert_cache[cache_key] = now
        return True
    return False


def alert_security_team(user, action, severity, ip_address, metadata=None):
    """
    Send throttled notification to Slack and Telegram for HIGH/CRITICAL events.
    Uses a 5-min throttle per (user_id, action) pair to prevent alert fatigue.
    """
    if severity not in ('HIGH', 'CRITICAL'):
        return

    user_id = str(user.id) if user else 'anon'
    cache_key = f"alert:{user_id}:{action}"
    throttle = 0 if severity == 'CRITICAL' else 5  # CRITICAL = instant, HIGH = throttled

    if not _should_send_alert(cache_key, throttle):
        logger.info(f"[Security] Alert throttled for {cache_key}")
        return

    try:
        username = user.username if user else 'Anonymous'
        emoji = '🚨' if severity == 'CRITICAL' else '⚠️'
        msg = (
            f"{emoji} <b>Security Alert [{severity}]</b>\n\n"
            f"<b>Action:</b> {action}\n"
            f"<b>User:</b> {username}\n"
            f"<b>IP:</b> <code>{ip_address}</code>\n"
        )
        if metadata:
            for k, v in metadata.items():
                msg += f"<b>{k}:</b> {v}\n"

        from .telegram_utils import send_telegram_message
        send_telegram_message(msg)
    except Exception as e:
        logger.error(f"[Security] Failed to send security alert: {e}")


# ---------------------------------------------------------------------------
# Public API — The only function views should call
# ---------------------------------------------------------------------------

def log_audit_event(
    action,
    request=None,
    user=None,
    severity='LOW',
    source='USER',
    metadata=None,
    _system_call=False,
):
    """
    The single, centralized function for writing audit logs.

    Usage examples:
        log_audit_event('registration', request=request, user=user, severity='LOW')
        log_audit_event('suspicious_login', request=request, user=user, severity='HIGH')
        log_audit_event('order_created', request=request, user=user, severity='MEDIUM',
                        metadata={'order_id': str(order.id)})
    """
    from ..models import AuditLog

    ip = get_client_ip(request) if request else None
    ua_string = get_user_agent(request) if request else None
    device_info = parse_user_agent(ua_string)

    try:
        AuditLog.objects.create(
            user=user,
            action=action,
            severity=severity,
            source='SYSTEM' if _system_call else source,
            ip_address=ip or None,
            os=device_info.get('os'),
            browser=device_info.get('browser'),
            device_type=device_info.get('device_type'),
            user_agent=ua_string,
            metadata=metadata or {},
        )
        logger.info(
            f"[AuditLog] {severity} | {action} | {user} | {ip}"
        )
    except Exception as e:
        # Audit logging must NEVER crash the main request
        logger.error(f"[AuditLog] FAILED to write log: {e}")
        return

    # Notify security team for high-impact events
    if severity in ('HIGH', 'CRITICAL'):
        alert_security_team(user, action, severity, ip, metadata)
