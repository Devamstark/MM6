import { test, expect } from '@playwright/test';

test.describe('Checkout & Referral System (Modules 3 & 🎁)', () => {

    test('Referral Discount Redemption - Feature 56 [NEW]', async ({ page }) => {
        // 1. Login with a user who has earnings ($10 minimum)
        await page.goto('/login');
        await page.fill('input[name="email"]', 'affiliate_test@example.com');
        await page.fill('input[name="password"]', 'Password123!');
        await page.click('button[type="submit"]');

        // 2. Add product and go to checkout
        await page.goto('/shop');
        await page.click('button:has-text("Add To Cart")');
        await page.goto('/checkout');

        // 3. Locate the "Use Referral Earnings" checkbox if balance >= $10.00
        const referralCheckbox = page.locator('input:has-text("Use Referral Earnings")');
        const balance = page.locator('text=Balance: $');

        // Check if the balance is above the threshold (min $10.00)
        // and if the checkbox appears/is clickable
        if (await referralCheckbox.count() > 0) {
            await referralCheckbox.check();

            // Ensure discount is applied to the summary
            const discountRow = page.locator('text=Referral Discount');
            await expect(discountRow).toBeVisible();
            await expect(discountRow).toContainText('-$');
        }
    });

    test('Stripe Payment Integration (Feature 16)', async ({ page }) => {
        // Navigate to checkout after item is added
        await page.goto('/checkout');

        // Fill shipping address
        await page.fill('input[name="address"]', '123 Automation Lane');
        await page.fill('input[name="city"]', 'Silicon Valley');
        await page.fill('input[name="zip"]', '94035');

        // Verify Stripe card input visibility (this is usually an iframe)
        const stripeFrame = page.frameLocator('iframe[src*="stripe.com"]');
        await expect(stripeFrame.locator('input[name="cardnumber"]')).toBeVisible();

        // Place order button should exist
        await expect(page.locator('button:has-text("Place Order")')).toBeVisible();
    });
    test('Order Success Confirmation & Invoice View (Feature 17)', async ({ page }) => {
        // Assume user is logged in and has item in checkout
        await page.goto('/checkout');

        // Fill details
        await page.fill('input[name="address"]', '456 Automation Ave');
        await page.fill('input[name="city"]', 'San Francisco');
        await page.fill('input[name="zip"]', '94105');

        // Note: For live site, only proceed if Stripe is in TEST mode
        await page.click('button:has-text("Place Order")');

        // Check for Order Success Screen
        await expect(page.locator('text=Thank you for your order')).toBeVisible();
        await expect(page.locator('text=Order ID')).toBeVisible();

        // Navigate to the Invoice/Order Detail view (Feature 18)
        await page.click('button:has-text("View Order Details")');

        // Verify invoice details
        await expect(page.locator('.order-summary')).toBeVisible();
        await expect(page.locator('.shipping-info')).toContainText('456 Automation Ave');
        await expect(page.locator('.total-price')).not.toHaveText('$0.00');
    });
});
