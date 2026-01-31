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

---
*Last Updated: 2026-01-31*
