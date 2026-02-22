# SmartShop — VPS Deployment Guide (Docker + Dokploy)

> ⚠️ This document contains **no passwords, API keys, or internal ports**.
> All credentials are stored securely in Dokploy's environment variable manager.

---

## Overview

SmartShop is deployed on a **HostAsia VPS** using **Dokploy** — an open-source, self-hosted deployment platform. Dokploy manages Docker containers, automatic SSL certificates (via Traefik + Let's Encrypt), and GitHub-based deployments.

This replaced the previous manual approach (Nginx + Gunicorn + systemd), making the deployment simpler, repeatable, and fully containerized.

---

## Infrastructure Summary

| Component | Technology |
|:---|:---|
| VPS Provider | HostAsia (Budget VPS 1 — 2 Core, 4GB RAM, 20GB NVMe) |
| OS | Ubuntu Linux |
| Deployment Platform | Dokploy |
| Reverse Proxy + SSL | Traefik (managed by Dokploy) |
| Container Runtime | Docker + Docker Compose |
| Frontend Server | Nginx (inside Docker container) |
| Backend Server | Gunicorn (inside Docker container) |
| Database | PostgreSQL 15 (Docker container) |
| Storage | Docker named volumes (persistent on VPS disk) |

---

## DNS Records Required

All of these A records must point to the VPS IP address:

| Subdomain | Purpose |
|:---|:---|
| `smartshop1.us` | Main storefront |
| `www.smartshop1.us` | WWW redirect |
| `api.smartshop1.us` | Django backend API & Admin |
| `db.smartshop1.us` | Adminer database browser |
| `minio.smartshop1.us` | MinIO storage web console |
| `s3.smartshop1.us` | MinIO S3-compatible API |

---

## Services Defined in docker-compose.yml

### `db` — PostgreSQL Database
- Stores all application data (products, orders, users, etc.)
- Uses a persistent Docker volume so data survives container restarts
- Has a healthcheck to ensure it's ready before the backend starts

### `backend` — Django API (Gunicorn)
- Runs database migrations and static file collection on startup
- Serves the REST API at `api.smartshop1.us/api/`
- Serves the Django admin panel at `api.smartshop1.us/admin/`
- Serves uploaded media files (product images) at `api.smartshop1.us/media/`
- Uses **WhiteNoise** middleware to serve admin CSS/JS static files

### `frontend` — React App (Nginx)
- React app is built at Docker image build time (not at runtime)
- The API URL is baked in during the build via `VITE_API_URL` build argument
- Nginx serves the built static files and handles SPA routing (all 404s → `index.html`)

### `adminer` — Database Browser
- Lightweight web UI for browsing and querying the PostgreSQL database
- Accessible at `https://db.smartshop1.us`
- Protected by your database credentials

### `minio` — Self-Hosted S3 Storage
- S3-compatible object storage running on the VPS
- Web console at `https://minio.smartshop1.us`
- S3 API at `https://s3.smartshop1.us`
- Used by Dokploy's backup system to store database backups

---

## Environment Variables

All environment variables are managed in the **Dokploy Dashboard → Environment tab**. Never commit them to Git.

| Variable | Used By | Description |
|:---|:---|:---|
| `SECRET_KEY` | Backend | Django cryptographic secret key |
| `DEBUG` | Backend | Set to `False` in production |
| `ALLOWED_HOSTS` | Backend | Comma-separated list of allowed hostnames |
| `DATABASE_URL` | Backend | Full PostgreSQL connection string |
| `CORS_ALLOWED_ORIGINS` | Backend | Frontend origins allowed to call the API |
| `CSRF_TRUSTED_ORIGINS` | Backend | Origins trusted for CSRF (admin login) |
| `POSTGRES_DB` | Database | Database name |
| `POSTGRES_USER` | Database | Database username |
| `POSTGRES_PASSWORD` | Database | Database password |
| `MINIO_ROOT_USER` | MinIO | MinIO admin username |
| `MINIO_ROOT_PASSWORD` | MinIO | MinIO admin password |

---

## How to Redeploy

1. Push code changes to the `main` branch on GitHub
2. Log in to Dokploy Dashboard
3. Navigate to the SmartShop service
4. Click **Redeploy**
5. Dokploy pulls the latest code, rebuilds Docker images, and restarts containers

> If you changed a `Dockerfile` or `docker-compose.yml`, make sure to check **Rebuild Images** before deploying.

---

## How to Add a Django Superuser

After first deployment, create an admin account by running this on the VPS:

```bash
docker exec -it <backend-container-name> python manage.py createsuperuser
```

Follow the prompts to set email and password. Then log in at `https://api.smartshop1.us/admin/`.

---

## Checking Logs

```bash
# View backend logs (Django + Gunicorn)
docker logs <backend-container-name> --tail=50

# View frontend logs (Nginx)
docker logs <frontend-container-name> --tail=20

# List all running containers
docker ps
```

Replace `<backend-container-name>` with the actual name from `docker ps`.

---

## Backup & Recovery

### Configure Automatic Backups (Dokploy)
1. Dokploy Dashboard → **Backups** tab
2. Set S3 endpoint to `https://s3.smartshop1.us`
3. Enter MinIO credentials (from Dokploy environment)
4. Create a bucket called `backups` in MinIO first
5. Set a backup schedule (e.g., daily at 2am)

### Manual Database Backup
```bash
docker exec <db-container-name> \
  pg_dump -U <db_user> <db_name> > backup_$(date +%F).sql
```

### Manual Media File Backup
```bash
tar -czf media_backup_$(date +%F).tar.gz \
  /var/lib/docker/volumes/<project>_backend_media/_data/
```

---

## Key Architectural Decisions

### Why Docker?
- Consistent environment between development and production
- Easy to update individual services without affecting others
- All dependencies isolated — no conflicts between Python, Node, Postgres versions

### Why Dokploy?
- Free and open-source
- Provides GitHub-based deployments without complex CI/CD setup
- Includes Traefik for automatic SSL and routing
- Visual dashboard for managing containers and environment vars

### Why Traefik?
- Automatic HTTPS via Let's Encrypt with zero configuration
- Routes traffic to the correct container based on hostname
- Integrated with Docker — reads container labels automatically

### Why WhiteNoise?
- Allows Django/Gunicorn to serve its own static files (admin CSS/JS)
- Eliminates the need for a separate Nginx config for static file serving

### Why `serve` view for media?
- Django's default `static()` helper only serves media when `DEBUG=True`
- Using Django's `serve` view makes media files accessible in production without a CDN or extra Nginx config

---

## Troubleshooting

| Problem | Likely Cause | Fix |
|:---|:---|:---|
| Site shows 502 Bad Gateway | Backend container crashed | Check backend logs |
| Images not loading | Media URL misconfigured | Verify `MEDIA_URL` and `urls.py` config |
| CORS errors in browser | Origin not in `CORS_ALLOWED_ORIGINS` | Update env var and redeploy |
| Admin login fails (CSRF) | `CSRF_TRUSTED_ORIGINS` missing | Add to Dokploy environment |
| Changes not reflected | Old image cached | Force rebuild in Dokploy |
| Database connection error | Wrong `DATABASE_URL` | Verify credentials in Dokploy env |
