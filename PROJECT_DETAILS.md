# CloudMart E-Commerce Project Details

## 🎯 Minimum Viable Product (MVP) Overview

The CloudMart MVP is a fully functional e-commerce platform that allows users to browse products, manage a shopping cart, and simulate checkout. It also includes dedicated portals for Sellers to manage their inventory and Admins to oversee the platform.

### Core Value Proposition
- **For Shoppers:** A seamless shopping experience with product filtering, cart management, and order history.
- **For Sellers:** A dashboard to list and manage products and view sales statistics.
- **For Admins:** Full control over users, products, and platform analytics.

---

## ✅ Current Working Features

### 1. User Authentication & Authorization
- **Sign Up / Login:** Secure authentication using Supabase Auth.
- **Role-Based Access Control (RBAC):**
  - **User:** Can browse and buy.
  - **Seller:** Can access the Seller Dashboard.
  - **Admin:** Can access the Admin Dashboard.
- **Persisted Session:** Users stay logged in across page reloads.

### 2. Product Browsing & Discovery
- **Product Listing:** Dynamic grid view of all available products.
- **Advanced Filtering:** Filter by Category, Price Range, and Brand.
- **Sorting:** Sort options for Price (Low/High) and Newest Arrivals.
- **Search:** Real-time text search for product names.

### 3. Shopping Cart & Checkout
- **Cart Management:** Add, remove, and update quantities of items.
- **Cart Summary:** Real-time calculation of totals including tax and shipping.
- **Checkout Process:** A simulated checkout flow (address input -> payment simulation -> order creation).

### 4. Dashboards

#### 🛍️ User Dashboard
- View order history.
- Manage profile details.

#### 💼 Seller Dashboard
- **Product Management:** Add, Edit, and Delete products.
- **Sales Analytics:** View Total Revenue, Units Sold, and Growth trends.
- **Order Management:** View orders relevant to their products.

#### 🛡️ Admin Dashboard
- **Platform Overview:** High-level metrics (Total Users, Total Orders, Revenue).
- **User Management:** View and manage all registered users.
- **Global Inventory:** Access to modify or remove any product on the platform.

### 5. Backend & Database (Supabase)
- **Real-time Database:** PostgreSQL hosted on Supabase.
- **Security:** Row Level Security (RLS) policies ensuring users only access their own data.
- **Storage:** Image URL handling for product assets.

---

## 🚀 Future Enhancements (Roadmap)

To take CloudMart to the next level, the following features are planned for V2:

### 1. Payment Gateway Integration
- **Stripe / PayPal:** Replace the simulated checkout with real payment processing.
- **Webhooks:** Listen for successful payment events to automatically update order status.

### 2. Real-Time Features
- **Live Inventory:** Real-time stock updates using Supabase Realtime so users can't buy out-of-stock items.
- **Notifications:** Push notifications for Order Shipped or Delivered status.

### 3. Social Features
- **Reviews & Ratings:** Allow verified buyers to leave 1-5 star reviews on products.
- **Wishlist:** Save products for later without adding them to the cart.

### 4. Advanced Analytics
- **Data Visualization:** Interactive charts for Sellers showing daily/monthly sales trends.
- **Export Data:** Ability to export order history to CSV/PDF.

### 5. UI/UX Improvements
- **Dark Mode:** System-wide dark theme preference.
- **Mobile App:** Convert the PWA (Progressive Web App) into a native mobile experience.
