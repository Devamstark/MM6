# QA Fixes & Improvements Log

This document tracks the issues identified during QA testing and the solutions implemented to resolve them.

## 1. Deployment & Infrastructure
*   **Problem:** Deployment failed on Render due to missing dependencies (`gunicorn`, `psycopg2`).
    *   **Solution:** Updated `requirements.txt` to include all necessary production packages.
*   **Problem:** Build script was not executable or missing steps.
    *   **Solution:** Created a robust `build.sh` script to handle dependency installation, migration, and static file collection.
*   **Problem:** Database migration conflict (multiple leaf nodes for migration `0005`).
    *   **Solution:** Manually merged conflicting migrations into `0005_merged_changes.py` ensuring both feature sets (variants + password reset) were preserved.
*   **Problem:** Environment variables were not properly loaded in production.
    *   **Solution:** Standardized `.env` usage and updated `settings.py` to use `python-dotenv`.

## 2. Navigation & Filtering
*   **Problem:** Clicking "Men" -> "T-Shirts" in the top menu yielded incorrect results (was using broad search).
    *   **Solution:** Updated `Layout.tsx` to use precise filtering: `/products?category=Men&subcategory=T-Shirts`.
*   **Problem:** "Sale" link in navigation pointed to a generic price sort, not actual sale items.
    *   **Solution:** Updated link to query `/products?on_sale=true` and implemented backend logic to filter by discount > 0.

## 3. Product Display & Images
*   **Problem:** Product images were broken or missing.
    *   **Solution:** Integrated Cloudinary for robust image hosting. Updated `serializers.py` to return absolute URLs.
*   **Problem:** Users couldn't tell if an item was on sale or out of stock from the card.
    *   **Solution:**
        *   Added **Sale Badges** (e.g., "-20% OFF").
        *   Added **Price Display** showing original price crossed out in red.
        *   Added **"Out of Stock"** overlay for unavailable items.
        *   Added **"Hot" / "Popular"** badges for feature products.

## 4. Shopping Experience
*   **Problem:** Buying a product was slow (required clicking into detail page).
    *   **Solution:** Added **"Quick Add"** (bag icon) and **"Buy Now"** (lightning icon) buttons directly on the product card.
*   **Problem:** Users couldn't easily browse filtered lists.
    *   **Solution:** Implemented a sidebar filter panel for recursive filtering by Category, Price, and Brand.
*   **Problem:** Cart allowed adding more items than available in stock (e.g., adding 2 when stock was 1).
    *   **Solution:** Added strict stock checks in `CartContext` (`addToCart`, `updateQuantity`). The system now alerts "Sorry, only X items in stock!" and prevents the addition. On the product page, the "Add to Cart" button now respects the specific stock level of the selected size/color variant.

## 5. Admin Dashboard & Management
*   **Problem:** Admins had no way to put items on sale.
    *   **Solution:** Added a **"Discount Management"** feature. Admins can now click a customizable discount button (10-60%) to instantly update product prices.
*   **Problem:** Product images uploaded by admins weren't saving correctly.
    *   **Solution:** Fixed `ProductForm` to handle `FormData` correctly for file uploads to the Django backend.
*   **Problem:** Conflicting categories.
    *   **Solution:** Standardized categories in `utils/categories.ts` and ensured backend choices matched.

## 6. Backend Logic
*   **Problem:** Sale prices weren't calculated consistentyl.
    *   **Solution:** Overrode the `Product` model's `save()` method. Now, whenever a `discount_percentage` is set, the system automatically calculates and saves the `sale_price`.
*   **Problem:** API search was fuzzy and returned irrelevant results.
    *   **Solution:** Refined `ProductFilter` in Django to support strict filtering for categories/subcategories while keeping broad text search for the search bar.

## 7. Security Hardening
*   **Problem:** Privilege Escalation (users could register as 'admin').
    *   **Solution:** Hardcoded `role='user'` in the registration endpoint, ignoring any user-submitted role data.
*   **Problem:** Data Leakage (users could list all other users).
    *   **Solution:** Restricted `UserViewSet` so standard users can only view their own profile.
*   **Problem:** Unauthorized Product Creation.
    *   **Solution:** Added explicit checks to ensure only Admins and Sellers can create products via the API.
*   **Problem:** Local Storage Data Visibility.
    *   **Solution:** Implemented **Data Obfuscation** for the cart in `localStorage` using Base64 encoding. This prevents the cart data from being easily readable as plain text in the browser.
*   **Problem:** API Data Exposure (Excessive Fields).
    *   **Solution:** Refactored `ProductSerializer` to explicitly whitelist public-only fields. Sensitive or internal fields (like `updated_at`, internal flags) are now excluded from the API response.
*   **Problem:** Exposed Browsable API Interface.
    *   **Solution:** Disabled the Django Rest Framework "Browsable API" in production environments. The API now returns strict JSON only, reducing the "developer" surface area visible to the public.
*   **Problem:** Exposed API Root Directory.
    *   **Solution:** Switched to `SimpleRouter` in production to hide the `/api/` root listing, returning a 404 instead of a map of all endpoints.
*   **Problem:** Backend Router Configuration Error (`UserViewSet`).
    *   **Solution:** Added `basename='user'` to the `UserViewSet` registration in `urls.py` to support the dynamic `get_queryset` security logic.

---
*Last Updated: 2026-01-31*
