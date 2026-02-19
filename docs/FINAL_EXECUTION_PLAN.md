# 🚀 Final Execution Plan: Docker Deployment (Easiest & Best)

This guide replaces all previous manual setups. We will use **Docker** to deploy the entire SmartShop stack (Frontend, Backend, Database) with a single command. This ensures it works exactly as intended, regardless of server configuration.

---

## 📋 1. Prerequisites
*   **VPS IP Address**: `157.90.149.223`
*   **Domain**: `smartshop1.us` (Not yet propagated, so we will test via IP first)
*   **SSH Access**: Log in as `root`.

---

## 🧼 2. Clean Up Old Manual Setup (Important!)
Since we are switching to Docker, we need to stop the old manually installed services to free up Port 80.

```bash
# Stop and disable Host Nginx
systemctl stop nginx
systemctl disable nginx

# Stop and disable Host Backend Service
systemctl stop smartshop-backend
systemctl disable smartshop-backend

# (Optional) You can delete the old files if you want, but stopping them is enough.
```

---

## 🐳 3. Install Docker & Git
Install the Docker engine and Git on your VPS.

```bash
# Update system
apt update && apt upgrade -y

# Install Git and Curl
apt install -y git curl

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose (if not included)
apt install -y docker-compose-plugin
```

---

## 🚀 4. Deploy SmartShop with Docker

### A. Clone the Repository
We use your new repository `MM6`.

```bash
cd ~
rm -rf smartshop-app  # Remove old folder if it exists
git clone https://github.com/Devamstark/MM6 smartshop-app
cd smartshop-app
```

### B. Launch Everything
The magic command. This builds the frontend, backend, and sets up the database automatically.

```bash
docker compose up -d --build
```
*(Note: If `docker compose` doesn't work, try `docker-compose up -d --build`)*

**What this does:**
1.  starts **PostgreSQL** (Database)
2.  starts **Django Backend** (API)
3.  starts **Nginx + React Frontend** (Web Server)

---

## 🛠️ 5. Post-Deployment Steps

### A. Create Superuser (Admin)
Since the database is fresh in Docker, you need to create your admin account again.

```bash
# Run the command inside the 'backend' container
docker compose exec backend python manage.py createsuperuser
```
*(Follow the prompts to set username and password)*

---

## ✅ 6. Verification
Since your DNS (`smartshop1.us`) is still propagating, **test using your IP address**:

1.  **Frontend**: Visit `http://157.90.149.223` -> Should see the store.
2.  **Backend Admin**: Visit `http://157.90.149.223/admin` -> Login with your new superuser.
3.  **API**: Visit `http://157.90.149.223/api/` -> Should respond.

---

## 🔄 7. Updating the App
If you make code changes and push to GitHub, here is how to update the VPS:

```bash
cd ~/smartshop-app
git pull origin main
docker compose up -d --build
```

---

## 🔒 8. SSL (HTTPS) - *Do this AFTER DNS propagates*
**Only do this step once `smartshop1.us` correctly points to your IP `157.90.149.223`.**

We will run Certbot on the host to get certificates, then map them to the container. But for now, since you are waiting for DNS, **HTTP via IP** is the best way to test.

---

### 🆘 Troubleshooting

**View Logs:**
```bash
docker compose logs -f
```

**Restart Containers:**
```bash
docker compose restart
```

**Reset Database (Danger!):**
```bash
docker compose down -v
docker compose up -d
```
