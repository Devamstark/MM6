# 🏗️ SmartShop - System Architecture

## 📐 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Web Browser                            │   │
│  │  (Chrome, Firefox, Safari, Edge)                         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              ↕                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              React Frontend (SPA)                        │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐        │   │
│  │  │   Pages    │  │ Components │  │ Jotai Store│        │   │
│  │  │  (Routes)  │  │    (UI)    │  │  (Atoms)   │        │   │
│  │  └────────────┘  └────────────┘  └────────────┘        │   │
│  │                                                          │   │
│  │  ┌────────────────────────────────────────────┐        │   │
│  │  │         Services Layer (API Client)        │        │   │
│  │  │              Axios + JWT                    │        │   │
│  │  └────────────────────────────────────────────┘        │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↕ HTTPS
┌─────────────────────────────────────────────────────────────────┐
│                         SERVER LAYER                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │           Django REST Framework (API)                    │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐        │   │
│  │  │  ViewSets  │  │Serializers │  │Permissions │        │   │
│  │  │  (Logic)   │  │(Validation)│  │   (RBAC)   │        │   │
│  │  └────────────┘  └────────────┘  └────────────┘        │   │
│  │                                                          │   │
│  │  ┌────────────────────────────────────────────┐        │   │
│  │  │         Django ORM (Data Layer)            │        │   │
│  │  └────────────────────────────────────────────┘        │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              ↕ SQL
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              PostgreSQL Database                         │   │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐           │   │
│  │  │ Users  │ │Products│ │ Orders │ │Reviews │           │   │
│  │  └────────┘ └────────┘ └────────┘ └────────┘           │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
│  ┌──────────────┐  ┌──────────────┐                            │
│  │    VPS       │  │   Cloudinary  │                            │
│  │ (Full Stack) │  │    (Images)   │                            │
│  └──────────────┘  └──────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Request Flow Diagram

### User Authentication Flow
```
┌──────┐                ┌──────────┐              ┌──────────┐
│Client│                │ Frontend │              │ Backend  │
└──┬───┘                └────┬─────┘              └────┬─────┘
   │                         │                         │
   │  1. Enter credentials   │                         │
   ├────────────────────────>│                         │
   │                         │  2. POST /api/auth/login/
   │                         ├────────────────────────>│
   │                         │                         │
   │                         │  3. Validate credentials│
   │                         │     & Generate JWT      │
   │                         │<────────────────────────┤
   │                         │                         │
   │  4. Store JWT in        │                         │
   │     localStorage        │                         │
   │<────────────────────────┤                         │
   │                         │                         │
   │  5. Redirect to         │                         │
   │     Dashboard           │                         │
   │<────────────────────────┤                         │
   │                         │                         │
```

### Product Purchase Flow
```
┌──────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│Client│     │ Frontend │     │ Backend  │     │ Database │
└──┬───┘     └────┬─────┘     └────┬─────┘     └────┬─────┘
   │              │                 │                │
   │ 1. Browse    │                 │                │
   ├─────────────>│                 │                │
   │              │ 2. GET /api/products/            │
   │              ├────────────────>│                │
   │              │                 │ 3. Query       │
   │              │                 ├───────────────>│
   │              │                 │<───────────────┤
   │              │<────────────────┤                │
   │<─────────────┤                 │                │
   │              │                 │                │
   │ 4. Add to    │                 │                │
   │    Cart      │                 │                │
   ├─────────────>│ 5. Store in     │                │
   │              │    Atom (Jotai) │                │
   │              │                 │                │
   │ 6. Checkout  │                 │                │
   ├─────────────>│ 7. POST /api/orders/             │
   │              ├────────────────>│                │
   │              │                 │ 8. Create Order│
   │              │                 │    & Update    │
   │              │                 │    Stock       │
   │              │                 ├───────────────>│
   │              │                 │<───────────────┤
   │              │<────────────────┤                │
   │<─────────────┤                 │                │
   │              │                 │                │
```

---

## 🗄️ Database Schema

### Entity Relationship Diagram

