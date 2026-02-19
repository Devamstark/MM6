# 🚀 VPS Setup Guide: From Scratch (Corrected & Verified)

This guide documents the complete process to set up the **SmartShop** application on a fresh VPS. It incorporates fixes for all previous issues (static files, database connections, and folder paths).

---

## 📋 Prerequisites
*   **VPS IP**: `157.90.149.223`
*   **Domain**: `smartshop1.us`
*   **SSH Access**: Root password for the VPS.

---

## 1️⃣ Part 1: Initial Server Setup (As Root)
**Log in to your VPS as root:**
```bash
ssh root@157.90.149.223
```

### 1. Update & Create User
Create the `devam` user and give it sudo privileges.
```bash
apt update && apt upgrade -y
adduser devam
# Enter password (e.g., smartshop123) and skip other details by pressing Enter
usermod -aG sudo devam
```

### 2. Install Required Software
Install everything we need in one go:
```bash
# Install System Dependencies
apt install -y python3-pip python3-venv python3-dev libpq-dev postgresql postgresql-contrib nginx git curl acl

# Install Node.js 20 (for Frontend)
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
```

### 3. Switch to the New User
**Stop using root now.** Switch to `devam`:
```bash
su - devam
```

---

## 2️⃣ Part 2: Database Setup
We will set a specific password (`smartshop123`) to avoid authentication errors later.

```bash
sudo -u postgres psql
```

**Run these SQL commands:**
```sql
CREATE DATABASE smartshop_db;
CREATE USER smartshop_user WITH PASSWORD 'smartshop123';
ALTER ROLE smartshop_user SET client_encoding TO 'utf8';
ALTER ROLE smartshop_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE smartshop_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE smartshop_db TO smartshop_user;
\q
```

---

## 3️⃣ Part 3: Backend Setup (Django)

### 1. Clone the Repository
We will clone it into a folder named `smartshop-app` to keep things clean.
```bash
cd ~
git clone https://github.com/Devamstark/MM6 smartshop-app
cd smartshop-app/backend
```

### 2. Virtual Environment & Dependencies
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pip install gunicorn psycopg2-binary
```

### 3. Environment Variables (.env)
Create the `.env` file for the backend.
```bash
nano .env
```
**Paste this exactly:**
```ini
DEBUG=False
SECRET_KEY=django-insecure-prod-key-12345
DATABASE_URL=postgres://smartshop_user:smartshop123@127.0.0.1:5432/smartshop_db
ALLOWED_HOSTS=smartshop1.us,www.smartshop1.us,157.90.149.223,localhost
CORS_ALLOWED_ORIGINS=https://smartshop1.us,https://www.smartshop1.us,http://157.90.149.223
CSRF_TRUSTED_ORIGINS=https://smartshop1.us,https://www.smartshop1.us,http://157.90.149.223
```
*Save: Ctrl+O, Enter, Ctrl+X*

### 4. Run Migrations & Collect Static Files
```bash
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser
# Follow prompts to create your admin account
```

---

## 4️⃣ Part 4: Frontend Setup (React)

```bash
cd ~/smartshop-app
nano .env
```
**Add the API URL:**
```ini
VITE_API_URL=https://smartshop1.us/api
```
*Save: Ctrl+O, Enter, Ctrl+X*

**Build:**
```bash
npm install
npm run build
```

**Move Files to Web Directory:**
```bash
sudo mkdir -p /var/www/smartshop
sudo cp -r dist/* /var/www/smartshop/
sudo chown -R www-data:www-data /var/www/smartshop
sudo chmod -R 755 /var/www/smartshop
```

---

## 5️⃣ Part 5: Service Configuration (Gunicorn)

Create the systemd service to keep the backend running.
```bash
sudo nano /etc/systemd/system/smartshop-backend.service
```

**Paste This Content:**
```ini
[Unit]
Description=SmartShop Backend
After=network.target

[Service]
User=devam
Group=www-data
WorkingDirectory=/home/devam/smartshop-app/backend
Environment="PATH=/home/devam/smartshop-app/backend/venv/bin"
Environment="DATABASE_URL=postgres://smartshop_user:smartshop123@127.0.0.1:5432/smartshop_db"
Environment="ALLOWED_HOSTS=smartshop1.us,www.smartshop1.us,157.90.149.223"
ExecStart=/home/devam/smartshop-app/backend/venv/bin/gunicorn \
          --workers 3 \
          --bind unix:/home/devam/smartshop-app/backend/smartshop.sock \
          core.wsgi:application

[Install]
WantedBy=multi-user.target
```

**Start the Service:**
```bash
sudo systemctl daemon-reload
sudo systemctl start smartshop-backend
sudo systemctl enable smartshop-backend
```

---

## 6️⃣ Part 6: Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/smartshop
```

**Paste This Content:**
```nginx
server {
    listen 80;
    server_name smartshop1.us www.smartshop1.us 157.90.149.223;

    location = /favicon.ico { access_log off; log_not_found off; }

    # Static Assets (CSS/JS for Admin)
    location /static/ {
        alias /home/devam/smartshop-app/backend/staticfiles/;
    }

    # Media Files (User Uploads)
    location /media/ {
        alias /home/devam/smartshop-app/backend/media/;
    }

    # Backend API & Admin
    location ~ ^/(api|admin)/ {
        include proxy_params;
        proxy_pass http://unix:/home/devam/smartshop-app/backend/smartshop.sock;
    }

    # Frontend (React)
    location / {
        root /var/www/smartshop;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

**Enable & Restart:**
```bash
sudo ln -s /etc/nginx/sites-available/smartshop /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Remove default welcome page
sudo nginx -t
sudo systemctl restart nginx
```

---

## 7️⃣ Part 7: SSL (HTTPS)
Finally, secure the site.
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d smartshop1.us -d www.smartshop1.us
```
*Follow the prompts (enter email, agree to TOS).*

---

## 🎉 Verification
Visit **https://smartshop1.us**.
1.  **Frontend**: Should load the shop.
2.  **Backend**: Go to `/admin`. Styles should work.
3.  **Login**: Try logging in with the superuser you created.
