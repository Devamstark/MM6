---
description: Deploy CloudMart for FREE using Vercel, Render, and Neon
---

# Free Deployment Guide for CloudMart

Deploy your entire CloudMart application for **FREE** using cloud services. Perfect for academic projects and demos!

---

## 🎯 Services We'll Use (All FREE)

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| **Vercel** | Frontend (React) | Unlimited projects |
| **Render** | Backend (Django) | 750 hours/month |
| **Neon** | PostgreSQL Database | 1 project, 10GB |
| **Cloudinary** | Image Storage | 25GB storage |

**Total Cost: ₹0/month** 🎉

---

## Part 1: Setup Database (Neon)

### 1. Create Neon Account
- Go to https://neon.tech
- Sign up with GitHub/Google
- Click **"Create a project"**

### 2. Get Database Credentials
After creating project, you'll see:
```
Host: ep-xxx.neon.tech
Database: neondb
User: your_username
Password: your_password
```

**Save these!** You'll need them later.

### 3. Copy Connection String
It looks like:
```
postgresql://user:password@ep-xxx.neon.tech/neondb?sslmode=require
```

---

## Part 2: Deploy Backend (Render)

### 4. Prepare Backend for Deployment

Create `render.yaml` in your backend folder:
```yaml
services:
  - type: web
    name: cloudmart-backend
    env: python
    buildCommand: pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput
    startCommand: gunicorn cloudmart.wsgi:application
    envVars:
      - key: SECRET_KEY
        generateValue: true
      - key: DEBUG
        value: False
      - key: DATABASE_URL
        sync: false
      - key: ALLOWED_HOSTS
        value: .onrender.com
      - key: CORS_ALLOWED_ORIGINS
        value: https://your-frontend.vercel.app
```

### 5. Update requirements.txt
Add these if not present:
```
gunicorn
psycopg2-binary
whitenoise
dj-database-url
```

### 6. Update Django Settings
Edit `backend/cloudmart/settings.py`:

```python
import os
import dj_database_url

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('SECRET_KEY', 'your-dev-secret-key')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get('DEBUG', 'True') == 'True'

ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

# Database
if os.environ.get('DATABASE_URL'):
    DATABASES = {
        'default': dj_database_url.config(
            default=os.environ.get('DATABASE_URL'),
            conn_max_age=600
        )
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# CORS
CORS_ALLOWED_ORIGINS = os.environ.get(
    'CORS_ALLOWED_ORIGINS',
    'http://localhost:5173'
).split(',')

# Static files
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Add this
    # ... other middleware
]

STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
```

### 7. Deploy to Render
1. Go to https://render.com
2. Sign up with GitHub
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub repository
5. Select `backend` folder (if monorepo)
6. Fill in:
   - **Name:** cloudmart-backend
   - **Environment:** Python 3
   - **Build Command:** `pip install -r requirements.txt && python manage.py collectstatic --noinput`
   - **Start Command:** `gunicorn cloudmart.wsgi:application`
7. Add Environment Variables:
   ```
   SECRET_KEY=<generate random string>
   DEBUG=False
   DATABASE_URL=<paste Neon connection string>
   ALLOWED_HOSTS=.onrender.com
   CORS_ALLOWED_ORIGINS=https://your-app.vercel.app
   ```
8. Click **"Create Web Service"**

### 8. Wait for Deployment
- Render will build and deploy (5-10 minutes)
- You'll get a URL like: `https://cloudmart-backend.onrender.com`
- **Save this URL!**

### 9. Run Migrations
In Render dashboard:
- Go to **Shell** tab
- Run:
  ```bash
  python manage.py migrate
  python manage.py createsuperuser
  ```

---

## Part 3: Deploy Frontend (Vercel)

### 10. Update Frontend Environment
Edit `frontend/.env`:
```env
VITE_API_URL=https://cloudmart-backend.onrender.com/api
```

### 11. Deploy to Vercel
1. Go to https://vercel.com
2. Sign up with GitHub
3. Click **"Add New"** → **"Project"**
4. Import your GitHub repository
5. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend` (if monorepo)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. Add Environment Variables:
   ```
   VITE_API_URL=https://cloudmart-backend.onrender.com/api
   ```
7. Click **"Deploy"**

### 12. Get Your URL
- Vercel will deploy in 2-3 minutes
- You'll get: `https://cloudmart.vercel.app`
- **This is your live website!** 🎉

