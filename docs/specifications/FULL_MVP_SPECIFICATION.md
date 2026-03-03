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
- **Caching & Brokers**: Redis 7.x (High-performance L3 Cache for API/Sessions and Celery Broker)
- **Background Tasks**: Celery & Celery-Beat (Async task processing, scheduled jobs, emails)
- **Database ORM**: Django ORM
- **File Storage**: Local Docker volume (`backend_media`)
- **CORS**: django-cors-headers
- **Static Files**: WhiteNoise (Production static serving)
- **Deployment**: Docker + Gunicorn (5 Workers) + Celery Workers

### **Database**
- **Development**: SQLite3 (Local testing)
- **Production**: PostgreSQL 15 (Docker, persistent named volume)

### **DevOps & Tools**
- **Version Control**: Git
- **Package Managers**: npm (frontend), pip (backend)
- **Environment Variables**: python-dotenv + Dokploy env manager
- **Edge Optimization**: Cloudflare (CDN, DDoS, Edge Caching, Brotli)
- **Orchestrator**: Dokploy (self-hosted)
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Traefik (auto SSL via Let's Encrypt)
- **Backup Storage**: MinIO (self-hosted S3)
- **Telegram Bot API**: Python Telegram Bot (Webhook-based async processing)
- **AI Engine**: GPT-4 based intent parsing for AI Concierge
- **E2E Testing**: Playwright (Automated flows and reporting)

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
  - **Blogger**: Create and manage fashion-related blog content
  - **Admin**: Full platform control, user management, content moderation, dynamic CMS
- **GDPR Protection**: Self-deletion and data export (SAR) for all users

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
  2. Enter shipping address (detailed address management)
  3. Select payment method (Secure Stripe Card Payment)
  4. Order confirmation & Background email notification

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
- Handle cancellations with automatic restocking and referral earnings refunds
- Real-time revenue analytics update (excludes cancelled orders)

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
- **Platform Overview**: Today's revenue, yesterday close, MTD growth, total lifetime earnings, plus quick stats (total orders, pending, inventory, low stock, delivered)
- **User Management**: View all users, change user roles, deactivate accounts
- **Product Moderation**: Approve/reject new products, feature products, bulk delete
- **Content Management (CMS)**: Edit homepage content, manage static pages (About, Terms, Privacy)
- **Order Management**: View and manage all orders across all sellers
- **Staff Management**: Admin staff oversight and permissions
- **Analytics**: Advanced sales charts, revenue breakdowns, order trends

> **Note**: Coupon management has been moved to the **Marketing tab** (Section 13) for a more cohesive marketing workflow.

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

### **11. Fashion Blogger System** ✍️

#### Features:
- **Public Blog Feed**: Magazine-style layout for trend reports and style guides
- **Blogger Dashboard**: Dedicated workflow for content creators
- **Full-Screen Editor**: Specialized UI for writing and formatting articles
- **Content Moderation**: Admin oversight of all blog content
- **Engagement Stats**: View counts and reading time metrics for all posts

#### Technical Implementation:
- **Backend Models**: `BlogPost` with UUID, slug auto-generation, and author relationships
- **Frontend Components**: `Blog`, `BloggerDashboard`
- **Endpoints**:
  - `GET /api/blog/` (Public feed)
  - `GET /api/blog/{slug}/` (Post details & view increment)
  - `POST /api/blog/` (Create - Blogger/Admin only)
  - `PATCH /api/blog/{slug}/publish/` (Toggle visibility)

---

### **12. GDPR & Privacy** 🔒

#### Features:
- **Right to Access**: Users can download a full copy of their personal data (Profile, Orders, Addresses, Reviews) in JSON format.
- **Right to Erasure**: Users can permanently delete their own account and all associated personal data ("Right to be Forgotten").
- **Transparency**: Dedicated Static Pages for Comprehensive Privacy Policy and Terms of Service.
- **Data Security**: Hashed passwords, HTTPS encryption, and private SMTP infrastructure for communication.

#### Technical Implementation:
- **Backend**: `export_data` and `delete_self` actions in `UserViewSet`.
- **Frontend**: Privacy controls in `UserProfile` > `Security` tab.
- **Documentation**: `GDPR_COMPLIANCE.md` and updated `Privacy Policy` static page.
- **Endpoints**:
  - `GET /api/users/export_data/` (Download data)
  - `DELETE /api/users/delete_self/` (Account erasure)

---

### **17. 🛡️ Enterprise Security Hub** 🛡️

#### Features:
- **SOC2-Compliant Audit Logging**: Centralized, immutable security logs for all critical system events (logins, registrations, role changes).
- **Security Hub Dashboard**: Professional administrative interface for monitoring platform-wide security signals.
- **Blocked IPs & Shields**: Real-time management of automated blocks triggered by the defensive shield.
- **One-Click Unblock**: Administrative capability to lift IP or Username lockouts instantly.
- **IP Anomaly Detection**: Automatic tracking of user IP history to detect and log logins from unrecognized locations.

#### Technical Implementation:
- **Backend Model**: `AuditLog` with strict append-only constraints.
- **Service Layer**: Centralized `log_audit_event` for consistent recording across the API.
- **Defense**: `django-axes` integration for brute-force protection and IP-based lockout state.

---

### **13. Enterprise Marketing System** 📧

#### Features:
- **Campaign Management**: Create, edit, duplicate, and delete marketing campaigns with 6 statuses (Draft, Scheduled, Sending, Sent, Paused, Failed).
- **5 Campaign Types**: Promotional, Abandoned Cart, Re-engagement, First Purchase Thank You, Post-purchase Upsell.
- **Advanced Audience Targeting**: All users, ordered at least once, never ordered, recent signups (last X days), abandoned cart, manual selection.
- **Enterprise Email Sending**: Batch processing (configurable, default 200/batch) via Celery + Redis with per-email delivery logging.
- **Auto-Retry**: Failed emails automatically retry up to 3 times.
- **Delivery Logging**: Each email tracked individually (pending, sent, failed, opened, clicked) with error messages.
- **Analytics Dashboard**: Total campaigns, emails sent, delivery rate, open rate, click rate, status/type breakdowns.
- **Conversion Analytics**: Per-campaign revenue, click-through, and conversion tracking modal.
- **Campaign Calendar View**: Visual calendar showing scheduled and sent campaigns by date.
- **Custom Calendar Date-Time Picker**: Fully custom date-time scheduler replacing native `datetime-local` input — includes monthly calendar navigation, past-date disabling, manual hour/minute selection, and a confirmation banner.
- **Email confirmation**: (Background Celery task with itemized summary & shipping info)
- **Email Template Builder**: Visual drag-and-drop style template builder with live HTML preview that auto-populates the email body field.
- **Audience Preview**: Live preview of recipient count before sending.
- **Campaign Actions**: Send Now, Schedule Later, Pause, Resume, Duplicate.
- **Coupon Management** *(moved from Admin Dashboard)*: Create, activate/deactivate, and delete promo codes — now fully integrated within the Marketing tab as the "Coupons" view for a unified marketing workflow.
- **Marketing Command Center**: Dedicated Marketing Dashboard page (`/marketing`) with enterprise-grade quick stats panel (Subscribers, Emails Sent, Avg Open Rate, Avg Click Rate, Active Coupons, Total Revenue).
- **GDPR Compliance**: Unsubscribe footer automatically appended to every marketing email.
- **Security**: Only users with `role='user'` receive emails; Admin and Seller accounts are always excluded.

#### Technical Implementation:
- **Backend Models**: `MarketingCampaign`, `CampaignRecipient`, `EmailDeliveryLog` with DB indexes on `campaign_id`, `user_id`, `status`.
- **Celery Tasks**: `send_marketing_campaign` (orchestrator), `_send_batch` (per-batch worker), `_resolve_audience` (audience segmentation).
- **Frontend**: Enterprise MarketingTab component with SaaS-grade UI, Analytics view, Delivery Logs modal.
- **Endpoints**:
  - `GET /api/marketing-campaigns/` (List, filter by status/type)
  - `POST /api/marketing-campaigns/` (Create)
  - `PATCH /api/marketing-campaigns/{id}/` (Update)
  - `DELETE /api/marketing-campaigns/{id}/` (Delete)
  - `POST /api/marketing-campaigns/{id}/send/` (Send or schedule)
  - `POST /api/marketing-campaigns/{id}/pause/` (Pause)
  - `POST /api/marketing-campaigns/{id}/resume/` (Resume)
  - `POST /api/marketing-campaigns/{id}/duplicate/` (Duplicate)
  - `GET /api/marketing-campaigns/{id}/logs/` (Delivery logs)
  - `GET /api/marketing-campaigns/analytics/` (Dashboard analytics)
  - `GET /api/marketing-campaigns/audience-preview/` (Audience preview)
  - `GET /api/marketing-campaigns/users-list/` (Users for manual selection)

---

### **14. Observability & Notifications** 🔭

#### Features:
- **Full-Stack Health & Monitoring**: Dedicated `/api/health/` JSON endpoint executing live PostgreSQL and Redis connection tests.
- **CheckCle Integration**: UI monitoring dashboard deployed independently at `status.smartshop1.us`.
- **Actionable Slack Webhooks**: Instant Celery-powered Slack alerts upon successful order completions.
- **Brute-Force Shield**: `django-axes` automatically tracks failed logins, locks out IP addresses after 5 strikes, introduces a 1.2s PBKDF2 hash delay to throttle supercomputers, and instantly fires a high-priority Slack alert.

#### Technical Implementation:
- **Backend Model**: `@receiver(user_locked_out)` hooking into `notify_slack_security_alert`.
- **Celery Tasks**: `notify_slack_new_order`, `notify_slack_security_alert`.
- **Infrastructure**: Traefik labels configured for DNS-only Let's Encrypt SSL generation on the CheckCle container.

---

### **15. Privacy & Database Optimizations** ⚡

#### Features:
- **Email Privacy**: Mass emails utilize `bcc` headers to strictly veil all customer PII.
- **Query Elimination**: Composite B-Tree indexes constructed across User, Product, and MarketingCampaign tables to permanently eradicate full-table scan bottlenecks.
- **Log Pruning**: Asynchronous `django-celery-beat` background task configured to permanently delete outdated tracking logs after 6 months.

#### Technical Implementation:
- **Backend Models**: Extended `Index` Meta classes within `models.py`.
- **Celery**: Configured `prune_old_logs` task mapped to a monthly periodic execution cycle.

### **16. 🤖 Telegram AI Concierge & Mini App** 🤖

#### Features:
- **Telegram Mini App (TMA)**: A native-feeling store experience launched directly from the Telegram bot.
- **AI Concierge Assistant**: Intent-based AI that handles tracking requests, return policy questions, and contact info.
- **Inline Query Search**: Global product search via `@bot_name` in any chat, displaying cards with prices and links.
- **Push Notifications**: Proactive order status alerts (Shipped/Delivered) sent to the user's Telegram.
- **Command Menu**: `/start` for onboarding, `/help` for support, and `/mini_app` for shopping.

#### Technical Implementation:
- **Backend**: Async Django webhook view in `api/telegram_bot.py` with HMAC signature verification (optional, uses bot token).
- **AI Engine**: Intent classification logic in `AIConcierge` class before falling back to product search.
- **Frontend**: React site detects Telegram WebApp context via `@telegram-apps/sdk` or window object.
- **Endpoints**:
  - `POST /api/telegram-webhook/` (Primary event handler)
  - `POST /api/ai-concierge/` (Direct AI chat endpoint)

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
├── deployment/DEPLOYMENT_GUIDE.md
└── specifications/FULL_MVP_SPECIFICATION.md (this file)
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

### **Security & Compliance**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/audit-logs/` | List security audit logs | Security Admin |
| GET | `/api/audit-logs/summary/` | Dashboard stats (counts, trends) | Security Admin |
| GET | `/api/blocked-ips/` | List active IP blocks (Axes) | Security Admin |
| POST | `/api/blocked-ips/unblock/` | Restore access to IP or User | Security Admin |

### **Telegram & AI**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/telegram-webhook/` | Main bot event handler | No (Secret token) |
| POST | `/api/ai-concierge/` | Direct AI query endpoint | No/Yes |
| GET | `/api/products/inline_search/` | Internal bot search | No |

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

### **Blog**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/blog/` | List published blog posts | No |
| GET | `/api/blog/{slug}/` | Get blog post details | No |
| POST | `/api/blog/` | Create blog post | Blogger/Admin |
| PUT | `/api/blog/{id}/` | Update blog post | Owner/Admin |
| PATCH | `/api/blog/{id}/publish/` | Toggle publish status | Owner/Admin |
| DELETE | `/api/blog/{id}/` | Delete blog post | Owner/Admin |

### **Marketing Campaigns**
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/marketing-campaigns/` | List campaigns (filterable) | Admin |
| POST | `/api/marketing-campaigns/` | Create campaign | Admin |
| PATCH | `/api/marketing-campaigns/{id}/` | Update campaign | Admin |
| DELETE | `/api/marketing-campaigns/{id}/` | Delete campaign | Admin |
| POST | `/api/marketing-campaigns/{id}/send/` | Send or schedule | Admin |
| POST | `/api/marketing-campaigns/{id}/pause/` | Pause campaign | Admin |
| POST | `/api/marketing-campaigns/{id}/resume/` | Resume campaign | Admin |
| POST | `/api/marketing-campaigns/{id}/duplicate/` | Duplicate campaign | Admin |
| GET | `/api/marketing-campaigns/{id}/logs/` | Delivery logs | Admin |
| GET | `/api/marketing-campaigns/analytics/` | Dashboard analytics | Admin |
| GET | `/api/marketing-campaigns/audience-preview/` | Preview audience | Admin |
| GET | `/api/marketing-campaigns/users-list/` | Users for selection | Admin |

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

> The application is live on a self-hosted VPS. See **[deployment/VPS_DEPLOYMENT_GUIDE.md](../deployment/VPS_DEPLOYMENT_GUIDE.md)** for full details.

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
- [x] Real payment integration (Stripe/PayPal)
- [x] Email notifications (Order confirmations, password reset, newsletters handled asynchronously via Celery)
- [ ] Advanced search with Elasticsearch
- [x] Wishlist functionality (Full toggle support and dedicated view)
- [ ] Product recommendations (AI-powered)
- [ ] Live chat support
- [ ] Multi-language support (i18n)
- [ ] Dark mode toggle

### **Phase 3 Features**
- [x] Telegram Bot & Mini App Integration — ✅ Done (v3.1.0)
- [x] AI Support Assistant — ✅ Done (Intent-based)
- [x] Enterprise Security Hub — ✅ Done (v3.2.0)
- [ ] Mobile app (React Native)
- [ ] Seller verification system
- [ ] Product comparison tool
- [ ] Advanced analytics dashboard
- [ ] Inventory forecasting
- [x] Automated marketing campaigns
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
- Email: [support@smartshop1.us]
- GitHub Issues: https://github.com/Devamstark/MM6/issues

---

### **8. Wishlist & Shopping Tools** 💖

#### Features:
- **Save for Later**: Heart toggle on all product cards and detail pages
- **Wishlist Dashboard**: Aggregated view of all saved items
- **Add to Cart from Wishlist**: Direct conversion from saved items
- **Guest Protection**: Persistence requires authenticated state

#### Technical Implementation:
- **Backend Model**: `Wishlist` with unique user-product constraint
- **Endpoints**: `POST /api/wishlist/toggle/`

---

### **9. Referral & Loyalty System** 🎁

#### Features:
- **Unique Referral Links**: Every user gets a shareable link and code
- **Signup Bonus**: Instant $1.00 credit for referrers per new valid signup
- **Order Redemption**: Apply earnings as real cash discounts during checkout
- **Redemption Logic**: Locked until a $10.00 minimum balance is reached
- **Cancellation Refunds**: Automatic restoration of applied earnings if an order is cancelled

#### Technical Implementation:
- **Backend**: Referral bonus logic inside `RegisterView` (auth system)
- **Frontend**: `Affiliate.tsx` dashboard for tracking metrics

---

### **10. Dynamic Homepage CMS (Admin-Only)** ⚡

#### Features:
- **Hero Banner Management**: Visual editor for homepage slides (titles, buttons, images)
- **Positioning**: Focal point control (Top/Center/Bottom) and Image Fit (Cover/Contain)
- **Flexible Home Sections**: Reorderable rows (Featured, Promos, Categories)
- **Active Toggles**: Instant show/hide control from Dashboard

#### Technical Implementation:
- **Backend**: `HeroBanner` and `HomePageSection` models
- **Frontend**: CMS Sub-tabs in Admin Dashboard

---

### **11. GDPR & Privacy Compliance** 🛡️

#### Features:
- **Data Portability (SAR)**: Download full JSON profile, orders, and reviews
- **Right to Erasure**: Permanent self-deletion of account and PII
- **Transparency**: Clear opt-out for marketing emails

#### Technical Implementation:
- **Backend Actions**: `export_data` and `delete_self` on `UserViewSet`

---

### **12. Enterprise Operations & Scale** 🏢

#### Features:
- **Relational Architecture**: Structured `ProductVariant` and `ProductImage` relations to exactly track stock and images down to size and color.
- **Resilient Shopping Carts**: Database-backed carts maintaining session state across all devices.
- **Inventory Reservations**: 10-minute cart locking period preventing overselling during checkout.
- **Atomic Database Locks**: Backend SQL decrements for absolute accuracy during high-concurrency peak sales.
- **Client Resilience**: API Interceptor "Circuit Breaker" to prevent crashes from analytics/slow endpoints, plus `axios-retry` logic for unreliable networks.
- **Granular Seller Analytics**: Real-time sales by region, cart-abandonment analysis, and inventory health tracking.
- **Background Upload Processing**: Asynchronous Celery + Redis workers processing massive CSV catalogs without blocking the seller.
- **Automated Lifecycle Marketing**: 4-hour abandoned cart reminders and 48-hour automated 10% discount codes generated dynamically.
- **Consumable Subscriptions**: 30-day recurring automated order engine supporting consumer "Subscribe and Save" workflows via Stripe.
- **Dynamic Fulfillment & Tax**: Stripe Native API taxation setup and backend shipping rate stubs for ShipStation/EasyPost APIs.

#### Technical Implementation:
- **Task Broker**: Redis & Django Celery/Celery Beat
- **Models**: `Cart`, `StockReservation`, `Subscription`, `ProductVariant`
- **Frontend Interceptors**: Custom Axios plugins and Chart.js dashboards

---

**Project**: SmartShop E-Commerce Platform  
**Version**: 3.1.0 (Telegram Ecosystem & AI Concierge)  
**Last Updated**: March 2, 2026  
**Status**: ✅ Live in Production (v3.1.0 — Telegram Integrated)  
**URL**: [https://smartshop1.us](https://smartshop1.us)  
**Completion**: 100%
