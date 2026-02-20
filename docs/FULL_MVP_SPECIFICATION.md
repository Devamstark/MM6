# 🚀 SmartShop - Full Stack MVP Specification

## 📋 Executive Summary

**SmartShop** is a modern, full-stack e-commerce platform built with a decoupled architecture. This MVP delivers a complete B2C marketplace with multi-role support (Buyers, Sellers, Admins), real-time inventory management, secure authentication, and a premium user experience using the latest web technologies.

---

## 🏗️ Technology Stack

### **Frontend**
- **Framework**: React 19.x with TypeScript
- **Build Tool**: Vite 6.x (Fast HMR, optimized builds)
- **Styling**: Tailwind CSS 4.x (Utility-first, responsive design, v4 engine)
- **Routing**: React Router DOM v7
- **State Management**: Jotai (Atomic state management for Cart, User, UI)
- **HTTP Client**: Axios (REST API communication)
- **Icons**: Lucide React (Modern, lightweight icons)
- **Deployment**: Docker + Nginx (self-hosted VPS via Dokploy)

### **Backend**
- **Language**: Python 3.10+
- **Framework**: Django 4.2 + Django REST Framework (DRF)
- **Authentication**: JWT (djangorestframework-simplejwt)
- **Database ORM**: Django ORM
- **File Storage**: Local Docker volume (`backend_media`)
- **CORS**: django-cors-headers
- **Static Files**: WhiteNoise (Production static serving)
- **Deployment**: Docker + Gunicorn (self-hosted VPS via Dokploy)

### **Database**
- **Development**: SQLite3 (Local testing)
- **Production**: PostgreSQL 15 (Docker, persistent named volume)

