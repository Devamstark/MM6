# Migration Plan: Supabase to Django/PostgreSQL

This document outlines the step-by-step transformation of the CloudMart project from a Supabase-backed application to a Python/Django architecture, as required by the Senior Capstone Proposal.

## Phase 1: Frontend Restructuring (React)

The frontend needs to be decoupled from Supabase libraries and pointed to a standard REST API.

1.  **Remove Dependencies**: Uninstall `@supabase/supabase-js`.
2.  **Add Dependencies**: Install `axios` for HTTP requests.
3.  **Delete Files**: Remove `services/supabaseClient.ts`.
4.  **Refactor `services/api.ts`**:
    *   Replace `supabase.auth.signInWithPassword` -> `POST /api/token/`
    *   Replace `supabase.from('products').select(...)` -> `GET /api/products/`
    *   Replace `supabase.from('orders').insert(...)` -> `POST /api/orders/`
    *   Implement Axios interceptors to attach the JWT token (Authorization: Bearer <token>) to every request.

## Phase 2: Backend Implementation (Django + DRF)

A new `backend/` directory will be created to host the Django project.

### 1. Data Models (`backend/api/models.py`)
Recreate the Supabase schema using Django ORM.
*   **User**: Use custom `User` model inheriting from `AbstractUser`. Add `role` field.
*   **Product**: Fields: `name`, `description`, `price`, `category`, `brand`, `stock_quantity`, `image_url`, `is_featured`, `is_popular`.
*   **Order**: Fields: `user` (FK), `total_amount`, `status`, `created_at`.
*   **OrderItem**: Fields: `order` (FK), `product` (FK), `quantity`, `price_at_purchase`.
*   **Payment**: Fields: `order` (FK), `user` (FK), `amount`, `status`, `payment_method`.

### 2. Serializers (`backend/api/serializers.py`)
Convert Django models to JSON for the React frontend.
*   `UserSerializer`, `ProductSerializer`, `OrderSerializer`, `OrderItemSerializer`.

### 3. Views & Business Logic (`backend/api/views.py`)
Implement the API endpoints using generic ViewSets.
*   `ProductViewSet`: Support filtering by category, price, brand (using `django-filter`).
*   `OrderViewSet`: Handle order creation (transactional) and listing.
*   `UserViewSet`: For admin user management.
*   **Auth Views**: Use `TokenObtainPairView` from `simplejwt` for login.

### 4. Routing (`backend/api/urls.py`)
Map URLs to Views.
*   `/api/products/`
*   `/api/orders/`
*   `/api/auth/login/`
*   `/api/auth/register/`

## Phase 3: Configuration & Deployment

1.  **Environment Variables**:
    *   Frontend `.env`: `VITE_API_URL=http://localhost:8000/api` (dev) / `https://your-render-app.onrender.com/api` (prod).
    *   Backend `.env`: `DATABASE_URL`, `SECRET_KEY`, `ALLOWED_HOSTS`.
2.  **Deployment Config**:
    *   `render.yaml` or `build.sh` for deploying the Python backend.
    *   `vercel.json` for the frontend to handle SPA routing.

---

## Authorization & Security Strategy (Changes)

| Feature | Supabase Approach | Django Approach |
| :--- | :--- | :--- |
| **Login** | Client calls Supabase Auth API | Client POSTs to `/api/token/` (JWT) |
| **Permissions** | Row Level Security (RLS) in DB | Django Permissions (`IsAuthenticated`, `IsAdminUser`) in Views |
| **Data Access** | Client queries DB directly | Client calls REST API; Backend queries DB |
| **Session** | Session managed by Supabase client | Access Token (short-lived) + Refresh Token |

