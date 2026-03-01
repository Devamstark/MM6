# SmartShop Deployment Guide

> ⚠️ **This file is superseded by the current deployment guide.**
> The application has been migrated from Vercel + Render + Neon to a **self-hosted VPS**.

---

## ✅ Current Deployment

SmartShop is deployed on a **HostAsia VPS** using:
- **Dokploy** — deployment orchestrator
- **Docker + Docker Compose** — containerized services
- **Traefik** — reverse proxy + automatic SSL (Let's Encrypt)
- **PostgreSQL** — database in Docker
- **MinIO** — self-hosted S3 for backups

### 📖 Read the current guides instead:

| Guide | Description |
|:---|:---|
| **[VPS_DEPLOYMENT_GUIDE.md](./VPS_DEPLOYMENT_GUIDE.md)** | Full deployment instructions for Docker + Dokploy |
| **[SSL_SECURITY_SETUP.md](./SSL_SECURITY_SETUP.md)** | How Traefik + Let's Encrypt handles SSL |
| **[NETWORK_ARCHITECTURE.md](../architecture/NETWORK_ARCHITECTURE.md)** | Full network diagram and Docker network layout |
| **[WORK_DONE.md](../progress/WORK_DONE.md)** | Summary of all deployed services and their URLs |

---

## 🌐 Live URLs

| Service | URL |
|:---|:---|
| Store | https://smartshop1.us |
| Backend API | https://api.smartshop1.us |
| Django Admin | https://api.smartshop1.us/ssx/ |
| Database Browser | https://db.smartshop1.us |
| MinIO Console | https://minio.smartshop1.us |

---

*The legacy Vercel / Render / Neon instructions have been archived. The project no longer uses those platforms.*
