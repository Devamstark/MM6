# Pending Features Implementation Plan

This document outlines the implementation details for the remaining requested features.

## 1. Verified Buyer Review System
**Objective**: ensure that reviews can only be written by users who have actually purchased the product, linked to their account.

### Implementation Steps:
1.  **Backend (Django)**:
    *   Create a new `Review` model in `api/models.py`.
        *   Fields: `product` (FK), `user` (FK), `rating` (1-5), `comment` (Text), `created_at`.
    *   Create a `ReviewViewSet` in `api/views.py`.
    *   **Crucial Logic**: In the `create` method of the view, query the `Order` model to verify that `request.user` has a `delivered` order containing this `product`. If not, deny the review creation.
2.  **Frontend (React)**:
    *   On the **Product Detail Page**, add a "Write a Review" button.
    *   This button should be conditional or disabled if the user hasn't bought the item (validated via API).
    *   Display the list of real reviews instead of static text.

## 2. Product List Enhancements (Colors & Sizes)
**Objective**: Show available options directly on the product card in the list view so users can see variations without clicking details.

### Implementation Steps:
1.  **Frontend (`ProductCard.tsx`)**:
    *   Update the card layout to render `product.colors` as small circular swatches.
    *   Render `product.sizes` as a small text string or badge list (e.g., "S, M, L").
    *   Ensure these elements fit neatly within the card design without cluttering it.

## 3. Advanced Stock & Quantity Logic
**Objective**: Enforce inventory limits and communicate stock status to the buyer.

### Implementation Steps:
1.  **Product Card logic**:
    *   **Display Logic**:
        *   If `stock_quantity == 0`: Show an "Out of Stock" overlay or badge. Disable "Add to Cart" and "Buy Now".
        *   If `stock_quantity <= 5` and `> 0`: Show a text label "Only [qty] left!".
    *   **Interaction Logic**:
        *   When clicking "Add to Cart", check current cart quantity + 1 vs `stock`.
        *   If the user tries to add more than available, show an error: "Cannot add more items than available stock."
2.  **Cart & Checkout**:
    *   Ensure the checkout process validates stock one last time before confirming the order.
