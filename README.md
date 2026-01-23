# CloudMart E-Commerce Platform (Senior Capstone)

A comprehensive, full-stack B2C e-commerce solution designed to demonstrate modern, decoupled cloud architecture. This project integrates a **React** frontend with a **Django REST Framework** backend and a **PostgreSQL** database, adhering to strict Agile SDLC and academic standards.

## 🎓 Academic Project Overview

*   **Course:** IT495 / Senior Seminar
*   **Architecture:** Decoupled (Headless) Client-Server
*   **Deployment:** Cloud-Native (Vercel + Render + Neon)
*   **Testing Strategy:** Automated End-to-End Testing with Playwright

---

## 🏗 Tech Stack

### **Frontend (Client-Side)**
*   **Framework:** React 18 (TypeScript)
*   **Styling:** Tailwind CSS
*   **State Management:** React Context API
*   **HTTP Client:** Axios (consuming REST API)
*   **Hosting:** **Vercel**

### **Backend (Server-Side)**
*   **Language:** Python 3.10+
*   **Framework:** Django 4.2 + Django REST Framework (DRF)
*   **Authentication:** JWT (JSON Web Tokens) via `djangorestframework-simplejwt`
*   **Hosting:** **Render**

### **Database (Persistence)**
*   **Engine:** PostgreSQL 15
*   **Hosting:** **Neon** (Serverless Postgres)

### **Quality Assurance**
*   **E2E Testing:** Playwright (JavaScript)
*   **Unit Testing:** Django Test Suite (`unittest`)

---

## 📂 Project Structure

```
/
├── frontend/               # React Client Application
│   ├── src/
│   │   ├── components/     # UI Components (ProductCard, Layout)
│   │   ├── pages/          # Views (Home, SellerDashboard, internal Admin)
│   │   ├── services/       # API integration service (Axios)
│   │   └── context/        # Auth & Cart Context providers
│   ├── tests/              # Playwright E2E Tests
│   └── package.json
│
├── backend/                # Django Server Application
│   ├── manage.py           # Django CLI entry point
│   ├── core/               # Main project settings
│   ├── api/                # Application logic
│   │   ├── models.py       # database schema (Products, Orders, Users)
│   │   ├── views.py        # API ViewSets
│   │   ├── serializers.py  # JSON serialization
│   │   └── urls.py         # Route definitions
│   └── requirements.txt    # Python dependencies
│
└── README.md
```

---

## 🚀 Setup & Installation

### 1. Prerequisites
*   Node.js v16+
*   Python 3.10+
*   PostgreSQL (Local or Neon connection string)

### 2. Backend Setup (Django)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt

# Configure Environment Variables (.env)
# DATABASE_URL=postgres://user:pass@ep-xyz.neon.tech/neondb

python manage.py migrate
python manage.py runserver
```

### 3. Frontend Setup (React)
```bash
cd frontend
npm install
npm run dev
```
The application will launch at `http://localhost:5173`, communicating with the Django API at `http://localhost:8000`.

---

## 🧩 Architectural Decisions

### **Why Python & Django?**
Python was selected for the backend to leverage its robust standard library and "batteries-included" web framework, Django. Using Django REST Framework allows for rapid development of secure, strictly API-based endpoints, ensuring clean separation from the client.

### **Why React & Playwright?**
React provides a dynamic, component-based user interface essential for modern web applications. Playwright was chosen for testing to allow for reliable, cross-browser automation using the same language (JavaScript) used in the frontend, streamlining the QA process.

### **Cloud Deployment**
The project avoids monolithic hosting by utilizing best-in-class specialized cloud services:
*   **Render** handles the stateless Python containers.
*   **Neon** provides scalable, serverless PostgreSQL storage.
*   **Vercel** delivers the static frontend assets globally with low latency.

---

## 🔐 Security Features
*   **RBAC (Role-Based Access Control):** distinct permissions for Shoppers, Sellers, and Admins.
*   **JWT Authentication:** Stateless, secure token-based session management.
*   **CORS Protection:** Strict allow-listing of frontend domains.
*   **Environment Isolation:** Sensitive credentials managed via environment variables.

---

## 🔮 Roadmap
*   Integration of Stripe Webhooks for real-time payment confirmation.
*   Redis caching for high-traffic product endpoints.
*   CI/CD pipeline automation via GitHub Actions.
