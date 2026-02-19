# HostAsia VPS Deployment Guide (Step-by-Step)

This guide is designed for your **Budget VPS 1** plan (2 Core, 4GB RAM, 20GB NVMe). It provides detailed explanations for every command so you understand exactly what is happening.

## Prerequisites
- **VPS IP Address**: The IP address HostAsia emailed you (e.g., `123.45.67.89`).
- **Root Password**: The password sent by HostAsia.
- **Domain Name**: Your purchased domain (e.g., `smartshop.net`).

---

## 🛑 Essential Architecture Change: Replacing SaaS
By moving to this VPS, you are becoming **fully independent**. You no longer need the following services:

| Service | Old Role | New Replacement on VPS |
| :--- | :--- | :--- |
| **Vercel** | Frontend Hosting | **Nginx** (Web Server) |
| **Render** | Backend Hosting | **Gunicorn** + **Systemd** |
| **Neon** | Database | **Local PostgreSQL** (Installed in Phase 3) |
| **Cloudinary** | Image Storage | **Local NVMe Storage** (Served via Nginx) |

**Note**: To "turn off" Cloudinary and use your VPS storage, simply **do not** add the Cloudinary API keys to your `.env` file in Phase 4.

---

## Phase 1: Accessing & Securing Your Server

### Step 1: Login via SSH
**Why?** SSH (Secure Shell) is how you remotely control your Linux server. Think of it as opening a command prompt on a computer that is miles away.
Open your terminal (Command Prompt or PowerShell on Windows) and type:

```bash
ssh root@157.90.149.223
```
*Replace `157.90.149.223` with your actual IP address.*
*When asked "Are you sure you want to continue connecting?", type `yes` and press Enter.*
*Enter your password (typing will be invisible) and press Enter.*

### Step 2: Update Your System
**Why?** Essential for security and stability. This installs the latest security patches and software updates available for your Ubuntu system.

```bash
apt update && apt upgrade -y
```

### Step 3: Create a Dedicated User
**Why?** Running as `root` (super user) is dangerous. If you make a mistake as root, you could break the entire server. We create a regular user named `smartshop` with sudo (admin) privileges for safer management.

```bash
# Create the user
adduser smartshop

# Add user to the 'sudo' group so they can run admin commands
usermod -aG sudo smartshop

# Switch to this new user
su - smartshop
```

### Step 4: Configure a Firewall
**Why?** We want to block all ports except the ones we need (SSH, HTTP, HTTPS). This prevents hackers from accessing unused services.

```bash
# Allow OpenSSH so you don't lock yourself out
sudo ufw allow OpenSSH

# Allow standard web traffic (HTTP/HTTPS)
sudo ufw allow 'Nginx Full'

# Enable the firewall
sudo ufw enable
```
*Type `y` and Enter to confirm.*

---

## Phase 2: Installing Software (The Stack)

### Step 1: Install Python, PostgreSQL, Nginx, and Git
**Why?**
- **Python**: To run your Django backend.
- **PostgreSQL**: A robust database for your products and users.
- **Nginx**: A high-performance web server to serve your site to the world.
- **Git**: To download your code from GitHub.

```bash
sudo apt install python3-pip python3-venv python3-dev libpq-dev postgresql postgresql-contrib nginx curl git -y
```

### Step 2: Install Node.js
**Why?** Required to build your React frontend. We use Node.js version 20 (LTS).

```bash
# Download the setup script for Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js
sudo apt install -y nodejs
```

---

## Phase 3: Setting Up the Database

### Step 1: Configure PostgreSQL
**Why?** We need to create a "room" (database) and a "key" (user) for your app to store and access data securely.

```bash
# Start the PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Log in to the database system
sudo -u postgres psql
```

**Inside the SQL prompt (looks like `postgres=#`), run these lines one by one:**

```sql
-- Create the database
CREATE DATABASE smartshop_db;

-- Create the user (Replace 'strong_password' with a REAL secure password)
CREATE USER smartshop_user WITH PASSWORD 'strong_password';

-- Configure recommended settings for Django
ALTER ROLE smartshop_user SET client_encoding TO 'utf8';
ALTER ROLE smartshop_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE smartshop_user SET timezone TO 'UTC';

-- Give the user permission to use the database
GRANT ALL PRIVILEGES ON DATABASE smartshop_db TO smartshop_user;

-- Exit the SQL prompt
\q
```

---

## Phase 4: Deploying the Backend (Django)

### Step 1: Download Your Code
**Why?** We need to get your code from GitHub onto the server.

```bash
cd /home/smartshop
git clone https://github.com/Devamstark/MM6.git smartshop-app
cd smartshop-app/backend
```