```
┌─────────────────┐
│      User       │
├─────────────────┤
│ id (PK)         │
│ username        │
│ email           │
│ password        │
│ role            │◄──────────┐
│ bio             │           │
│ bonus_points    │           │
└─────────────────┘           │
        │                     │
        │ 1:N                 │ 1:N
        ▼                     │
┌─────────────────┐           │
│    Product      │           │
├─────────────────┤           │
│ id (PK)         │           │
│ seller_id (FK)  │───────────┘
│ name            │
│ description     │
│ price           │
│ stock_quantity  │
│ category        │
│ brand           │
│ image           │
│ sizes (JSON)    │
│ colors (JSON)   │
│ variants (JSON) │
│ discount_%      │
│ sale_price      │
└─────────────────┘
        │
        │ 1:N
        ▼
┌─────────────────┐
│     Review      │
├─────────────────┤
│ id (PK)         │
│ product_id (FK) │
│ user_id (FK)    │
│ rating          │
│ comment         │
│ created_at      │
└─────────────────┘

┌─────────────────┐
│      Order      │
├─────────────────┤
│ id (PK)         │
│ user_id (FK)    │───────┐
│ customer_name   │       │
│ total_amount    │       │
│ status          │       │
│ created_at      │       │
└─────────────────┘       │
        │                 │
        │ 1:N             │ N:1
        ▼                 │
┌─────────────────┐       │
│   OrderItem     │       │
├─────────────────┤       │
│ id (PK)         │       │
│ order_id (FK)   │       │
│ product_id (FK) │       │
│ quantity        │       │
│ price_at_purch. │       │
└─────────────────┘       │
                          │
                          │
┌─────────────────┐       │
│    Payment      │       │
├─────────────────┤       │
│ id (PK)         │       │
│ order_id (FK)   │───────┘
│ user_id (FK)    │
│ amount          │
│ status          │
│ payment_method  │
│ transaction_id  │
└─────────────────┘

┌─────────────────┐
│   Affiliate     │
├─────────────────┤
│ id (PK)         │
│ user_id (FK)    │
│ referral_code   │
│ earnings        │
│ clicks          │
└─────────────────┘

┌─────────────────┐
│  PageContent    │
├─────────────────┤
│ id (PK)         │
│ slug            │
│ title           │
│ content         │
│ updated_at      │
└─────────────────┘
```

---

## 🔐 Security Architecture

### Authentication Flow
```
┌─────────────────────────────────────────────────────────┐
│                  Security Layers                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Layer 1: HTTPS/TLS                                     │
│  ├─ All traffic encrypted in transit                    │
│  └─ SSL certificates (Vercel/Render automatic)          │
│                                                          │
│  Layer 2: CORS Protection                               │
│  ├─ Whitelist allowed origins                           │
│  └─ Prevent unauthorized cross-origin requests          │
│                                                          │
│  Layer 3: JWT Authentication                            │
│  ├─ Stateless token-based auth                          │
│  ├─ Token expiration (24 hours)                         │
│  └─ Refresh token mechanism                             │
│                                                          │
│  Layer 4: Role-Based Access Control (RBAC)              │
│  ├─ User roles: admin, seller, user                     │
│  ├─ Permission classes on API endpoints                 │
│  └─ Frontend route protection                           │
│                                                          │
│  Layer 5: Input Validation                              │
│  ├─ DRF serializer validation                           │
│  ├─ Frontend form validation                            │
│  └─ SQL injection prevention (ORM)                      │
│                                                          │
│  Layer 6: Password Security                             │
│  ├─ Django PBKDF2 hashing                               │
│  ├─ Password strength requirements                      │
│  └─ Secure password reset flow                          │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 Component Architecture

### Frontend Component Hierarchy

```
App.tsx
├── JotaiProvider
│   ├── AuthProvider
│   │   ├── Router
│   │   │   ├── Layout
│   │   │   │   ├── Header
│   │   │   │   │   ├── Logo
│   │   │   │   │   ├── Navigation
│   │   │   │   │   └── UserMenu (useAtom)
│   │   │   │   ├── Main (Outlet)
│   │   │   │   └── Footer
│   │   │   │
│   │   │   ├── Public Routes
│   │   │   │   ├── Home
│   │   │   │   │   ├── HeroSection
│   │   │   │   │   ├── FeaturedProducts
│   │   │   │   │   └── CategoryGrid
│   │   │   │   ├── Shop
│   │   │   │   │   ├── FilterSidebar
│   │   │   │   │   ├── ProductGrid
│   │   │   │   │   └── ProductCard
│   │   │   │   ├── ProductDetail
│   │   │   │   │   ├── ImageGallery
│   │   │   │   │   ├── ProductInfo
│   │   │   │   │   ├── VariantSelector
│   │   │   │   │   └── ReviewSection
│   │   │   │   ├── Login
│   │   │   │   └── Register
│   │   │   │
│   │   │   ├── Protected Routes (User)
│   │   │   │   ├── Cart (CartAtom)
│   │   │   │   │   └── CartItem
│   │   │   │   ├── Checkout
│   │   │   │   │   ├── ShippingForm
│   │   │   │   │   └── PaymentForm
│   │   │   │   └── OrderHistory
│   │   │   │       └── OrderCard
│   │   │   │
│   │   │   ├── Protected Routes (Seller)
│   │   │   │   ├── SellerDashboard
│   │   │   │   │   ├── StatsCards
│   │   │   │   │   ├── SalesChart
│   │   │   │   │   └── RecentOrders
│   │   │   │   └── ProductManagement
│   │   │   │       └── ProductForm
│   │   │   │
│   │   │   └── Protected Routes (Admin)
│   │   │       └── AdminDashboard
│   │   │           ├── PlatformStats
│   │   │           ├── UserManagement
│   │   │           ├── ProductModeration
│   │   │           └── ContentEditor
```

---

## 🔄 State Management

### Jotai Atoms (New)

We have migrated global state management to **Jotai** for better performance and atomic updates.

```
┌─────────────────────────────────────────────────────────┐
│                    Store (atoms.ts)                      │
├─────────────────────────────────────────────────────────┤
│  User State:                                             │
│  ├─ userAtom: User | null                               │
│  ├─ tokenAtom: string | null                            │
│                                                          │
│  Cart State:                                             │
│  ├─ cartAtom: CartItem[]                                │
│  ├─ cartCountAtom (derived): number                     │
│  ├─ cartTotalAtom (derived): number                     │
│                                                          │
│  UI State:                                               │
│  ├─ isCartOpenAtom: boolean                             │
│  ├─ isMobileMenuOpenAtom: boolean                       │
│  ├─ searchQueryAtom: string                             │
└─────────────────────────────────────────────────────────┘
```

### Context Architecture (Legacy/Wrappers)

Some contexts remain as wrappers or for specific logic not yet fully migrated, but core state is moving to atoms.

```
┌─────────────────────────────────────────────────────────┐
│                    AuthContext                           │
├─────────────────────────────────────────────────────────┤
│  State:                                                  │
│  ├─ user: User | null                                   │
│  ├─ isAuthenticated: boolean                            │
│                                                          │
│  Actions:                                                │
│  ├─ login(email, password)                              │
│  ├─ register(userData)                                  │
│  ├─ logout()                                            │
│  └─ updateUser(userData)                                │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Deployment Architecture

