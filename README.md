# SmartShop E-Commerce Platform

SmartShop is a modern, full-stack e-commerce marketplace built with **React**, **Jotai**, and **Django REST Framework**. It features a decoupled architecture, role-based access control (Admin, Seller, User), and a premium responsive UI.

---

## 👥 Team - Smart Tech

- **Abdul Choudhary** - Project Manager
- **Aqveena Manoj** - Backend Developer
- **Vrushika Gajjar** - Designer
- **Abdul Munshi** - Security & Network
- **Devam Trivedi** - Full Stack Developer & DevOps

---

##  Documentation

Please navigate to the docs/ folder for comprehensive documentation:

- **[Start Here: Documentation Index](./docs/DOCUMENTATION_INDEX.md)**
- **[Project Summary](./docs/MVP_SUMMARY.md)**
- **[Quick Start Guide](./docs/QUICK_START_GUIDE.md)**
- **[Technical Specification](./docs/FULL_MVP_SPECIFICATION.md)**
- **[System Architecture](./docs/SYSTEM_ARCHITECTURE.md)**

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Python** 3.10+
- **PostgreSQL** (for production) or SQLite (for development)
- **Git**

### Frontend Setup (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
The frontend will be available at `http://localhost:5173`

### Backend Setup (Django)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```
The backend API will be available at `http://localhost:8000`

---

## ✨ Features

- **Multi-Role System**: Admin, Seller, and Customer roles with distinct permissions
- **Product Management**: Full CRUD operations for products with image uploads
- **Shopping Cart**: Real-time cart management with Jotai state
- **Order Processing**: Complete order workflow from cart to delivery
- **Admin Dashboard**: Analytics, order management, and user administration
- **Seller Portal**: Product listing, inventory, and sales tracking
- **Search & Filter**: Advanced product search with category filtering
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Authentication**: JWT-based secure authentication
- **Reviews & Ratings**: Customer product reviews and ratings

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS 4, Jotai
- **Backend**: Python 3.10, Django 4.2, DRF, JWT
- **Database**: PostgreSQL (Production) / SQLite (Dev)
- **Deployment**: Vercel (Frontend) + Render (Backend)

---

## 📁 Project Structure

```
smartshop-e-commerce/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service layer
│   │   ├── store/           # Jotai state management
│   │   └── types/           # TypeScript type definitions
│   ├── public/              # Static assets
│   └── package.json
│
├── backend/                 # Django backend application
│   ├── api/                 # Main API app
│   │   ├── models.py        # Database models
│   │   ├── views.py         # API views
│   │   ├── serializers.py   # DRF serializers
│   │   └── urls.py          # API routing
│   ├── core/                # Project settings
│   └── requirements.txt
│
└── docs/                    # Project documentation
```

---

## 🔐 Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000/api
```

### Backend (.env)
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DATABASE_URL=postgresql://user:password@localhost:5432/smartshop
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

---

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `GET /api/auth/user/` - Get current user

### Products
- `GET /api/products/` - List all products
- `GET /api/products/:id/` - Get product details
- `POST /api/products/` - Create product (Seller/Admin)
- `PUT /api/products/:id/` - Update product (Seller/Admin)
- `DELETE /api/products/:id/` - Delete product (Seller/Admin)

### Orders
- `GET /api/orders/` - List user orders
- `POST /api/orders/` - Create new order
- `GET /api/orders/:id/` - Get order details
- `PATCH /api/orders/:id/` - Update order status (Admin)

### Reviews
- `GET /api/products/:id/reviews/` - Get product reviews
- `POST /api/products/:id/reviews/` - Add product review

---

## 🚀 Deployment

### Deployment (VPS)
Please refer to the **[VPS Deployment Guide](./docs/VPS_DEPLOYMENT_GUIDE.md)** for detailed instructions on deploying to HostAsia VPS.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is developed by **Smart Tech** team as part of an academic project.

---

## 📧 Contact

For questions or support, please contact the team:
- **Project Manager**: Abdul Choudhary
- **Backend Lead**: Aqveena Manoj
- **Design Lead**: Vrushika Gajjar
- **Security Lead**: Abdul Munshi
- **DevOps Lead**: Devam Trivedi

---

**Built with ❤️ by Smart Tech Team**
