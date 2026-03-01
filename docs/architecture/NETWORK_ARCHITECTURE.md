# 🌐 SmartShop - Network Architecture

> **Status**: ✅ Live in Production  
> **Server**: HostAsia VPS (Ubuntu 22.04 LTS)  
> **Orchestrator**: Dokploy  
> **Last Updated**: February 2026

---

## 1. Overview

SmartShop uses a **hybrid edge-origin architecture**. Static content and security are handled by **Cloudflare Edge**, while the core application logic runs on a single VPS using Docker containers orchestrated by **Dokploy**. All internal data traffic is optimized via a **Redis caching layer** before hitting the PostgreSQL database.

---

## 2. Full Network Diagram

```
════════════════════════════════════════════════════════════════
                       INTERNET (HTTPS)
════════════════════════════════════════════════════════════════
                              │
                   CLOUDFLARE EDGE (CDN)
              ┌───────────────────────────────┐
              │  • DDoS Protection            │
              │  • SSL Termination (Strict)   │
              │  • Edge Caching (/media/)     │
              └───────────────┬───────────────┘
                              │ (Encrypted)
                              ▼
════════════════════════════════════════════════════════════════
              VPS — HostAsia (Ubuntu 22.04 LTS)
════════════════════════════════════════════════════════════════
                              │
              ┌───────────────▼───────────────────────────────┐
              │           TRAEFIK (Docker Container)           │
              │                                               │
              │  • Internal Routing & Domain Mapping          │
              └──┬───────────┬──────────┬────────┬───────────┘
                 │           │          │        │
        ┌────────▼───┐ ┌─────▼───┐ ┌───▼────┐ ┌─▼──────────┐
        │  Frontend  │ │ Backend │ │Adminer │ │   MinIO    │
        │  (Nginx)   │ │(Redis   │ │(DB UI) │ │(S3 Storage)│
        │            │ │ Aware)  │ │        │ │            │
        └────────────┘ └────┬────┘ └───┬────┘ └────────────┘
                            │          │
                     ┌──────▼──────────▼──┐
                     │    REDIS CACHE      │
                     │   (Docker :6379)    │
                     └──────┬─────────────┘
                            │
                     ┌──────▼───────┐
                     │  PostgreSQL   │
                     │ (Docker :5432)│
                     └───────────────┘
```

---

## 3. Docker Network

All containers are connected to a single Docker bridge network: **`dokploy-network`**.

```
┌─────────────────────────────────────────────────────────────────┐
│                    dokploy-network (bridge)                      │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Container name   │ Internal hostname │ Port(s) exposed  │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │  traefik          │ traefik           │ 80, 443 (public) │   │
│  │  frontend         │ frontend          │ 80 (internal)    │   │
│  │  backend          │ backend           │ 8000 (internal)  │   │
│  │  redis            │ redis             │ 6379 (internal)  │   │
│  │  db               │ db                │ 5432 (internal)  │   │
│  │  adminer          │ adminer           │ 8080 (internal)  │   │
│  │  minio            │ minio             │ 9000, 9001 (int) │   │
│  │  roundcube        │ roundcube         │ 8025 (direct)    │   │
│  │  filebrowser      │ filebrowser       │ 2025 (direct)    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Containers reference each other by service name:               │
│    backend → db:5432  (PostgreSQL connection)                    │
│    adminer → db:5432  (DB browser connection)                    │
│    traefik → backend:8000  (via Docker socket routing)           │
│    traefik → frontend:80   (via Docker socket routing)           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Traffic Flow (Step by Step)

### 4.1 User visits `https://smartshop1.us` (Frontend)

```
1. Browser → DNS (Cloudflare) → Cloudflare Edge
2. Cloudflare checks cache/WAF → Forwards to VPS:443 (if miss)
3. Traefik receives encrypted traffic from Cloudflare
4. Traefik matches Host header: "smartshop1.us"
5. Traefik forward HTTP to frontend:80 (internal)
6. Nginx serves React index.html
7. Browser receives HTML, loads JS bundle
```

### 4.2 React app calls `https://api.smartshop1.us/api/products/`

```
1. Browser → Cloudflare Edge → VPS IP:443
2. Traefik matches "api.smartshop1.us" → backend:8000
3. Gunicorn (5 workers) receives request
4. Django checks REDIS cache at redis:6379 (L3 Cache)
5. If MISS: Django queries PostgreSQL at db:5432
6. If MISS: Django saves result to REDIS
7. Response returned to user via Cloudflare
```

### 4.3 HTTP → HTTPS Redirect

```
1. Browser visits http://smartshop1.us (port 80)
2. Traefik receives on HTTP entrypoint
3. Traefik middleware: redirect HTTP → HTTPS (301)
4. Browser follows redirect to https://smartshop1.us
```

---

## 5. DNS Records