### Step 2: Set Up Python Environment
**Why?** Virtual environments keep your project libraries separate from the system libraries. This prevents version conflicts.

```bash
# Create virtual environment
python3 -m venv venv

# Activate it
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install gunicorn psycopg2-binary
```

### Step 3: Configure Environment Variables
**Why?** We keep secrets (passwords, keys) out of the code and in a secure file. This is best practice for security.

```bash
nano core/.env
```
**Paste this inside (Right-click to paste):**

```env
DEBUG=False
SECRET_KEY='<GENERATE_A_RANDOM_SECRET_KEY>'
ALLOWED_HOSTS=<YOUR_DOMAIN_NAME>,157.90.149.223
CSRF_TRUSTED_ORIGINS=https://<YOUR_DOMAIN_NAME>,https://www.<YOUR_DOMAIN_NAME>
CORS_ALLOWED_ORIGINS=https://<YOUR_DOMAIN_NAME>,https://www.<YOUR_DOMAIN_NAME>
DATABASE_URL=postgres://smartshop_user:strong_password@localhost:5432/smartshop_db
```
*Press `Ctrl+O`, `Enter` to save, then `Ctrl+X` to exit.*

### Step 4: Initialize the Application
**Why?** We need to apply the database structure (tables) and collect static files (CSS/JS for admin) into one folder.

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py collectstatic --noinput
```

### Step 5: Keep Django Running (Gunicorn & Systemd)
**Why?** If you just run `python manage.py runserver`, it stops when you close SSH. Systemd is a Linux tool that keeps programs running in the background and restarts them if the server reboots.

1. **Create the service file:**
   ```bash
   sudo nano /etc/systemd/system/gunicorn.service
   ```

2. **Paste this content:**
   ```ini
   [Unit]
   Description=gunicorn daemon
   After=network.target

   [Service]
   User=smartshop
   Group=www-data
   WorkingDirectory=/home/smartshop/smartshop-app/backend
   ExecStart=/home/smartshop/smartshop-app/backend/venv/bin/gunicorn --workers 3 --bind unix:/home/smartshop/smartshop-app/backend/core.sock core.wsgi:application

   [Install]
   WantedBy=multi-user.target
   ```

3. **Start the service:**
   ```bash
   sudo systemctl start gunicorn
   sudo systemctl enable gunicorn
   ```

---

## Phase 5: Deploying the Frontend (React)

### Step 1: Build the App
**Why?** Browsers cannot read React code directly. We must "build" it into standard HTML, CSS, and JavaScript.

```bash
cd /home/smartshop/smartshop-app

# Install Node dependencies
npm install

