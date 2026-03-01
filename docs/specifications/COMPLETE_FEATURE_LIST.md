# 🎯 SmartShop MVP - Complete Feature List

## 📋 Table of Contents
1. [User Roles](#user-roles)
2. [Authentication Features](#authentication-features)
3. [Product Features](#product-features)
4. [Shopping Features](#shopping-features)
5. [Order Management](#order-management)
6. [Review System](#review-system)
7. [Seller Features](#seller-features)
8. [Admin Features](#admin-features)
9. [UI/UX Features](#uiux-features)

---

## 👥 User Roles

### 1. **Guest User** (Not Logged In)
**Capabilities:**
- ✅ Browse all products
- ✅ Search and filter products
- ✅ View product details
- ✅ Read product reviews
- ✅ Add items to cart (stored in localStorage)
- ✅ Register for an account
- ✅ Login to existing account
- ❌ Cannot checkout
- ❌ Cannot write reviews
- ❌ Cannot access dashboards

### 2. **Registered User/Buyer**
**Capabilities:**
- ✅ All guest capabilities
- ✅ Complete checkout and place orders
- ✅ View order history
- ✅ Track order status
- ✅ Write reviews for purchased products
- ✅ Edit/delete own reviews
- ✅ Update profile information
- ✅ View bonus points
- ❌ Cannot create products
- ❌ Cannot access seller/admin dashboards

### 3. **Seller**
**Capabilities:**
- ✅ All buyer capabilities
- ✅ Create new products
- ✅ Edit own products
- ✅ Delete own products
- ✅ Upload product images
- ✅ Set product variants (sizes, colors)
- ✅ Manage inventory/stock
- ✅ View sales analytics
- ✅ Access seller dashboard
- ✅ View orders containing their products
- ✅ Update order status (mark as shipped)
- ❌ Cannot manage other sellers' products
- ❌ Cannot access admin dashboard

### 4. **Admin**
**Capabilities:**
- ✅ All seller capabilities
- ✅ Manage all products (any seller)
- ✅ Manage all users
- ✅ Change user roles
- ✅ Deactivate user accounts
- ✅ View platform statistics
- ✅ Manage all orders
- ✅ Edit site content (About, Terms, etc.)
- ✅ Feature/unfeature products
- ✅ Access admin dashboard
- ✅ Full platform control

### 5. **Blogger**
**Capabilities:**
- ✅ Browse all public content
- ✅ Create, edit, and delete own blog posts
- ✅ Upload cover images for blog posts
- ✅ Manage post status (Draft vs. Published)
- ✅ Feature own posts (subject to admin override)
- ✅ Access blogger dashboard
- ❌ Cannot manage other bloggers' posts
- ❌ Cannot access seller or admin dashboards (unless also an admin)

---

## 🔐 Authentication Features

### Feature 1: User Registration
**User Story:** *As a new visitor, I want to create an account so that I can make purchases.*

**Functionality:**
- Email-based registration
- Password strength validation (min 8 characters)
- Automatic role assignment (default: "user")
- Email uniqueness check
- Username uniqueness check
- Success confirmation message
- Auto-login after registration

**Technical Details:**
- Endpoint: `POST /api/auth/register/`
- Frontend: `pages/Register.tsx`
- Backend: `api/views.py` - RegisterView

---

### Feature 2: User Login
**User Story:** *As a registered user, I want to login so that I can access my account.*

**Functionality:**
- Email/username + password authentication
- JWT token generation
- Token stored in localStorage
- Automatic redirect to dashboard/home
- "Remember me" functionality
- Error messages for invalid credentials

**Technical Details:**
- Endpoint: `POST /api/auth/login/`
- Frontend: `pages/Login.tsx`
- Backend: Django Simple JWT

---

### Feature 3: Password Reset
**User Story:** *As a user who forgot my password, I want to reset it via email.*

**Functionality:**
- Request password reset by email
- Generate 6-digit OTP
- OTP expires in 10 minutes
- Email sent with reset code
- Confirm reset with OTP + new password
- Success notification

**Technical Details:**
- Endpoints: 
  - `POST /api/auth/password-reset/`
  - `POST /api/auth/password-reset-confirm/`
- Backend: `PasswordResetToken` model

---

### Feature 4: Logout
**User Story:** *As a logged-in user, I want to logout to secure my account.*

**Functionality:**
- Clear JWT token from localStorage
- Clear user state from context
- Redirect to home page
- Clear cart (optional)

**Technical Details:**
- Frontend: `context/AuthContext.tsx`

---

## 📦 Product Features

### Feature 5: Product Catalog
**User Story:** *As a shopper, I want to browse all available products.*

**Functionality:**
- Display all products in grid layout
- Show product image, name, price
- Show discount badge if on sale
- Show stock status (In Stock, Low Stock, Out of Stock)
- Pagination (20 products per page)
- Responsive grid (1-4 columns based on screen size)

**Technical Details:**
- Endpoint: `GET /api/products/`
- Frontend: `pages/Shop.tsx`, `components/ProductCard.tsx`

---

### Feature 6: Product Search
**User Story:** *As a shopper, I want to search for products by name or description.*

**Functionality:**
- Search bar in header
- Real-time search (debounced)
- Search by product name, description, brand
- Display search results count
- Clear search button

**Technical Details:**
- Endpoint: `GET /api/products/?search=query`
- Frontend: `pages/Shop.tsx`

---

### Feature 7: Product Filtering
**User Story:** *As a shopper, I want to filter products by category, price, etc.*

**Functionality:**
- Filter by category
- Filter by subcategory
- Filter by brand
- Filter by gender (Male, Female, Unisex)
- Filter by price range (min/max)
- Filter by sale items
- Filter by featured products
- Multiple filters can be applied simultaneously
- Clear all filters button

**Technical Details:**
- Endpoint: `GET /api/products/?category=X&min_price=Y&max_price=Z`
- Frontend: Filter sidebar in `pages/Shop.tsx`

---

### Feature 8: Product Sorting
**User Story:** *As a shopper, I want to sort products by price or date.*

**Functionality:**
- Sort by price (low to high)
- Sort by price (high to low)
- Sort by newest first
- Sort by popularity
- Dropdown selector for sort options

**Technical Details:**
- Endpoint: `GET /api/products/?sort=price_asc`
- Frontend: Sort dropdown in `pages/Shop.tsx`

---

### Feature 9: Product Details
**User Story:** *As a shopper, I want to view detailed information about a product.*

**Functionality:**
- Product image gallery (primary + additional images)
- Product name, brand, category
- Full description
- Price (with sale price if discounted)
- Discount percentage badge
- Stock availability
- Available sizes (if applicable)
- Available colors (if applicable)
- Variant selector (size + color)
- Quantity selector
- Add to cart button
- Product reviews section
- Related products suggestions

**Technical Details:**
- Endpoint: `GET /api/products/{id}/`
- Frontend: `pages/ProductDetail.tsx`

---

### Feature 10: Product Variants
**User Story:** *As a shopper, I want to select size and color for a product.*

**Functionality:**
- Display available sizes as buttons
- Display available colors as swatches
- Highlight selected variant
- Show variant-specific stock
- Disable out-of-stock variants
- Update price if variant has different price

**Technical Details:**
- Backend: JSON field `variants` in Product model
- Frontend: Variant selector in `ProductDetail.tsx`

---

### Feature 11: Product Images
**User Story:** *As a shopper, I want to view multiple images of a product.*

**Functionality:**
- Primary product image
- Up to 5 additional images
- Image gallery with thumbnails
- Click thumbnail to view full size
- Zoom on hover (desktop)
- Swipe gestures (mobile)

**Technical Details:**
- Backend: Cloudinary image storage
- Frontend: Image gallery component

---

## 🛒 Shopping Features

### Feature 12: Add to Cart
**User Story:** *As a shopper, I want to add products to my cart.*

**Functionality:**
- Select product variant (size, color)
- Select quantity
- Validate stock availability
- Add to cart with confirmation
- Update cart badge count
- Show success toast notification
- Prevent adding more than available stock

**Technical Details:**
- Frontend: `context/CartContext.tsx`
- Storage: localStorage

---

### Feature 13: View Cart
**User Story:** *As a shopper, I want to view all items in my cart.*

**Functionality:**
- Display all cart items
- Show product image, name, variant
- Show quantity and price
- Show subtotal per item
- Show cart total
- Update quantity controls
- Remove item button
- Continue shopping button
- Proceed to checkout button

**Technical Details:**
- Frontend: `pages/Cart.tsx`, `components/CartItem.tsx`

---

### Feature 14: Update Cart
**User Story:** *As a shopper, I want to change quantities in my cart.*

**Functionality:**
- Increase quantity button
- Decrease quantity button
- Direct quantity input
- Validate against stock
- Auto-update totals
- Save changes to localStorage

**Technical Details:**
- Frontend: `context/CartContext.tsx`

---

### Feature 15: Remove from Cart
**User Story:** *As a shopper, I want to remove items from my cart.*

**Functionality:**
- Remove button on each cart item
- Confirmation dialog (optional)
- Update cart total
- Show empty cart message if no items

**Technical Details:**
- Frontend: `context/CartContext.tsx`

---

### Feature 16: Checkout
**User Story:** *As a logged-in user, I want to complete my purchase.*

**Functionality:**
- Review order summary
- Enter shipping address
- Select payment method (Secure Stripe Card Processing)
- Apply referral earnings as a discount (Referral System Integration)
- View order total
- Place order button
- Validate all required fields
- Create order in database
- Deduct stock quantities
- Clear cart after successful order
- Redirect to order confirmation

**Technical Details:**
- Endpoint: `POST /api/orders/`
- Frontend: `pages/Checkout.tsx`

---

### Feature 17: Order Confirmation
**User Story:** *As a buyer, I want confirmation that my order was placed.*

**Functionality:**
- Display order number
- Show order details
- Show estimated delivery date
- Print order button
- Continue shopping button
- Email confirmation (Background Celery task with itemized summary & shipping info)

**Technical Details:**
- Frontend: Order confirmation page/modal

---

## 📋 Order Management

### Feature 18: Order History
**User Story:** *As a buyer, I want to view my past orders.*

**Functionality:**
- List all user's orders
- Show order number, date, total
- Show order status (Pending, Shipped, Delivered, Cancelled)
- Click to view order details
- Filter by status
- Sort by date

**Technical Details:**
- Endpoint: `GET /api/orders/`
- Frontend: `pages/OrderHistory.tsx`

---

### Feature 19: Order Details
**User Story:** *As a buyer, I want to view details of a specific order.*

**Functionality:**
- Order number and date
- Order status with timeline
- List of items ordered
- Shipping address
- Payment method
- Order total
- Track shipment button (if shipped)
- Cancel order button (if pending)

**Technical Details:**
- Endpoint: `GET /api/orders/{id}/`
- Frontend: Order detail page/modal

---

### Feature 20: Cancel Order
**User Story:** *As a buyer, I want to cancel my order if it hasn't shipped.*

**Functionality:**
- Cancel button (only for pending orders)
- Confirmation dialog
- Update order status to "cancelled"
- Restore product stock automatically
- Refund any applied referral earnings to the user's balance
- Dashboard statistics updated to exclude cancelled revenue
- Show cancellation confirmation

**Technical Details:**
- Endpoint: `DELETE /api/orders/{id}/`
- Permission: Owner or Admin only

---

### Feature 21: Order Status Updates
**User Story:** *As a seller, I want to update order status when I ship items.*

**Functionality:**
- View orders containing my products
- Update status dropdown (Pending → Shipped → Delivered)
- Add tracking number (future)
- Notify customer (future)

**Technical Details:**
- Endpoint: `PATCH /api/orders/{id}/`
- Permission: Seller (own products) or Admin

---

## ⭐ Review System

### Feature 22: View Reviews
**User Story:** *As a shopper, I want to read reviews before purchasing.*

**Functionality:**
- Display all reviews for a product
- Show reviewer name
- Show star rating (1-5)
- Show review text
- Show review date
- Calculate average rating
- Show total review count
- Sort reviews (newest, highest rated)

**Technical Details:**
- Endpoint: `GET /api/reviews/?product={id}`
- Frontend: Review section in `ProductDetail.tsx`

---

### Feature 23: Write Review
**User Story:** *As a verified buyer, I want to write a review for a product I purchased.*

**Functionality:**
- Review form (only for verified buyers)
- Star rating selector (1-5)
- Text comment field
- Submit button
- Validation: Must have purchased and received product
- One review per product per user
- Success notification

**Technical Details:**
- Endpoint: `POST /api/reviews/`
- Backend validation: Check for delivered order containing product

---

### Feature 24: Edit Review
**User Story:** *As a reviewer, I want to edit my existing review.*

**Functionality:**
- Edit button on own reviews
- Pre-fill form with existing review
- Update rating and/or comment
- Save changes
- Show updated timestamp

**Technical Details:**
- Endpoint: `PUT /api/reviews/{id}/`
- Permission: Owner only

---

### Feature 25: Delete Review
**User Story:** *As a reviewer, I want to delete my review.*

**Functionality:**
- Delete button on own reviews
- Confirmation dialog
- Remove review from database
- Update product average rating

**Technical Details:**
- Endpoint: `DELETE /api/reviews/{id}/`
- Permission: Owner or Admin

---

## 💼 Seller Features

### Feature 26: Seller Dashboard
**User Story:** *As a seller, I want to view my sales performance.*

**Functionality:**
- Total revenue (all time)
- Revenue growth (vs previous period)
- Units sold
- Units growth
- Conversion rate
- Monthly sales chart
- Recent orders table
- Top-selling products
- Low stock alerts

**Technical Details:**
- Endpoint: `GET /api/seller/stats/`
- Frontend: `pages/SellerDashboard.tsx`

---

### Feature 27: Create Product
**User Story:** *As a seller, I want to list a new product for sale.*

**Functionality:**
- Product creation form
- Fields: name, description, price, category, brand
- Image upload (primary + additional)
- Stock quantity
- Sizes (multi-select)
- Colors (multi-select)
- Discount percentage
- Gender selection
- Featured/popular toggles
- Validation for all fields
- Submit button
- Success notification

**Technical Details:**
- Endpoint: `POST /api/products/`
- Frontend: Product form in seller dashboard

---

### Feature 28: Edit Product
**User Story:** *As a seller, I want to update my product details.*

**Functionality:**
- Edit button on own products
- Pre-filled form with existing data
- Update any field
- Replace images
- Save changes
- Success notification

**Technical Details:**
- Endpoint: `PUT /api/products/{id}/`
- Permission: Owner or Admin

---

### Feature 29: Delete Product
**User Story:** *As a seller, I want to remove a product from my catalog.*

**Functionality:**
- Delete button on own products
- Confirmation dialog
- Remove product from database
- Delete associated images
- Cannot delete if active orders exist

**Technical Details:**
- Endpoint: `DELETE /api/products/{id}/`
- Permission: Owner or Admin

---

### Feature 30: Manage Inventory
**User Story:** *As a seller, I want to update stock quantities.*

**Functionality:**
- View current stock for each product
- Update stock quantity
- Low stock warnings (< 10 items)
- Out of stock indicator
- Bulk stock update (future)

**Technical Details:**
- Endpoint: `PATCH /api/products/{id}/`
- Frontend: Inventory management page

---

### Feature 31: View Seller Orders
**User Story:** *As a seller, I want to see orders containing my products.*

**Functionality:**
- List orders with my products
- Filter by status
- View order details
- Update order status
- Mark as shipped

**Technical Details:**
- Endpoint: `GET /api/seller/orders/`
- Frontend: Seller orders page

---

## 🛡️ Admin Features

### Feature 32: Admin Dashboard
**User Story:** *As an admin, I want to view platform-wide statistics.*

**Functionality:**
- Total users count
- Total products count
- Total orders count
- Total revenue
- Revenue by month chart
- Recent user registrations
- Recent orders
- Top sellers
- Top products

**Technical Details:**
- Endpoint: `GET /api/admin/stats/`
- Frontend: `pages/AdminDashboard.tsx`

---

### Feature 33: User Management
**User Story:** *As an admin, I want to manage all users.*

**Functionality:**
- List all users
- Search users by name/email
- Filter by role
- View user details
- Change user role (user ↔ seller ↔ admin)
- Deactivate/activate accounts
- View user order history
- View user reviews

**Technical Details:**
- Endpoint: `GET /api/admin/users/`
- Endpoint: `PATCH /api/admin/users/{id}/`
- Frontend: User management page

---

### Feature 34: Product Moderation
**User Story:** *As an admin, I want to manage all products on the platform.*

**Functionality:**
- View all products (all sellers)
- Search and filter products
- Edit any product
- Delete any product
- Feature/unfeature products
- Approve new products (future)
- Bulk actions (delete, feature)

**Technical Details:**
- Endpoint: `GET /api/products/`
- Frontend: Product moderation page

---

### Feature 35: Content Management
**User Story:** *As an admin, I want to edit site content pages.*

**Functionality:**
- Edit About page
- Edit Terms of Service
- Edit Privacy Policy
- Edit Contact page
- Rich text editor
- Preview changes
- Publish changes

**Technical Details:**
- Endpoint: `GET /api/admin/content/`
- Endpoint: `PUT /api/admin/content/{slug}/`
- Backend: `PageContent` model

---

### Feature 36: Order Management (Admin)
**User Story:** *As an admin, I want to manage all orders.*

**Functionality:**
- View all orders (all users)
- Filter by status, date, user
- Update any order status
- Cancel any order
- Refund orders (future)
- Export orders to CSV (future)

**Technical Details:**
- Endpoint: `GET /api/orders/` (admin sees all)
- Frontend: Admin order management page

---

### Feature 37: Batch Product Creator
**User Story:** *As an admin, I want to quickly add multiple products by uploading images.*

**Functionality:**
- Drag and drop multiple product images
- Auto-generate product drafts from images
- Auto-infer category/gender from explicit folders or defaults
- Edit pricing/names for all drafts in one view
- Bulk publish all drafts
- "Add More" capability to continue adding

**Technical Details:**
- Frontend: `components/BatchProductCreator.tsx`
- Integration: Cloudinary for bulk image upload
- API: Batch create requests

---

## 🎨 UI/UX Features

### Feature 38: Responsive Design
**User Story:** *As a user on any device, I want the site to work well.*

**Functionality:**
- Mobile-first design (320px+)
- Tablet optimization (768px+)
- Desktop layout (1024px+)
- Touch-friendly buttons (min 44px)
- Hamburger menu on mobile
- Collapsible filters on mobile
- Swipe gestures for image galleries

**Technical Details:**
- Tailwind CSS responsive utilities
- Mobile navigation component

---

### Feature 39: Loading States
**User Story:** *As a user, I want to know when content is loading.*

**Functionality:**
- Skeleton loaders for product cards
- Spinner for page transitions
- Loading button states
- Progress indicators for uploads

**Technical Details:**
- Frontend: Loading components

---

### Feature 40: Error Handling
**User Story:** *As a user, I want clear error messages when something goes wrong.*

**Functionality:**
- Toast notifications for errors
- Form validation errors
- 404 page for invalid routes
- Network error messages
- Retry buttons for failed requests

**Technical Details:**
- Axios interceptors
- Error boundary components

---

### Feature 41: Notifications
**User Story:** *As a user, I want feedback for my actions.*

**Functionality:**
- Success toasts (e.g., "Added to cart")
- Info toasts (e.g., "Please login")
- Warning toasts (e.g., "Low stock")
- Auto-dismiss after 3 seconds

**Technical Details:**
- Frontend: Toast context/component

---

### Feature 42: Animations (Modern UI)
**User Story:** *As a user, I want a smooth and premium feel.*

**Functionality:**
- Page transitions (fade/slide)
- Hover effects on cards
- Micro-interactions on buttons
- Smooth scrolling
- Mobile menu slide-in

**Technical Details:**
- CSS transitions and keyframes
- Tailwind `transition-*` utilities

---

## 📨 Background Tasks & Emails

### Feature 43: Automated Transactional Emails
**User Story:** *As a platform user, I want reliable and branded email communication for important account actions.*

**Functionality:**
- Asynchronous email sending so the user doesn't wait
- Password Reset emails with secure OTP
- Order Confirmation emails summarizing purchase
- Newsletter & promotional email support
- Premium HTML email templates featuring the `SMARTSHOP™ EST. 2026` logo
- Responsive email design formatted for all clients

**Technical Details:**
- Backend: Celery task queue, Redis broker
- Infrastructure: Dockerized Celery workers
- Templates: Base HTML templates using standard fonts and typography logomark

---

## 📧 Enterprise Marketing System (Admin Only)

> **Location**: Admin Dashboard → Marketing Tab (`components/dashboard/MarketingTab.tsx`)  
> **Access**: Admin role only. Sellers and regular users cannot see this tab.

---

### 🖥️ Marketing Tab — Overview

The Marketing Tab is a full SaaS-grade **Email Marketing Command Center** embedded directly into the admin dashboard. It allows the admin to create, schedule, send, pause, track, and analyze email marketing campaigns — all without leaving the dashboard.

The tab has **two switchable views**:
1. **📊 Analytics View** — Platform-wide campaign performance summary
2. **📋 Campaigns View** — Campaign list, filters, and management actions

---

### Feature 46: Quick Stats Header

**What it shows (always visible at the top):**

| Stat Card | What It Displays |
|---|---|
| 📧 Total Campaigns | Count of all campaigns ever created |
| 📬 Emails Sent | Total individual emails delivered across all campaigns |
| 👥 Active Users | Number of eligible recipients (role=`user`) on the platform |
| ✅ Delivery Rate | % of sent emails that were successfully delivered |

- Each card has a color-coded icon and a large number
- Cards animate on hover (icon scales up)
- Data is fetched from `GET /api/marketing-campaigns/analytics/`

**Technical Details:**
- Component: `StatCard` (defined in `MarketingTab.tsx`)
- Data source: `loadAnalytics()` → `api.getMarketingAnalytics()`

---

### Feature 47: Analytics View

Triggered by clicking the **"Analytics"** button in the view switcher.

**What it shows:**

#### Campaign Status Breakdown
- **Horizontal progress bars** for each status: Draft, Scheduled, Sending, Sent, Paused, Failed
- Each bar shows count + % of total, color-coded per status
- Uses `STATUS_COLORS` constant for consistent color theming

#### Campaign Type Breakdown
- Grid of boxes for each campaign type: Promotional, Abandoned Cart, Re-engagement, Thank You, Post-purchase Upsell
- Count displayed per type

#### Performance Metrics
- **Delivery Rate** progress bar (green)
- **Open Rate** progress bar (blue)
- **Click Rate** progress bar (purple)
- Percentages with colored fill bars

#### Last Campaign Banner
- Highlighted indigo gradient banner showing the most recent campaign
- Displays: campaign name, status badge, total recipients, emails sent, failed count
- Only shown if at least one campaign exists

**Technical Details:**
- Endpoint: `GET /api/marketing-campaigns/analytics/`
- Frontend: `analytics` state populated by `loadAnalytics()`

---

### Feature 48: Campaign List View

Triggered by clicking the **"Campaigns"** button in the view switcher.

**Filter Bar:**
- 🔍 **Search** — Filter campaigns by name (live, client-side)
- **Status filter** dropdown — All / Draft / Scheduled / Sending / Sent / Paused / Failed
- **Type filter** dropdown — All / Promotional / Abandoned Cart / Re-engagement / Thank You / Upsell
- **"+ Create Campaign"** button (opens the campaign creation modal)

**Campaign Table columns:**
| Column | Details |
|---|---|
| Campaign Name | Bold name + campaign type badge below |
| Status | Color-coded pill badge (6 possible statuses) |
| Recipients | Count of resolved recipients |
| Sent | Emails successfully sent |
| Failed | Failed delivery count (shown in red) |
| Scheduled | Formatted date/time if scheduled, otherwise "—" |
| Actions | Contextual action buttons depending on status |

**Action Buttons per Campaign (contextual by status):**
| Button | When Shown | What It Does |
|---|---|---|
| 🚀 Send | Draft only | Immediately sends the campaign |
| ✏️ Edit | Draft / Scheduled | Opens creation modal pre-filled |
| ⏸ Pause | Sending only | Pauses the ongoing send |
| ▶️ Resume | Paused only | Resumes sending |
| 📋 Duplicate | Always | Creates a draft copy of the campaign |
| 📬 Logs | Always | Opens Delivery Logs modal |
| 📊 Analytics | Always | Opens Conversion Analytics modal |
| 🗑 Delete | Always (with confirm) | Permanently deletes campaign |

**Technical Details:**
- Data: `loadCampaigns()` → `api.getCampaigns()`
- All mutations use the API service: `api.sendCampaign`, `api.pauseCampaign`, `api.resumeCampaign`, `api.duplicateCampaign`, `api.deleteCampaign`

---

### Feature 49: Campaign Creation / Edit Modal

Opened by clicking **"+ Create Campaign"** or **"✏️ Edit"**.

**Form Sections:**

#### 1. Basic Info
- **Campaign Name** (required) — text input
- **Campaign Type** — dropdown: Promotional / Abandoned Cart / Re-engagement / Thank You / Upsell

#### 2. Email Content
- **Subject Line** (required) — appears in the recipient's inbox
- **Preheader Text** — short preview text shown below subject in email clients
- **"Use Template Builder" button** — opens the full Email Template Builder modal (visual drag-and-drop email designer)
- **Message Body** — large textarea for HTML email content with a multi-line placeholder showing an example HTML email
- **Formatting Tips** panel — inline guide showing how to use `<h2>`, `<p>`, `<strong>`, and `{{customer_name}}` placeholders
- **Plain Text Fallback** — textarea for non-HTML email clients

#### 3. CTA & Extras
- **Banner Image URL** — URL to a header image displayed in the email
- **CTA Button Text** — e.g. "Shop Now"
- **CTA Button URL** — link the CTA button points to

#### 4. Coupon / Discount Configuration
- **Discount Code** — auto-uppercased, e.g. `SUMMER25`
- **Discount Type** — Percentage (%) or Fixed Amount ($)
- **Discount Value** — numeric
- **Minimum Purchase ($)** — minimum cart value to apply the code
- **Usage Limit** — max redemptions (blank = unlimited)
- **Expiry (Days after send)** — auto-expires the coupon N days after the campaign sends
- ℹ️ Coupon is **auto-created** in the system when campaign is saved and **auto-deleted** when campaign is removed

#### 5. Batch Size
- **Batch Size** — how many emails to send per Celery task batch (default: 200)

#### 6. Audience Targeting
- **Target Audience** dropdown:
  | Segment | Description |
  |---|---|
  | All Users | Every registered user with `role='user'` |
  | Ordered At Least Once | Users who have completed at least 1 order |
  | Never Ordered | Users who have never placed an order |
  | Recent Signups (X days) | Users who registered within the last X days |
  | Abandoned Cart | Users flagged as having abandoned a cart |
  | Manual Selection | Admin manually picks recipients |
- **Registered Within (Days)** — appears only when "Recent Signups" is selected
- **Live Audience Preview** — shows count + sample emails of who will receive the campaign (fetched from `GET /api/marketing-campaigns/audience-preview/`)

#### 7. Scheduling
- **Send Now** / **Schedule Later** toggle buttons
- When **Schedule Later** is selected → the `CustomDateTimePicker` appears:
  - **Calendar tab**: Visual month calendar, navigate months with arrows, click any future date to select it, past dates are grayed out and disabled
  - **Time tab**: Scrollable 00–23 hours + scrollable 5-minute interval minutes (00, 05, 10...55)
  - **Confirmed Schedule banner**: Green confirmation box showing the full selected date and time in human-readable format

#### 8. Save Buttons
- **"Save as Draft"** — saves without sending or scheduling
- **"Save & Send" / "Save & Schedule"** — saves and immediately sends or schedules based on the Send Now / Schedule Later selection

**Technical Details:**
- Endpoints: `POST /api/marketing-campaigns/` (create), `PATCH /api/marketing-campaigns/{id}/` (update)
- Component: Campaign creation modal in `MarketingTab.tsx`

---

### Feature 50: Delivery Logs Modal

Opened by clicking the **"📬 Logs"** button on any campaign.

**What it shows:**
- **Summary badges** at the top: count per status (Pending / Sent / Failed / Opened / Clicked)
- **Total count** badge
- **Full log table** with columns:
  | Column | Details |
  |---|---|
  | User | Recipient's display name |
  | Email | Recipient's email address |
  | Status | Color-coded status pill |
  | Sent At | Formatted timestamp of delivery attempt |
  | Retries | Number of retry attempts (0–3) |
  | Error | Error message if failed (truncated at 200px) |
- Empty state message if no logs exist
- Loading spinner while fetching

**Technical Details:**
- Endpoint: `GET /api/marketing-campaigns/{id}/logs/`
- State: `logs`, `logsLoading`, `showLogsModal`

---

### Feature 51: Conversion Analytics Modal

Opened by clicking the **"📊 Analytics"** button on any campaign.

**What it shows:**
- **4 Metric Cards**:
  - Click-Through Rate (%)
  - Conversion Rate (%)
  - Total Revenue Generated ($)
  - Total Conversions (count)
- Empty state with chart icon if no conversion data is yet recorded
- Loading spinner while fetching

**Technical Details:**
- Endpoint: `GET /api/marketing-campaigns/{id}/conversion-analytics/`
- Component: `ConversionAnalyticsTab` imported from `./ConversionAnalyticsTab`

---

### Feature 52: Email Template Builder Modal

Opened by clicking **"Use Template Builder"** inside the campaign creation modal.

**What it shows:**
- Full-screen visual email designer
- Drag-and-drop email block builder
- Allows creating professional-looking emails without writing HTML
- On template selection, the HTML is auto-inserted into the Message Body field

**Technical Details:**
- Component: `EmailTemplateBuilder` imported from `./EmailTemplateBuilder`
- Callback: `handleTemplateSelect` sets `formData.message` with the generated HTML

---

### Feature 53: Campaign Calendar View

A visual calendar component available within the marketing system.

**Technical Details:**
- Component: `CampaignCalendar` imported from `./CampaignCalendar`
- Shows scheduled campaigns on their scheduled dates

---

### 🔌 All Marketing API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/marketing-campaigns/` | List all campaigns |
| `POST` | `/api/marketing-campaigns/` | Create new campaign |
| `PATCH` | `/api/marketing-campaigns/{id}/` | Update campaign |
| `DELETE` | `/api/marketing-campaigns/{id}/` | Delete campaign |
| `POST` | `/api/marketing-campaigns/{id}/send/` | Send campaign immediately |
| `POST` | `/api/marketing-campaigns/{id}/pause/` | Pause active send |
| `POST` | `/api/marketing-campaigns/{id}/resume/` | Resume paused send |
| `POST` | `/api/marketing-campaigns/{id}/duplicate/` | Clone campaign as draft |
| `GET` | `/api/marketing-campaigns/{id}/logs/` | Delivery logs for campaign |
| `GET` | `/api/marketing-campaigns/{id}/conversion-analytics/` | Conversion data |
| `GET` | `/api/marketing-campaigns/analytics/` | Platform-wide analytics |
| `GET` | `/api/marketing-campaigns/audience-preview/` | Live audience count preview |
| `GET` | `/api/marketing-campaigns/users-list/` | All eligible users list |

---

### Feature 50: Custom Calendar Date-Time Picker
**User Story:** *As an admin, I want to easily and accurately schedule a campaign by picking a date from a visual calendar and choosing a time without typing.*

**Functionality:**
- Inline **visual monthly calendar** with Su–Sa day headers
- Navigate between months with `‹` / `›` arrow buttons
- **Past dates are disabled** — cannot accidentally schedule in the past
- Today's date is highlighted in indigo for quick orientation
- Selected date shown with a filled indigo circle
- Tab switch to **Time Picker** with scrollable hours (00–23) and minutes (00, 05...55 in 5-min increments)
- Selected hour/minute highlighted with indigo button
- **"Planned Delivery"** preview box showing the chosen time in real time
- After selecting both date and time, a green **"Confirmed Schedule"** banner appears showing the full human-readable date and time
- Replaces the broken native `<input type="datetime-local">` which caused formatting errors across browsers

**Technical Details:**
- Component: `components/dashboard/CustomDateTimePicker.tsx`
- Props: `value: string` (ISO 8601), `onChange: (value: string) => void`, `minDate?: Date`
- Used in: `MarketingTab.tsx` → Campaign creation/edit modal → Schedule Later section

---


## 📊 Feature Completion Statistics

### **Total Features: 51**
- **Authentication**: 4/4 (100%)
- **Product**: 7/7 (100%)
- **Shopping**: 6/6 (100%)
- **Order Management**: 4/4 (100%)
- **Review System**: 4/4 (100%)
- **Seller Features**: 6/6 (100%)
- **Admin Features**: 6/6 (100%)
- **UI/UX Features**: 6/6 (100%)
- **Blogger Features**: 4/4 (100%)
- **Background Tasks & Emails**: 1/1 (100%)
- **Enterprise Marketing**: 5/5 (100%)
- **Wishlist & Loyalty**: 3/3 (100%) [NEW]
- **GDPR Compliance**: 2/2 (100%) [NEW]
- **Dynamic CMS**: 2/2 (100%) [NEW]

**Overall Completion: 100%** ✅

---

**Last Updated**: February 28, 2026  
**Version**: 2.1.0 (Referral System, Wishlists, Dynamic CMS, GDPR Controls)

---

## ✍️ Fashion Blogger Features

### Feature 44: Public Blog Feed
**User Story:** *As a visitor, I want to read fashion articles and trend reports.*

**Functionality:**
- Magazine-style layout with featured post hero
- Category-based filtering (All, Style, Trends, Care, News, Lookbook)
- Responsive grid of published articles
- Post metadata (author, date, reading time, views)
- Skeleton loading states for smooth UX
- Direct links to full article view

**Technical Details:**
- Endpoint: `GET /api/blog/` (lists published only)
- Frontend: `pages/Blog.tsx`
- Backend: `BlogPostViewSet`

---

### Feature 43: Blogger Dashboard
**User Story:** *As a blogger, I want a dedicated space to manage my articles.*

**Functionality:**
- Real-time stats (Total posts, Published count, Total views)
- Interactive list of all own posts
- Quick toggle for Publish/Unpublish status
- Edit and Delete actions for each post
- Search and filter own posts
- Welcome message with personalized greeting

**Technical Details:**
- Endpoint: `GET /api/blog/?author={id}`
- Frontend: `pages/BloggerDashboard.tsx` (List mode)

---

### Feature 44: Full-Screen Blog Editor
**User Story:** *As a blogger, I want a powerful tool to write and format my articles.*

**Functionality:**
- Intuitive title and excerpt fields
- Rich text/HTML content editor support
- Category selection via interactive chips
- Cover image URL input with live preview
- Tag management (comma-separated)
- Draft vs. Published toggle
- Featured post toggle
- Instant success feedback on save

**Technical Details:**
- Endpoints: `POST /api/blog/`, `PATCH /api/blog/{id}/`
- Frontend: `pages/BloggerDashboard.tsx` (Editor mode)

---

### Feature 45: Blog Moderation (Admin)
**User Story:** *As an admin, I want to manage all blog content on the platform.*

**Functionality:**
- View all posts from all bloggers in the admin panel
- Edit or delete any post
- Toggle featured status across the entire platform
- Assign/Revoke blogger roles via User management
- SEO settings (slug auto-generation, reading time calculation)

**Technical Details:**
- Backend: Django Admin registration with customized list filters and searchable fields.
- API: `set_role` endpoint in `UserViewSet`.

---

---

## 🔭 Observability & Notifications

### Feature 46: Full-Stack Health & Monitoring
**User Story:** *As an admin, I want to proactively monitor my server, database, cache, and frontend uptime to prevent sales loss.*

**Functionality:**
- Dedicated `GET /api/health/` JSON endpoint.
- Live PostgreSQL query testing (`SELECT 1`).
- Live Redis cache read/write testing.
- CheckCle UI monitoring integration at `status.smartshop1.us`.
- Traefik SSL auto-generation specifically for the status dashboard.
- Uptime Kuma/CheckCle Slack alerts for sudden downtime.

**Technical Details:**
- Endpoint: `GET /api/health/` (`permissions.AllowAny`)
- Middleware: Independent Docker deployment template (DNS-Only).

---

### Feature 47: Actionable Slack Webhooks
**User Story:** *As a business owner, I want real-time notifications about sales and security attacks on my phone.*

**Functionality:**
- Instant Slack ping on order completion with customer name and USD value.
- Configurable environment variables for `SLACK_ORDERS_WEBHOOK` and `SLACK_SECURITY_WEBHOOK`.
- Non-blocking asynchronous dispatch via Celery.

**Technical Details:**
- Backend: `notify_slack_new_order.delay()` in `OrderViewSet`
- Dependencies: `requests` module mapped to `settings.py`

---

### Feature 48: Brute-Force Shield (`django-axes`)
**User Story:** *As an admin, I want my application to automatically defend itself against hackers guessing passwords.*

**Functionality:**
- Tracks failed login attempts per IP address and Username.
- Hard lock-out established after 5 consecutive failures.
- 30-minute automated cool-off period.
- Introduces intentional ~1-second PBKDF2 Hash processing threshold (Key Stretching) to explicitly throttle supercomputers attempting fast, programmatic brute-forcing.
- Automatic Django Signal dispatched to Celery upon lockout.
- High-priority Slack alert broadcasting the attacker's IP and targeted user.

**Technical Details:**
- Library: `django-axes` integration in `settings.py` and `middleware`.
- Backend: `@receiver(user_locked_out)` hooking into `notify_slack_security_alert` in `models.py`.

---

### Feature 49: Privacy & Database Scans (Optimization)
**User Story:** *As a growing enterprise, I want my data to load instantly and keep user emails entirely private.*

**Functionality:**
- Mass email delivery (Marketing & Newsletters) leverages `bcc` headers to mask PII from other recipients.
- Composite B-Tree indexes constructed on `User`, `Product`, and `MarketingCampaign` to eradicate full-table scans.
- Bulk generation of database objects (`OrderItem`, `EmailDeliveryLog`) to eliminate `O(n)` query loops.
- Asynchronous Celery-Beat task designed to delete outdated tracking logs over 6 months old.

**Technical Details:**
- Operations: `bulk_create`, Django `Meta.indexes`
- Emailing: `EmailMultiAlternatives` utilizing `bcc=[...]` mechanism.

---

## 💖 Wishlist & Shopping Tools

### Feature 54: Wishlist System
**User Story:** *As a shopper, I want to save items for later without adding them to my cart.*

**Functionality:**
- Integrated "Add to Wishlist" heart icon on product cards and detail pages
- Animated heart toggle (solid vs outline)
- Dedicated Wishlist page to view all saved items
- Real-time "Remove from Wishlist" action
- "Add to Cart from Wishlist" capability
- Guest user protection (must be logged in to save favorites)

**Technical Details:**
- Endpoint: `POST /api/wishlist/toggle/`
- Frontend: `pages/Wishlist.tsx`, `components/Wishlist.tsx`
- Backend: `Wishlist` model with unique user-product constraint

---

## 🎁 Referral & Loyalty System

### Feature 55: Invitation Network
**User Story:** *As a loyal customer, I want to invite friends and earn rewards for their signups.*

**Functionality:**
- Unique referral link generation for every user
- **Affiliate Profile**: Dedicated dashboard to track clicks and earnings
- **Signup Bonus**: Referrers earn $1.00 instantly for every new user who signs up via their link
- **Automated Fraud Detection**: Prevention of self-referral or double-crediting
- **Earnings Wallet**: Transparent balance view and redemption eligibility

**Technical Details:**
- Model: `ReferralSignup`, `User.referral_earnings`, `Affiliate`
- Registry: Credit applied atomically during `POST /api/auth/register/`

### Feature 56: Referral Discount Redemption
**User Story:** *As a customer with referral earnings, I want to use my balance to pay for my orders.*

**Functionality:**
- Dynamic checkout option to "Use Referral Earnings"
- **Redemption Threshold**: Minimum $10.00 balance required to unlock redemption
- Automatic deduction from order total
- Secure atomic updates to user balance and order records
- **refund on Cancellation**: If an order using earnings is cancelled, the balance is restored to the user account

**Technical Details:**
- Logic: `OrderViewSet.create` handles balance deduction and threshold validation

---

## ⚡ Dynamic Homepage CMS (Admin Only)

### Feature 57: Hero Banner Management
**User Story:** *As an admin, I want to update the homepage banners for sales and promotions instantly.*

**Functionality:**
- **Visual Banner Editor**: Update titles, subtitles, and CTA buttons
- **Asset Control**: Base64 or URL image uploads
- **Rich Placement**: Choose image fit (Cover/Contain) and focal point (Top/Center/Bottom)
- **Active Toggle**: Show or hide specific banners without deleting them
- **Auto-Stacking**: Multiple active banners create a high-speed Carousel

**Technical Details:**
- Model: `HeroBanner`
- UI: Admin Dashboard → CMS Tab → Hero Sub-tab

### Feature 58: Flexible Home Sections
**User Story:** *As an admin, I want to reorder and swap homepage sections (Featured, Categories, Testimonials).*

**Functionality:**
- Support for multiple section types: Featured Collection, Promotional Banner, Category Showcase
- **Custom Display Order**: Drag-and-drop or manual ordering
- Targeted linking to specific categories or product collections
- Section-specific images and descriptions

**Technical Details:**
- Model: `HomePageSection`
- UI: Admin Dashboard → CMS Tab → Sections Sub-tab

---

## 🛡️ GDPR & Data Privacy

### Feature 59: User Data Portability (SAR)
**User Story:** *As a user, I want to download all my data to comply with GDPR Right to Data Portability.*

**Functionality:**
- One-click "Export My Data" button in User Profile
- Instant JSON generation containing:
  - Personal profile and contact info
  - Full order history (itemized)
  - All shipping addresses
  - All product reviews written
- Non-blocking background generation

**Technical Details:**
- Endpoint: `GET /api/users/export_data/`
- Frontend: Profile Page → Security & Privacy

### Feature 60: Right to Erasure (Account Deletion)
**User Story:** *As a user, I want to permanently delete my account and data.*

**Functionality:**
- "Delete Account" option with multi-step confirmation
- Atomic deletion of user profile and PII
- Persistence of anonymized order data for accounting (optional/configurable)
- Instant logout and session termination

- Action: `UserViewSet.delete_self`

---

## 🏢 Enterprise Scaling (Roadmap Phases 1-4)

### Feature 61: Relational Product Architecture
**User Story:** *As an enterprise admin, I want structured product data to accurately map stock levels to specific sizes and colors.*

**Functionality:**
- Separation of products into `ProductVariant` and `ProductImage` relations
- Exact stock level mapping down to variant combination (e.g., Red-XL has 5 units)
- Variant-specific images linked to color variants
- API segregation with optimized prefetches to prevent N+1 query overhead

**Technical Details:**
- Models: `ProductVariant`, `ProductImage`
- UI: Admin Product Inlines

### Feature 62: Enterprise Cart & Inventory Locking
**User Story:** *As a buyer, my cart should be preserved across devices, and as a seller, I want to avoid overselling items during checkout.*

**Functionality:**
- Backend-stored active carts syncing seamlessly across mobile and desktop
- 10-minute active inventory reservations upon entering checkout
- SQL-level atomic stock decrements to prevent race conditions during high-volume sales events

**Technical Details:**
- Models: `Cart`, `StockReservation`
- Backend: Endpoint `reservations/` and `carts/`
- DB: Atomic transactions (`F()` expressions)

### Feature 63: Circuit Breaker & Automatic Retries
**User Story:** *As a user, the app should remain functional even if background services fail or network connections drop.*

**Functionality:**
- Exponential backoff retry logic for 5xx and 429 API errors
- Circuit breaker pattern to silently disable non-critical features (like analytics or suggestions) during partial outages without blocking checkout

**Technical Details:**
- Implementation: `axios-retry` frontend plugin
- Frontend API interceptors

### Feature 64: Real-Time Seller Analytics
**User Story:** *As a seller, I want to deeply understand my business performance using granular data.*

**Functionality:**
- Dynamic dashboard widgets showing Total Revenue, Conversion Rate, and Top Search Terms
- Cart-abandonment recovery insights and opportunity calculations
- Geographic sales breakdown by region
- Inventory health monitoring (low stock alerts)

**Technical Details:**
- UI: Seller Dashboard metrics grid
- Backend: `users/{id}/seller_stats/` endpoint

### Feature 65: Background Catalog Bulk Import
**User Story:** *As a new vendor, I want to upload a CSV with a thousand products without timing out my browser.*

**Functionality:**
- Asynchronous processing of massive product catalogs via CSV
- Job queued and processed entirely in the background, freeing the seller's browser

**Technical Details:**
- Tech Stack: Celery + Redis
- Backend Tasks: `process_bulk_upload`

### Feature 66: Automated Abandoned Cart Recovery
**User Story:** *As a business owner, I want to automatically recover lost revenue by reminding users of their abandoned carts.*

**Functionality:**
- "Did you forget something?" email sent automatically 4 hours after a cart is abandoned
- Dynamic "COMEBACK10" 10% discount email sent 48 hours after abandonment
- High-conversion branded HTML email templates

**Technical Details:**
- Tech Stack: Celery Beat + Celery worker task `process_abandoned_carts`

### Feature 67: Subscription & Auto-Replenishment
**User Story:** *As a customer, I want to subscribe to consumables (like coffee) and have them auto-shipped monthly at a discount.*

**Functionality:**
- Option to subscribe to specific products for up to 10% discount
- Background recurring orders engine that generates orders on a 30-day cron loop
- Automatic stock deduction for subscription renewals

**Technical Details:**
- Model: `Subscription`
- Task: `process_subscriptions`

### Feature 68: Advanced Logistics & Tax
**User Story:** *As an admin, I want dynamic shipping rates and accurate backend taxation enabled seamlessly through Stripe.*

**Functionality:**
- Dynamic API shipping rate calculation stub included during checkout intent creation
- Hardcoded multi-region automated tax attributes added to Stripe intents

**Technical Details:**
- Webhook: `StripeWebhookView`
- Intent: Automatic tax enabled flag logic
