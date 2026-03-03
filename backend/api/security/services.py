"""
Security Service Layer — Centralized Audit Logging
====================================================
This module is the SINGLE entry point for all audit log creation.
Views and other services should NEVER write to AuditLog directly.
Instead, they should call log_audit_event(...) from here.

Architecture:
- get_client_ip():        Proxy-aware IP extraction (Cloudflare → Traefik → REMOTE_ADDR)
- parse_user_agent():     Extracts OS, Browser, Device from raw User-Agent string
- check_ip_anomaly():     Compares current IP against user's known_ips list
- track_failed_login():   Brute-force counter — triggers CRITICAL alert at threshold
- send_slack_alert():     Posts rich Block Kit message to Slack Incoming Webhook
- alert_security_team():  Throttled Slack + Telegram notifications for HIGH+ events
- log_audit_event():      Public API — the ONLY function views should call
"""
import logging
import requests
from datetime import datetime
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
# Brute-Force / Failed Login Tracking
# ---------------------------------------------------------------------------

# In-memory store: { "email_or_ip": [timestamp, timestamp, ...] }
_failed_login_cache = {}
BRUTE_FORCE_THRESHOLD = 5       # attempts before CRITICAL alert
BRUTE_FORCE_WINDOW_MINUTES = 10  # rolling window in minutes


def track_failed_login(identifier, request=None):
    """
    Track failed login attempts by identifier (email or IP).
    Returns the current failure count within the window.
    Fires a CRITICAL alert when threshold is hit.

    Call this from the login view on authentication failure.
    """
    now = timezone.now()
    window_start = now.timestamp() - BRUTE_FORCE_WINDOW_MINUTES * 60

    # Prune old entries outside the window
    attempts = [t for t in _failed_login_cache.get(identifier, []) if t > window_start]
    attempts.append(now.timestamp())
    _failed_login_cache[identifier] = attempts

    count = len(attempts)
    logger.warning(f"[Security] Failed login #{count} for '{identifier}'")

    if count == BRUTE_FORCE_THRESHOLD:
        ip = get_client_ip(request) if request else identifier
        _fire_brute_force_alert(identifier, ip, count)

    return count


def _fire_brute_force_alert(identifier, ip, count):
    """Internal — fires a CRITICAL brute-force alert ignoring throttle."""
    logger.critical(f"[Security] BRUTE FORCE DETECTED: {count} failures for '{identifier}' from {ip}")

    try:
        emoji = '🚨'
        slack_msg = {
            "text": f"{emoji} *CRITICAL — Brute Force Attack Detected*",
            "blocks": [
                {
                    "type": "header",
                    "text": {"type": "plain_text", "text": "🚨 Brute Force Attack Detected", "emoji": True}
                },
                {
                    "type": "section",
                    "fields": [
                        {"type": "mrkdwn", "text": f"*Target:*\n`{identifier}`"},
                        {"type": "mrkdwn", "text": f"*IP Address:*\n`{ip}`"},
                        {"type": "mrkdwn", "text": f"*Attempts:*\n{count} in {BRUTE_FORCE_WINDOW_MINUTES} min"},
                        {"type": "mrkdwn", "text": f"*Time:*\n{datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}"},
                    ]
                },
                {
                    "type": "section",
                    "text": {"type": "mrkdwn", "text": f"⚠️ *Recommended:* Review IP `{ip}` in your Security Hub and consider blocking."}
                },
                {"type": "divider"},
                {
                    "type": "context",
                    "elements": [{"type": "mrkdwn", "text": "SmartShop Security · SOC2 AuditLog"}]
                }
            ]
        }
        _post_slack(slack_msg)

        # Also send Telegram for brute force
        telegram_msg = (
            f"🚨 <b>CRITICAL — Brute Force</b>\n\n"
            f"<b>Target:</b> {identifier}\n"
            f"<b>IP:</b> <code>{ip}</code>\n"
            f"<b>Attempts:</b> {count} in {BRUTE_FORCE_WINDOW_MINUTES} min\n"
        )
        from .telegram_utils import send_telegram_message
        send_telegram_message(telegram_msg)

    except Exception as e:
        logger.error(f"[Security] Brute force alert failed: {e}")