### **DevOps & Tools**
- **Version Control**: Git
- **Package Managers**: npm (frontend), pip (backend)
- **Environment Variables**: python-dotenv + Dokploy env manager
- **Process Manager**: Gunicorn (WSGI server)
- **Orchestrator**: Dokploy (self-hosted)
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Traefik (auto SSL via Let's Encrypt)
- **Backup Storage**: MinIO (self-hosted S3)

---

## 🎯 Core Features & Functionalities

### **1. Authentication & Authorization** 🔐

#### Features:
- **User Registration**: Email-based signup with password validation
- **Login/Logout**: JWT token-based authentication
- **Password Reset**: 6-digit OTP sent to email (token expires in 10 minutes)
- **Role-Based Access Control (RBAC)**:
  - **User/Buyer**: Browse products, add to cart, checkout, write reviews
  - **Seller**: Manage own products, view sales analytics
  - **Admin**: Full platform control, user management, content moderation

#### Technical Implementation:
- **Backend**: Custom `User` model extending `AbstractUser` with `role` field
- **Frontend**: `AuthProvider` wrapping Jotai atoms for user state
- **Security**: HTTP-only cookies (optional), JWT stored in localStorage
- **Endpoints**:
  - `POST /api/auth/register/`
  - `POST /api/auth/login/`
  - `POST /api/auth/password-reset/`
  - `POST /api/auth/password-reset-confirm/`

---

### **2. Product Management** 📦

#### Features:
- **Product Catalog**: Browse products with filtering and search
- **Categories & Subcategories**: Hierarchical organization (e.g., Clothing → Men's Shirts)
- **Product Variants**: Support for sizes, colors, and variant-specific stock
- **Image Gallery**: Primary image + additional images (up to 5)
- **Stock Management**: Real-time inventory tracking
- **Discounts**: Percentage-based discounts with auto-calculated sale prices
- **Featured & Popular Products**: Highlight trending items on homepage

#### Seller Capabilities:
- Create, edit, delete own products
- Upload images (stored in Docker volume)
- Set pricing, stock, and variants
- View product performance metrics

#### Admin Capabilities:
- Manage all products across sellers
- Feature/unfeature products
- Bulk actions (delete, update stock)

#### Technical Implementation:
- **Backend Models**: `Product` with UUID primary key, JSON fields for variants/images
- **Frontend Components**: `ProductCard`, `ProductDetail`, `ProductForm`
- **Endpoints**:
  - `GET /api/products/` (List with filters)
  - `POST /api/products/` (Create - Seller/Admin only)
  - `GET /api/products/{id}/`
  - `PUT /api/products/{id}/` (Update - Owner/Admin only)
  - `DELETE /api/products/{id}/` (Delete - Owner/Admin only)

---

### **3. Shopping Cart & Checkout** 🛒

#### Features:
- **Add to Cart**: Select product variants (size, color) and quantity
- **Cart Persistence**: Stored in localStorage (guest) with Jotai atom sync
- **Stock Validation**: Prevent over-purchasing
- **Cart Summary**: Real-time total calculation with discounts
- **Checkout Flow**:
  1. Review cart items
  2. Enter shipping address
  3. Select payment method (Mock payment for MVP)
  4. Order confirmation

#### Technical Implementation:
- **Frontend**: `cartAtom` (Jotai) with CRUD operations
- **Backend**: `Order` and `OrderItem` models
- **Endpoints**:
  - `POST /api/orders/` (Create order)
  - `GET /api/orders/` (User's order history)
  - `GET /api/orders/{id}/` (Order details)

---

### **4. Order Management** 📋

#### User Features:
- View order history
- Track order status (Pending → Shipped → Delivered)
- Cancel orders (if status is "Pending")

#### Seller Features:
- View orders containing their products
- Update order status (Ship items)

#### Admin Features:
- View all orders
- Update any order status
- Handle cancellations and refunds

#### Technical Implementation:
- **Backend**: `Order` model with status choices
- **Frontend**: `OrderHistory`, `OrderDetail` pages
- **Endpoints**:
  - `GET /api/orders/`
  - `PATCH /api/orders/{id}/` (Update status)
  - `DELETE /api/orders/{id}/` (Cancel - User/Admin only)

---

### **5. Review System** ⭐

#### Features:
- **Verified Buyer Reviews**: Only users who purchased a product can review it
- **Rating System**: 1-5 stars
- **Written Reviews**: Text comments
- **One Review Per Product**: Users can edit their existing review
- **Review Display**: Show on product detail page with user name and date

#### Technical Implementation:
- **Backend**: `Review` model with unique constraint (product, user)
- **Validation**: Check if user has a delivered order containing the product
- **Frontend**: Review form on `ProductDetail` page
- **Endpoints**:
  - `GET /api/reviews/?product={id}` (Product reviews)
  - `POST /api/reviews/` (Create review - Verified buyers only)
  - `PUT /api/reviews/{id}/` (Update own review)
  - `DELETE /api/reviews/{id}/` (Delete own review)

---

### **6. Seller Dashboard** 📊

#### Features:
- **Sales Analytics**:
  - Total revenue
  - Revenue growth (vs. previous period)
  - Units sold
  - Conversion rate
  - Monthly sales chart
- **Product Management**: Quick access to add/edit products
- **Order Fulfillment**: View and update order statuses
- **Performance Metrics**: Best-selling products

#### Technical Implementation:
- **Backend**: Custom viewset methods for analytics
- **Frontend**: `SellerDashboard` page with charts
- **Endpoints**:
  - `GET /api/seller/stats/`
  - `GET /api/seller/products/`
  - `GET /api/seller/orders/`

---

### **7. Admin Dashboard** 🛡️

#### Features:
- **Platform Overview**:
  - Total users, products, orders
  - Revenue metrics
  - Recent activity
- **User Management**:
  - View all users
  - Change user roles
  - Deactivate accounts
- **Product Moderation**:
  - Approve/reject new products
  - Feature products
  - Bulk delete
- **Content Management**:
  - Edit homepage content
  - Manage static pages (About, Terms, Privacy)
- **Order Management**: View and manage all orders

#### Technical Implementation:
- **Backend**: Admin-only viewsets with permission classes
- **Frontend**: `AdminDashboard` with tabs/sections
- **Endpoints**:
  - `GET /api/admin/stats/`
  - `GET /api/admin/users/`
  - `PATCH /api/admin/users/{id}/` (Update role)
  - `GET /api/admin/content/`
  - `PUT /api/admin/content/{slug}/`

---

### **8. Search & Filtering** 🔍

#### Features:
- **Text Search**: Search by product name, description, brand
- **Category Filters**: Filter by category and subcategory
- **Price Range**: Min/max price sliders
- **Sorting**: Price (low to high, high to low), newest, popularity
- **Gender Filter**: Male, Female, Unisex
- **Sale Items**: Filter products on discount

#### Technical Implementation:
- **Backend**: DRF `django_filters` integration
- **Frontend**: Filter sidebar with controlled inputs, Jotai atoms for filter state
- **Endpoints**:
  - `GET /api/products/?search=shirt&category=clothing&min_price=10&max_price=50&sort=price_asc`

---

### **9. Affiliate Program** 💰

#### Features:
- **Referral Codes**: Unique codes for affiliates
- **Click Tracking**: Track referral link clicks
- **Earnings**: Commission on referred sales
- **Dashboard**: View clicks, conversions, earnings

#### Technical Implementation:
- **Backend**: `Affiliate` model linked to `User`
- **Frontend**: Affiliate dashboard page
- **Endpoints**:
  - `GET /api/affiliates/me/`
  - `POST /api/affiliates/track-click/`

---

### **10. Responsive Design** 📱

#### Features:
- **Mobile-First**: Optimized for smartphones (320px+)
- **Tablet Support**: Enhanced layout for tablets (768px+)
- **Desktop Experience**: Full-featured UI for desktops (1024px+)
- **Touch-Friendly**: Large tap targets, swipe gestures

#### Technical Implementation:
- **Tailwind CSS**: Responsive utility classes (`sm:`, `md:`, `lg:`)
- **Flexbox/Grid**: Adaptive layouts
- **Mobile Menu**: Hamburger navigation with smooth transition

---

## 🎨 Design System

### **Color Palette**
```css
:root {
  --primary: #3b82f6;      /* Blue 500 */
  --primary-dark: #2563eb; /* Blue 600 */
  --secondary: #8b5cf6;    /* Violet 500 */
  --accent: #f59e0b;       /* Amber 500 */
  --success: #10b981;      /* Emerald 500 */
  --error: #ef4444;        /* Red 500 */
  --warning: #f59e0b;      /* Amber 500 */
  --background: #ffffff;
  --surface: #f9fafb;      /* Gray 50 */
  --text-primary: #111827; /* Gray 900 */
  --text-secondary: #6b7280; /* Gray 500 */
  --border: #e5e7eb;       /* Gray 200 */
}
```

### **Typography**
- **Font Family**: Inter (Google Fonts)
- **Headings**: Bold, 600-800 weight
- **Body**: Regular, 400 weight
- **Scale**: 12px, 14px, 16px, 18px, 24px, 32px, 48px

### **Components**
- **Buttons**: Primary, Secondary, Outline, Ghost
- **Cards**: Elevated with hover effects
- **Forms**: Floating labels, validation states
- **Modals**: Centered overlay with backdrop blur
- **Toasts**: Top-right notifications

---

## 📂 Project Structure

```
smartshop-e-commerce/
├── frontend/ (Root - Vite React App)
│   ├── index.html
│   ├── index.tsx              # App entry point
│   ├── App.tsx                # Main app component with routing
│   ├── index.css              # Global styles + Tailwind
│   ├── types.ts               # TypeScript interfaces
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   │
│   ├── components/            # Reusable UI components
│   │   ├── Layout.tsx         # Header, Footer, Navigation
│   │   ├── ProductCard.tsx
│   │   ├── CartItem.tsx
│   │   └── ProtectedRoute.tsx
│   │
│   ├── pages/                 # Route pages
│   │   ├── Home.tsx
│   │   ├── Shop.tsx
│   │   ├── ProductDetail.tsx
│   │   ├── Cart.tsx
│   │   ├── Checkout.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── SellerDashboard.tsx
│   │   ├── AdminDashboard.tsx
│   │   └── OrderHistory.tsx
│   │
│   ├── context/               # Global state (Legacy/Wrappers)
│   │   ├── AuthContext.tsx
│   │   └── CartContext.tsx
│   │
│   ├── store/                 # Jotai Atoms (New State)
│   │   └── atoms.ts
│   │
│   ├── services/              # API integration
│   │   └── api.ts             # Axios instance + endpoints
│   │
│   └── utils/                 # Helper functions
│       └── formatters.ts
│
├── backend/                   # Django REST API
│   ├── manage.py
│   ├── requirements.txt
│   ├── build.sh               # Render deployment script
│   │
│   ├── core/                  # Django project settings
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   │
│   └── api/                   # Main app
│       ├── models.py          # Database models
│       ├── serializers.py     # DRF serializers
│       ├── views.py           # API viewsets
│       ├── urls.py            # API routes
│       ├── admin.py           # Django admin config
│       └── migrations/
│
├── .gitignore
├── README.md
├── DEPLOYMENT_GUIDE.md
└── MVP_SPECIFICATION.md (this file)
```

---

## 🔌 API Endpoints Reference

### **Authentication**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register/` | Create new user | No |
| POST | `/api/auth/login/` | Login and get JWT | No |
| POST | `/api/auth/password-reset/` | Request password reset | No |
| POST | `/api/auth/password-reset-confirm/` | Confirm reset with OTP | No |
| GET | `/api/auth/me/` | Get current user | Yes |

### **Products**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/products/` | List products (with filters) | No |
| POST | `/api/products/` | Create product | Seller/Admin |
| GET | `/api/products/{id}/` | Get product details | No |
| PUT | `/api/products/{id}/` | Update product | Owner/Admin |
| DELETE | `/api/products/{id}/` | Delete product | Owner/Admin |

### **Orders**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/orders/` | List user's orders | Yes |
| POST | `/api/orders/` | Create order | Yes |
| GET | `/api/orders/{id}/` | Get order details | Yes (Owner/Admin) |
| PATCH | `/api/orders/{id}/` | Update order status | Seller/Admin |
| DELETE | `/api/orders/{id}/` | Cancel order | User/Admin |

### **Reviews**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/reviews/?product={id}` | Get product reviews | No |
| POST | `/api/reviews/` | Create review | Yes (Verified buyer) |
| PUT | `/api/reviews/{id}/` | Update own review | Yes |
| DELETE | `/api/reviews/{id}/` | Delete own review | Yes |

### **Seller**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/seller/stats/` | Get seller analytics | Seller |
| GET | `/api/seller/products/` | Get seller's products | Seller |
| GET | `/api/seller/orders/` | Get orders with seller's products | Seller |

### **Admin**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/stats/` | Platform statistics | Admin |
| GET | `/api/admin/users/` | List all users | Admin |
| PATCH | `/api/admin/users/{id}/` | Update user role | Admin |
| GET | `/api/admin/content/` | Get page content | Admin |
| PUT | `/api/admin/content/{slug}/` | Update page content | Admin |

---

## 🚀 Setup & Installation

### **Prerequisites**
- Node.js 18+ and npm
- Python 3.10+
- PostgreSQL (for production) or SQLite (for development)
- Git

### **1. Clone Repository**
```bash
git clone https://github.com/Devamstark/MM6.git
cd smartshop-e-commerce
```

### **2. Backend Setup**
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo "SECRET_KEY=your-secret-key-here" > .env
echo "DEBUG=True" >> .env
echo "DATABASE_URL=sqlite:///db.sqlite3" >> .env

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser (admin)
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

Backend will run at `http://localhost:8000`

### **3. Frontend Setup**
```bash
# From project root
npm install

# Start development server
npm run dev
```

Frontend will run at `http://localhost:5173`

### **4. Access the Application**
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api/
- **Django Admin**: http://localhost:8000/admin/

---

## 🧪 Testing

### **Manual Testing Checklist**

#### Authentication
- [ ] Register new user
- [ ] Login with credentials
- [ ] Password reset flow
- [ ] Protected routes redirect to login

#### Product Browsing
- [ ] View all products
- [ ] Filter by category
- [ ] Search products
- [ ] View product details
- [ ] See product variants (sizes, colors)

#### Shopping Cart
- [ ] Add product to cart
- [ ] Update quantity
- [ ] Remove from cart
- [ ] Cart persists on refresh
- [ ] Stock validation works

#### Checkout
- [ ] Complete checkout flow
- [ ] Order appears in order history
- [ ] Stock decrements after purchase

#### Reviews
- [ ] Cannot review without purchase
- [ ] Can review after delivery
- [ ] One review per product
- [ ] Can edit own review

#### Seller Dashboard
- [ ] Create new product
- [ ] Upload images
- [ ] View sales stats
- [ ] Update order status

#### Admin Dashboard
- [ ] View all users
- [ ] Change user roles
- [ ] Manage all products
- [ ] View all orders

---

## 🌐 Deployment

> The application is live on a self-hosted VPS. See **[VPS_DEPLOYMENT_GUIDE.md](./VPS_DEPLOYMENT_GUIDE.md)** for full details.

### **Current Stack (VPS + Docker + Dokploy)**
1. Push code to GitHub
2. Dokploy detects the push and triggers rebuild
3. Docker builds `Dockerfile.frontend` and `Dockerfile.backend`
4. `docker-compose.yml` spins up all services
5. Traefik routes traffic and issues SSL certificates automatically

### **Environment Variables (set in Dokploy)**
- `SECRET_KEY`
- `DATABASE_URL`
- `ALLOWED_HOSTS`
- `CORS_ALLOWED_ORIGINS`
- `CSRF_TRUSTED_ORIGINS`
- `DEBUG=False`

---

## 📊 MVP Success Metrics

### **Technical Metrics**
- ✅ All API endpoints functional
- ✅ Frontend builds without errors
- ✅ Backend passes all migrations
- ✅ Authentication flow works end-to-end
- ✅ CRUD operations for all entities
- ✅ Responsive on mobile, tablet, desktop

### **Feature Completeness**
- ✅ User registration and login
- ✅ Product browsing with filters
- ✅ Shopping cart functionality
- ✅ Checkout and order creation
- ✅ Verified buyer review system
- ✅ Seller dashboard with analytics
- ✅ Admin dashboard with user management
- ✅ Role-based access control

### **User Experience**
- ✅ Clean, modern UI design
- ✅ Intuitive navigation
- ✅ Fast page loads (< 2s)
- ✅ Mobile-friendly interface
- ✅ Clear error messages
- ✅ Smooth animations and transitions

---

## 🔮 Future Enhancements (Post-MVP)

### **Phase 2 Features**
- [ ] Real payment integration (Stripe/PayPal)
- [ ] Email notifications (order confirmations, shipping updates)
- [ ] Advanced search with Elasticsearch
- [ ] Wishlist functionality
- [ ] Product recommendations (AI-powered)
- [ ] Live chat support
- [ ] Multi-language support (i18n)
- [ ] Dark mode toggle

### **Phase 3 Features**
- [ ] Mobile app (React Native)
- [ ] Seller verification system
- [ ] Product comparison tool
- [ ] Advanced analytics dashboard
- [ ] Inventory forecasting
- [ ] Automated marketing campaigns
- [ ] Social media integration
- [ ] Progressive Web App (PWA)

---

## 🤝 Contributing

This is an academic project for IT495 Senior Seminar. Contributions are welcome for educational purposes.

---

## 📄 License

This project is created for academic purposes as part of a senior capstone project.

---

## 👥 Team

- **Abdul Choudhary** - Project Manager
- **Aqveena Manoj** - Backend Developer
- **Vrushika Gajjar** - Designer
- **Abdul Munshi** - Security & Network
- **Devam Trivedi** - Full Stack Developer & DevOps

## 📞 Support

For questions or issues:
- Email: smartshop@example.com
- GitHub Issues: https://github.com/Devamstark/MM6/issues

---

**Last Updated**: February 2026
**Version**: 1.2.0 (VPS Deployment)
