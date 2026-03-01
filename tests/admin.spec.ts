import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard & CMS (Modules 5 & ⚡)', () => {

    // We skip these for now if we don't have an admin session
    // But define the structure logic for the user

    test('Dashboard Stat Dashboard Loads (Feature 46)', async ({ page }) => {
        // 1. Log in as admin
        await page.goto('/login');
        await page.fill('input[name="email"]', 'admin@smartshop1.us');
        await page.fill('input[name="password"]', 'Admin123!');
        await page.click('button[type="submit"]');

        // 2. Head to dashboard
        await page.goto('/admin');
        await expect(page).toHaveURL(/.*admin/);

        // 3. Check for stat cards (expect non-zero values)
        const revenueCard = page.locator('text=Total Revenue');
        await expect(revenueCard).toBeVisible();
        await expect(revenueCard).not.toHaveText('$0'); // Should have actual data
    });

    test('CMS: Hero Banner Position Control - Feature 57 [NEW]', async ({ page }) => {
        // Assuming admin is logged in
        await page.goto('/admin');
        await page.click('button:has-text("CMS")');
        await page.click('button:has-text("Hero Banners")');

        // Create or Edit banner
        await page.click('button:has-text("Add Banner")');

        // Change image fit to "Contain"
        await page.selectOption('select:has-text("Image Fit")', 'contain');

        // Change focal point using the interactive grid
        // For automation, we just check if it's there
        const focalGrid = page.locator('.aspect-video.bg-gray-100');
        await expect(focalGrid).toBeVisible();

        // Save banner
        await page.click('button:has-text("Save Banner")');
        await expect(page.locator('text=Banner saved successfully')).toBeVisible();
    });

    test('System Health API Monitoring (Feature 46)', async ({ page }) => {
        // This is a direct API call to the health endpoint
        const response = await page.request.get('/api/health/');
        await expect(response.status()).toBe(200);
        const body = await response.json();
        await expect(body.status).toBe('ok');
        await expect(body.database).toBe('connected');
        await expect(body.cache).toBe('active');
    });

    test('Manage Order Status Lifecycle (Feature 21)', async ({ page }) => {
        // 1. Admin Login & Navigate to Orders
        await page.goto('/login');
        await page.fill('input[name="email"]', 'admin@smartshop1.us');
        await page.fill('input[name="password"]', 'Admin123!');
        await page.click('button[type="submit"]');
        await page.goto('/admin');
        await page.click('button:has-text("Orders")');

        // 2. Select the newest order (expect one exists)
        const firstOrder = page.locator('.order-row').first();
        await expect(firstOrder).toBeVisible();
        await firstOrder.click();

        // 3. Cycle through statuses
        const statusSelect = page.locator('select[name="status"]');

        // Processing
        await statusSelect.selectOption('processing');
        await page.click('button:has-text("Update Status")');
        await expect(page.locator('text=Order Status: Processing')).toBeVisible();

        // Shipped
        await statusSelect.selectOption('shipped');
        await page.click('button:has-text("Update Status")');
        await expect(page.locator('text=Order Status: Shipped')).toBeVisible();

        // Delivered
        await statusSelect.selectOption('delivered');
        await page.click('button:has-text("Update Status")');
        await expect(page.locator('text=Order Status: Delivered')).toBeVisible();
    });
});