# ---------------------------------------------------------------------------
# Slack Integration
# ---------------------------------------------------------------------------

def _post_slack(payload: dict):
    """
    POST a Block Kit payload to the configured Slack Incoming Webhook.
    Silent no-op if SLACK_WEBHOOK_URL is not set.
    """
    webhook_url = getattr(settings, 'SLACK_WEBHOOK_URL', '')
    if not webhook_url:
        logger.debug("[Security] SLACK_WEBHOOK_URL not set — skipping Slack alert.")
        return False

    try:
        resp = requests.post(webhook_url, json=payload, timeout=8)
        if resp.status_code == 200:
            logger.info("[Security] Slack alert sent.")
            return True
        else:
            logger.warning(f"[Security] Slack returned {resp.status_code}: {resp.text}")
            return False
    except Exception as e:
        logger.error(f"[Security] Slack POST failed: {e}")
        return False


def send_slack_security_alert(severity, action, username, ip, metadata=None):
    """
    Build and send a rich Slack Block Kit security alert.
    severity: 'HIGH' or 'CRITICAL'
    """
    emoji = '🚨' if severity == 'CRITICAL' else '⚠️'
    color = '#FF0000' if severity == 'CRITICAL' else '#FF8C00'

    action_label = {
        'suspicious_login': 'Suspicious Login — New IP',
        'failed_login':     'Failed Login Attempt',
        'account_lockout':  'Account Lockout',
        'role_change':      'Role Changed',
    }.get(action, action.replace('_', ' ').title())

    fields = [
        {"type": "mrkdwn", "text": f"*Severity:*\n`{severity}`"},
        {"type": "mrkdwn", "text": f"*Event:*\n{action_label}"},
        {"type": "mrkdwn", "text": f"*User:*\n`{username}`"},
        {"type": "mrkdwn", "text": f"*IP Address:*\n`{ip or '—'}`"},
    ]

    if metadata:
        for k, v in list(metadata.items())[:4]:  # max 4 extra fields
            fields.append({"type": "mrkdwn", "text": f"*{k.replace('_',' ').title()}:*\n{v}"})

    payload = {
        "text": f"{emoji} SmartShop Security [{severity}]: {action_label}",
        "attachments": [
            {
                "color": color,
                "blocks": [
                    {
                        "type": "header",
                        "text": {"type": "plain_text", "text": f"{emoji} Security Alert [{severity}]", "emoji": True}
                    },
                    {
                        "type": "section",
                        "fields": fields
                    },
                    {
                        "type": "section",
                        "text": {
                            "type": "mrkdwn",
                            "text": f"*Time:* {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')} · <https://smartshop1.us/security|View Security Hub>"
                        }
                    },
                    {"type": "divider"},
                    {
                        "type": "context",
                        "elements": [{"type": "mrkdwn", "text": "SmartShop · SOC2-aligned AuditLog System"}]
                    }
                ]
            }
        ]
    }
    _post_slack(payload)


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
    Send throttled notification to Slack AND Telegram for HIGH/CRITICAL events.
    Throttle: CRITICAL = instant (no delay), HIGH = max 1 alert per 5 min per user+action.
    """
    if severity not in ('HIGH', 'CRITICAL'):
        return

    user_id = str(user.id) if user else 'anon'
    cache_key = f"alert:{user_id}:{action}"
    throttle = 0 if severity == 'CRITICAL' else 5  # CRITICAL = instant

    if not _should_send_alert(cache_key, throttle):
        logger.info(f"[Security] Alert throttled for {cache_key}")
        return

    username = user.username if user else 'Anonymous'

    # ── Slack ──────────────────────────────────────────────────────────────
    try:
        send_slack_security_alert(severity, action, username, ip_address, metadata)
    except Exception as e:
        logger.error(f"[Security] Slack alert failed: {e}")

    # ── Telegram ───────────────────────────────────────────────────────────
    try:
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
        logger.error(f"[Security] Telegram alert failed: {e}")


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
        log_audit_event('failed_login', request=request, severity='MEDIUM',
                        metadata={'email': email})
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
