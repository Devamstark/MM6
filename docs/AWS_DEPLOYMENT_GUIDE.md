# ☁️ Deploying CloudMart to AWS

This guide outlines how to migrate your CloudMart e-commerce application from Render/Vercel to Amazon Web Services (AWS).

We will use a modern, serverless-like architecture for ease of management:
- **Backend (Django)**: AWS App Runner (Containerized, Auto-scaling)
- **Frontend (React)**: AWS Amplify (Static Web Hosting, CI/CD)
- **Database**: AWS RDS (Managed PostgreSQL)
- **Media Storage**: Adding AWS S3 (Optional, replacing Cloudinary if desired, but keeping Cloudinary is easier)

---

## 📋 Prerequisites

1.  **AWS Account**: You need an active AWS account.
2.  **GitHub Repo**: Your code must be pushed to GitHub.
3.  **Domain Name (Optional)**: If you want a custom domain (e.g., `cloudmart.com`).

---

## 🛠️ Step 1: Database Setup (AWS RDS)

1.  Go to the **AWS Console** > **RDS**.
2.  Click **Create database**.
3.  **Choose a database creation method**: Standard create.
4.  **Engine options**: PostgreSQL.
5.  **Templates**: Free tier (if eligible) or Dev/Test.
6.  **Settings**:
    - **DB Instance identifier**: `cloudmart-db`
    - **Master username**: `postgres` (or your choice)
    - **Master password**: *Create a strong password*
7.  **Connectivity**:
    - **Public access**: **Yes** (Easier for development/App Runner, otherwise you need a VPC setup which is complex).
    - **VPC security group**: Create new. Allow access from "Anywhere" (0.0.0.0/0) *temporarily* for initial setup, or restrict to your App Runner IP later.
8.  **Create database**.
9.  **Wait** for it to become "Available".
10. **Copy Endpoint**: It will look like `cloudmart-db.cxxxxxx.us-east-1.rds.amazonaws.com`.

**Build your Connection String:**
```text
postgres://postgres:YOUR_PASSWORD@YOUR_ENDPOINT:5432/postgres
```

---

## 🚀 Step 2: Backend Deployment (AWS App Runner)

AWS App Runner is the easiest way to deploy a containerized API. It's similar to Render.

1.  Go to **AWS Console** > **App Runner**.
2.  Click **Create service**.
3.  **Source**: Source code repository.
4.  **Connect GitHub**: Select your repository (`MM6`) and branch (`main`).
5.  **Deployment settings**: Automatic (deploys on push).
6.  **Build settings**:
    - **Runtime**: Python 3
    - **Build command**: `pip install -r backend/requirements.txt`
    - **Start command**: `sh backend/build.sh` (Assuming your build script runs migrations and starts Gunicorn)
    - *Note*: You might need to adjust paths if `requirements.txt` is in a subfolder.
    - **Port**: `8000`
7.  **Service settings**:
    - **Service name**: `cloudmart-backend`
    - **Environment variables**: Add the following:
        - `DATABASE_URL`: *(Paste your RDS connection string from Step 1)*
        - `SECRET_KEY`: *(Generate a random string)*
        - `DEBUG`: `False`
        - `CLOUDINARY_CLOUD_NAME`: *(Your Cloudinary Name)*
        - `CLOUDINARY_API_KEY`: *(Your Key)*
        - `CLOUDINARY_API_SECRET`: *(Your Secret)*
        - `ALLOWED_HOSTS`: `*` (or your specific App Runner domain once created)
8.  **Create & Deploy**.

**Result**: AWS will give you a default domain like `https://xyz.awsapprunner.com`. **Copy this URL.**

---

## 🎨 Step 3: Frontend Deployment (AWS Amplify)

AWS Amplify is the easiest way to deploy React apps. It's similar to Vercel.

1.  Go to **AWS Console** > **AWS Amplify**.
2.  Click **Create new app** > **Host web app** (GitHub).
3.  **Connect GitHub**: Select your repository.
4.  **Build settings**:
    - Amplify usually auto-detects `vite`.
    - Ensure `baseDirectory` is set to `dist`.
    - Build command: `npm install && npm run build`