# Build for production (Replace URL with your domain)
export VITE_API_URL=https://<YOUR_DOMAIN_NAME>/api
npm run build
```
*This creates a `dist` folder containing your ready-to-serve website.*

### Step 2: Deploy Files
**Why?** We move the finished files to `/var/www/`, the standard folder for web servers to read from.

```bash
sudo mkdir -p /var/www/smartshop
sudo cp -r dist/* /var/www/smartshop/
sudo chown -R www-data:www-data /var/www/smartshop
```

---

## Phase 6: Connecting with Nginx

### Step 1: Configure Nginx
**Why?** Nginx acts as the traffic controller. It sends website visitors to your React files and API requests (like login or checkout) to your Django backend.

```bash
sudo nano /etc/nginx/sites-available/smartshop
```

**Paste this content (Replace `your_domain.com` with your actual domain):**

```nginx
server {
    listen 80;
    server_name your_domain.com www.your_domain.com;

    # Serve React Frontend
    location / {
        root /var/www/smartshop;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to Django
    location /api/ {
        include proxy_params;
        proxy_pass http://unix:/home/smartshop/smartshop-app/backend/core.sock;
    }

    # Proxy Admin requests to Django
    location /admin/ {
        include proxy_params;
        proxy_pass http://unix:/home/smartshop/smartshop-app/backend/core.sock;
    }

    # Serve Django Static Media (Images uploaded by users)
    location /media/ {
        alias /home/smartshop/smartshop-app/backend/media/;
    }

    # Serve Django Admin Styles (CSS for admin panel)
    location /static/ {
        alias /home/smartshop/smartshop-app/backend/staticfiles/;
    }
}
```

### Step 2: Activate the Site
**Why?** We link the configuration file to the "enabled" folder to tell Nginx to use it.

```bash
# Link the config
sudo ln -s /etc/nginx/sites-available/smartshop /etc/nginx/sites-enabled/

# Test for errors
sudo nginx -t

# Restart Nginx to apply changes
sudo systemctl restart nginx
```

---

## Phase 7: Go Live (DNS & Email Preservation)

**CRITICAL: Read this before changing anything!**
You currently use cPanel (IP `51.83.161.4`) for your email. Moving to a VPS will **BREAK YOUR EMAIL** if you don't follow these steps. We will set up a "Split Configuration":
- **Website** -> Goes to **New VPS**.
- **Email** -> Stays on **Old cPanel Hosting** (so you don't lose emails).

#### Step 1: Prepare "Mail" Record (Do this NOW in cPanel)
1.  Log in to cPanel Zone Editor.
2.  Find the record `mail.smartshop.net`. It is currently a **CNAME**.
3.  **Delete** the `mail.smartshop.net` CNAME record.
4.  **Create a New Record**:
    *   **Name**: `mail.smartshop.net`
    *   **Type**: **A**
    *   **Record/Value**: `51.83.161.4` (This is your current cPanel IP)
    *   **TTL**: 14400
5.  **Edit the MX Record**:
    *   Make sure the MX record points to `mail.smartshop.net` (Priority 0).

*Why? This "pins" your email to the old server. Now, even if we move the main domain, email stays put.*

#### Step 2: Point Domain to VPS (Do this AFTER buying VPS)
Once you buy the VPS, HostAsia will give you a **NEW IP ADDRESS** (e.g., `xxx.xxx.xxx.xxx`).

1.  In cPanel Zone Editor (or your Domain Registrar if they are different):
2.  Find the **A Record** for `smartshop.net`.
3.  **Edit** it:
    *   **Old Value**: `51.83.161.4`
    *   **New Value**: `157.90.149.223`
4.  Find the **CNAME** for `www.smartshop.net`.
    *   Ensure it points to `smartshop.net`.

#### Step 3: Secure with HTTPS (SSL) on VPS
SSH into your **157.90.149.223** and run:

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d smartshop.net -d www.smartshop.net
```
*Select "Redirect" (2) when asked.*

---

## Phase 8: Automating Updates (CI/CD Pipeline)

**Why?** Without automation, every time you fix a bug or add a feature, you have to SSH into the server, run `git pull`, restart services, build the frontend, etc. A CI/CD pipeline does this automatically whenever you push code to GitHub.

### Step 1: Get Your SSH Key
You need to give GitHub permission to access your VPS.
On your **local computer**, run:
```bash
cat ~/.ssh/id_rsa
```
*(If you don't have one, generate one with `ssh-keygen -t rsa -b 4096` and add the public key `~/.ssh/id_rsa.pub` to your VPS's `~/.ssh/authorized_keys`)*.

Copy the entire block of text starting with `-----BEGIN OPENSSH PRIVATE KEY-----` and ending with `-----END OPENSSH PRIVATE KEY-----`.

### Step 2: Configure GitHub Secrets
1. Go to your GitHub Repository page.
2. Click **Settings** > **Secrets and variables** > **Actions**.
3. Click **New repository secret**.
4. Add the following secrets:
   - **Name**: `VPS_HOST`
     - **Value**: Your VPS IP address (e.g., `123.45.67.89`)
   - **Name**: `VPS_USERNAME`
     - **Value**: `root` (or `smartshop` if you created a user with key access)
   - **Name**: `SSH_PRIVATE_KEY`
     - **Value**: The private key you copied in Step 1.

### Step 3: Trigger a Deployment
I have already created a file for you at `.github/workflows/deploy.yml`.
Now, simply make a change to your code, commit, and push:
```bash
git add .
git commit -m "Setup CI/CD pipeline"
git push origin main
```
Go to the **Actions** tab on GitHub to watch your deployment run automatically!

---

## Phase 9: FAQ & Maintenance

### 1. If I delete my GitHub repository, will my website stop working?
**Answer: NO.**
Your website runs from the code stored on your VPS hard drive. GitHub is just a place to store a *copy* of your code for development.
- **If you delete the repo**: Your site stays online safely.
- **The downside**: You lose your backup and history. You won't be able to push new updates easily until you create a new one.
- **Recommendation**: Always keep your GitHub repo as a backup.

### 2. How do I update my website manually?
If you don't want to set up CI/CD, simply SSH into your server and run:
```bash
cd /home/smartshop/smartshop-app
git pull
# If backend changes:
sudo systemctl restart gunicorn
# If frontend changes:
npm run build && sudo cp -r dist/* /var/www/smartshop/
```

### 3. How do I check logs if something breaks?
- **Nginx (Web Server) Logs**: `sudo tail -f /var/log/nginx/error.log`
- **Django (Backend) Logs**: `sudo journalctl -u gunicorn -f`

---

## Conclusion
You have now deployed a professional, high-performance e-commerce platform on your own **HostAsia VPS**. You have full control, lower costs, and no dependencies on third-party cloud platforms like Vercel or Render.

**Enjoy your new site!**