| Type | Name | Value | Proxy Status | Purpose |
|:---|:---|:---|:---|:---|
| A | `smartshop1.us` | `157.90.149.223` | 🟠 Proxied | Root domain → CDN |
| A | `www` | `157.90.149.223` | 🟠 Proxied | www subdomain → CDN |
| A | `api` | `157.90.149.223` | 🟠 Proxied | Backend API → CDN |
| A | `smtp` | `157.90.149.223` | 🔘 DNS Only | Mail subdomains (Grey Cloud) |
| MX | `@` | `mail.old-host.com` | N/A | Email remains on cPanel |

> **Split DNS**: Website on VPS, email on original cPanel host. MX records left unchanged so email was not disrupted.

---

## 6. Ports Summary

| Port | Protocol | Who Listens | Publicly Accessible? |
|:---|:---|:---|:---|
| 22 | TCP | SSH (VPS) | ✅ Yes (admin only) |
| 80 | TCP | Traefik | ✅ Yes (redirects to 443) |
| 443 | TCP | Traefik | ✅ Yes (HTTPS) |
| 5432 | TCP | PostgreSQL | ❌ Internal only |
| 8000 | TCP | Gunicorn (Django) | ❌ Internal only (via Traefik) |
| 8025 | TCP | Roundcube Webmail | ⚠️ Direct IP access (admin only) |
| 8080 | TCP | Adminer | ❌ Internal only (via Traefik) |
| 9000 | TCP | MinIO S3 API | ❌ Internal only (via Traefik) |
| 9001 | TCP | MinIO Console | ❌ Internal only (via Traefik) |
| 2025 | TCP | FileBrowser | ⚠️ Direct IP access (admin only) |

---

## 7. SSL / TLS Architecture

```
Browser ───────── TLS 1.3 ────────► Cloudflare ───────── TLS ────────► Traefik
        (HTTPS/HTTP3)               Edge          (Full Strict)        (VPS)
                                                                         │
                                                                         ▼
                                                                     Container
```

- **Cloudflare Edge** terminates the initial connection (enabling HTTP/3 and WAF).
- **Full (strict)** mode is used: Cloudflare connects to Traefik using the VPS's Let's Encrypt certificates.
- **Traefik** handles the second stage of SSL termination at the VPS level.
- Cert renewal: Automatic via Let's Encrypt (Traefik) + Universal SSL (Cloudflare).

---

## 8. Docker Volumes (Persistent Storage)

```
┌──────────────────────────────────────────────────────────────┐
│                   Docker Named Volumes                        │
├─────────────────────┬────────────────────────────────────────┤
│ Volume Name         │ Contents                               │
├─────────────────────┼────────────────────────────────────────┤
│ postgres_data       │ PostgreSQL database files              │
│ backend_static      │ Django collectstatic output (CSS/JS)   │
│ backend_media       │ Uploaded product images                │
│ frontend_build      │ React production build (dist/)         │
│ minio_data          │ MinIO object storage (backups)         │
└─────────────────────┴────────────────────────────────────────┘
```

Volume mounts per service:
- `backend` → `backend_static:/app/staticfiles`, `backend_media:/app/media`
- `db`      → `postgres_data:/var/lib/postgresql/data`
- `minio`   → `minio_data:/data`

---

## 9. Firewall Rules (UFW)

| Rule | Port | Direction | Purpose |
|:---|:---|:---|:---|
| Allow | 22/tcp | Inbound | SSH access |
| Allow | 80/tcp | Inbound | HTTP (Traefik) |
| Allow | 443/tcp | Inbound | HTTPS (Traefik) |
| Deny | All others | Inbound | Block all other ports |

> All services (PostgreSQL, Gunicorn, Adminer, MinIO) are only accessible through Traefik — never directly from the internet.

---

## 10. Dokploy Deployment Flow

```
Developer pushes to GitHub (main branch)
        │
        ▼
Dokploy detects change (webhook or manual trigger)
        │
        ▼
Docker builds new images:
  • Dockerfile.frontend  → nginx:alpine + React build
  • Dockerfile.backend   → python:slim + Django
        │
        ▼
docker-compose up --build -d
(pulls/builds, recreates containers, no downtime for DB/MinIO)
        │
        ▼
Traefik picks up new container labels automatically
        │
        ▼
New version is live at https://smartshop1.us
```

---

## 11. External Integrations (Outbound Traffic)

| Service | Used For | Protocol / Port |
|:---|:---|:---|
| **EwallHost SMTP** | Sending password reset codes, welcome emails, newsletter emails | SMTP Port 587 (TLS) |
| **Roundcube** | Admin webmail client to manage `support@smartshop1.us` inbox | HTTP Port 8025 (direct IP) |
| **Unsplash API** | Placeholder images for Bloggers and Home Categories | HTTPS (443) |

> **Email**: Hosted on EwallHost (`us2.smtp.mailhostbox.com`). Webmail accessible at `http://[VPS-IP]:8025` — login with `support@smartshop1.us`. Credentials stored securely in Dokploy environment variables only.

---

**Version**: 1.9.0 (Financial Integrity Sprint: Stripe, Order Cancellation Restocking, Referral Refunds, Wishlist)  
**Last Updated**: February 26, 2026  
**Infrastructure**: HostAsia VPS, Docker, Dokploy, Traefik  
