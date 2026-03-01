import { test, expect } from '@playwright/test';

test.describe('Shopping & Cart (Module 2)', () => {

    test('Product Catalog Search & Filter (Feature 10)', async ({ page }) => {
        await page.goto('/shop');

        // Search for "iPhone"
        await page.fill('input[placeholder*="Search"]', 'iPhone');
        await page.press('input[placeholder*="Search"]', 'Enter');

        // Expect at least one product with that name
        await expect(page.locator('text=iPhone')).toBeVisible();

        // Filter by category "Electronics"
        await page.click('button:has-text("Electronics")');
        await expect(page).toHaveURL(/.*category=Electronics/);
    });

    test('Wishlist Toggle - Feature 54 [NEW]', async ({ page }) => {
        await page.goto('/shop');

        // Locate the first wishlist heart button
        const wishlistBtn = page.locator('button[aria-label*="wishlist"]').first();

        // Check if it toggles (requires login in real scenario)
        // For automation, we click and expect a state change or an auth prompt 
        // We'll assume the user is logged in for this test to pass
        await wishlistBtn.click();

        // Check for success heart change (solid vs outline)
        // This depends on how the heart is actually rendered (CSS/Lucide)
        await expect(wishlistBtn).toHaveClass(/.*active|.*solid/);
    });

    test('Add to Cart & Checkout Navigation (Feature 14)', async ({ page }) => {
        await page.goto('/shop');

        // Click "Add to Cart" on first product
        await page.click('button:has-text("Add to Cart")');

        // Verify cart count badge update
        const cartCount = page.locator('.cart-badge');
        await expect(page.locator('text=Cart (1)')).toBeVisible();

        // Navigate to Cart
        await page.click('a[href="/cart"]');
        await expect(page).toHaveURL(/.*cart/);

        // Confirm order exists in cart summary
        await expect(page.locator('button:has-text("Checkout")')).toBeEnabled();
    });
});
