---
description: Complete guide to deploy CloudMart on a VPS
---

# VPS Deployment Guide for CloudMart E-Commerce

This guide walks you through deploying your CloudMart application on a VPS (Virtual Private Server) from scratch.

## Prerequisites

Before starting, ensure you have:
- A VPS with Ubuntu 22.04 or later (recommended providers: DigitalOcean, Linode, Vultr, AWS EC2)
- Root or sudo access to the VPS
- A domain name (optional but recommended)
- SSH client installed on your local machine

---

## Part 1: Initial VPS Setup

### 1. Connect to Your VPS via SSH

```bash
ssh root@your_vps_ip_address
```

Replace `your_vps_ip_address` with your actual VPS IP.

### 2. Update System Packages

```bash
apt update && apt upgrade -y
```

### 3. Create a Non-Root User (Security Best Practice)

```bash
adduser cloudmart
usermod -aG sudo cloudmart
```

Switch to the new user:
```bash
su - cloudmart
```

### 4. Configure Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

---

## Part 2: Install Required Software

### 5. Install Node.js (for Frontend)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version  # Verify installation
npm --version
```

### 6. Install Python and Dependencies (for Backend)

```bash
sudo apt install -y python3 python3-pip python3-venv
python3 --version  # Verify installation
```

### 7. Install PostgreSQL Database

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 8. Install Nginx (Web Server)

```bash
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 9. Install Git

```bash
sudo apt install -y git
```

---

## Part 3: Setup PostgreSQL Database

### 10. Create Database and User

```bash
sudo -u postgres psql
```

Inside PostgreSQL shell, run:
```sql
CREATE DATABASE cloudmart;
CREATE USER cloudmart_user WITH PASSWORD 'your_secure_password';
ALTER ROLE cloudmart_user SET client_encoding TO 'utf8';
ALTER ROLE cloudmart_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE cloudmart_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE cloudmart TO cloudmart_user;
\q
```

---

## Part 4: Deploy Backend (Django)

### 11. Clone Your Repository

```bash
cd /home/cloudmart
git clone https://github.com/your-username/cloudmart-e-commerce.git
cd cloudmart-e-commerce/backend
```

### 12. Create Python Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate
```

### 13. Install Python Dependencies

```bash
pip install -r requirements.txt
pip install gunicorn psycopg2-binary
```

### 14. Configure Backend Environment Variables

Create `.env` file:
```bash
nano .env
```

Add the following:
```env
SECRET_KEY=your-very-secure-random-secret-key-here
DEBUG=False
DATABASE_URL=postgresql://cloudmart_user:your_secure_password@localhost:5432/cloudmart
ALLOWED_HOSTS=your_domain.com,your_vps_ip
CORS_ALLOWED_ORIGINS=https://your_domain.com,http://your_vps_ip
```

Save and exit (Ctrl+X, then Y, then Enter).

### 15. Run Database Migrations

```bash
python manage.py migrate
python manage.py createsuperuser  # Create admin account
python manage.py collectstatic --noinput
```

### 16. Test Backend Server

```bash
gunicorn cloudmart.wsgi:application --bind 0.0.0.0:8000
```

Visit `http://your_vps_ip:8000` to verify. Press Ctrl+C to stop.

### 17. Create Systemd Service for Backend

```bash
sudo nano /etc/systemd/system/cloudmart-backend.service
```

Add the following:
```ini
[Unit]
Description=CloudMart Django Backend
After=network.target

[Service]
User=cloudmart
Group=www-data
WorkingDirectory=/home/cloudmart/cloudmart-e-commerce/backend
Environment="PATH=/home/cloudmart/cloudmart-e-commerce/backend/venv/bin"
ExecStart=/home/cloudmart/cloudmart-e-commerce/backend/venv/bin/gunicorn \
          --workers 3 \
          --bind unix:/home/cloudmart/cloudmart-e-commerce/backend/cloudmart.sock \
          cloudmart.wsgi:application

[Install]
WantedBy=multi-user.target
```

Save and enable the service:
```bash
sudo systemctl start cloudmart-backend
sudo systemctl enable cloudmart-backend
sudo systemctl status cloudmart-backend  # Check status
```