### 13. Update Backend CORS
Go back to Render → Environment Variables:
```
CORS_ALLOWED_ORIGINS=https://cloudmart.vercel.app,https://cloudmart-backend.onrender.com
```
Save and redeploy.

---

## Part 4: Setup Cloudinary (Optional)

### 14. Create Cloudinary Account
1. Go to https://cloudinary.com
2. Sign up (free tier)
3. Get credentials from dashboard:
   ```
   Cloud Name: your_cloud_name
   API Key: your_api_key
   API Secret: your_api_secret
   ```

### 15. Add to Backend
Install package:
```bash
pip install cloudinary django-cloudinary-storage
```

Update `settings.py`:
```python
INSTALLED_APPS = [
    # ...
    'cloudinary_storage',
    'cloudinary',
]

CLOUDINARY_STORAGE = {
    'CLOUD_NAME': os.environ.get('CLOUDINARY_CLOUD_NAME'),
    'API_KEY': os.environ.get('CLOUDINARY_API_KEY'),
    'API_SECRET': os.environ.get('CLOUDINARY_API_SECRET'),
}

DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'
```

Add to Render environment variables:
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 🎯 Final URLs

After deployment, you'll have:

```
Frontend: https://cloudmart.vercel.app
Backend API: https://cloudmart-backend.onrender.com/api
Admin Panel: https://cloudmart-backend.onrender.com/admin
```

---

## ⚠️ Free Tier Limitations

### Render (Backend)
- ✅ 750 hours/month (enough for 1 project)
- ⚠️ **Sleeps after 15 min inactivity** (first request takes 30-60 seconds)
- ✅ 512MB RAM
- ✅ Auto-deploys on git push

### Neon (Database)
- ✅ 1 project
- ✅ 10GB storage
- ✅ Always active
- ⚠️ Limited connections

### Vercel (Frontend)
- ✅ Unlimited projects
- ✅ 100GB bandwidth/month
- ✅ Always fast (CDN)
- ✅ Auto-deploys on git push

### Cloudinary (Images)
- ✅ 25GB storage
- ✅ 25GB bandwidth/month
- ✅ Image transformations

---

## 🔄 How to Update Your Site

### Update Backend:
```bash
git add .
git commit -m "Update backend"
git push origin main
```
Render auto-deploys in 2-3 minutes.

### Update Frontend:
```bash
git add .
git commit -m "Update frontend"
git push origin main
```
Vercel auto-deploys in 1-2 minutes.

---

## 🐛 Troubleshooting

### Backend is slow on first load
- **Normal!** Free tier sleeps after 15 min
- First request wakes it up (30-60 sec)
- Subsequent requests are fast

### CORS errors
- Check `CORS_ALLOWED_ORIGINS` in Render
- Must include your Vercel URL
- No trailing slash

### Database connection errors
- Verify `DATABASE_URL` in Render
- Check Neon dashboard (project active?)
- Ensure `?sslmode=require` in connection string

### Static files not loading
- Run `python manage.py collectstatic` in Render shell
- Check `STATIC_ROOT` in settings.py
- Verify WhiteNoise is installed

---

## 💰 Cost Summary

| Service | Cost | What You Get |
|---------|------|--------------|
| Vercel | **FREE** | Frontend hosting |
| Render | **FREE** | Backend hosting (with sleep) |
| Neon | **FREE** | PostgreSQL database |
| Cloudinary | **FREE** | Image storage |
| Domain | ₹800/year | Optional (use .vercel.app for free) |

**Total: ₹0/month** (or ₹67/month with custom domain)

---

## 🚀 Upgrade Path

When you need more:

### Remove Sleep (Backend)
- Render Starter: $7/month (~₹580)
- No sleep, more RAM

### More Database
- Neon Pro: $19/month (~₹1,580)
- More storage, connections

### Custom Domain
- Namecheap: ₹800/year
- Add to Vercel (free SSL included)

---

## ✅ Checklist

- [ ] Create Neon database
- [ ] Update Django settings for production
- [ ] Add gunicorn, whitenoise to requirements.txt
- [ ] Deploy backend to Render
- [ ] Run migrations in Render shell
- [ ] Create superuser in Render shell
- [ ] Update frontend .env with Render URL
- [ ] Deploy frontend to Vercel
- [ ] Update CORS in Render with Vercel URL
- [ ] Test the live site!

---

**Congratulations! Your CloudMart is now live for FREE! 🎉**

Share with your team:
- Frontend: https://cloudmart.vercel.app
- Admin: https://cloudmart-backend.onrender.com/admin