5.  **Environment Variables**:
    - Key: `VITE_API_URL`
    - Value: *(Paste your App Runner Backend URL from Step 2)* **IMPORTANT: Add `/api` at the end if your code expects it, e.g., `https://xyz.awsapprunner.com/api`**
6.  **Save and Deploy**.

**Result**: AWS will give you a domain like `https://main.dxxxxx.amplifyapp.com`.

---

## 🔄 Required Code Changes

You might need to make small adjustments to ensure your code works smoothly on AWS.

### 1. `backend/settings.py` (CORS & Hosts)
Ensure your Django settings allow traffic from your new AWS Amplify domain.

```python
# backend/core/settings.py

# Add your AWS domains here
ALLOWED_HOSTS = [
    'localhost', 
    '127.0.0.1', 
    '.onrender.com', 
    '.awsapprunner.com',  # Allow all App Runner subdomains
]

# Add your Amplify domain to CORS
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "https://mm-6.vercel.app",
    "https://main.dxxxxx.amplifyapp.com", # <--- Add your specific Amplify URL here
]

# Alternatively, for testing, allow all (Not recommended for strict production)
# CORS_ALLOW_ALL_ORIGINS = True 
```

### 2. Update `build.sh` (If needed)
Ensure your `backend/build.sh` is pointing to the right folders. App Runner runs from the root usually.

```bash
#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r backend/requirements.txt

python backend/manage.py collectstatic --no-input
python backend/manage.py migrate

# Start Gunicorn
# Adjust path to wsgi if needed
cd backend
gunicorn core.wsgi:application
```

---

## 🛡️ Step 4: Final Security Checks

1.  **RDS Security Group**: Go back to RDS > Connectivity > Security Group. Edit Inbound Rules.
    - Instead of `0.0.0.0/0`, try to restrict it.
    - *Note*: App Runner IPs change. The best way is to put RDS and App Runner in the **same VPC**, but that is an advanced setup. For a simple setup, keeping it open to 0.0.0.0/0 with a **Strong Password** and **SSL** is a common compromise, or allow-listing specific IPs if you can.
2.  **HTTPS**: Both App Runner and Amplify provide free SSL (HTTPS) automatically.

---

## ✅ Summary

1.  **Database**: Migrated to **AWS RDS**.
2.  **Backend**: Running on **AWS App Runner**.
3.  **Frontend**: Hosted on **AWS Amplify**.
4.  **Config**: Updated Env Vars (`DATABASE_URL`, `VITE_API_URL`) in the AWS consoles.

You are now live on the AWS Cloud! 🌤️

---

## ❓ Do I still need Vercel, Render, Neon, or Cloudinary?

If you migrate to AWS, here is what happens to your current services:

| Current Service | AWS Equivalent | Do you need to keep the old one? | Notes |
| :--- | :--- | :--- | :--- |
| **Vercel** (Frontend) | **AWS Amplify** | **NO** | AWS Amplify completely replaces Vercel for hosting your React frontend. |
| **Render** (Backend) | **AWS App Runner** | **NO** | AWS App Runner completely replaces Render for running your Django API. |
| **Neon** (Database) | **AWS RDS** | **NO** | AWS RDS (PostgreSQL) completely replaces Neon. You will migrate your data to AWS. |
| **Cloudinary** (Images) | **AWS S3** | **MAYBE** | **Recommendation: KEEP Cloudinary.** <br><br>While AWS S3 stores files, it **does not** edit, resize, or optimize images on the fly like Cloudinary. <br><br>To replace Cloudinary with AWS, you would need S3 + CloudFront + Lambda (complex to build). **Most AWS-hosted apps still use Cloudinary** for their media management because it is specialized and superior. |

### Summary
- **Cancel**: Vercel, Render, Neon.
- **Keep**: Cloudinary (unless you want to build a custom image processor).