---

## Part 5: Deploy Frontend (React + Vite)

### 18. Build Frontend

```bash
cd /home/cloudmart/cloudmart-e-commerce/frontend
```

Create `.env` file:
```bash
nano .env
```

Add:
```env
VITE_API_URL=https://your_domain.com/api
```

Install dependencies and build:
```bash
npm install
npm run build
```

This creates a `dist` folder with production-ready files.

---

## Part 6: Configure Nginx

### 19. Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/cloudmart
```

Add the following configuration:
```nginx
server {
    listen 80;
    server_name your_domain.com www.your_domain.com;

    # Frontend (React)
    location / {
        root /home/cloudmart/cloudmart-e-commerce/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API (Django)
    location /api/ {
        include proxy_params;
        proxy_pass http://unix:/home/cloudmart/cloudmart-e-commerce/backend/cloudmart.sock;
    }

    # Django Admin
    location /admin/ {
        include proxy_params;
        proxy_pass http://unix:/home/cloudmart/cloudmart-e-commerce/backend/cloudmart.sock;
    }

    # Django Static Files
    location /static/ {
        alias /home/cloudmart/cloudmart-e-commerce/backend/staticfiles/;
    }

    # Django Media Files
    location /media/ {
        alias /home/cloudmart/cloudmart-e-commerce/backend/media/;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/cloudmart /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

---

## Part 7: Setup SSL Certificate (HTTPS)

### 20. Install Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 21. Obtain SSL Certificate

```bash
sudo certbot --nginx -d your_domain.com -d www.your_domain.com
```

Follow the prompts. Certbot will automatically configure HTTPS.

### 22. Auto-Renewal Setup

```bash
sudo systemctl status certbot.timer  # Should be active
```

---

## Part 8: Final Steps

### 23. Set Proper Permissions

```bash
sudo chown -R cloudmart:www-data /home/cloudmart/cloudmart-e-commerce
sudo chmod -R 755 /home/cloudmart/cloudmart-e-commerce
```

### 24. Restart All Services

```bash
sudo systemctl restart cloudmart-backend
sudo systemctl restart nginx
```

### 25. Verify Deployment

Visit `https://your_domain.com` in your browser. Your CloudMart application should be live!

---

## Maintenance & Updates

### Update Application Code

```bash
cd /home/cloudmart/cloudmart-e-commerce
git pull origin main

# Update Backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart cloudmart-backend

# Update Frontend
cd ../frontend
npm install
npm run build
sudo systemctl restart nginx
```

### View Logs

```bash
# Backend logs
sudo journalctl -u cloudmart-backend -f

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### Backup Database

```bash
sudo -u postgres pg_dump cloudmart > backup_$(date +%Y%m%d).sql
```

---

## Troubleshooting

### Backend Not Starting
```bash
sudo journalctl -u cloudmart-backend -n 50
```

### Nginx Errors
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### Database Connection Issues
```bash
sudo -u postgres psql
\l  # List databases
\du # List users
```

### Permission Issues
```bash
sudo chown -R cloudmart:www-data /home/cloudmart/cloudmart-e-commerce
sudo chmod -R 755 /home/cloudmart/cloudmart-e-commerce
```

---

## Security Recommendations

1. **Keep System Updated**: Run `sudo apt update && sudo apt upgrade` regularly
2. **Use Strong Passwords**: For database, admin accounts, and SSH
3. **Disable Root SSH Login**: Edit `/etc/ssh/sshd_config`
4. **Enable Fail2Ban**: `sudo apt install fail2ban`
5. **Regular Backups**: Automate database and file backups
6. **Monitor Logs**: Check logs regularly for suspicious activity

---

## Performance Optimization

1. **Enable Gzip Compression** in Nginx
2. **Setup Redis** for Django caching
3. **Use CDN** for static assets
4. **Database Indexing**: Optimize PostgreSQL queries
5. **Monitor Resources**: Use tools like `htop`, `netstat`

---

**Congratulations! Your CloudMart e-commerce platform is now live on your VPS! 🎉**

For support, contact the Smart Tech team.