### Production Environment (Docker + Dokploy)

```
┌─────────────────────────────────────────────────────────────┐
│             PRODUCTION — HostAsia VPS (Ubuntu)               │
│                 Managed by Dokploy                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Traefik (Reverse Proxy)                    │ │
│  │         SSL via Let's Encrypt (Auto-renewed)           │ │
│  └───┬─────────────┬──────────────┬────────────┬──────────┘ │
│      │             │              │            │            │
│      ▼             ▼              ▼            ▼            │
│  ┌───────┐    ┌────────┐   ┌──────────┐  ┌────────┐       │
│  │ Nginx │    │Gunicorn│   │ Adminer  │  │ MinIO  │       │
│  │(React)│    │(Django)│   │(DB View) │  │ (S3)   │       │
│  └───────┘    └────┬───┘   └──────────┘  └────────┘       │
│                    │                                        │
│                    ▼                                        │
│             ┌────────────┐                                  │
│             │ PostgreSQL │                                  │
│             │  (Docker)  │                                  │
│             └────────────┘                                  │
│                                                              │
│  All services connected via: dokploy-network (Docker bridge) │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow Patterns

### Read Operation (GET)
```
User Action → Frontend Component → API Service → 
Backend ViewSet → Serializer → Database → 
Serializer → JSON Response → Jotai Atom Update → UI Update
```

### Write Operation (POST/PUT)
```
User Input → Form Validation → API Service → 
Backend ViewSet → Permission Check → Serializer Validation → 
Database Write → Success Response → Atom/Context Update → 
UI Feedback (Toast/Redirect)
```

### Error Handling
```
Error Occurs → Backend Exception → 
DRF Error Handler → JSON Error Response → 
Axios Interceptor → Error Context → 
UI Error Display (Toast/Alert)
```

---

## 🔧 Technology Integration Points

### Frontend ↔ Backend
- **Protocol**: REST API over HTTPS
- **Format**: JSON
- **Auth**: JWT Bearer Token in Authorization header
- **CORS**: Configured in Django settings

### Backend ↔ Database
- **ORM**: Django ORM
- **Connection**: psycopg2 (PostgreSQL driver)
- **Migrations**: Django migrations system
- **Pooling**: Database connection pooling

### Backend ↔ Storage
- **Media Files**: Stored in Docker named volume (`backend_media`)
- **Serving**: Django `serve` view at `/media/` endpoint
- **Backups**: MinIO S3-compatible storage via Dokploy

---

## 📈 Scalability Considerations

### Horizontal Scaling
```
┌─────────────────────────────────────────────────────────┐
│  Load Balancer (Render/Vercel automatic)                │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
   ┌────────┐   ┌────────┐   ┌────────┐
   │ Server │   │   2    │   │   3    │
   │   1    │   │ Server │   │ Server │
   └────────┘   └────────┘   └────────┘
        │            │            │
        └────────────┼────────────┘
                     ▼
              ┌────────────┐
              │  Database  │
              │   (Shared) │
              └────────────┘
