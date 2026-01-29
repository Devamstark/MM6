# CloudMart Product & Experience Improvements Plan

## 1. 🐛 Critical Fixes
- [ ] **Fix Broken Product Images**
    - Investigation: Check Django `MEDIA_URL` and `MEDIA_ROOT` settings.
    - Fix: Ensure `urls.py` is configured to serve media files during development.
    - Verify: Upload a new product and check if the image loads.
- [ ] **Fix Subcategory Filtering**
    - Investigation: Check how the Home page category filter passes parameters to `ProductList`.
    - Fix: Ensure subcategory IDs or names are correctly filtered in the backend `ProductViewSet` or frontend logic.

## 2. ⭐ Reviews System Overhaul
- [ ] **Remove Mock Data**
    - Action: Remove hardcoded "4.9 stars" and "1.2k+ sold" from `ProductCard` and `ProductDetail`.
- [ ] **Implement Real Reviews**
    - Database: Create `Review` model (User, Product, Rating, Comment, CreatedAt).
    - Logic: Allow review creation ONLY if the user has purchased the product (check `Order` history).
    - UI: Add "Write a Review" form on Product Detail page (visible only to verified buyers).
    - API: Add endpoints to fetch reviews for a product and post a new review.

## 3. 🛍️ Purchase Flow Enhancements
- [ ] **"Buy Now" Button on Product Card**
    - Logic: Button should add item to cart and immediately redirect to `/checkout`.
    - UI: Add a distinct button (e.g., "Buy Now") to the Product Card hover state or main view.
- [ ] **Stock & Quantity Logic**
    - Validation: Prevent adding more items to cart than available `stock`.
    - UI:
        - Show "Out of Stock" badge if logic determines `quantity === 0`.
        - Disable "Add to Cart" / "Buy Now" if out of stock.
        - (Optional) Show "Only X left!" if stock is low (e.g., < 5).

## 4. 🎨 UI/UX Improvements
- [ ] **Colors & Sizes on Product List**
    - UI: Display available color swatches and available sizes directly on the `ProductCard` (or on hover).
    - Logic: Fetch `colors` and `sizes` fields (already added to types) and render them.
