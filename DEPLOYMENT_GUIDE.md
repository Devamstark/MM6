# CloudMart Deployment Guide (Vercel + Render + Neon)

This guide details the steps to deploy the CloudMart Capstone project to a live production environment using the approved technology stack.

## 📋 Prerequisites

1.  A **GitHub Account** with the project code pushed to a public repository.
2.  A **Render Account** (for Backend & Database).
3.  A **Vercel Account** (for Frontend).

---

## 🏗 Phase 1: Backend & Database (Render)

We will use Render's "Blueprints" feature to automatically provision the Django Service and the PostgreSQL Database.

### 1. Connect to Render
1.  Log in to the [Render Dashboard](https://dashboard.render.com/).
2.  Click **New +** and select **Blueprint**.
3.  Connect your GitHub account and select the `cloudmart-e-commerce` repository.

### 2. Configure the Blueprint
Render will detect the `render.yaml` file in the root of your repository.
1.  **Service Name**: Ensure it is set to `cloudmart-backend`.
2.  **Environment Variables**: The `render.yaml` will automatically prompt strictly required variables, but you may need to add:
    *   `SECRET_KEY`: (Render generates this automatically due to `generateValue: true` in the yaml).
    *   `DATABASE_URL`: (Render connects this automatically).

### 3. Deploy
1.  Click **Apply**.
2.  Render will:
    *   Spin up a generic PostgreSQL instance (`cloudmart-db`).
    *   Build the Python environment (`pip install`).
    *   Run migrations (`manage.py migrate`).
    *   Start the Gunicorn server.

### 4. Locate Backend URL
Once deployed (green checkmark), find your **Service URL** at the top of the Dashboard (e.g., `https://cloudmart-backend.onrender.com`).
> **Copy this URL. You will need it for the Frontend.**

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