```

### Caching Strategy (Future)
```
┌─────────────────────────────────────────────────────────┐
│                    Cache Layers                          │
├─────────────────────────────────────────────────────────┤
│  L1: Browser Cache (Static Assets)                      │
│  L2: CDN Cache (Vercel Edge, Cloudinary)                │
│  L3: Redis Cache (API Responses) [Future]               │
│  L4: Database Query Cache (PostgreSQL)                  │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Architecture Principles

### 1. **Separation of Concerns**
- Frontend handles UI/UX only
- Backend handles business logic and data
- Database handles persistence

### 2. **Stateless API**
- JWT tokens for authentication
- No server-side sessions
- Enables horizontal scaling

### 3. **RESTful Design**
- Resource-based URLs
- HTTP methods for CRUD
- Standard status codes

### 4. **Security First**
- HTTPS everywhere
- Input validation at all layers
- Principle of least privilege (RBAC)

### 5. **Performance Optimized**
- CDN for static assets
- Database indexing
- Lazy loading on frontend
- Pagination for large datasets

---

**Last Updated**: February 2026
**Version**: 1.2.0

---

## 🌐 Network Architecture

### Full Network Diagram (Production)

```
                    ┌─────────────────┐
                    │    Internet     │
                    │  (HTTPS only)   │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   DNS Records   │
                    │  smartshop1.us  │
                    │  → VPS IP       │
                    └────────┬────────┘
                             │
                    ┌────────▼────────────────────────────────┐
                    │        Traefik (port 80 / 443)           │
                    │   Reverse Proxy + SSL Termination        │
                    │   Certificates: Let's Encrypt (auto)     │
                    └──┬──────┬────────┬──────────┬───────────┘
                       │      │        │          │
          ┌────────────▼┐  ┌──▼──────┐ │  ┌───────▼──────┐
          │  Frontend   │  │ Backend │ │  │   Adminer    │
          │  (Nginx)    │  │(Gunicorn│ │  │  (DB Browser)│
          │ port 80     │  │ port8000│ │  │  port 8080   │
          │             │  │         │ │  └──────────────┘
          │ smartshop   │  │api.smart│ │
          │ 1.us        │  │shop1.us │ │  ┌───────▼──────┐
          └─────────────┘  └────┬────┘ │  │    MinIO     │
                                │      │  │  Console UI  │
                         ┌──────▼────┐ └─►│  + S3 API    │
                         │PostgreSQL │    │  port 9000/  │
                         │  port5432 │    │  9001        │
                         │(internal) │    └──────────────┘
                         └───────────┘

  FileBrowser (internal, IP:port only — not via Traefik)
     Mounted directly to backend_media Docker volume
```

### Docker Network

```
┌─────────────────────────────────────────────────┐
│           dokploy-network (bridge)               │
│                                                  │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│   │ frontend │  │ backend  │  │    db    │     │
│   └──────────┘  └──────────┘  └──────────┘     │
│                                                  │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│   │ adminer  │  │  minio   │  │ traefik  │     │
│   └──────────┘  └──────────┘  └──────────┘     │
│                                                  │
│  All containers talk to each other by service    │
│  name (e.g. backend → db:5432)                  │
│  External access only via Traefik on 80/443      │
└─────────────────────────────────────────────────┘
```

### Docker Volumes (Persistent Storage)

```
┌─────────────────────────────────────────────────┐
│              Docker Named Volumes                │
├──────────────────┬──────────────────────────────┤
│ postgres_data    │ PostgreSQL database files      │
│ backend_static   │ Django admin CSS/JS files      │
│ backend_media    │ Uploaded product images        │
│ frontend_build   │ React production build         │
│ minio_data       │ MinIO backup storage           │
└──────────────────┴──────────────────────────────┘
```

### Traffic Flow (HTTPS Request)

```
Browser → DNS resolve smartshop1.us → VPS IP
       → Traefik (port 443, SSL terminate)
       → Docker internal HTTP to Nginx container
       → Nginx serves React index.html
       → React loads, calls api.smartshop1.us/api/...
       → Traefik routes to backend container
       → Gunicorn → Django processes request
       → Returns JSON response
       → React renders UI
```
