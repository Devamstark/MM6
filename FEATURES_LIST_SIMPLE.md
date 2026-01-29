# Features and Fixes Plan
// 01.28.2026
Here is the list of changes and features we are working on:

1.  **Fix Broken Product Images**
    *   The product images were not loading. We will fix the URLs so they show up correctly.

2.  **Fix Product Visibility in Sub-Categories**
    *   Products were not showing up when you clicked a sub-category filter on the home page. We will fix this so the filter works.

3.  **Remove Fake Review Numbers**
    *   We will remove the fake "4.9 stars" and "1.2k+ sold" text from the product cards.

4.  **Real Reviews for Buyers Only**
    *   We will add a "Write a Review" option.
    *   **Rule**: Only someone who actually bought the product (linked to their account) can write a review.

5.  **"Buy Now" Button**
    *   We will add a "Buy Now" button to the product card. Clicking it will skip the cart and go straight to checkout.

6.  **Multiple Colors & Sizes with Quantity (Product Listing)**
    *   **For Uploader**: When listing a new product, the seller/admin can select multiple sizes and colors.
    *   **Quantity Tracking**: The uploader can specify the quantity available for each specific size/color combination (e.g., "Red - M: 5 qty", "Blue - L: 2 qty").

7.  **Stock Quantity Logic**
    *   **Show Quantity**: The product card will show how many items are left in stock.
    *   **Limit Purchases**: If there is only 1 item left, the buyer cannot buy 2.
    *   **Out of Stock Handling**:
        *   If quantity is 0, show "Out of Stock".
        *   Disable "Add to Cart" and "Buy Now".
        *   **Wishlist Request**: Show a "Wishlist" button instead. Clicking this sends the buyer's info and a restock request to the Admin Panel.

8.  **Synchronize Categories & Sub-Categories**
    *   **Problem**: The categories shown on the website (filters) match the live products, but the Admin Panel drop-down shows a different (hardcoded or outdated) list.
    *   **Fix**: Ensure the Admin Panel fetches the *actual* category and sub-category options dynamically from the database (or a central configuration) so they perfectly match the website.

9.  **Fix Price Filter Logic**
    *   **Bug**: Products are showing up even when they are outside the selected price range (e.g., a $10 item shows up when filtering for $11-$100).
    *   **Fix**: Correct the logic in the backend API to strictly apply `min_price` and `max_price` filters.
