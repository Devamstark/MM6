# CloudMart Deployment Guide (Vercel + Render + Neon)

This guide details the steps to deploy the CloudMart Capstone project to a live production environment using the approved technology stack.

## 📋 Prerequisites

1.  A **GitHub Account** with the project code pushed to a public repository.
2.  A **Render Account** (for Backend & Database).
3.  A **Vercel Account** (for Frontend).

---

## 🏗 Phase 1: Database Setup (Neon)

Since `render.yaml` separates the database to avoid costs, we will use **Neon** (Free Tier) for the database.

1.  **Create Database**:
    *   Go to [Neon.tech](https://neon.tech/) and sign up.
    *   Create a new Project (e.g., `cloudmart`).
    *   **Important**: Copy the **Connection String** (e.g., `postgres://user:pass@ep-xyz.neon.tech/neondb?sslmode=require`).

## 🏗 Phase 2: Backend Setup (Render Manual Deployment)

**Note:** We use Manual Deployment to avoid the requirement of adding a credit card, which is often enforced when using Blueprints (`render.yaml`).

1.  **Create New Web Service**:
    *   Log in to [Render Dashboard](https://dashboard.render.com/).
    *   Click **New +** -> **Web Service**.
    *   **Do NOT** select "Blueprint". Select **"Build and deploy from a Git repository"**.
    *   Connect your `cloudmart-e-commerce` repository.

2.  **Configure Service Details**:
    *   **Name**: `cloudmart-backend`
    *   **Region**: Oregon (US West) or closest to you.
    *   **Branch**: `main`
    *   **Runtime**: **Python 3**
    *   **Build Command**: `pip install -r backend/requirements.txt && python backend/manage.py collectstatic --noinput && python backend/manage.py migrate`
    *   **Start Command**: `gunicorn backend.core.wsgi:application`
    *   **Instance Type**: **Free**.

3.  **Environment Variables**:
    *   Scroll down to "Environment Variables" and add:
        *   `PYTHON_VERSION`: `3.10.0`
        *   `DATABASE_URL`: *(Paste your Neon Connection String)*
        *   `SECRET_KEY`: `django-insecure-change-me` (or generate a random string)
        *   `WEB_CONCURRENCY`: `4`

4.  **Deploy**:
    *   Click **Create Web Service**.
    *   Wait for the build to finish.
    *   Copy the **onrender.com** URL once live.

---

## 🎨 Phase 2: Frontend (Vercel)

### 1. Connect to Vercel
1.  Log in to the [Vercel Dashboard](https://vercel.com/dashboard).
2.  Click **Add New...** -> **Project**.
3.  Import the same `cloudmart-e-commerce` repository from GitHub.

### 2. Configure Build Settings
Vercel usually auto-detects Vite/React, but verify:
*   **Framework Preset**: Vite
*   **Root Directory**: `./` (or `frontend` if you moved the react files there. *Note: based on current structure, root is correct*).
*   **Build Command**: `npm run build`
*   **Output Directory**: `dist`

### 3. Environment Variables
Click **Environment Variables** before deploying and add:

| Variable Name | Value | Description |
| :--- | :--- | :--- |
| `VITE_API_URL` | `https://cloudmart-backend.onrender.com/api` | The URL from Phase 1 + `/api` |

### 4. Deploy
1.  Click **Deploy**.
2.  Vercel will install npm dependencies, build the static assets, and distribute them to the edge.

---

## 🔍 Phase 3: Final Verification

1.  Open your **Vercel URL** (e.g., `https://cloudmart.vercel.app`).
2.  **Register a User**:
    *   Since the `register` endpoint effectively throws an error in our strict academic demo (or relies on Admin), log in with the **Superuser** credentials you created via the Render Shell.
    *   *Tip: To create a superuser in Render: Go to Shell -> `python backend/manage.py createsuperuser`*.
3.  **Browse Products**: Ensure products load (fetching from Django).
4.  **Add to Cart & Checkout**: Complete a purchase and verify the order appears in the User Dashboard.

---

## 🛠 Troubleshooting

**Issue:** API calls fail with "CORS Error".
**Fix:**
1.  Go to Render Dashboard -> Environment Variables.
2.  Add `CORS_ALLOWED_ORIGINS` with your Vercel URL (e.g., `https://cloudmart.vercel.app`).
3.  (Note: The current `settings.py` allows all origins for simplicity, but check for typos).

**Issue:** Images are broken.
**Fix:**
This demo uses direct URLs. Ensure `image_url` in the database points to valid public image links (e.g., unsplash.com), as we are not using S3 for file storage in this academic scope.
