# SSL / HTTPS Security Setup Guide

## ✅ Current SSL Status (Production)

SmartShop is deployed on a VPS with SSL managed automatically by **Traefik** and **Let's Encrypt**. No manual certificate management is needed.

| Domain | SSL | Provider | Status |
|:---|:---|:---|:---|
| `https://smartshop1.us` | ✅ Auto-renewed | Let's Encrypt via Traefik | Live |
| `https://www.smartshop1.us` | ✅ Auto-renewed | Let's Encrypt via Traefik | Live |
| `https://api.smartshop1.us` | ✅ Auto-renewed | Let's Encrypt via Traefik | Live |
| `https://db.smartshop1.us` | ✅ Auto-renewed | Let's Encrypt via Traefik | Live |
| `https://minio.smartshop1.us` | ✅ Auto-renewed | Let's Encrypt via Traefik | Live |
| `https://s3.smartshop1.us` | ✅ Auto-renewed | Let's Encrypt via Traefik | Live |

---

## 🔧 How SSL Works in This Deployment

### Traefik + Let's Encrypt

Dokploy installs and manages **Traefik** as a reverse proxy. Traefik handles:
- Automatic certificate issuance from Let's Encrypt
- Certificate renewal (before expiry, automatically)
- HTTP → HTTPS redirect for all domains
- SSL termination (decrypts HTTPS, forwards HTTP internally to containers)

Each service is assigned a domain via Docker labels in `docker-compose.yml`:
```yaml
labels:
  - "traefik.http.routers.backend.tls.certresolver=letsencrypt"
```

### HTTPS Behind Traefik (Django Configuration)

Since Django runs behind Traefik, it receives requests over internal HTTP. Django needs to know it's actually serving HTTPS. This is configured in `settings.py`:

```python
# Trust Traefik's forwarded proto header
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
USE_X_FORWARDED_HOST = True
USE_X_FORWARDED_PORT = True
```

Traefik forwards the `X-Forwarded-Proto: https` header, which Django uses to determine the actual protocol.

---

## 🔐 Security Configuration in Django

### CORS (Cross-Origin Resource Sharing)
Controls which domains can call the API:
```python
CORS_ALLOWED_ORIGINS = [
    "https://smartshop1.us",
    "https://www.smartshop1.us",
]
```
Prevents unauthorized websites from using your API.

### CSRF (Cross-Site Request Forgery)
Required for Django admin login and form submissions:
```python
CSRF_TRUSTED_ORIGINS = [
    "https://smartshop1.us",
    "https://www.smartshop1.us",
    "https://api.smartshop1.us",
]
```

### ALLOWED_HOSTS
Prevents HTTP Host header attacks:
```python
ALLOWED_HOSTS = ["smartshop1.us", "api.smartshop1.us", "www.smartshop1.us"]
```

---

## 🚨 Common SSL Issues & Solutions

| Issue | Cause | Fix |
|:---|:---|:---|
| Certificate not issued | DNS record missing | Add A record for the domain and redeploy |
| `CORS header missing` error | Origin not in `CORS_ALLOWED_ORIGINS` | Update env var and redeploy backend |
| Django CSRF error on admin | `CSRF_TRUSTED_ORIGINS` missing | Add to Dokploy environment and redeploy |
| Mixed content warning | API URL uses `http://` | Ensure `VITE_API_URL` starts with `https://` |
| `Bad Gateway` after SSL | Backend container crashed | Check backend logs via `docker logs` |

---

## 📋 SSL Deployment Checklist

- [x] DNS A records pointing to VPS for all subdomains
- [x] Traefik configured as reverse proxy (managed by Dokploy)
- [x] `certresolver=letsencrypt` label on all service routers
- [x] `SECURE_PROXY_SSL_HEADER` set in Django settings
- [x] `CORS_ALLOWED_ORIGINS` includes `https://smartshop1.us`
- [x] `CSRF_TRUSTED_ORIGINS` includes all app domains
- [x] `VITE_API_URL` uses `https://api.smartshop1.us/api`
- [x] All services accessible over HTTPS

---

## 🔒 Additional Security Best Practices Applied

| Practice | Status | How |
|:---|:---|:---|
| HTTPS everywhere | ✅ | Traefik auto-redirect HTTP → HTTPS |
| JWT Authentication | ✅ | djangorestframework-simplejwt |
| Password hashing | ✅ | Django default (PBKDF2) |
| CORS protection | ✅ | django-cors-headers |
| SQL injection prevention | ✅ | Django ORM |
| XSS protection | ✅ | React auto-escaping + Django |
| Secrets in env vars | ✅ | Dokploy environment manager |
| Role-based access | ✅ | Django permissions + DRF |
| Input validation | ✅ | DRF serializers + frontend forms |

---

## 🧪 Testing SSL

Visit your live site and verify:
1. **Browser padlock** shows 🔒 on all pages
2. **No mixed content** warnings in browser console (F12)
3. **HTTP redirects** — visiting `http://smartshop1.us` should redirect to `https://`
4. Test your SSL grade: [https://www.ssllabs.com/ssltest/](https://www.ssllabs.com/ssltest/)

---

**SSL is fully automated. No manual renewal or configuration is ever needed.**
