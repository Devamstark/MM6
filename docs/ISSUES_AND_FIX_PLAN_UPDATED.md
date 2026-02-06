# ✅ New Issues & Fix Plan (Updated)

## 1. Fix Search Button Not Working
**Status: Fixed**
- Implemented visible search overlay.
- Search now functioning on frontend.

## 2. Fix Wishlist Button Not Working
**Status: Fixed**
- Implemented Wishlist model and API.
- Added Wishlist page and navigation.
- Added "Add to Wishlist" toggle on Product Detail page.

## 3. Fix Login Session Persistence Issue
**Status: Fixed**
- Implemented `isLoading` state in `AuthContext` to handle initial session check.
- Updated `ProtectedRoute` to wait for session restoration before redirecting.

## 4. Enable Wishlist Heart Icon on Product Images
**Status: Fixed**
- Added heart icon overlay to `ProductCard.tsx` in listings.
- Connected to Wishlist API (toggle functionality).
- Requires login (redirects if not logged in).

## 5. Fix Product Stock Display
**Status: Fixed**
- Updated `ProductDetail.tsx` to ensure stock displays as at least 1 (e.g. "Only 1 left") instead of "Out of Stock" (0).

## 6. Fix Stock Quantity Validation
**Status: Fixed**
- Added `MinValueValidator(0)` to `Product.stock_quantity`.
- Allows 0 (for Out of Stock).
- Restricts negative values.
