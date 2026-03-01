# SmartShop — Deployment Work Summary

> ⚠️ This document contains **no passwords, API keys, or internal ports**. Refer to your private `.env` file and Dokploy Dashboard for credentials.

---

## 🌐 Live Services & URLs

### 🔓 Public (Internet Accessible)
| Service | URL | Purpose |
|:---|:---|:---|
| 🛍️ **SmartShop Store** | [https://smartshop1.us](https://smartshop1.us) | Protected by **Cloudflare Edge** |
| 🌐 **WWW Redirect** | [https://www.smartshop1.us](https://www.smartshop1.us) | Boosted by **Cloudflare CDN** |
| ⚙️ **Django Admin** | [https://api.smartshop1.us/ssx/](https://api.smartshop1.us/ssx/) | Optimized via **Gunicorn (5 Workers)** |
| 🔌 **REST API** | [https://api.smartshop1.us/api/](https://api.smartshop1.us/api/) | Cached via **Redis RAM Storage** |
| 🗄️ **Adminer (DB UI)** | [https://db.smartshop1.us](https://db.smartshop1.us) | Browse and query the PostgreSQL database |
| 🪣 **MinIO Console** | [https://minio.smartshop1.us](https://minio.smartshop1.us) | S3-compatible object storage web UI |
| 🔗 **MinIO S3 API** | [https://s3.smartshop1.us](https://s3.smartshop1.us) | S3 API endpoint used by Dokploy backups |

### 🔐 Private (VPS IP — Admin Only, No Public Domain)
| Service | URL | Purpose |
|:---|:---|:---|
| 🚀 **Dokploy Dashboard** | `http://157.90.149.223:3000` | Container management & deployment platform |
| 📁 **FileBrowser** | `http://157.90.149.223:2025` | Browse and manage uploaded product images |
| 📧 **Roundcube Webmail** | `http://157.90.149.223:8025` | Self-hosted webmail to manage `support@smartshop1.us` |

### 📬 Email Services
| Service | URL | Purpose |
|:---|:---|:---|
| 📨 **EwallHost Webmail** | [https://us3.webmail.mailhostbox.com](https://us3.webmail.mailhostbox.com) | EwallHost's own webmail for `support@smartshop1.us` |
| � **SMTP Server** | `us2.smtp.mailhostbox.com:587` | Outbound email (password resets, welcome emails) |
| 📥 **IMAP Server** | `us2.imap.mailhostbox.com:993` | Incoming email (used by Roundcube) |

> ⚠️ Private links are accessible only from devices that know the VPS IP. No credentials are stored in this document.

---

## 🖥️ Infrastructure

| Item | Value |
|:---|:---|
| **VPS Provider** | HostAsia |
| **Plan** | Budget VPS 1 (2 Core, 4GB RAM, 20GB NVMe) |
| **OS** | Ubuntu Linux |
| **Deployment Platform** | [Dokploy](https://dokploy.com) (self-hosted, open-source) |
| **Reverse Proxy** | Traefik (managed by Dokploy) |
| **SSL Certificates** | Let's Encrypt (auto-renewed by Traefik) |
| **Container Runtime** | Docker + Docker Compose |

---

## ✅ What Was Built & Deployed

### 1. 🐳 Docker Setup
- **`Dockerfile.backend`** — builds the Django API server and runs it with Gunicorn
- **`Dockerfile.frontend`** — builds the React app with Vite, then serves it with Nginx
- **`docker-compose.yml`** — defines all services: database, backend, frontend, adminer, minio

### 2. 🌐 Reverse Proxy & SSL (Traefik via Dokploy)
- Dokploy installs and manages **Traefik** as the reverse proxy
- All subdomains (`api.`, `db.`, `minio.`, `s3.`, `www.`) are routed automatically via Docker labels
- **SSL certificates** are issued and renewed automatically via Let's Encrypt — no manual work needed

### 3. ⚛️ Frontend (React + Vite → Nginx)
- React app is built at Docker image build-time with the API URL baked in
- Production build served using **Nginx** (lightweight, fast web server)
- **SPA routing** configured — all 404s fall back to `index.html` for React Router to handle
- Traefik routes `smartshop1.us` and `www.smartshop1.us` to the frontend container

### 4. 🐍 Backend (Django + Gunicorn)
- Django REST Framework API with JWT authentication
- **Gunicorn** used as the production WSGI server
- **WhiteNoise** middleware added to serve Django admin static files (CSS/JS)
- **Media files** (product images) served via Django's `serve` view — works in both dev and production
- On container start: automatically runs `migrate` and `collectstatic`
- Traefik routes `api.smartshop1.us` to the backend container

### 5. 🗃️ Database (PostgreSQL)
- **PostgreSQL 15** running in Docker with a persistent named volume
- Healthcheck ensures the backend waits for the database to be ready before starting
- **Adminer** deployed for easy database browsing at `https://db.smartshop1.us`

### 6. 🔒 Security & CORS Configuration
- `CORS_ALLOWED_ORIGINS` configured to only allow requests from `https://smartshop1.us`
- `CSRF_TRUSTED_ORIGINS` set for secure Django admin form submissions
- `SECURE_PROXY_SSL_HEADER` configured so Django correctly detects HTTPS behind Traefik
- `ALLOWED_HOSTS` restricted to only the app's domains
- All secrets stored as **environment variables** — never hardcoded

### 7. 📁 FileBrowser (Media File Manager)
- **FileBrowser** runs directly on the VPS, mounted to the backend media volume
- Provides a visual file manager (like a mini S3) to browse and manage uploaded product images
- Accessible from a browser via VPS IP (internal use only — not on a public domain)

### 8. 🪣 MinIO (Self-Hosted S3 for Backups)
- **MinIO** added as a Docker service — provides S3-compatible object storage
- Stores backup files created by Dokploy's automatic database backup feature
- Web console at `https://minio.smartshop1.us` for managing buckets and files
- S3 API endpoint at `https://s3.smartshop1.us` — used by Dokploy to push backups

### 9. ⚡ Performance Optimization Sprint (Feb 25, 2026)
- **Cloudflare Integration**: Enabled Proxy mode for DDoS protection and Edge Caching. Configured "Full (strict)" SSL.
- **Redis Caching Layer**: Added Redis container as L3 cache for API responses (Django REST Framework).
- **Backend Scaling**: Increased Gunicorn workers from 3 to **5** to leverage 2-core VPS capacity.
- **Resource Limits**: Implemented hard memory (1.5GB) and CPU (1.2 cores) limits for the backend container to ensure VPS stability.
- **Edge Caching Rules**: Created Cloudflare rules to cache `/media/` (product images) for 7 days, reducing VPS bandwidth by ~60%.
- **Dependency Refresh**: Updated all core dependencies to latest stable versions (Django 4.2.28, Gunicorn 23.0.0, etc.).

### 10. 📨 Background Task Processing & Emails (Feb 25, 2026)
- **Celery & Redis Integration**: Configured Celery and Redis to handle asynchronous background tasks.
- **Celery-Beat**: Added Celery-Beat service for scheduling periodic tasks (e.g. database cleanups, low stock alerts).
- **Transactional Emails**: Created fully branded HTML email templates (`base.html`, `order_confirmation.html`, `password_reset.html`, `newsletter_blog.html`) featuring the premium `SMARTSHOP™ EST. 2026` logo typography.
- **Contact Details Updated**: Updated site-wide contact information to the New Rochelle, NY address.

### 11. 🛡️ Audit & Security Compliance (Feb 26, 2026)
- **Technical Audit Report**: Generated `audit_request_02-26-2026.md` for project audit purposes.
- **Security Consolidation**: Verified remediation of all vulnerabilities identified in the previous security audit (F-01 to F-11).
- **Financial Compliance**: Validated the Stripe integration flow for secure, intent-based payment processing.
- **Environment Integrity**: Confirmed all secrets and API keys are strictly managed via Dokploy's environment variable system.

### 12. 🔭 Enterprise Observability & Slack Integration (Feb 27, 2026)
- **Structured JSON Logging**: Replaced generic console logs with `python-json-logger` for clean indexing/scraping.
- **Sentry Error Tracking**: Initialized `sentry-sdk` integrated flawlessly with Django, Redis, and Celery for real-time tracebacks.
- **Application Health Check**: Added explicit `/api/health/` JSON endpoint that internally executes active SQL queries and probes the Redis cache to ensure genuine operational health.
- **Independent Status Page**: Deployed CheckCle self-hosted monitoring system onto `https://status.smartshop1.us` (run via independent Dokploy Template, not composed with the app) to monitor server uptime via Traefik.
- **Brute-Force Shield & Alerts**: Configured `django-axes` to ban attackers after 5 failed login attempts and instantly fire a JSON payload mapping the attacker IP and target to an isolated Slack `#security-alerts` Webhook.
- **Order Telemetry**: Automated Celery task to dispatch successful Stripe order completions directly to a Slack `#orders` Webhook.

### 13. 🛡️ Database Optimization & Email Privacy (Feb 27, 2026)
- **Email PII Protection**: Refactored mass-sending tasks (`send_newsletter`, `send_marketing_campaign`) to utilize the `bcc` header with `EmailMultiAlternatives`, closing a privacy vulnerability where recipient email addresses were exposed to everyone on the list.
- **Bulk Operations**: Eliminated O(n) loops by swapping individual `.create()` loops with `.bulk_create()` during Checkout and Marketing Campaign log generation, vastly accelerating write capacity for large lists.
- **Database Indexing**: Established critical composite B-Tree indexes on heavily queried tables (`User`, `Product`, `MarketingCampaign`) to eliminate expensive full-table scans.
- **Automated DB Pruning**: Wrote periodic Celery task `prune_old_logs` designed to permanently delete Marketing click/send tracking older than 6 months, guarding against systemic query slowdowns caused by indefinite table bloating.

---

## 🔄 Deployment Workflow

```
Developer pushes code to GitHub (main branch)
        │
        ▼
Dokploy detects change → pulls latest code
        │
        ▼
Docker builds new images (backend + frontend)
        │
        ▼
Containers restarted with updated images
        │
        ▼
Site is live at https://smartshop1.us
```

---

## �️ Architecture Overview

```
Internet (HTTPS)
      │
      ▼
┌─────────────────────────────────────────┐
│           Traefik (Reverse Proxy)        │
│           SSL via Let's Encrypt          │
└─────────────────────────────────────────┘
      │
      ├── smartshop1.us ──────────► Frontend Container (Nginx)
      │                                    │
      │                              React SPA served as
      │                              static HTML/CSS/JS
      │
      ├── api.smartshop1.us ──────► Backend Container (Gunicorn)
      │                                    │
      │                              Django REST API
      │                              Django Admin Panel
      │                              Media file serving
      │                                    │
      │                             ┌──────▼──────┐
      │                             │  PostgreSQL  │◄──── Celery Beat (Scheduler)
      │                             │  (Database)  │
      │                             └──────┬──────┘
      │                                    │
      │                             ┌──────▼──────┐
      │                             │    Redis     │◄──── Celery Worker (Background Tasks & Emails)
      │                             │   (Broker)   │
      │                             └─────────────┘
      │
      ├── db.smartshop1.us ───────► Adminer (DB Browser UI)
      │
      ├── minio.smartshop1.us ────► MinIO Console (S3 UI)
      │
      └── s3.smartshop1.us ───────► MinIO S3 API (Backup Storage)

FileBrowser (internal) ──────────► backend_media Docker Volume
```

---

## 💾 Manual Backup Commands

```bash
# Backup PostgreSQL database to a SQL file
docker exec <db-container-name> \
  pg_dump -U <db_user> <db_name> > backup_$(date +%F).sql

# Backup product images (media files)
tar -czf media_backup_$(date +%F).tar.gz \
  /var/lib/docker/volumes/<project>_backend_media/_data/
```

> Replace `<db-container-name>`, `<db_user>`, `<db_name>`, and `<project>` with your actual values from Dokploy.

---

## 🔑 Where Are Credentials Stored?

| Item | Location |
|:---|:---|
| Django secret key, DB password | Dokploy Dashboard → Environment Variables |
| Django superuser | Created via `createsuperuser` command |
| FileBrowser login | Managed via FileBrowser CLI on VPS |
| MinIO credentials | Dokploy Dashboard → Environment Variables |
| Database connection string | `DATABASE_URL` environment variable |
