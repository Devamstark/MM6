# CloudMart E-Commerce Platform

CloudMart is a modern, full-stack e-commerce marketplace built with **React**, **Jotai**, and **Django REST Framework**. It features a decoupled architecture, role-based access control (Admin, Seller, User), and a premium responsive UI.

---

##  Documentation

Please navigate to the docs/ folder for comprehensive documentation:

- **[Start Here: Documentation Index](./docs/DOCUMENTATION_INDEX.md)**
- **[Project Summary](./docs/MVP_SUMMARY.md)**
- **[Quick Start Guide](./docs/QUICK_START_GUIDE.md)**
- **[Technical Specification](./docs/FULL_MVP_SPECIFICATION.md)**
- **[System Architecture](./docs/SYSTEM_ARCHITECTURE.md)**

---

##  Quick Start

### Frontend (React + Vite)
`ash
cd frontend
npm install
npm run dev
``n
### Backend (Django)
`ash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python manage.py runserver
``n
---

##  Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS 4, Jotai
- **Backend**: Python 3.10, Django 4.2, DRF, JWT
- **Database**: PostgreSQL (Production) / SQLite (Dev)
- **Deployment**: Vercel (Frontend) + Render (Backend)

