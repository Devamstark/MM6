import { test, expect } from '@playwright/test';

/**
 * Master E2E Audit Test: Live Site Walkthrough
 * Covers: Auth, Navigation, Search, Admin CMS, Product Editing, Checkout, 
 * Stripe Integration, Invoice Generation, and Order Lifecycle Management.
 */

test('Complete Site Audit: From Browsing to Admin Delivery', async ({ page }) => {
    // 1. Navigation & Theme Testing
    await page.goto('https://smartshop1.us/');
    await page.getByRole('link', { name: 'SMARTSHOP', exact: true }).click();
    await page.getByRole('navigation').getByRole('link', { name: 'New Arrivals' }).click();
    await page.getByRole('navigation').getByRole('link', { name: 'Women' }).click();
    await page.getByRole('navigation').getByRole('link', { name: 'Men', exact: true }).click();
    await page.getByRole('navigation').getByRole('link', { name: 'Accessories' }).click();
    await page.getByRole('navigation').getByRole('link', { name: 'Sale' }).click();

    // Theme Switching
    await page.getByRole('button', { name: 'Theme Settings' }).click();
    await page.getByRole('button', { name: 'Dark' }).click();
    await page.getByRole('button', { name: 'Light' }).click();

    // Hard-close the sidebar using the close button (more reliable than Escape)
    await page.locator('button:has(img[src*="close"]), button[aria-label="Close"]').first().click();
    await page.waitForTimeout(500); // Wait for transition

    // 2. Search Functionality
    // Using a more specific selector or forced click to ensure it hits the button
    await page.getByRole('button', { name: 'Search' }).click({ force: true });
    await page.getByRole('textbox', { name: 'Search for items, brands, or' }).fill('tshirt');
    await page.getByRole('textbox', { name: 'Search for items, brands, or' }).press('Enter');
    await expect(page.locator('text=jacket').or(page.locator('text=tshirt'))).toBeVisible();

    // 3. Admin: Product & Order Management
    await page.goto('/login');
    await page.getByPlaceholder('Email Address').fill('admin@test.com');
    await page.getByPlaceholder('Password').fill('admin@test.com');
    await page.getByPlaceholder('Password').press('Enter');
    await page.getByRole('button', { name: 'Sign In' }).first().click();

    // Admin Tab Navigation
    await page.getByRole('button', { name: 'products' }).click();
    await page.getByRole('button', { name: 'orders' }).click();
    await page.getByRole('button', { name: 'cms' }).click();

    // Edit Product Workflow
    await page.getByRole('button', { name: 'products' }).click();
    await page.getByRole('button', { name: 'Edit' }).first().click();
    await page.getByRole('textbox', { name: 'Tell the story of your' }).fill('Testing on live site');
    await page.getByPlaceholder('Cost of Goods').fill('10');
    await page.getByPlaceholder('Shipping').fill('5');
    await page.getByRole('button', { name: 'Update Product' }).click();

    // 4. User: Shopping & Checkout Flow
    await page.getByRole('button', { name: 'Account' }).click();
    await page.getByRole('button', { name: 'Sign Out' }).click();

    await page.goto('/login');
    await page.getByPlaceholder('Email Address').fill('devam9131@gmail.com');
    await page.getByPlaceholder('Password').fill('devam9131@gmail.com');
    await page.getByRole('button', { name: 'Sign In' }).first().click();

    // Add to Bag
    await page.goto('/shop');
    await page.getByRole('button', { name: 'Add to Bag' }).first().click();
    await page.getByRole('button', { name: 'View Full Bag' }).click();

    // Promo Code Application
    await page.getByRole('textbox', { name: 'ENTER CODE' }).fill('ABDUL');
    await page.getByRole('button', { name: 'Apply' }).click();

    // Checkout & Stripe Payment
    await page.getByRole('button', { name: 'Proceed to Checkout' }).first().click();
    await page.getByRole('button', { name: 'Continue to Payment' }).click();

    // Fill Stripe Test Card
    const stripeCardFrame = page.frameLocator('iframe[name*="StripeFrame"]').first();
    await stripeCardFrame.getByRole('textbox', { name: 'Credit or debit card number' }).fill('4242 4242 4242 4242');

    const stripeExpiryFrame = page.frameLocator('iframe[name*="StripeFrame"]').nth(1);
    await stripeExpiryFrame.getByRole('textbox', { name: 'Credit or debit card' }).fill('12 / 30');

    const stripeCvcFrame = page.frameLocator('iframe[name*="StripeFrame"]').nth(2);
    await stripeCvcFrame.getByRole('textbox', { name: 'Credit or debit card CVC/CVV' }).fill('123');

    await page.getByRole('button', { name: /Pay \$/ }).click();

    // 5. Post-Purchase: Invoices & Account
    await expect(page.locator('text=Order ID')).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: 'View Order Details' }).click();
    await expect(page.getByRole('button', { name: 'Download Invoice' })).toBeVisible();

    // 6. Admin: Final Fulfillment (Accept -> Ship -> Deliver)
    await page.getByRole('button', { name: 'Account' }).click();
    await page.getByRole('button', { name: 'Sign Out' }).click();

    await page.goto('/login');
    await page.getByPlaceholder('Email Address').fill('admin@test.com');
    await page.getByPlaceholder('Password').fill('admin@test.com');
    await page.getByRole('button', { name: 'Sign In' }).first().click();

    await page.getByRole('button', { name: 'orders' }).click();
    await page.getByRole('button', { name: 'View Details' }).first().click();

    // Accept, Ship, and Confirm Delivery
    page.once('dialog', d => d.accept());
    await page.getByRole('button', { name: 'Accept Order' }).click();

    page.once('dialog', d => d.accept());
    await page.getByRole('button', { name: 'Dispatch / Ship' }).click();

    page.once('dialog', d => d.accept());
    await page.getByRole('button', { name: 'Confirm Delivery' }).click();

    await expect(page.locator('text=Order Status: Delivered')).toBeVisible();

    // 7. Admin: Coupon System (Unique Code Creation)
    const uniqueCoupon = `AUDIT_${Date.now()}`;
    await page.getByRole('button', { name: 'Account' }).click();
    await page.getByRole('link', { name: 'Marketing' }).click();
    await page.getByRole('button', { name: 'Coupons' }).click();
    await page.getByRole('button', { name: 'Create Coupon' }).click();
    await page.getByRole('textbox', { name: 'E.g. SUMMER2024' }).fill(uniqueCoupon);
    await page.getByRole('spinbutton').first().fill('15'); // 15% discount
    await page.getByRole('button', { name: 'Save Coupon' }).click();

    // Verify it appeared in the list
    await expect(page.locator(`text=${uniqueCoupon}`)).toBeVisible();
});
