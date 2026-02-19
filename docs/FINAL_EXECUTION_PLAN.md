# 🚀 FINAL EXECUTION PLAN: SmartShop Deployment

**Target VPS IP**: `157.90.149.223`
**Domain**: `smartshop.net`
**Email Server IP**: `51.83.161.4` (Old cPanel)

---

## 1. cPanel Actions (DNS Configuration)

**Goal**: Keep email working on the old server, point the website to the new VPS.

### 🛑 ACTION 1: Run NOW (Before moving domain)
*Go to cPanel -> Zone Editor -> Manage*

1.  **Delete** the existing `CNAME` record for `mail.smartshop.net`.
2.  **Create** a new **A Record**:
    *   **Name**: `mail.smartshop.net`
    *   **Record**: `51.83.161.4`
3.  **Verify** the **MX Record**:
    *   **Priority**: `0`
    *   **Destination**: `mail.smartshop.net`

### 🚀 ACTION 2: Run AFTER VPS Setup is Complete
*Go to cPanel -> Zone Editor -> Manage*

1.  **Edit** the **A Record** for `smartshop.net` (Root domain):
    *   **Change IP From**: `51.83.161.4`
    *   **Change IP To**: `157.90.149.223`
2.  **Verify** `www.smartshop.net` is a CNAME pointing to `smartshop.net`.

---

## 2. VPS Configuration (SSH)

**Goal**: Prepare the Ubuntu server to host the application.

### Step 1: Login & Update
```bash
# Login
ssh root@157.90.149.223

# Update System
apt update && apt upgrade -y
```

### Step 2: Create User & Secure
```bash
# Create User
adduser smartshop
usermod -aG sudo smartshop

# Setup Firewall
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

### Step 3: Install Software Stack
```bash
# Install Python, PostgreSQ, Nginx, Git, Node.js
sudo apt install python3-pip python3-venv libpq-dev postgresql postgresql-contrib nginx git curl -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

### Step 4: Database Setup
```bash
sudo -u postgres psql

# In SQL Prompt:
CREATE DATABASE smartshop_db;
CREATE USER smartshop_user WITH PASSWORD 'YOUR_STRONG_PASSWORD';
ALTER ROLE smartshop_user SET client_encoding TO 'utf8';
ALTER ROLE smartshop_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE smartshop_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE smartshop_db TO smartshop_user;
\q
```

---

## 3. Deployment Commands (Shell)

**Goal**: Deploy the code and start the application.

### Step 1: Clone & Setup Backend
```bash
# Switch to user
su - smartshop

# Clone
git clone https://github.com/Devamstark/MM6.git smartshop-app
cd smartshop-app/backend

# Virtual Env
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn psycopg2-binary

# Migrations & Static
python manage.py migrate
python manage.py collectstatic
```

### Step 2: Configure Gunicorn (Backend Server)
*Create file: `/etc/systemd/system/gunicorn.service`*

```ini
[Unit]
Description=gunicorn daemon
After=network.target

[Service]
User=smartshop
Group=www-data
WorkingDirectory=/home/smartshop/smartshop-app/backend
ExecStart=/home/smartshop/smartshop-app/backend/venv/bin/gunicorn --access-logfile - --workers 3 --bind unix:/home/smartshop/smartshop-app/backend/smartshop.sock core.wsgi:application

[Install]
WantedBy=multi-user.target
```
*Run:* `sudo systemctl start gunicorn && sudo systemctl enable gunicorn`

### Step 3: Configure Nginx (Web Server)
*Create file: `/etc/nginx/sites-available/smartshop`*

```nginx
server {
    listen 80;
    server_name smartshop.net www.smartshop.net;

    location = /favicon.ico { access_log off; log_not_found off; }
    
    # Backend API
    location /api/ {
        include proxy_params;
        proxy_pass http://unix:/home/smartshop/smartshop-app/backend/smartshop.sock;
    }

    # Admin Panel
    location /admin/ {
        include proxy_params;
        proxy_pass http://unix:/home/smartshop/smartshop-app/backend/smartshop.sock;
    }

    # Static Files (Django)
    location /static/ {
        alias /home/smartshop/smartshop-app/backend/staticfiles/;
    }

    # Frontend (React)
    location / {
        root /var/www/smartshop;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```
*Run:*
```bash
sudo ln -s /etc/nginx/sites-available/smartshop /etc/nginx/sites-enabled
sudo nginx -t
sudo systemctl restart nginx
```

### Step 4: Final SSL (HTTPS)
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d smartshop.net -d www.smartshop.net
```
